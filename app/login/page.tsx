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
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Shield,
  MessageCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen flex bg-[#05060a]">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="text-2xl font-bold text-cyan-300 flex items-center gap-2">
              <span className="text-3xl">🤟</span>
              SignConnect
            </Link>
            <p className="text-white/40 text-sm mt-1">Welcome back! Please login to your account</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
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
                  onKeyDown={handleKeyDown}
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
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
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
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              className="w-full flex items-center justify-center gap-2 py-6 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold rounded-xl transition shadow-lg shadow-cyan-500/20"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>

            <p className="text-center text-sm text-white/40 mt-4">
              Don't have an account?{" "}
              <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 transition">
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Cute Avatar + About */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg w-full text-center">
          {/* Cute Avatar */}
          <div className="w-72 h-72 mx-auto mb-8">
            <CuteAvatar />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">SignConnect</span>
          </h2>
          <p className="text-white/60 text-lg mb-8">
            Breaking the silence barrier with AI-powered Indian Sign Language translation
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
              "Sign language is not just a language, it's a bridge that connects hearts."
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