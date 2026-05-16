"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Pencil, Trash2, ImagePlus, Minus, ChevronUp, Coffee } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRiderAuth } from "../layout";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string | null;
  stock: number;
  available: boolean;
};

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

function MenuCard({ item, onToggle, onStockChange, onDelete, onEdit, loadingAction }: {
  item: MenuItem;
  onToggle: (id: string, current: boolean) => void;
  onStockChange: (id: string, newStock: number) => void;
  onDelete: (id: string) => void;
  onEdit: (item: MenuItem) => void;
  loadingAction: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 overflow-hidden ${item.available ? "border-zinc-100" : "border-zinc-100 opacity-60"}`}>
      {/* Gambar */}
      <div className="relative w-full h-40 bg-zinc-100 overflow-hidden">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-contain p-2" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300">
            <ImagePlus className="w-8 h-8" />
          </div>
        )}
        {/* Available badge */}
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${item.available ? "bg-green-500 text-white" : "bg-zinc-400 text-white"}`}>
          {item.available ? "Tersedia" : "Habis"}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-zinc-900 text-sm leading-tight">{item.name}</h3>
          <span className="text-sm font-bold text-[#5C3D2E] whitespace-nowrap">{fmt(item.price)}</span>
        </div>
        <p className="text-xs text-zinc-400 mb-3 leading-relaxed line-clamp-2 min-h-[32px]">{item.description}</p>

        {/* Stock */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-zinc-500">Stok</span>
          <div className="flex items-center gap-2">
            <button onClick={() => onStockChange(item.id, Math.max(0, item.stock - 1))} disabled={item.stock <= 0 || loadingAction}
              className="w-7 h-7 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 transition-colors">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-bold text-zinc-900 w-6 text-center">{item.stock}</span>
            <button onClick={() => onStockChange(item.id, item.stock + 1)} disabled={loadingAction}
              className="w-7 h-7 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-30">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(item)} disabled={loadingAction} className="w-8 h-8 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-[#5C3D2E] hover:border-[#5C3D2E]/50 transition-colors disabled:opacity-50">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(item.id)} disabled={loadingAction} className="w-8 h-8 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-red-500 hover:border-red-200 transition-colors disabled:opacity-50">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle switch */}
          <button onClick={() => onToggle(item.id, item.available)} disabled={loadingAction} className="flex items-center gap-2 group disabled:opacity-50">
            <span className={`text-xs font-semibold transition-colors w-[52px] text-right ${item.available ? "text-green-600" : "text-zinc-500"}`}>
              {item.available ? "Tersedia" : "Habis"}
            </span>
            <div className={`relative w-10 h-5 rounded-full transition-colors duration-300 flex-shrink-0 ${item.available ? "bg-green-500" : "bg-zinc-300"}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${item.available ? "translate-x-5" : "translate-x-0"}`} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

type FormState = { name: string; price: string; description: string; stock: string; image_url: string | null };
const emptyForm: FormState = { name: "", price: "", description: "", stock: "10", image_url: null };

