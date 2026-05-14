import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Specifically look for avatar.vrm, not any .vrm file
    const publicDir = path.join(process.cwd(), 'public');
    const vrmPath = path.join(publicDir, 'avatar.vrm');
    
    console.log("Looking for VRM at:", vrmPath);
    
    if (fs.existsSync(vrmPath)) {
      const stats = fs.statSync(vrmPath);
      console.log("✅ VRM file found! Size:", stats.size, "bytes");
      console.log("Last modified:", stats.mtime);
      
      const fileBuffer = fs.readFileSync(vrmPath);
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'model/vrm',
          'Content-Disposition': `inline; filename="avatar.vrm"`,
          // Disable caching completely for development
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }
    
    console.error("❌ VRM file NOT found at:", vrmPath);
    
    // List all files in public folder for debugging
    const files = fs.existsSync(publicDir) ? fs.readdirSync(publicDir) : [];
    console.log("Files in public folder:", files);
    
    return NextResponse.json({ 
      error: "VRM model not found",
      message: "Place your VRM file at: public/avatar.vrm",
      filesInPublic: files.filter(f => f.endsWith('.vrm'))
    }, { status: 404 });
  } catch (error) {
    console.error("VRM API error:", error);
    return NextResponse.json({ 
      error: "Failed to load VRM model",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}