"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, Coffee, Info, Loader } from "react-feather";
import { supabase } from "@/lib/supabase";

export default function RiderLoginPage() {
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

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) throw signInError;

      // Ambil profil rider
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, role, brand, logo")
        .eq("id", data.user.id)
        .single();

      // Pastikan yang login beneran rider
      if (profile?.role !== "rider") {
        throw new Error("Akun ini bukan akun Rider!");
      }

      // Simpan session rider
      sessionStorage.setItem("rider_auth", JSON.stringify({
        id: data.user.id,
        name: profile?.name || "Rider",
        brand: profile?.brand || "Brand Kopi",
        logo: profile?.logo || "/brand_coffe/KSJ.png",
        email: data.user.email,
        role: "rider"
      }));

      router.push("/dashboard/rider/ngetem");
    } catch (err: any) {
      setError(err.message || "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A0D06] via-[#2D1810] to-[#1A0D06] flex items-center justify-center px-4">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-[#A06C46]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#5C3D2E]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Card */}
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
              <h1 className="text-white font-extrabold text-lg">Rider Dashboard</h1>
            </div>
            <p className="text-white/50 text-sm text-center">Masuk dengan akun rider kamu</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-white/60 text-xs font-semibold mb-1.5 block">Email Rider</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@temukopling.com"
                  required
                  className="w-full bg-white/8 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#A06C46]/50 focus:border-[#A06C46]/50 transition"
                  style={{ background: "rgba(255,255,255,0.06)" }}
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
                  placeholder="••••••••"
                  required
                  className="w-full border border-white/15 rounded-xl pl-10 pr-10 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#A06C46]/50 focus:border-[#A06C46]/50 transition"
                  style={{ background: "rgba(255,255,255,0.06)" }}
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

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <p className="text-red-400 text-xs font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#A06C46] hover:bg-[#8C5E3C] text-white font-bold text-sm transition-all duration-300 shadow-lg shadow-[#A06C46]/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : "Masuk ke Dashboard"}
            </button>
          </form>



          {/* Register Link */}
          <p className="text-center text-white/30 text-xs mt-6 font-medium">
            Belum daftar jadi rider?{" "}
            <Link href="/rider-register" className="text-[#A06C46] hover:text-[#C08050] font-semibold transition-colors">
              Daftar di sini
            </Link>
          </p>

          {/* Back */}
          <p className="text-center text-white/30 text-xs mt-4">
            Bukan rider?{" "}
            <a href="/" className="text-[#A06C46] hover:text-[#C08050] font-semibold transition-colors">
              Kembali ke beranda
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
