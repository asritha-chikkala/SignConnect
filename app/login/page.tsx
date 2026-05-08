"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowser();
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    
    if (loginError) {
      setError(loginError.message);
    } else {
      router.push("/dashboard");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-4">
      <Card className="w-full space-y-4 p-6">
        <div>
          <h1 className="text-2xl font-semibold">Login</h1>
          <p className="mt-1 text-sm text-white/60">Access your SignBridge account</p>
        </div>

        <input
          className="focus-ring w-full rounded-lg border border-white/20 bg-black/40 p-2 text-white placeholder-white/50"
          placeholder="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />

        <input
          className="focus-ring w-full rounded-lg border border-white/20 bg-black/40 p-2 text-white placeholder-white/50"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />

        <Button
          className="w-full"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={async () => {
            const supabase = createSupabaseBrowser();
            await supabase.auth.signInWithOAuth({ 
              provider: "google", 
              options: { 
                redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard`,
              } 
            });
          }}
          disabled={loading}
        >
          Continue with Google
        </Button>

        {error && <p className="rounded-lg border border-rose-500/50 bg-rose-950/30 p-2 text-sm text-rose-300">{error}</p>}

        <div className="border-t border-white/10 pt-4">
          <p className="text-center text-sm text-white/60">
            Don't have an account?{" "}
            <Link href="/signup" className="text-cyan-400 hover:underline">
              Create one now
            </Link>
          </p>
        </div>
      </Card>
    </main>
  );
}
