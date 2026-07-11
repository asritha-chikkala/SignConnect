import os
import cv2
import numpy as np
import tensorflow as tf
import joblib
import json
import sys
import traceback
import base64

class ISLPredictor:
    def __init__(self):
        self.model = None
        self.label_encoder = None
        self.load_model()
    
    def load_model(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(base_dir, 'public', 'models', 'isl_sign_model.h5')
        encoder_path = os.path.join(base_dir, 'public', 'models', 'label_encoder.pkl')
        
        print(f"🔍 Model path: {model_path}", file=sys.stderr)
        print(f"🔍 Encoder path: {encoder_path}", file=sys.stderr)
        
        if os.path.exists(model_path):
            try:
                self.model = tf.keras.models.load_model(model_path)
                print("✅ Model loaded successfully!", file=sys.stderr)
            except Exception as e:
                print(f"❌ Failed to load model: {e}", file=sys.stderr)
                return False
        else:
            print(f"❌ Model not found: {model_path}", file=sys.stderr)
            return False
        
        if os.path.exists(encoder_path):
            try:
                self.label_encoder = joblib.load(encoder_path)
                print("✅ Label encoder loaded successfully!", file=sys.stderr)
            except Exception as e:
                print(f"❌ Failed to load encoder: {e}", file=sys.stderr)
                return False
        else:
            print(f"❌ Label encoder not found: {encoder_path}", file=sys.stderr)
            return False
        
        return True
    
    def preprocess_image(self, image_bytes):
        """Preprocess image for better accuracy"""
        try:
            # Decode image
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                raise ValueError("Could not decode image")
            
            # Convert to grayscale for better contrast
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Apply histogram equalization (improves contrast)
            gray = cv2.equalizeHist(gray)
            
            # Convert back to 3-channel for model
            img = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
            
            # Resize
            img = cv2.resize(img, (224, 224))
            
            # Normalize
            img = img.astype(np.float32) / 255.0
            img = np.expand_dims(img, axis=0)
            
            return img
            
        except Exception as e:
            print(f"❌ Preprocess error: {e}", file=sys.stderr)
            return None
    
    def predict_from_bytes(self, image_bytes):
        """Predict sign from image bytes with top predictions"""
        try:
            img = self.preprocess_image(image_bytes)
            if img is None:
                return {'error': 'Failed to preprocess image'}
            
            # Get predictions
            predictions = self.model.predict(img, verbose=0)[0]
            
            # Get top 3 predictions
            top_indices = np.argsort(predictions)[-3:][::-1]
            top_predictions = []
            
            for idx in top_indices:
                sign = self.label_encoder.inverse_transform([idx])[0]
                confidence = float(predictions[idx])
                top_predictions.append({
                    'sign': sign,
                    'confidence': confidence
                })
            
            # Best prediction
            best = top_predictions[0]
            
            print(f"✅ Top predictions: {top_predictions}", file=sys.stderr)
            
            return {
                'sign': best['sign'],
                'confidence': best['confidence'],
                'top_predictions': top_predictions
            }
        except Exception as e:
            print(f"❌ Prediction error: {e}", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            return {'error': str(e)}

if __name__ == '__main__':
    predictor = ISLPredictor()
    
    # Read base64 from stdin
    try:
        input_data = sys.stdin.read()
        if input_data:
            data = json.loads(input_data)
            image_base64 = data.get('image')
            if image_base64:
                image_bytes = base64.b64decode(image_base64)
                result = predictor.predict_from_bytes(image_bytes)
                print(json.dumps(result))
            else:
                print(json.dumps({'error': 'No image data provided'}))
        else:
            print(json.dumps({'error': 'No input data provided'}))
    except Exception as e:
        print(json.dumps({'error': str(e)}))