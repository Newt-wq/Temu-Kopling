"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, Loader, ArrowLeft } from "react-feather";
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
      let { data: profile } = await supabase
        .from("profiles")
        .select("name, role, brand, logo")
        .eq("id", data.user.id)
        .single();

      // Jika profil belum ada di table tapi metadata auth ada
      if (!profile && data.user) {
        const metadata = data.user.user_metadata;
        // Pastikan role-nya memang rider di metadata
        if (metadata?.role === "rider") {
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .upsert({
              id: data.user.id,
              email: data.user.email,
              name: metadata?.name || "Rider",
              role: "rider",
              brand: metadata?.brand || "Brand Kopi",
              logo: metadata?.logo || ""
            })
            .select()
            .single();
          
          if (!createError) profile = newProfile;
        }
      }

      const meta = data.user.user_metadata || {};
      const role = profile?.role || meta.role || "rider";

      if (role === "customer") {
        await supabase.auth.signOut();
        throw new Error("Gagal login: Akun ini terdaftar sebagai Customer. Silakan login di halaman beranda.");
      }

      if (role !== "rider") {
        await supabase.auth.signOut();
        throw new Error("Gagal login: Akun ini tidak memiliki hak akses sebagai Rider.");
      }

      // Prioritaskan profil database (karena ini yang bisa di-edit dari Supabase), fallback ke metadata auth
      sessionStorage.setItem("rider_auth", JSON.stringify({
        id: data.user.id,
        name: profile?.name || meta.name || "Rider",
        brand: profile?.brand || meta.brand || "Brand Kopi",
        logo: profile?.logo || meta.logo || "",
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
    <div className="min-h-screen bg-[#0C0806] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Premium Background Elements (Dark Mode) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#8C5E3C]/15 to-transparent blur-[120px]" />
        <div className="absolute bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-[#D4B895]/10 to-transparent blur-[150px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="relative w-24 h-16 transform transition-transform hover:scale-105 duration-300">
            <Image src="/logo.png" alt="Temu Kopling" fill className="object-contain drop-shadow-md brightness-200" priority />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Portal Mitra
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-400 max-w-sm mx-auto">
          Masuk ke dashboard untuk mulai menerima pesanan dan memantau penghasilan.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[440px] relative z-10 px-4 sm:px-0">
        <div className="bg-white/[0.03] backdrop-blur-xl py-8 px-6 sm:px-10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] border border-white/10 rounded-3xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  className="appearance-none block w-full pl-11 pr-4 py-3.5 border border-white/10 rounded-2xl shadow-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#8C5E3C]/50 focus:border-[#8C5E3C] sm:text-sm bg-black/20 text-white focus:bg-black/40 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="appearance-none block w-full pl-11 pr-11 py-3.5 border border-white/10 rounded-2xl shadow-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#8C5E3C]/50 focus:border-[#8C5E3C] sm:text-sm bg-black/20 text-white focus:bg-black/40 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                >
                  {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl bg-red-500/10 p-4 border border-red-500/20">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-400">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl shadow-[0_0_20px_-5px_rgba(140,94,60,0.4)] text-sm font-bold text-white bg-[#8C5E3C] hover:bg-[#A06C46] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0C0806] focus:ring-[#8C5E3C] transition-all duration-200 hover:shadow-[0_0_25px_-5px_rgba(140,94,60,0.6)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    Memverifikasi...
                  </span>
                ) : (
                  "Masuk ke Dashboard"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-[#110C0A] text-zinc-500 rounded-full">atau</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-zinc-400">
              Tertarik menjadi mitra?{" "}
              <Link href="/rider-register" className="font-semibold text-[#8C5E3C] hover:text-[#A06C46] transition-colors">
                Daftar sebagai Rider
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link href="/" className="flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
