"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Save, Loader, CheckCircle, Camera, Coffee } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRiderAuth } from "../layout";
import { io } from "socket.io-client";

export default function RiderEditProfilePage() {
  const router = useRouter();
  const { riderAuth } = useRiderAuth();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [brand, setBrand] = useState("");
  const [logo, setLogo] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Coba dari context dulu
    if (riderAuth) {
      setName(riderAuth.name || "");
      setEmail(riderAuth.email || "");
      setBrand(riderAuth.brand || "");
      setLogo(riderAuth.logo || "");
      setPreviewUrl(riderAuth.logo || "");
      setCheckingAuth(false);
      return;
    }
    // Fallback: baca langsung dari sessionStorage
    const auth = sessionStorage.getItem("rider_auth");
    if (auth) {
      const parsed = JSON.parse(auth);
      setName(parsed.name || "");
      setEmail(parsed.email || "");
      setBrand(parsed.brand || "");
      setLogo(parsed.logo || "");
      setPreviewUrl(parsed.logo || "");
      setCheckingAuth(false);
    } else {
      router.replace("/rider-login");
    }
  }, [riderAuth, router]);

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

    const auth = sessionStorage.getItem("rider_auth");
    if (!auth) {
      setLoading(false);
      alert("Sesi tidak ditemukan. Silakan login ulang.");
      return;
    }
    const parsed = JSON.parse(auth);
    const userId = parsed.id;

    try {
      // Pertahankan logo lama jika tidak ada file baru yang dipilih
      let finalLogoUrl = logo;

      // Upload foto baru jika ada
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
        const fileName = `rider-${userId}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('menu_images')
          .upload(filePath, selectedFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('menu_images').getPublicUrl(filePath);
        finalLogoUrl = urlData.publicUrl;
      }

      // ✅ Update via Supabase Auth API (bypass RLS, tidak perlu service key)
      const { error: metaError } = await supabase.auth.updateUser({
        data: { name, brand, logo: finalLogoUrl }
      });
      if (metaError) throw metaError;

      // Best-effort: update profiles table juga (mungkin gagal karena RLS, tidak apa)
      await supabase
        .from('profiles')
        .update({ name, brand, logo: finalLogoUrl })
        .eq('id', userId)
        .then(({ error }) => {
          if (error) console.warn('Profiles table update skipped (RLS):', error.message);
          else console.log('✅ Profiles table updated');
        });

      // Update sessionStorage
      const updated = { ...parsed, name, email, brand, logo: finalLogoUrl };
      sessionStorage.setItem("rider_auth", JSON.stringify(updated));

      // Broadcast profile_updated ke semua client yang sedang chat
      const socket = io("http://localhost:5000");
      socket.on("connect", () => {
        socket.emit("profile_updated", { userId: userId, role: "rider", name, brand, logo: finalLogoUrl });
        setTimeout(() => socket.disconnect(), 1500);
      });

      setSuccess(true);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      console.error("Save error:", err);
      alert(`Gagal menyimpan profil: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-[#A06C46] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-500 font-medium">Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Edit Profil Rider</h1>
        <p className="text-zinc-500 mt-1">Perbarui informasi toko kopi dan akunmu</p>
      </div>

      <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-zinc-100">
        <div className="flex items-center gap-6 mb-8 border-b border-zinc-100 pb-8">
          <div 
            className="w-24 h-24 rounded-full bg-[#FAF8F5] border-2 border-[#A06C46] flex items-center justify-center text-[#5C3D2E] flex-shrink-0 shadow-md relative group cursor-pointer overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Logo Brand" className="w-full h-full object-contain p-1" />
            ) : (
              <Coffee className="w-10 h-10 text-[#A06C46]/40" />
            )}
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white mb-1" />
              <span className="text-white text-[10px] font-bold">Ubah Logo</span>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          <div>
            <h2 className="text-xl font-extrabold text-zinc-900 leading-tight">Logo / Foto Brand</h2>
            <p className="text-sm text-zinc-500 mt-1">Klik gambar di samping untuk mengganti logo toko</p>
          </div>
        </div>

        {success && (
          <div className="mb-8 p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-green-800">Profil Berhasil Diperbarui!</p>
              <p className="text-xs text-green-700 mt-0.5">Memuat ulang halaman...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-zinc-700 text-xs font-bold mb-1.5 block">Nama Lengkap Rider</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-zinc-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A06C46]/30 focus:border-[#A06C46] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-700 text-xs font-bold mb-1.5 block">Nama Brand Kopi</label>
              <div className="relative">
                <Coffee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-zinc-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A06C46]/30 focus:border-[#A06C46] transition-all"
                />
              </div>
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

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading || success}
              className="px-8 py-3.5 rounded-xl bg-[#A06C46] hover:bg-[#5C3D2E] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
  );
}
