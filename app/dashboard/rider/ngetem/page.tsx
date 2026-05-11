"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import { MapPin, Play, Square, Clock, Navigation } from "lucide-react";

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
  const [isNgetem, setIsNgetem] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [riderPos, setRiderPos] = useState<[number, number] | null>(null);

  const handleMulai = useCallback(() => {
    // Pakai koordinat dummy (center Surabaya) — di produksi pakai navigator.geolocation
    const pos: [number, number] = [-7.2575 + (Math.random() - 0.5) * 0.01, 112.752 + (Math.random() - 0.5) * 0.01];
    setRiderPos(pos);
    setIsNgetem(true);
    setStartTime(new Date());
  }, []);

  const handleSelesai = useCallback(() => {
    setIsNgetem(false);
    setStartTime(null);
    setRiderPos(null);
  }, []);

  const formatDuration = () => {
    if (!startTime) return "00:00";
    const diff = Math.floor((Date.now() - startTime.getTime()) / 1000);
    const m = Math.floor(diff / 60).toString().padStart(2, "0");
    const s = (diff % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Status bar top */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
        {isNgetem ? (
          <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-sm shadow-xl border border-green-200 px-4 py-2.5 rounded-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-bold text-green-700">Sedang Ngetem</span>
            <span className="text-zinc-400">·</span>
            <div className="flex items-center gap-1 text-sm text-zinc-600 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span id="duration-display">{formatDuration()}</span>
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
        <NgetemMap isNgetem={isNgetem} riderPos={riderPos} />
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 w-full px-6 max-w-sm">
        {isNgetem ? (
          <>
            {/* Info lokasi */}
            <div className="w-full bg-white/95 backdrop-blur-sm shadow-lg border border-zinc-100 rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#5C3D2E]/10 flex items-center justify-center flex-shrink-0">
                <Navigation className="w-4 h-4 text-[#5C3D2E]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-zinc-400 font-medium">Lokasi aktif</p>
                <p className="text-sm font-bold text-zinc-800 truncate">
                  {riderPos ? `${riderPos[0].toFixed(4)}, ${riderPos[1].toFixed(4)}` : "-"}
                </p>
              </div>
            </div>

            {/* Selesai button */}
            <button
              onClick={handleSelesai}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-base shadow-xl shadow-red-500/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Square className="w-5 h-5 fill-white" />
              Selesai Ngetem
            </button>
          </>
        ) : (
          <button
            onClick={handleMulai}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-[#5C3D2E] hover:bg-[#4A2B12] text-white font-bold text-base shadow-xl shadow-[#5C3D2E]/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Play className="w-5 h-5 fill-white" />
            Mulai Ngetem
          </button>
        )}
      </div>
    </div>
  );
}