export default function MenuPage() {
  const { riderAuth } = useRiderAuth();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!riderAuth?.id) return;
    fetchMenus();
  }, [riderAuth?.id]);

  const fetchMenus = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("menus")
      .select("*")
      .eq("rider_id", riderAuth!.id)
      .order("name");
      
    if (!error && data) {
      setMenus(data);
    }
    setLoading(false);
  };

  const handleToggle = async (id: string, current: boolean) => {
    setActionLoading(true);
    const { error } = await supabase.from("menus").update({ available: !current }).eq("id", id);
    if (!error) {
      setMenus(prev => prev.map(m => m.id === id ? { ...m, available: !current } : m));
    }
    setActionLoading(false);
  };

  const handleStock = async (id: string, newStock: number) => {
    setActionLoading(true);
    const { error } = await supabase.from("menus").update({ stock: newStock }).eq("id", id);
    if (!error) {
      setMenus(prev => prev.map(m => m.id === id ? { ...m, stock: newStock } : m));
    }
    setActionLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus menu ini?")) return;
    setActionLoading(true);
    const { error } = await supabase.from("menus").delete().eq("id", id);
    if (!error) {
      setMenus(prev => prev.filter(m => m.id !== id));
    }
    setActionLoading(false);
  };

  const handleEdit = (item: MenuItem) => {
    setEditId(item.id);
    setForm({ name: item.name, price: String(item.price), description: item.description, stock: String(item.stock), image_url: item.image_url });
    setSelectedFile(null);
    setShowForm(true);
    
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setForm(f => ({ ...f, image_url: url })); // Preview URL
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !riderAuth) return;
    setSaving(true);
    
    let finalImageUrl = form.image_url;
    
    // Jika ada file gambar baru, upload ke supabase storage
    if (selectedFile) {
      try {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${riderAuth.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('menu_images')
          .upload(filePath, selectedFile);
          
        if (!uploadError) {
          const { data } = supabase.storage.from('menu_images').getPublicUrl(filePath);
          finalImageUrl = data.publicUrl;
        } else {
          console.error("Upload error:", uploadError);
          alert(`Gagal mengupload gambar: ${uploadError.message}. Pastikan bucket 'menu_images' sudah public dan RLS diizinkan.`);
          setSaving(false);
          return;
        }
      } catch (err: any) {
        console.error("Upload failed", err);
        alert(`Terjadi kesalahan saat upload gambar: ${err.message}`);
        setSaving(false);
        return;
      }
    }

    const payload = {
      rider_id: riderAuth.id,
      name: form.name,
      price: Number(form.price),
      description: form.description,
      stock: Number(form.stock),
      image_url: finalImageUrl,
      available: true
    };

    if (editId) {
      // Hilangkan field yang tidak diupdate misal rider_id & available
      const { data, error } = await supabase.from("menus").update({
        name: payload.name,
        price: payload.price,
        description: payload.description,
        stock: payload.stock,
        image_url: payload.image_url
      }).eq("id", editId).select().single();
      
      if (!error && data) {
        setMenus(prev => prev.map(m => m.id === editId ? data : m));
      }
    } else {
      const { data, error } = await supabase.from("menus").insert([payload]).select().single();
      if (!error && data) {
        setMenus(prev => [...prev, data]);
      }
    }

    setSaving(false);
    setForm(emptyForm);
    setSelectedFile(null);
    setEditId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
         <div className="w-8 h-8 border-4 border-[#5C3D2E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div ref={topRef} className="flex items-center justify-between mb-6 scroll-mt-6">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900">Menu Jualan</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{menus.length} menu · {menus.filter(m => m.available).length} tersedia</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); setSelectedFile(null); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5C3D2E] text-white text-sm font-semibold hover:bg-[#4A2B12] transition-all shadow-md shadow-[#5C3D2E]/20"
        >
          {showForm ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Tutup" : "Tambah Menu"}
        </button>
      </div>

      {/* Form tambah/edit */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 mb-6 transition-all">
          <h2 className="font-bold text-zinc-900 mb-4 text-sm">{editId ? "Edit Menu" : "Tambah Menu Baru"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Upload gambar */}
            <div
              onClick={() => fileRef.current?.click()}
              className={`sm:col-span-2 h-36 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex items-center justify-center cursor-pointer hover:border-[#5C3D2E]/50 transition-colors overflow-hidden ${saving ? "opacity-50 pointer-events-none" : ""}`}
            >
              {form.image_url ? (
                <img src={form.image_url} alt="preview" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-center text-zinc-400">
                  <ImagePlus className="w-8 h-8 mx-auto mb-1" />
                  <p className="text-xs">Klik untuk upload gambar</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} disabled={saving} />

            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1 block">Nama Menu *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} disabled={saving}
                placeholder="cth. Es Kopi Susu" className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/30 focus:border-[#5C3D2E] disabled:opacity-50" />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1 block">Harga *</label>
              <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} type="number" disabled={saving}
                placeholder="18000" className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/30 focus:border-[#5C3D2E] disabled:opacity-50" />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-500 mb-1 block">Deskripsi</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} disabled={saving}
                placeholder="Deskripsikan menu ini..." className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/30 focus:border-[#5C3D2E] resize-none disabled:opacity-50" />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1 block">Stok Awal</label>
              <input value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} type="number" disabled={saving}
                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/30 focus:border-[#5C3D2E] disabled:opacity-50" />
            </div>

            <div className="flex items-end">
              <button onClick={handleSave} disabled={saving} className="w-full py-2.5 rounded-xl bg-[#5C3D2E] text-white text-sm font-bold hover:bg-[#4A2B12] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? "Menyimpan..." : (editId ? "Simpan Perubahan" : "Tambahkan Menu")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid menu */}
      {menus.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-zinc-200">
          <Coffee className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-500 font-medium">Belum ada menu, tambahkan menu jualan pertamamu!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {menus.map(item => (
            <MenuCard key={item.id} item={item} onToggle={handleToggle} onStockChange={handleStock} onDelete={handleDelete} onEdit={handleEdit} loadingAction={actionLoading} />
          ))}
        </div>
      )}
    </div>
  );
}
