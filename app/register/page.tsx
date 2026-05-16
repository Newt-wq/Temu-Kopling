"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, User, Loader } from "react-feather";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
            role: "customer", // otomatis diset jadi customer
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // 1. Pastikan data user ada
      if (data.user) {
        // 2. Insert ke table profiles (manual sync)
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            email: email.trim().toLowerCase(),
            name: name,
            role: "customer"
          });
        
        if (profileError) {
          console.error("Gagal membuat profil:", profileError.message);
          // Kita abaikan saja jika error (misal karena trigger sudah jalan) 
          // yang penting Auth-nya sudah berhasil.
        }
      }

      setSuccess("Pendaftaran berhasil! Silakan login.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mendaftar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFCF8] via-[#F7EFE5] to-[#E8DCCB] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#D4A373]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#8B5E3C]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm z-10">
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-20 h-12 mb-4">
              <Image src="/logo.png" alt="Temu Kopling" fill className="object-contain" />
            </div>
            <h1 className="text-zinc-900 font-extrabold text-xl tracking-tight">Daftar Akun</h1>
            <p className="text-zinc-500 text-sm text-center">Buat akun untuk mulai pesan kopi</p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Nama */}
            <div>
              <label className="text-zinc-700 text-xs font-bold mb-1.5 block">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Kamu"
                  required
                  className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-zinc-800 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/30 focus:border-[#5C3D2E] transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-zinc-700 text-xs font-bold mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@contoh.com"
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
                  placeholder="Minimal 6 karakter"
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

            {/* Error & Success */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-xs font-bold">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <p className="text-green-600 text-xs font-bold">{success}</p>
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
                  Mendaftarkan...
                </>
              ) : "Daftar Sekarang"}
            </button>
          </form>

          {/* Back to Login */}
          <p className="text-center text-zinc-500 text-xs mt-6 font-medium">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-[#A06C46] hover:text-[#5C3D2E] font-bold transition-colors">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
