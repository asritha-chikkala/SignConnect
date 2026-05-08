"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError("");
    setMessage("");
    
    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowser();
    const { error: signupError } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard`,
      },
    });
    setLoading(false);
    
    if (signupError) {
      setError(signupError.message);
    } else {
      setMessage("✓ Check your inbox to verify your account.");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSignup();
    }
  };

  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-4">
      <Card className="w-full space-y-4 p-6">
        <div>
          <h1 className="text-2xl font-semibold">Create Account</h1>
          <p className="mt-1 text-sm text-white/60">Join SignBridge to translate speech to sign language</p>
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

        <input
          className="focus-ring w-full rounded-lg border border-white/20 bg-black/40 p-2 text-white placeholder-white/50"
          placeholder="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />

        <Button
          className="w-full"
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Sign up"}
        </Button>

        {error && <p className="rounded-lg border border-rose-500/50 bg-rose-950/30 p-2 text-sm text-rose-300">{error}</p>}
        {message && <p className="rounded-lg border border-cyan-500/50 bg-cyan-950/30 p-2 text-sm text-cyan-300">{message}</p>}

        <div className="border-t border-white/10 pt-4">
          <p className="text-center text-sm text-white/60">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-400 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </Card>
    </main>
  );
}
