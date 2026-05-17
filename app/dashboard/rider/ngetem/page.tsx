"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Square, Clock, Navigation, MapPin, X, Check } from "lucide-react";
import { useRiderAuth } from "@/app/dashboard/rider/layout";
import { supabase } from "@/lib/supabase";

const NgetemMap = dynamic(() => import("@/components/NgetemMap"), {
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

export default function NgetemPage() {
  const { riderAuth } = useRiderAuth();

  const [isNgetem, setIsNgetem] = useState(false);
  const [riderPos, setRiderPos] = useState<[number, number] | null>(null);
  const [landmark, setLandmark] = useState("");
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [landmarkInput, setLandmarkInput] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [previewPos, setPreviewPos] = useState<[number, number] | null>(null);
  
  const [elapsedSec, setElapsedSec] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Initialize state from Supabase on load
  useEffect(() => {
    if (!riderAuth) return;

    const checkActiveNgetem = async () => {
      const { data, error } = await supabase
        .from('active_riders')
        .select('*')
        .eq('rider_id', riderAuth.id)
        .eq('status', 'online')
        .single();

      if (data && !error) {
        setIsNgetem(true);
        setRiderPos([data.lat, data.lng]);
        setLandmark(data.landmark || "");
        
        // Restore timer
        const startTime = new Date(data.start_time).getTime();
        const now = Date.now();
        setElapsedSec(Math.floor((now - startTime) / 1000));
        
        // Restart watch position
        startGpsWatch();
      }
    };

    checkActiveNgetem();
    
    return () => {
      stopGpsWatch();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riderAuth]);

  // Timer effect
  useEffect(() => {
    if (isNgetem) {
      timerRef.current = setInterval(() => {
        setElapsedSec((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsedSec(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isNgetem]);

  const startGpsWatch = useCallback(() => {
    // Restore tracking: Update both local screen and Supabase
    if (navigator.geolocation) {
      const wid = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setRiderPos(prev => {
            if (prev && Math.abs(prev[0] - lat) < 0.00001 && Math.abs(prev[1] - lng) < 0.00001) {
              return prev;
            }
            
            // Send live location update to Supabase
            if (riderAuth) {
              supabase
                .from('active_riders')
                .update({ lat, lng })
                .eq('rider_id', riderAuth.id)
                .then(({ error }) => {
                  if (error) console.error("Error updating location:", error);
                });
            }

            return [lat, lng];
          });
        },
        (err) => console.error("GPS Watch error", err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
      watchIdRef.current = wid;
    }
  }, [riderAuth]);

  const stopGpsWatch = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const formatDuration = () => {
    const h = Math.floor(elapsedSec / 3600);
    const m = Math.floor((elapsedSec % 3600) / 60).toString().padStart(2, "0");
    const s = (elapsedSec % 60).toString().padStart(2, "0");
    return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
  };

  const [currentLivePos, setCurrentLivePos] = useState<[number, number] | null>(null);

  // Background GPS Tracker to make "Mulai" instant and accurate
  useEffect(() => {
    if (navigator.geolocation) {
      const wid = navigator.geolocation.watchPosition(
        (pos) => {
          setCurrentLivePos([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(wid);
    }
  }, []);

  const handleMulaiClick = () => {
    setGpsLoading(true);
    setShowConfirm(true);
    setLandmarkInput("");

    if (currentLivePos) {
      // Instant load if background tracker already got it
      setPreviewPos(currentLivePos);
      setGpsLoading(false);
    } else if (navigator.geolocation) {
      // Fallback to manual fetch if not ready yet
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPreviewPos([pos.coords.latitude, pos.coords.longitude]);
          setGpsLoading(false);
        },
        () => {
          setPreviewPos([-7.2575, 112.752]); // fallback Surabaya
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, maximumAge: 15000, timeout: 10000 }
      );
    } else {
      setPreviewPos([-7.2575, 112.752]);
      setGpsLoading(false);
    }
  };

  const handleConfirmStart = async () => {
    if (!previewPos || !riderAuth) return;

    setGpsLoading(true);
    
    // 1. Upsert to Supabase
    const { error } = await supabase.from('active_riders').upsert({
      rider_id: riderAuth.id,
      name: riderAuth.name,
      brand: riderAuth.brand,
      logo: riderAuth.logo,
      lat: previewPos[0],
      lng: previewPos[1],
      landmark: landmarkInput.trim(),
      status: 'online',
      start_time: new Date().toISOString()
    });

    if (error) {
      console.error("Gagal mulai ngetem:", error);
      alert("Gagal terhubung ke database. Coba lagi.");
      setGpsLoading(false);
      return;
    }

    // 2. Set Local State
    setRiderPos(previewPos);
    setLandmark(landmarkInput.trim());
    setIsNgetem(true);
    setElapsedSec(0);
    setShowConfirm(false);
    setPreviewPos(null);
    setGpsLoading(false);

    // 3. Start watching location
    startGpsWatch();
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setPreviewPos(null);
    setLandmarkInput("");
  };

  const handleStopNgetem = async () => {
    if (!riderAuth) return;
    
    // Stop GPS watch
    stopGpsWatch();

    const durationMinutes = Math.floor(elapsedSec / 60);

    // Save to history before going offline
    if (riderPos) {
      const { error: historyError } = await supabase
        .from('ngetem_history')
        .insert({
          rider_id: riderAuth.id,
          start_time: new Date(Date.now() - elapsedSec * 1000).toISOString(),
          end_time: new Date().toISOString(),
          duration_minutes: durationMinutes,
          lat: riderPos[0],
          lng: riderPos[1],
          landmark: landmark || ""
        });
      if (historyError) {
        console.error("Gagal menyimpan riwayat:", historyError);
      }
    }

    // Update DB
    await supabase
      .from('active_riders')
      .update({ status: 'offline' })
      .eq('rider_id', riderAuth.id);

    setIsNgetem(false);
    setRiderPos(null);
    setLandmark("");
    setElapsedSec(0);
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-[#FAF8F5]">
      {/* Status bar top */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
        {isNgetem ? (
          <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-sm shadow-xl border border-green-200 px-4 py-2.5 rounded-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-bold text-green-700">Sedang Ngetem</span>
            <span className="text-zinc-400">·</span>
            <div className="flex items-center gap-1 text-sm text-zinc-600 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDuration()}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-sm shadow-xl border border-zinc-200 px-4 py-2.5 rounded-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
            <span className="text-sm font-semibold text-zinc-500">Belum Ngetem</span>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <NgetemMap
          isNgetem={isNgetem}
          riderPos={riderPos}
          riderLogo={riderAuth?.logo}
          riderName={riderAuth?.name || "Rider"}
          currentLivePos={currentLivePos}
        />
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 w-full px-6 max-w-sm">
        {isNgetem ? (
          <>
            {/* Info lokasi + patokan */}
            <div className="w-full bg-white/95 backdrop-blur-sm shadow-lg border border-zinc-100 rounded-2xl px-4 py-3 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#5C3D2E]/10 flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-4 h-4 text-[#5C3D2E]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-zinc-400 font-medium">Lokasi aktif</p>
                  <p className="text-sm font-bold text-zinc-800 truncate">
                    {riderPos ? `${riderPos[0].toFixed(5)}, ${riderPos[1].toFixed(5)}` : "-"}
                  </p>
                </div>
              </div>
              {landmark && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-400 font-medium">Patokan</p>
                    <p className="text-sm font-bold text-zinc-800 truncate">{landmark}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Selesai button */}
            <button
              onClick={handleStopNgetem}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-base shadow-xl shadow-red-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Square className="w-5 h-5 fill-white" />
              Selesai Ngetem
            </button>
          </>
        ) : (
          <button
            onClick={handleMulaiClick}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-[#5C3D2E] hover:bg-[#4A2B12] text-white font-bold text-base shadow-xl shadow-[#5C3D2E]/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Play className="w-5 h-5 fill-white" />
            Mulai Ngetem
          </button>
        )}
      </div>

      {/* ===== CONFIRM DIALOG ===== */}
      {showConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCancelConfirm} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-6 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#5C3D2E] to-[#A06C46] px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-extrabold text-lg">Mulai Ngetem</h3>
                  <p className="text-white/70 text-xs mt-0.5">Konfirmasi lokasi dan patokan</p>
                </div>
                <button onClick={handleCancelConfirm} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* GPS Preview */}
              <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#E8DCCB]/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5C3D2E]/10 flex items-center justify-center flex-shrink-0">
                    <Navigation className="w-5 h-5 text-[#5C3D2E]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-zinc-400 font-medium mb-0.5">Lokasi GPS Kamu</p>
                    {gpsLoading && !previewPos ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#5C3D2E]/30 border-t-[#5C3D2E] rounded-full animate-spin" />
                        <span className="text-sm text-zinc-500">Mendapatkan lokasi...</span>
                      </div>
                    ) : previewPos ? (
                      <p className="text-sm font-bold text-zinc-800">
                        {previewPos[0].toFixed(6)}, {previewPos[1].toFixed(6)}
                      </p>
                    ) : (
                      <p className="text-sm text-red-500">Gagal mendapatkan GPS</p>
                    )}
                  </div>
                  {!gpsLoading && previewPos && (
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    </span>
                  )}
                </div>
              </div>

              {/* Patokan Input */}
              <div>
                <label className="text-sm font-bold text-zinc-700 mb-2 block">
                  📍 Patokan Lokasi <span className="text-zinc-400 font-normal text-xs">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={landmarkInput}
                  onChange={(e) => setLandmarkInput(e.target.value)}
                  placeholder="Contoh: Depan Indomaret Jl. Raya Darmo"
                  className="w-full bg-[#FAF8F5] border-2 border-[#E8DCCB]/50 rounded-xl px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/20 focus:border-[#5C3D2E] transition-all"
                  autoFocus
                />
                <p className="text-[11px] text-zinc-400 mt-1.5">
                  Patokan ini akan terlihat oleh pelanggan agar mudah menemukan kamu
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={handleCancelConfirm}
                className="flex-1 py-3 rounded-xl border-2 border-zinc-200 text-zinc-600 font-bold text-sm hover:bg-zinc-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmStart}
                disabled={gpsLoading && !previewPos}
                className="flex-1 py-3 rounded-xl bg-[#5C3D2E] text-white font-bold text-sm hover:bg-[#4A2B12] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-[#5C3D2E]/30"
              >
                {gpsLoading ? "Menyimpan..." : "Mulai Ngetem"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
