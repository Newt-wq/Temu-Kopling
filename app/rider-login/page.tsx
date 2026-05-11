"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock, Mail, Coffee, Info, Loader } from "react-feather";

// Demo credentials — di produksi ganti dengan API auth
const RIDER_CREDENTIALS = [
  { id: 1, email: "budi@temukopling.com", password: "rider123", name: "Budi Santoso", brand: "Jago Coffee", logo: "/brand_coffe/Jago.jpeg" },
  { id: 2, email: "andi@temukopling.com", password: "rider123", name: "Andi Prasetyo", brand: "Kopi Susu Jalanan", logo: "/brand_coffe/KSJ.png" },
  { id: 3, email: "reza@temukopling.com", password: "rider123", name: "Reza Firmansyah", brand: "Calf", logo: "/brand_coffe/Calf.jpeg" },
];

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

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    const match = RIDER_CREDENTIALS.find(
      (c) => c.email === email.trim().toLowerCase() && c.password === password
    );

    if (match) {
      // Simpan session rider
      sessionStorage.setItem("rider_auth", JSON.stringify({
        id: match.id,
        name: match.name,
        brand: match.brand,
        logo: match.logo,
        email: match.email,
      }));
      router.push("/dashboard/rider/ngetem");
    } else {
      setError("Email atau password salah. Coba lagi.");
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

          {/* Demo hint as a tooltip icon */}
          <div className="mt-5 flex justify-center group relative">
            <div className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors cursor-help bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <Info className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">Info Demo</span>
            </div>
            
            {/* Tooltip Content */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 rounded-xl bg-[#2D1810] border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-10">
              <p className="text-white/60 text-[10px] font-semibold mb-1.5 uppercase tracking-wider">Demo Credentials</p>
              <div className="space-y-1 bg-black/20 p-2 rounded-lg border border-white/5">
                <p className="text-white/90 text-xs font-mono">budi@temukopling.com</p>
                <p className="text-white/70 text-xs font-mono mt-1 pt-1 border-t border-white/5">pass: rider123</p>
              </div>
              {/* Triangle pointer */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-white/20"></div>
            </div>
          </div>

          {/* Back */}
          <p className="text-center text-white/30 text-xs mt-5">
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
