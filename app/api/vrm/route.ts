import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requested = searchParams.get("file")?.trim();

    const publicDir = path.join(process.cwd(), "public");
    const candidates = [
      requested ? path.join(publicDir, path.basename(requested)) : null,
      path.join(publicDir, "avatar.vrm"),
      path.join(publicDir, "models", "7469932817343173615.vrm"),
    ].filter((p): p is string => Boolean(p));

    let vrmPath: string | null = null;
    for (const candidate of candidates) {
      if (fs.existsSync(candidate) && candidate.endsWith(".vrm")) {
        vrmPath = candidate;
        break;
      }
    }

    if (vrmPath) {
      const stats = fs.statSync(vrmPath);
      const fileBuffer = fs.readFileSync(vrmPath);
      const name = path.basename(vrmPath);

      console.info("[api/vrm] serving", { vrmPath, bytes: stats.size, mtime: stats.mtime.toISOString() });

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "model/gltf-binary",
          "Content-Disposition": `inline; filename="${name}"`,
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      });
    }

    const files = fs.existsSync(publicDir) ? fs.readdirSync(publicDir) : [];
    console.error("[api/vrm] no VRM found in candidates:", candidates);

    return NextResponse.json(
      {
        error: "VRM model not found",
        message: "Place avatar.vrm in /public or pass ?file=models/your.vrm",
        filesInPublic: files.filter((f) => f.endsWith(".vrm")),
      },
      { status: 404 },
    );
  } catch (error) {
    console.error("[api/vrm] error:", error);
    return NextResponse.json(
      {
        error: "Failed to load VRM model",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
