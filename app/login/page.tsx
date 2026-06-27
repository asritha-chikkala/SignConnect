"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth-shell";
import { Loader2 } from "lucide-react";

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
    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      if (!userData.user.email_confirmed_at) {
        setError("Please verify your email before logging in.");
        setLoading(false);
        await supabase.auth.signOut();
        return;
      }

      await supabase.from("profiles").upsert({
        id: userData.user.id,
        email: userData.user.email,
      });
    }

    setLoading(false);
    router.push("/");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <AuthShell title="Secure Login" subtitle="Enter your credentials to access the SignConnect neural dashboard.">
      <input
        className="focus-ring w-full rounded-xl border border-cyan-300/25 bg-black/40 p-3 text-white placeholder:text-white/40"
        placeholder="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        aria-label="Email"
      />

      <input
        className="focus-ring w-full rounded-xl border border-cyan-300/25 bg-black/40 p-3 text-white placeholder:text-white/40"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        aria-label="Password"
      />

      <Button 
        className="w-full flex items-center justify-center gap-2" 
        onClick={handleLogin} 
        disabled={loading} 
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Authenticating...
          </>
        ) : (
          "Login"
        )}
      </Button>

      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
        onClick={async () => {
          const supabase = createSupabaseBrowser();
          await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/`,
            },
          });
        }}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Please wait...
          </>
        ) : (
          "Continue with Google"
        )}
      </Button>

      {error && (
        <div className="rounded-xl border border-rose-500/50 bg-rose-950/30 p-3 text-sm text-rose-300">
          <p className="font-medium">⚠️ Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="text-center text-sm text-white/65">
        <span>Do not have an account? </span>
        <Link href="/signup" className="text-cyan-300 hover:underline">
          Create one now
        </Link>
      </div>
    </AuthShell>
  );
}