"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/auth-shell";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = password.length >= 12 ? "strong" : password.length >= 8 ? "medium" : "weak";

  const handleSignup = async () => {
    setMessage("");
    setError("");

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
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
      setError(error.message);
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
    setMessage("Verification email sent! Please check your inbox and verify before logging in.");
  };

  return (
    <AuthShell title="Create Account" subtitle="Set up your SignConnect profile and verify your email to continue.">
      {pendingVerification ? (
        <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
            <p className="font-medium text-emerald-200">Verification Email Sent</p>
          </div>
          <p className="mt-2 text-sm text-emerald-100/80">
            A verification link was sent to <strong>{email}</strong>. Please check your inbox and spam folder.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setPendingVerification(false)}>
              Edit details
            </Button>
            <Button onClick={() => router.push("/login")}>Go to Login</Button>
          </div>
        </div>
      ) : (
        <>
          <input
            className="focus-ring w-full rounded-xl border border-cyan-300/25 bg-black/40 p-3 text-white placeholder:text-white/40"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
            aria-label="Full name"
          />

          <input
            className="focus-ring w-full rounded-xl border border-cyan-300/25 bg-black/40 p-3 text-white placeholder:text-white/40"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            aria-label="Email"
          />

          <input
            className="focus-ring w-full rounded-xl border border-cyan-300/25 bg-black/40 p-3 text-white placeholder:text-white/40"
            placeholder="Password (min 8 characters)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
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
              {strength.toUpperCase()} {password.length > 0 && `(${password.length} characters)`}
            </p>
          </div>

          <input
            className="focus-ring w-full rounded-xl border border-cyan-300/25 bg-black/40 p-3 text-white placeholder:text-white/40"
            placeholder="Confirm password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            aria-label="Confirm password"
          />

          <Button 
            className="w-full flex items-center justify-center gap-2" 
            onClick={handleSignup} 
            disabled={loading} 
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign up"
            )}
          </Button>

          {message && (
            <div className="rounded-xl border border-emerald-500/50 bg-emerald-950/30 p-3 text-sm text-emerald-300">
              <p className="font-medium">✅ Success</p>
              <p>{message}</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-500/50 bg-rose-950/30 p-3 text-sm text-rose-300">
              <p className="font-medium">⚠️ Error</p>
              <p>{error}</p>
            </div>
          )}
        </>
      )}

      <div className="text-center text-sm text-white/65">
        <span>Already have an account? </span>
        <Link href="/login" className="text-cyan-300 hover:underline">
          Sign in
        </Link>
      </div>
    </AuthShell>
  );
}