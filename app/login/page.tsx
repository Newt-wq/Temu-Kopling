"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, Info, Loader, User } from "react-feather";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    // Demo customer login
    if (email.trim().toLowerCase() === "user@temukopling.com" && password === "user123") {
      sessionStorage.setItem("customer_auth", JSON.stringify({
        id: "cust-1",
        name: "Sobat Kopling",
        email: "user@temukopling.com",
      }));
      router.push("/cari-rider");
    } else {
      setError("Email atau password salah. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFCF8] via-[#F7EFE5] to-[#E8DCCB] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#D4A373]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#8B5E3C]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm z-10">
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-20 h-12 mb-4">
              <Image src="/logo.png" alt="Temu Kopling" fill className="object-contain" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-[#5C3D2E]/10 flex items-center justify-center">
                <User className="w-4 h-4 text-[#5C3D2E]" />
              </div>
              <h1 className="text-zinc-900 font-extrabold text-xl tracking-tight">Login Customer</h1>
            </div>
            <p className="text-zinc-500 text-sm text-center">Masuk untuk mulai pesan kopi</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-zinc-700 text-xs font-bold mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@temukopling.com"
                  required
                  className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-zinc-800 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/30 focus:border-[#5C3D2E] transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-zinc-700 text-xs font-bold mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-10 py-3 text-zinc-800 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/30 focus:border-[#5C3D2E] transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-xs font-bold">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-[#A06C46] to-[#5C3D2E] text-white font-bold text-sm transition-all duration-300 shadow-lg shadow-[#A06C46]/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : "Masuk"}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 flex justify-center group relative">
            <div className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 transition-colors cursor-help bg-zinc-100 px-3 py-1.5 rounded-full border border-zinc-200 shadow-sm">
              <Info className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">Info Akun Demo</span>
            </div>
            
            {/* Tooltip Content */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 rounded-xl bg-zinc-900 border border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-10">
              <p className="text-zinc-400 text-[10px] font-bold mb-1.5 uppercase tracking-wider text-center">Customer Demo</p>
              <div className="space-y-1 bg-black/40 p-2 rounded-lg border border-white/5">
                <p className="text-white/90 text-xs font-mono text-center">user@temukopling.com</p>
                <p className="text-white/70 text-xs font-mono mt-1 pt-1 border-t border-white/5 text-center">pass: user123</p>
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-zinc-900"></div>
            </div>
          </div>

          {/* Back */}
          <p className="text-center text-zinc-500 text-xs mt-6 font-medium">
            Belum punya akun?{" "}
            <Link href="/" className="text-[#A06C46] hover:text-[#5C3D2E] font-bold transition-colors">
              Kembali ke beranda
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
