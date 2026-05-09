"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth-shell";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = password.length >= 12 ? "strong" : password.length >= 8 ? "medium" : "weak";

  const handleSignup = async () => {
    setMessage("");

    if (!fullName || !email || !password || !confirmPassword) {
      setMessage("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    const supabase = createSupabaseBrowser();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/login`,
      },
    });

    if (error) {
      setLoading(false);
      setMessage(error.message);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
      });
    }

    setLoading(false);
    setPendingVerification(true);
    setMessage("Verification email sent. Please verify before login.");
  };

  return (
    <AuthShell title="Create Account" subtitle="Set up your SignBridge profile and verify your email to continue.">
      {pendingVerification ? (
        <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          <p className="font-medium">Verification pending</p>
          <p className="mt-1">A verification link was sent to {email}. Verify, then continue to login.</p>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" onClick={() => setPendingVerification(false)}>
              Edit details
            </Button>
            <Button onClick={() => router.push("/login")}>Go to Login</Button>
          </div>
        </div>
      ) : (
        <>
          <input
            className="focus-ring w-full rounded-xl border border-cyan-300/25 bg-black/40 p-3"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            aria-label="Full name"
          />

          <input
            className="focus-ring w-full rounded-xl border border-cyan-300/25 bg-black/40 p-3"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email"
          />

          <input
            className="focus-ring w-full rounded-xl border border-cyan-300/25 bg-black/40 p-3"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Password"
          />

          <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-xs">
            <p className="mono uppercase tracking-wider text-white/60">Password strength</p>
            <p
              className={
                strength === "strong"
                  ? "text-emerald-300"
                  : strength === "medium"
                    ? "text-amber-300"
                    : "text-rose-300"
              }
            >
              {strength.toUpperCase()}
            </p>
          </div>

          <input
            className="focus-ring w-full rounded-xl border border-cyan-300/25 bg-black/40 p-3"
            placeholder="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-label="Confirm password"
          />

          <Button className="w-full" onClick={handleSignup} disabled={loading} size="lg">
            {loading ? "Creating account..." : "Sign up"}
          </Button>

          {!!message && <p className="text-sm text-white/80">{message}</p>}
        </>
      )}

      <div className="text-center text-sm text-white/65">
        <span>Already verified? </span>
        <Link href="/login" className="text-cyan-300 hover:underline">
          Go to login
        </Link>
      </div>
    </AuthShell>
  );
}