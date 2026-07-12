from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import tensorflow as tf
import joblib
import base64
import os
import sys

app = Flask(__name__)
CORS(app)

# Load model at startup
print("🔍 Loading ML model...", file=sys.stderr)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, 'models', 'isl_sign_model.h5')
encoder_path = os.path.join(BASE_DIR, 'models', 'label_encoder.pkl')

try:
    model = tf.keras.models.load_model(model_path)
    label_encoder = joblib.load(encoder_path)
    print("✅ Model and label encoder loaded successfully!", file=sys.stderr)
except Exception as e:
    print(f"❌ Failed to load model: {e}", file=sys.stderr)
    sys.exit(1)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'model_loaded': True})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        image_base64 = data.get('image')
        if not image_base64:
            return jsonify({'error': 'No image provided'}), 400
        
        if 'base64,' in image_base64:
            image_base64 = image_base64.split('base64,')[1]
        
        image_bytes = base64.b64decode(image_base64)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return jsonify({'error': 'Could not decode image'}), 400
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)
        img = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
        img = cv2.resize(img, (224, 224))
        img = img.astype(np.float32) / 255.0
        img = np.expand_dims(img, axis=0)
        
        predictions = model.predict(img, verbose=0)[0]
        class_idx = np.argmax(predictions)
        confidence = float(np.max(predictions))
        sign = label_encoder.inverse_transform([class_idx])[0]
        
        top_indices = np.argsort(predictions)[-3:][::-1]
        top_predictions = []
        for idx in top_indices:
            top_predictions.append({
                'sign': label_encoder.inverse_transform([idx])[0],
                'confidence': float(predictions[idx])
            })
        
        return jsonify({
            'success': True,
            'sign': sign,
            'confidence': confidence,
            'top_predictions': top_predictions
        })
        
    except Exception as e:
        print(f"❌ Prediction error: {e}", file=sys.stderr)
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'service': 'ISL Sign Detection ML Model',
        'version': '1.0.0',
        'endpoints': {
            '/health': 'GET - Health check',
            '/predict': 'POST - Predict ISL sign from image',
            '/': 'GET - Service info'
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)