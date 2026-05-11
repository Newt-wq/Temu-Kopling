"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Save, ArrowLeft, Loader, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function EditProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const auth = sessionStorage.getItem("customer_auth");
    if (auth) {
      const parsed = JSON.parse(auth);
      setName(parsed.name || "");
      setEmail(parsed.email || "");
      setCheckingAuth(false);
    } else {
      router.replace("/login");
    }
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));

    const auth = sessionStorage.getItem("customer_auth");
    if (auth) {
      const parsed = JSON.parse(auth);
      const updated = {
        ...parsed,
        name: name,
        email: email,
      };
      sessionStorage.setItem("customer_auth", JSON.stringify(updated));
      
      setSuccess(true);
      setLoading(false);

      // Force reload the page or navigate back after 1.5s to show changes in Navbar
      setTimeout(() => {
        window.location.href = "/cari-rider";
      }, 1500);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#5C3D2E] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-500 font-medium">Memuat profil...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-80px)] bg-[#FAF8F5] flex justify-center px-4 py-10 md:py-16">
        <div className="w-full max-w-md">
          
          <Link href="/cari-rider" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors mb-6 font-medium text-sm">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-zinc-100">
            <div className="flex items-center gap-4 mb-8 border-b border-zinc-100 pb-6">
              <div className="w-16 h-16 rounded-full bg-[#5C3D2E] flex items-center justify-center text-white flex-shrink-0 shadow-md">
                <span className="text-2xl font-bold">{name.charAt(0)}</span>
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-zinc-900 leading-tight">Edit Profil</h1>
                <p className="text-sm text-zinc-500 mt-1">Perbarui informasi akunmu</p>
              </div>
            </div>

            {success && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-green-800">Profil Berhasil Diperbarui!</p>
                  <p className="text-xs text-green-700 mt-0.5">Mengarahkan kembali ke peta...</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="text-zinc-700 text-xs font-bold mb-1.5 block">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-zinc-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/30 focus:border-[#5C3D2E] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-700 text-xs font-bold mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-zinc-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/30 focus:border-[#5C3D2E] transition-all"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full py-3.5 rounded-xl bg-[#A06C46] hover:bg-[#5C3D2E] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
