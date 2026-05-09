import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Look for VRM file in public folder
    const publicDir = path.join(process.cwd(), 'public');
    
    if (!fs.existsSync(publicDir)) {
      return NextResponse.json({ 
        error: "Public directory not found",
        message: "Place a .vrm file in the public folder"
      }, { status: 404 });
    }
    
    const files = fs.readdirSync(publicDir);
    const vrmFile = files.find(f => f.endsWith('.vrm'));
    
    if (vrmFile) {
      const filePath = path.join(publicDir, vrmFile);
      const fileBuffer = fs.readFileSync(filePath);
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'model/vrm',
          'Content-Disposition': `inline; filename="${vrmFile}"`,
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    }
    
    // If no VRM file found, return a simple model info
    return NextResponse.json({ 
      error: "No VRM model found",
      message: "Place a .vrm file in the public folder",
      instructions: "Move your .vrm file to the 'public' directory and rename it to 'avatar.vrm'"
    }, { status: 404 });
  } catch (error) {
    console.error("VRM API error:", error);
    return NextResponse.json({ 
      error: "Failed to load VRM model",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}