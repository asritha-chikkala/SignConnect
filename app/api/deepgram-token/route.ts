import { NextResponse } from "next/server";
import { createDeepgramToken } from "@/services/deepgram";

export async function GET() {
  const token = await createDeepgramToken();
  if (!token) return NextResponse.json({ error: "Deepgram not configured" }, { status: 400 });
  return NextResponse.json({ token });
}
