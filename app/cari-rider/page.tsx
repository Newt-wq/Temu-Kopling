"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Search, MapPin, Coffee, ChevronRight, Navigation, MessageCircle, X, SlidersHorizontal, Clock } from "lucide-react";
import { riders, Rider } from "@/lib/riders-data";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ChatOverlay from "@/components/ChatOverlay";

// Lazy-load map (SSR disabled — Leaflet needs browser)
const RiderMap = dynamic(() => import("@/components/RiderMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#FAF8F5] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#5C3D2E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-zinc-500 font-medium">Memuat peta...</p>
      </div>
    </div>
  ),
});

const brandFilters = ["Semua", "Jago Coffee", "Kopi Susu Jalanan", "Calf"];

export default function CariRiderPage() {
  const [query, setQuery] = useState("");
  const [activeBrand, setActiveBrand] = useState("Semua");
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile toggle
  const [chatRider, setChatRider] = useState<Rider | null>(null);
  const [customerAuth, setCustomerAuth] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = sessionStorage.getItem("customer_auth");
    if (auth) {
      setCustomerAuth(JSON.parse(auth));
      setCheckingAuth(false);
    } else {
      router.replace("/login");
    }
  }, [router]);

  const filtered = useMemo(() => {
    return riders.filter((r) => {
      const matchBrand = activeBrand === "Semua" || r.brand === activeBrand;
      const matchQuery =
        query === "" ||
        r.brand.toLowerCase().includes(query.toLowerCase()) ||
        r.riderName.toLowerCase().includes(query.toLowerCase()) ||
        r.landmark.toLowerCase().includes(query.toLowerCase());
      return matchBrand && matchQuery;
    });
  }, [query, activeBrand]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#5C3D2E] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-500 font-medium">Memeriksa akses...</p>
      </div>
    );
  }

  const handleChatClick = (rider: Rider) => {
    if (!customerAuth) {
      // Redirect to login if not authenticated
      router.push("/login");
    } else {
      setChatRider(rider);
    }
  };



  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#FAF8F5] relative">

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`
          flex-shrink-0 w-full md:w-[360px] lg:w-[400px] bg-white border-r border-zinc-100 shadow-sm
          flex flex-col z-20
          absolute md:relative inset-0 md:inset-auto
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Header Sidebar */}
        <div className="px-5 pt-5 pb-4 border-b border-zinc-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-extrabold text-zinc-900 leading-tight">Cari Rider</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                <span className="text-green-500 font-bold">{filtered.length}</span> rider aktif di sekitarmu
              </p>
            </div>
            {/* Close button mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari rider atau brand kopi..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-[#FAF8F5] text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/30 focus:border-[#5C3D2E] transition"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Brand Filter Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {brandFilters.map((brand) => (
              <button
                key={brand}
                onClick={() => setActiveBrand(brand)}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 ${
                  activeBrand === brand
                    ? "bg-[#5C3D2E] text-white border-[#5C3D2E]"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-[#5C3D2E]/50"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Rider List */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Coffee className="w-10 h-10 text-zinc-300 mb-3" />
              <p className="text-sm font-semibold text-zinc-500">Tidak ada rider ditemukan</p>
              <p className="text-xs text-zinc-400 mt-1">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          ) : (
            filtered.map((rider) => {
              const isSelected = selectedRider?.id === rider.id;
              // Inisial dari nama rider
              const initials = rider.riderName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
              return (
                <button
                  key={rider.id}
                  onClick={() => {
                    setSelectedRider(rider);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left rounded-2xl border p-3.5 transition-all duration-200 group ${
                    isSelected
                      ? "border-[#5C3D2E] bg-[#5C3D2E]/5 shadow-sm"
                      : "border-zinc-100 bg-white hover:border-[#A06C46]/40 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar inisial rider */}
                    <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-base shadow-sm border-2 ${
                      isSelected
                        ? "bg-[#5C3D2E] text-white border-[#5C3D2E]"
                        : "bg-[#FAF8F5] text-[#5C3D2E] border-[#E8DCCB]"
                    }`}>
                      {initials}
                    </div>

                    {/* Info rider */}
                    <div className="flex-1 min-w-0">
                      {/* Baris 1: nama rider + status */}
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-bold text-sm text-zinc-900 truncate">{rider.riderName}</p>
                        <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          Ngetem
                        </span>
                      </div>

                      {/* Baris 2: badge brand */}
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="relative w-4 h-4 rounded-full overflow-hidden border border-zinc-200 bg-white flex-shrink-0">
                          <Image src={rider.logo} alt={rider.brand} fill className="object-contain" />
                        </div>
                        <span className="text-[11px] font-semibold text-[#A06C46] truncate">{rider.brand}</span>
                      </div>

                      {/* Baris 3: patokan + jam + jarak */}
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                        <p className="text-[11px] text-zinc-400 truncate">{rider.landmark}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                        <p className="text-[11px] text-zinc-400">Sejak {rider.ngetemSince}</p>
                        <span className="ml-auto flex-shrink-0 text-[11px] font-bold text-[#5C3D2E]">{rider.distance}</span>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isSelected ? "text-[#5C3D2E]" : "text-zinc-300 group-hover:text-zinc-500"
                    }`} />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ===== MAP AREA ===== */}
      <div className="flex-1 relative">
        {/* Mobile toggle button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden absolute top-4 left-4 z-10 flex items-center gap-2 bg-white shadow-md rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-700 border border-zinc-200 hover:bg-zinc-50 transition-all"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#5C3D2E]" />
          Daftar Rider
        </button>

        {/* Selected rider info bar (mobile) */}
        {selectedRider && (
          <div className="md:hidden absolute bottom-0 left-0 right-0 z-10 bg-white border-t border-zinc-100 shadow-2xl rounded-t-2xl px-5 py-4">
            {/* Rider identity */}
            <div className="flex items-center gap-3 mb-3">
              {/* Avatar */}
              <div className="w-11 h-11 flex-shrink-0 rounded-full bg-[#5C3D2E] flex items-center justify-center font-bold text-white text-sm">
                {selectedRider.riderName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-zinc-900">{selectedRider.riderName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="relative w-3.5 h-3.5 rounded-full overflow-hidden border border-zinc-200 bg-white">
                    <Image src={selectedRider.logo} alt={selectedRider.brand} fill className="object-contain" />
                  </div>
                  <span className="text-xs text-[#A06C46] font-semibold">{selectedRider.brand}</span>
                  <span className="text-zinc-300">·</span>
                  <span className="text-xs text-zinc-500">{selectedRider.distance}</span>
                </div>
              </div>
              <button onClick={() => setSelectedRider(null)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleChatClick(selectedRider)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#5C3D2E] text-white text-sm font-semibold hover:bg-[#4A2B12] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Chat Rider
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#5C3D2E] text-[#5C3D2E] text-sm font-semibold hover:bg-[#5C3D2E]/5 transition-colors">
                <Navigation className="w-4 h-4" />
                Lihat Rute
              </button>
            </div>
          </div>
        )}

        <RiderMap
          selectedRider={selectedRider}
          onSelectRider={setSelectedRider}
          onChatClick={handleChatClick}
        />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Chat Overlay */}
      {chatRider && customerAuth && (
        <ChatOverlay 
          rider={chatRider} 
          customerAuth={customerAuth} 
          onClose={() => setChatRider(null)} 
        />
      )}
    </div>
    </>
  );
}
