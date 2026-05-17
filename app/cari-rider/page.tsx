"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Search, X, SlidersHorizontal, Coffee, MapPin, Clock, ChevronRight, Navigation, MessageCircle, Map as MapIcon, ChevronLeft, Bike } from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export interface Rider {
  id: string;
  name: string;
  brand: string;
  logo: string;
  lat: number;
  lng: number;
  status: string;
  startTime?: string;
  landmark?: string;
}

export type MenuType = {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  available: boolean;
  stock: number;
};

// Lazy-load map (SSR disabled)
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

const filtersList = ["Semua", "Terdekat"];

export default function CariRiderPage() {
  const router = useRouter();
  
  const [activeRiders, setActiveRiders] = useState<Rider[]>([]);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Menu Overlay States
  const [showMenuOverlay, setShowMenuOverlay] = useState(false);
  const [menus, setMenus] = useState<MenuType[]>([]);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // ── AUTH GUARD ────────────────────────────────────────────────────────────
  useEffect(() => {
    const auth = sessionStorage.getItem("customer_auth");
    if (!auth) {
      router.replace("/login");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  // Background GPS Tracker
  const [currentLivePos, setCurrentLivePos] = useState<[number, number] | null>(null);
  useEffect(() => {
    if (navigator.geolocation) {
      const wid = navigator.geolocation.watchPosition(
        (pos) => setCurrentLivePos([pos.coords.latitude, pos.coords.longitude]),
        () => {},
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(wid);
    }
  }, []);

  // ── INIT SUPABASE REALTIME ────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      try {
        const { data, error } = await supabase.from('active_riders').select('*').eq('status', 'online');
        
        if (!error && data) {
          if (isMounted) {
            setActiveRiders(data.map((r: any) => ({
              id: r.rider_id,
              name: r.name,
              brand: r.brand,
              logo: r.logo,
              lat: r.lat,
              lng: r.lng,
              status: r.status,
              startTime: r.start_time,
              landmark: r.landmark
            })));
          }
        }
      } catch (err) {
        console.error("Fetch initial data error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInitialData();

    // Subscribe to active_riders changes
    const channel = supabase
      .channel('active_riders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'active_riders' }, (payload) => {
        const event = payload.eventType;
        const newData = payload.new as any;
        const oldData = payload.old as any;

        setActiveRiders(prev => {
          if (event === 'INSERT' || event === 'UPDATE') {
            if (newData.status === 'online') {
              const mapped = {
                id: newData.rider_id,
                name: newData.name,
                brand: newData.brand,
                logo: newData.logo,
                lat: newData.lat,
                lng: newData.lng,
                status: newData.status,
                startTime: newData.start_time,
                landmark: newData.landmark
              };
              const idx = prev.findIndex(r => r.id === mapped.id);
              if (idx !== -1) {
                // Update only if data actually changed to avoid shallow comparison issues
                const existing = prev[idx];
                if (existing.lat === mapped.lat && existing.lng === mapped.lng && existing.status === mapped.status && existing.landmark === mapped.landmark) {
                  return prev;
                }
                const next = [...prev];
                next[idx] = mapped;
                return next;
              }
              return [...prev, mapped];
            } else {
              // Status changed to offline
              return prev.filter(r => r.id !== newData.rider_id);
            }
          } else if (event === 'DELETE') {
            return prev.filter(r => r.id !== oldData.rider_id);
          }
          return prev;
        });

        // Clean up selectedRider if it goes offline
        if (event === 'UPDATE' && newData.status !== 'online') {
          setSelectedRider(current => (current?.id === newData.rider_id ? null : current));
        } else if (event === 'DELETE') {
          setSelectedRider(current => (current?.id === oldData.rider_id ? null : current));
        }
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);


  // Auto close menu overlay when rider unselected
  useEffect(() => {
    if (!selectedRider) {
      setShowMenuOverlay(false);
    }
  }, [selectedRider]);

  // ── FILTER DATA ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    // BATAS RADIUS TRACKING (5 KM)
    // Alasan: 
    // 1. UX/Relevansi: Pelanggan kopi keliling biasanya tidak akan memesan jika jarak rider > 5km karena es akan mencair, kopi jadi dingin, atau waktu tunggu terlalu lama.
    // 2. Performa: Mencegah map/sidebar terbebani (lag) oleh data rider dari kota lain yang tidak relevan.
    // 3. Hiper-lokal: Memastikan esensi "kopi keliling" tetap terjaga sebagai layanan di sekitar pelanggan.
    const MAX_RADIUS_KM = 5; 
    const R = 6371;
    const calcDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const dLat = (lat2 - lat1) * Math.PI / 180;  
      const dLon = (lon2 - lon1) * Math.PI / 180; 
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2); 
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    };

    let result = activeRiders.filter((r) => {
      // Jika tab "Terdekat", batasi hanya radius 5 KM
      if (activeFilter === "Terdekat" && currentLivePos) {
        const dist = calcDist(currentLivePos[0], currentLivePos[1], r.lat, r.lng);
        if (dist > MAX_RADIUS_KM) return false;
      }

      const matchQuery =
        query === "" ||
        r.brand.toLowerCase().includes(query.toLowerCase()) ||
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        (r.landmark || "").toLowerCase().includes(query.toLowerCase());
      return matchQuery;
    });

    if (activeFilter === "Terdekat" && currentLivePos) {
      // Urutkan dari yang paling dekat
      result = result.sort((a, b) => {
        const distA = calcDist(currentLivePos[0], currentLivePos[1], a.lat, a.lng);
        const distB = calcDist(currentLivePos[0], currentLivePos[1], b.lat, b.lng);
        return distA - distB;
      });
    } else {
      // Tab "Semua": Urutkan berdasarkan yang paling baru mulai ngetem
      result = result.sort((a, b) => {
        const timeA = a.startTime ? new Date(a.startTime).getTime() : 0;
        const timeB = b.startTime ? new Date(b.startTime).getTime() : 0;
        return timeB - timeA;
      });
    }

    return result;
  }, [query, activeFilter, activeRiders, currentLivePos]);

  // ── HANDLERS ─────────────────────────────────────────────────────────────
  const handleSelectRider = useCallback((rider: Rider | null) => {
    setSelectedRider(rider);
    setShowMenuOverlay(false);
    if (rider) setSidebarOpen(false); // Auto close sidebar on mobile
  }, []);

  const openGoogleMaps = useCallback((rider?: Rider) => {
    const targetRider = rider || selectedRider;
    if (!targetRider) return;
    const url = `https://www.google.com/maps?daddr=${targetRider.lat},${targetRider.lng}`;
    window.open(url, "_blank");
  }, [selectedRider]);

  const openChat = useCallback((rider?: Rider) => {
    const targetRider = rider || selectedRider;
    if (!targetRider) return;
    router.push(`/pesan?riderId=${targetRider.id}`);
  }, [router, selectedRider]);

  const getDistanceText = (lat1?: number, lon1?: number, lat2?: number, lon2?: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return "Belum diketahui";
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;  
    const dLon = (lon2 - lon1) * Math.PI / 180; 
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return `${(R * c).toFixed(1)} km`;
  };

  const fetchMenu = useCallback(async (rider?: Rider) => {
    const targetRider = rider || selectedRider;
    if (!targetRider) return;
    setShowMenuOverlay(true);
    setLoadingMenus(true);
    
    try {
      const { data, error } = await supabase.from('menus').select('*').eq('rider_id', targetRider.id);
      if (!error && data) {
        // Sort available first, then alphabetically
        const sorted = data.sort((a: any, b: any) => {
          if (a.available === b.available) return a.name.localeCompare(b.name);
          return a.available ? -1 : 1;
        });
        setMenus(sorted);
      } else {
        setMenus([]);
      }
    } catch (err) {
      console.error("Error fetching menu:", err);
      setMenus([]);
    } finally {
      setLoadingMenus(false);
    }
  }, [selectedRider]);


  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#5C3D2E] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-500 font-medium">Memverifikasi sesi...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#FAF8F5] relative">

        {/* ===== SIDEBAR KIRI (Daftar Rider) ===== */}
        <aside
          className={`
            flex-shrink-0 w-full md:w-[360px] lg:w-[400px] bg-white border-r border-zinc-100 shadow-sm
            flex flex-col z-20 absolute md:relative inset-0 md:inset-auto
            transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          {/* Header Sidebar */}
          <div className="px-5 pt-5 pb-4 border-b border-zinc-100 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-lg font-extrabold text-zinc-900 leading-tight">Cari Rider</h1>
                <p className="text-xs text-zinc-400 mt-0.5">
                  <span className="text-green-500 font-bold">{filtered.length}</span> rider aktif di sekitarmu
                </p>
              </div>
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
                placeholder="Cari rider atau patokan..."
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

            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {filtersList.map((filterName) => (
                <button
                  key={filterName}
                  onClick={() => setActiveFilter(filterName)}
                  className={`flex-shrink-0 text-xs font-bold px-4 py-1.5 rounded-full border transition-all duration-200 ${
                    activeFilter === filterName
                      ? "bg-[#FAF8F5] text-[#5C3D2E] border-[#5C3D2E]"
                      : "bg-white text-zinc-500 border-zinc-200 hover:text-zinc-700"
                  }`}
                >
                  {filterName}
                </button>
              ))}
            </div>
          </div>

          {/* List Rider */}
          <div className="flex-1 overflow-y-auto py-3 px-3 space-y-2 bg-zinc-50/50">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <div className="w-8 h-8 border-4 border-[#5C3D2E] border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm font-semibold text-zinc-500">Mencari rider...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Bike className="w-10 h-10 text-zinc-300 mb-3" />
                <p className="text-sm font-semibold text-zinc-500">Tidak ada rider ditemukan</p>
                <p className="text-xs text-zinc-400 mt-1">Coba ubah filter atau kata kunci pencarian</p>
              </div>
            ) : (
              filtered.map((rider) => {
                const isSelected = String(selectedRider?.id) === String(rider.id);
                const initials = rider.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <button
                    key={rider.id}
                    onClick={() => handleSelectRider(rider)}
                    className={`w-full text-left rounded-2xl border p-3.5 transition-all duration-200 group ${
                      isSelected
                        ? "border-[#5C3D2E] ring-1 ring-[#5C3D2E] bg-white shadow-sm"
                        : "border-zinc-200 bg-white hover:border-[#A06C46]/40 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-base shadow-sm border-2 overflow-hidden ${
                        isSelected
                          ? "bg-white text-[#5C3D2E] border-[#5C3D2E]"
                          : "bg-[#FAF8F5] text-[#5C3D2E] border-[#E8DCCB]"
                      }`}>
                        {rider.logo ? (
                          <img src={rider.logo} alt={rider.brand} className="w-full h-full object-contain p-1" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        ) : (
                          initials
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-bold text-sm text-zinc-900 truncate">{rider.name}</p>
                          <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Ngetem
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[11px] font-semibold text-[#A06C46] truncate bg-[#A06C46]/10 px-1.5 py-0.5 rounded-md">{rider.brand}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                          <p className="text-[11px] text-zinc-500 truncate">
                            {currentLivePos ? `Berjarak ${getDistanceText(currentLivePos[0], currentLivePos[1], rider.lat, rider.lng)}` : "Mencari lokasi Anda..."}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-colors \${
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
        <div className="flex-1 relative flex flex-col">
          {/* Mobile toggle button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden absolute top-4 left-4 z-10 flex items-center gap-2 bg-white shadow-md rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-700 border border-zinc-200 hover:bg-zinc-50 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#5C3D2E]" />
            Daftar Rider
          </button>

          {/* RiderMap */}
          <div className="flex-1 relative">
            <RiderMap
              activeRiders={filtered}
              selectedRider={selectedRider}
              onSelectRider={handleSelectRider}
              currentLivePos={currentLivePos}
              onOpenMenu={fetchMenu}
              onOpenChat={openChat}
              onOpenMaps={openGoogleMaps}
            />
          </div>

          {/* ===== OVERLAY RIDER (Premium Glassmorphism) ===== */}



          {/* ===== OVERLAY MENU (Ultra Premium Bottom Sheet) ===== */}
          {selectedRider && showMenuOverlay && (
            <div className="absolute inset-0 z-[100] flex items-end md:items-center justify-center pointer-events-none">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity duration-300 animate-in fade-in"
                onClick={() => setShowMenuOverlay(false)}
              />
              
              {/* Content Panel */}
              <div className="relative w-full h-[85vh] md:h-[650px] md:w-[480px] bg-[#FAF8F5] rounded-t-[32px] md:rounded-[32px] shadow-2xl pointer-events-auto flex flex-col overflow-hidden animate-in slide-in-from-bottom-full md:slide-in-from-bottom-8 md:fade-in duration-300 ease-out border border-[#E8DCCB]/50">
                {/* Drag Handle (Mobile) */}
                <div className="md:hidden flex justify-center pt-3 pb-2 bg-white rounded-t-[32px] shrink-0">
                  <div className="w-12 h-1.5 bg-zinc-200 rounded-full" />
                </div>

                {/* Premium Header */}
                <div className="relative px-6 py-4 flex items-center justify-between border-b border-zinc-100 bg-white/95 backdrop-blur-md z-10 shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-100 shadow-sm bg-white p-1">
                      {selectedRider.logo ? (
                        <img src={selectedRider.logo} alt={selectedRider.brand} className="w-full h-full object-contain" onError={(e) => (e.currentTarget.src = '/brand_coffe/KSJ.png')} />
                      ) : (
                        <div className="w-full h-full bg-[#5C3D2E] text-white flex items-center justify-center font-bold text-lg">
                          {selectedRider.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight leading-none mb-1 truncate max-w-[200px]">{selectedRider.name}</h2>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#A06C46] bg-[#A06C46]/10 px-2 py-0.5 rounded-full">{selectedRider.brand}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowMenuOverlay(false)} 
                    className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-5">
                  <div className="mb-5 flex items-end justify-between">
                    <div>
                      <h3 className="font-extrabold text-zinc-900 text-lg">Eksplorasi Menu</h3>
                      <p className="text-[13px] text-zinc-500 font-medium mt-0.5">Disajikan segar langsung dari motor</p>
                    </div>
                    {menus.length > 0 && (
                      <span className="text-[11px] font-bold text-zinc-400 bg-white px-2.5 py-1 rounded-full border border-zinc-200 shadow-sm">
                        {menus.filter(m => m.available && m.stock > 0).length} Tersedia
                      </span>
                    )}
                  </div>

                  {loadingMenus ? (
                    <div className="flex flex-col items-center justify-center h-48 space-y-4">
                      <div className="w-10 h-10 border-4 border-[#A06C46]/30 border-t-[#5C3D2E] rounded-full animate-spin" />
                      <p className="text-sm font-semibold text-zinc-500">Mencari menu terenak...</p>
                    </div>
                  ) : menus.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center bg-white rounded-[24px] border border-dashed border-zinc-200 p-6 shadow-sm">
                      <div className="w-14 h-14 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-3">
                        <Coffee className="w-6 h-6 text-zinc-300" />
                      </div>
                      <p className="font-bold text-zinc-700 mb-1">Yah, belum ada menu</p>
                      <p className="text-[13px] text-zinc-400 max-w-[250px] leading-relaxed">Rider ini belum mengatur daftar menu jualannya di aplikasi.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 pb-8">
                      {menus.map(menu => (
                        <div 
                          key={menu.id} 
                          className={`group bg-white rounded-[20px] p-3 flex gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_20px_rgba(160,108,70,0.08)] border border-transparent \${!menu.available || menu.stock <= 0 ? 'opacity-60 grayscale-[0.3]' : 'hover:border-[#E8DCCB] cursor-pointer'}`}
                        >
                          <div className="relative w-[110px] h-[110px] rounded-2xl bg-[#FAF8F5] border border-zinc-100 overflow-hidden flex-shrink-0 shadow-inner">
                            {menu.image_url ? (
                              <img src={menu.image_url} alt={menu.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-zinc-50">
                                <Coffee className="w-8 h-8 text-zinc-200" />
                              </div>
                            )}
                            {(!menu.available || menu.stock <= 0) && (
                              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                <span className="bg-zinc-800 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">HABIS</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col flex-1 py-1.5 pr-1">
                            <h4 className="font-extrabold text-zinc-900 text-[15px] leading-tight mb-1 group-hover:text-[#5C3D2E] transition-colors">{menu.name}</h4>
                            <p className="text-[12px] text-zinc-500 line-clamp-2 leading-relaxed flex-1">{menu.description}</p>
                            
                            <div className="flex items-end justify-between mt-3">
                              <span className="font-black text-[#5C3D2E] text-base tracking-tight">Rp {menu.price.toLocaleString('id-ID')}</span>
                              
                              {menu.available && menu.stock > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded-lg border border-zinc-200">
                                    Sisa: {menu.stock}
                                  </span>
                                  <span className="text-[10px] font-bold text-[#A06C46] bg-[#A06C46]/10 px-2 py-1 rounded-lg border border-[#A06C46]/20">
                                    Tersedia
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/30 z-10 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </>
  );
}
