import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Check file size (max 5MB)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large. Max 5MB.' }, { status: 400 });
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Path to Python script
    const scriptPath = path.join(process.cwd(), 'services', 'predict_sign.py');
    
    if (!fs.existsSync(scriptPath)) {
      console.error('❌ Python script not found:', scriptPath);
      return NextResponse.json({ error: 'Detection service not available' }, { status: 500 });
    }

    // Use spawn to avoid command-line length limits
    return new Promise<NextResponse>((resolve) => {
      const pythonProcess = spawn('python', [scriptPath]);
      
      let stdoutData = '';
      let stderrData = '';
      
      // Send data via stdin
      pythonProcess.stdin.write(JSON.stringify({ image: base64Image }));
      pythonProcess.stdin.end();
      
      pythonProcess.stdout.on('data', (data) => {
        stdoutData += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        stderrData += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        console.log('📤 Python exit code:', code);
        if (stderrData) {
          console.log('📤 stderr:', stderrData);
        }
        
        if (code !== 0) {
          resolve(NextResponse.json({ error: 'Prediction failed' }, { status: 500 }));
          return;
        }
        
        try {
          const result = JSON.parse(stdoutData);
          
          if (result.error) {
            resolve(NextResponse.json({ error: result.error }, { status: 500 }));
            return;
          }
          
          if (result.confidence < 0.70) {
            resolve(NextResponse.json({ 
              success: false, 
              error: `Low confidence (${(result.confidence * 100).toFixed(0)}%). Please try again.`,
              sign: result.sign,
              confidence: result.confidence,
            }));
            return;
          }
          
          resolve(NextResponse.json({
            success: true,
            sign: result.sign,
            confidence: result.confidence,
            top_predictions: result.top_predictions || [],
          }));
        } catch (error) {
          console.error('❌ Failed to parse Python output:', stdoutData);
          resolve(NextResponse.json({ error: 'Invalid response from model' }, { status: 500 }));
        }
      });
      
      pythonProcess.on('error', (error) => {
        console.error('❌ Spawn error:', error);
        resolve(NextResponse.json({ error: 'Failed to start Python process' }, { status: 500 }));
      });
    });

  } catch (error) {
    console.error('❌ Sign detection error:', error);
    return NextResponse.json({ error: 'Detection failed: ' + String(error) }, { status: 500 });
  }
}