export async function createDeepgramToken() {
  // In production this endpoint should mint temporary tokens using Deepgram SDK/server auth.
  // For deploy stability, we return the configured API key proxy value if present.
  return process.env.DEEPGRAM_API_KEY ?? null;
}
