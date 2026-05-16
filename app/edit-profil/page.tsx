"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Save, ArrowLeft, Loader, CheckCircle, Camera } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { io } from "socket.io-client";

export default function EditProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [logo, setLogo] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem("customer_auth");
    if (auth) {
      const parsed = JSON.parse(auth);
      setName(parsed.name || "");
      setEmail(parsed.email || "");
      setLogo(parsed.logo || "");
      setPreviewUrl(parsed.logo || "");
      setCheckingAuth(false);
    } else {
      router.replace("/login");
    }
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const auth = sessionStorage.getItem("customer_auth");
    if (!auth) {
      setLoading(false);
      alert("Sesi tidak ditemukan. Silakan login ulang.");
      return;
    }
    const parsed = JSON.parse(auth);
    const userId = parsed.id;

    try {
      // Pertahankan logo lama jika tidak ada file baru
      let finalLogoUrl = logo;

      if (selectedFile) {
        // Hapus foto lama dari storage agar tidak menumpuk (tidak ada file double)
        if (logo) {
          try {
            const parts = logo.split('/menu_images/');
            if (parts.length > 1) {
              const oldFilePath = parts[1];
              await supabase.storage.from('menu_images').remove([oldFilePath]);
              console.log('✅ Foto lama berhasil dihapus:', oldFilePath);
            }
          } catch (delErr) {
            console.warn('Gagal menghapus foto lama:', delErr);
          }
        }

        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `customer-${userId}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('menu_images')
          .upload(filePath, selectedFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('menu_images').getPublicUrl(filePath);
        finalLogoUrl = urlData.publicUrl;
      }

      // ✅ Update via Supabase Auth API (bypass RLS)
      const { error: metaError } = await supabase.auth.updateUser({
        data: { name, logo: finalLogoUrl }
      });
      if (metaError) throw metaError;

      // Best-effort: update profiles table juga
      await supabase
        .from('profiles')
        .update({ name, logo: finalLogoUrl })
        .eq('id', userId)
        .then(({ error }) => {
          if (error) console.warn('Profiles table update skipped (RLS):', error.message);
        });

      // Update sessionStorage
      const updated = { ...parsed, name, logo: finalLogoUrl };
      sessionStorage.setItem("customer_auth", JSON.stringify(updated));

      // Broadcast profile_updated agar chat rider langsung sinkron
      const socket = io("http://localhost:5000");
      socket.on("connect", () => {
        socket.emit("profile_updated", { userId: userId, role: "customer", name, logo: finalLogoUrl });
        setTimeout(() => socket.disconnect(), 1500);
      });

      setSuccess(true);
      setTimeout(() => { window.location.href = "/cari-rider"; }, 1500);
    } catch (err: any) {
      console.error("Save error:", err);
      alert(`Gagal menyimpan profil: ${err.message}`);
    } finally {
      setLoading(false);
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
            {/* Foto profil */}
            <div className="flex items-center gap-5 mb-8 border-b border-zinc-100 pb-6">
              <div
                className="w-20 h-20 rounded-full bg-[#FAF8F5] border-2 border-[#5C3D2E] flex items-center justify-center overflow-hidden cursor-pointer relative group flex-shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Foto Profil" className="w-full h-full object-contain p-1" />
                ) : (
                  <User className="w-8 h-8 text-[#5C3D2E]/40" />
                )}
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white mb-1" />
                  <span className="text-white text-[10px] font-bold">Ubah</span>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
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
                    disabled
                    className="w-full bg-zinc-100 border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-zinc-500 text-sm cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">Email tidak dapat diubah</p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full py-3.5 rounded-xl bg-[#A06C46] hover:bg-[#5C3D2E] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader className="w-4 h-4 animate-spin" />Menyimpan...</>
                  ) : (
                    <><Save className="w-4 h-4" />Simpan Perubahan</>
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
