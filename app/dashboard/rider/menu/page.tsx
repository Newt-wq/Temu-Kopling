"use client";

import { useState, useRef } from "react";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, ImagePlus, Minus, ChevronUp } from "lucide-react";

type MenuItem = {
  id: number;
  name: string;
  price: number;
  desc: string;
  image: string | null;
  stock: number;
  available: boolean;
};

const initialMenus: MenuItem[] = [
  { id: 1, name: "Kopi Susu Jago", price: 18000, desc: "Signature kopi susu khas Jago dengan paduan espresso dan gula aren.", image: "/brand_coffe/jago/kopi susu jago.png", stock: 20, available: true },
  { id: 2, name: "Salted Caramel Latte", price: 22000, desc: "Perpaduan manisnya karamel dan gurihnya sea salt.", image: "/brand_coffe/jago/Salted Caramel Latte.png", stock: 15, available: true },
  { id: 3, name: "Matcha Latte", price: 20000, desc: "Teh hijau matcha premium yang lembut dan menenangkan.", image: "/brand_coffe/jago/matcha.png", stock: 10, available: true },
  { id: 4, name: "Citrus Cold Brew", price: 20000, desc: "Cold brew menyegarkan dengan sentuhan buah citrus asam manis.", image: "/brand_coffe/jago/Citrus Cold Brew.png", stock: 0, available: false },
  { id: 5, name: "Chocolate", price: 18000, desc: "Minuman cokelat pekat yang kaya rasa.", image: "/brand_coffe/jago/chocolate.png", stock: 8, available: true },
];

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

function MenuCard({ item, onToggle, onStockChange, onDelete, onEdit }: {
  item: MenuItem;
  onToggle: (id: number) => void;
  onStockChange: (id: number, delta: number) => void;
  onDelete: (id: number) => void;
  onEdit: (item: MenuItem) => void;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 overflow-hidden ${item.available ? "border-zinc-100" : "border-zinc-100 opacity-60"}`}>
      {/* Gambar */}
      <div className="relative w-full h-40 bg-zinc-100 overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
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
        <p className="text-xs text-zinc-400 mb-3 leading-relaxed">{item.desc}</p>

        {/* Stock */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-zinc-500">Stok</span>
          <div className="flex items-center gap-2">
            <button onClick={() => onStockChange(item.id, -1)} disabled={item.stock <= 0}
              className="w-7 h-7 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 transition-colors">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-sm font-bold text-zinc-900 w-6 text-center">{item.stock}</span>
            <button onClick={() => onStockChange(item.id, +1)}
              className="w-7 h-7 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(item)} className="w-8 h-8 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-[#5C3D2E] hover:border-[#5C3D2E]/50 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(item.id)} className="w-8 h-8 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-red-500 hover:border-red-200 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle switch */}
          <button onClick={() => onToggle(item.id)} className="flex items-center gap-2 group">
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

type FormState = { name: string; price: string; desc: string; stock: string; image: string | null };
const emptyForm: FormState = { name: "", price: "", desc: "", stock: "10", image: null };

export default function MenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>(initialMenus);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const fileRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const handleToggle = (id: number) => setMenus(prev => prev.map(m => m.id === id ? { ...m, available: !m.available } : m));
  const handleStock = (id: number, delta: number) => setMenus(prev => prev.map(m => m.id === id ? { ...m, stock: Math.max(0, m.stock + delta) } : m));
  const handleDelete = (id: number) => setMenus(prev => prev.filter(m => m.id !== id));

  const handleEdit = (item: MenuItem) => {
    setEditId(item.id);
    setForm({ name: item.name, price: String(item.price), desc: item.desc, stock: String(item.stock), image: item.image });
    setShowForm(true);
    
    // Auto scroll ke atas menuju form
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm(f => ({ ...f, image: url }));
  };

  const handleSave = () => {
    if (!form.name || !form.price) return;
    if (editId) {
      setMenus(prev => prev.map(m => m.id === editId ? { ...m, name: form.name, price: Number(form.price), desc: form.desc, stock: Number(form.stock), image: form.image } : m));
    } else {
      setMenus(prev => [...prev, { id: Date.now(), name: form.name, price: Number(form.price), desc: form.desc, stock: Number(form.stock), image: form.image, available: true }]);
    }
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div ref={topRef} className="flex items-center justify-between mb-6 scroll-mt-6">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900">Menu Jualan</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{menus.length} menu · {menus.filter(m => m.available).length} tersedia</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }}
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
              className="sm:col-span-2 h-36 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex items-center justify-center cursor-pointer hover:border-[#5C3D2E]/50 transition-colors overflow-hidden"
            >
              {form.image ? (
                <img src={form.image} alt="preview" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-center text-zinc-400">
                  <ImagePlus className="w-8 h-8 mx-auto mb-1" />
                  <p className="text-xs">Klik untuk upload gambar</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />

            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1 block">Nama Menu *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="cth. Es Kopi Susu" className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/30 focus:border-[#5C3D2E]" />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1 block">Harga *</label>
              <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} type="number"
                placeholder="18000" className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/30 focus:border-[#5C3D2E]" />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-500 mb-1 block">Deskripsi</label>
              <textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} rows={2}
                placeholder="Deskripsikan menu ini..." className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/30 focus:border-[#5C3D2E] resize-none" />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1 block">Stok Awal</label>
              <input value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} type="number"
                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/30 focus:border-[#5C3D2E]" />
            </div>

            <div className="flex items-end">
              <button onClick={handleSave} className="w-full py-2.5 rounded-xl bg-[#5C3D2E] text-white text-sm font-bold hover:bg-[#4A2B12] transition-colors">
                {editId ? "Simpan Perubahan" : "Tambahkan Menu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid menu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {menus.map(item => (
          <MenuCard key={item.id} item={item} onToggle={handleToggle} onStockChange={handleStock} onDelete={handleDelete} onEdit={handleEdit} />
        ))}
      </div>
    </div>
  );
}
