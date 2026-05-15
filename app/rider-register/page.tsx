"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, User, Loader, Coffee } from "react-feather";
import { supabase } from "@/lib/supabase";

export default function RiderRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [brand, setBrand] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      setLoading(false);
      return;
    }

    try {
      // Daftar ke Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: "rider", // Set sebagai rider
            brand: brand,
            logo: "/brand_coffe/default.png" // default logo
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      setSuccess("Pendaftaran Rider berhasil! Silakan login.");
      setTimeout(() => {
        router.push("/rider-login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mendaftar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A0D06] via-[#2D1810] to-[#1A0D06] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-80 h-80 bg-[#A06C46]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#5C3D2E]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm z-10">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-16 h-16 mb-4">
              <Image src="/logo.png" alt="Temu Kopling" fill className="object-contain" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-xl bg-[#A06C46]/20 flex items-center justify-center">
                <Coffee className="w-4 h-4 text-[#A06C46]" />
              </div>
              <h1 className="text-white font-extrabold text-lg">Daftar Rider</h1>
            </div>
            <p className="text-white/50 text-sm text-center">Bergabung jadi mitra Temu Kopling</p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Nama */}
            <div>
              <label className="text-white/60 text-xs font-semibold mb-1.5 block">Nama Rider</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap"
                  required
                  className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#A06C46]/50 focus:border-[#A06C46]/50 transition"
                />
              </div>
            </div>

            {/* Brand */}
            <div>
              <label className="text-white/60 text-xs font-semibold mb-1.5 block">Brand Kopi</label>
              <div className="relative">
                <Coffee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Nama Brand (Contoh: Jago Coffee)"
                  required
                  className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#A06C46]/50 focus:border-[#A06C46]/50 transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-white/60 text-xs font-semibold mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rider@temukopling.com"
                  required
                  className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#A06C46]/50 focus:border-[#A06C46]/50 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-white/60 text-xs font-semibold mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-10 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#A06C46]/50 focus:border-[#A06C46]/50 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error & Success */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <p className="text-red-400 text-xs font-medium">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
                <p className="text-green-400 text-xs font-medium">{success}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-[#A06C46] hover:bg-[#8C5E3C] text-white font-bold text-sm transition-all duration-300 shadow-lg shadow-[#A06C46]/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Mendaftarkan...
                </>
              ) : "Daftar Jadi Rider"}
            </button>
          </form>

          {/* Back to Login */}
          <p className="text-center text-white/30 text-xs mt-5">
            Sudah punya akun?{" "}
            <Link href="/rider-login" className="text-[#A06C46] hover:text-[#C08050] font-semibold transition-colors">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
