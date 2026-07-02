"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { CuteAvatar } from "@/components/CuteAvatar";
import {
  Loader2,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Zap,
  Shield,
  MessageCircle,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen flex bg-[#05060a]">
      {/* Left Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="text-2xl font-bold text-cyan-300 flex items-center gap-2">
              <span className="text-3xl">🤟</span>
              SignConnect
            </Link>
            <p className="text-white/40 text-sm mt-1">Create your account</p>
          </div>

          {pendingVerification ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Verification Email Sent</h3>
              <p className="text-sm text-white/60 mt-2">
                We've sent a verification link to <span className="text-emerald-300">{email}</span>
              </p>
              <p className="text-xs text-white/40 mt-1">Please check your inbox and spam folder</p>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setPendingVerification(false)} className="flex-1">
                  Edit details
                </Button>
                <Button onClick={() => router.push("/login")} className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500">
                  Go to Login
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition"
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition"
                    placeholder="Minimum 8 characters"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-1 flex-1 rounded-full ${
                          strength === "strong"
                            ? "bg-emerald-500"
                            : strength === "medium"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span
                        className={`text-xs font-medium ${
                          strength === "strong"
                            ? "text-emerald-400"
                            : strength === "medium"
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        {strength.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition"
                    placeholder="Confirm your password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {message && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                  <p className="text-sm text-emerald-400">{message}</p>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                </div>
              )}

              <Button
                className="w-full flex items-center justify-center gap-2 py-6 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold rounded-xl transition shadow-lg shadow-cyan-500/20"
                onClick={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>

              <p className="text-center text-sm text-white/40 mt-4">
                Already have an account?{" "}
                <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition">
                  Login
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Cute Avatar + About */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg w-full text-center">
          <div className="w-72 h-72 mx-auto mb-8">
            <CuteAvatar />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">SignConnect</span>
          </h2>
          <p className="text-white/60 text-lg mb-8">
            Start learning and communicating in Indian Sign Language today
          </p>

          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-white">AI Translation</span>
              </div>
              <p className="text-xs text-white/40">Real-time speech to ISL gloss</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-white">3D Avatar</span>
              </div>
              <p className="text-xs text-white/40">Expressive signing avatar</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-white">Privacy First</span>
              </div>
              <p className="text-xs text-white/40">Your data stays yours</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-white">Learn ISL</span>
              </div>
              <p className="text-xs text-white/40">Interactive learning tools</p>
            </div>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-sm text-white/40 italic">
              "Sign language connects hearts, breaks barriers, and builds bridges of understanding."
            </p>
          </div>

          <p className="text-xs text-white/20 mt-6">
            Built with ❤️ 
          </p>
        </div>
      </div>
    </div>
  );
}