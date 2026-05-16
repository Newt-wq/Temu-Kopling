"use client";

import { useEffect, useState } from "react";
import { CheckCircle, MapPin, Clock, Calendar } from "lucide-react";
import { useRiderAuth } from "@/app/dashboard/rider/layout";
import { supabase } from "@/lib/supabase";

type HistoryItem = {
  id: string;
  date: string;
  landmark: string;
  duration: string;
  startTime: string;
  endTime: string;
  lat: number;
  lng: number;
  duration_minutes: number;
};

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4">
      <p className="text-xs font-semibold text-zinc-400 mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-zinc-900">{value}</p>
      <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>
    </div>
  );
}

export default function RiwayatPage() {
  const { riderAuth } = useRiderAuth();
  const [riwayat, setRiwayat] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!riderAuth) return;

    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('ngetem_history')
        .select('*')
        .eq('rider_id', riderAuth.id)
        .order('start_time', { ascending: false });

      if (error) {
        console.error("Error fetching history:", error);
      } else if (data) {
        const formatted = data.map((item: any) => {
          const startDate = new Date(item.start_time);
          const endDate = new Date(item.end_time);

          const dateStr = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(startDate);
          
          const startStr = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(startDate);
          const endStr = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(endDate);

          const h = Math.floor(item.duration_minutes / 60);
          const m = item.duration_minutes % 60;
          const durStr = h > 0 ? `${h}j ${m}m` : `${m}m`;

          return {
            id: item.id,
            date: dateStr,
            landmark: item.landmark || "Lokasi Pin Peta",
            duration: durStr,
            startTime: startStr,
            endTime: endStr,
            lat: item.lat,
            lng: item.lng,
            duration_minutes: item.duration_minutes
          };
        });
        setRiwayat(formatted);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [riderAuth]);

  const totalSesi = riwayat.length;
  const totalMinutes = riwayat.reduce((acc, curr) => acc + curr.duration_minutes, 0);
  const avgMinutes = totalSesi > 0 ? Math.floor(totalMinutes / totalSesi) : 0;

  const formatTotalDur = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}j ${m}m` : `${m}m`;
  };

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-zinc-900">Riwayat Ngetem</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Semua sesi ngetem yang sudah selesai</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <StatCard label="Total Sesi" value={String(totalSesi)} sub="keseluruhan" />
        <StatCard label="Total Durasi" value={formatTotalDur(totalMinutes)} sub="akumulasi" />
        <StatCard label="Rata-rata" value={formatTotalDur(avgMinutes)} sub="per sesi" />
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Garis vertikal */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-zinc-200" />

        <div className="space-y-4">
          {loading ? (
            <div className="py-10 text-center">
              <div className="w-8 h-8 border-4 border-[#5C3D2E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-zinc-500 font-medium">Memuat riwayat...</p>
            </div>
          ) : riwayat.length === 0 ? (
            <div className="py-10 text-center pl-10">
              <p className="text-sm font-semibold text-zinc-500">Belum ada riwayat ngetem.</p>
            </div>
          ) : (
            riwayat.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                {/* Dot */}
                <div className="flex-shrink-0 w-10 flex items-start justify-center pt-3 z-10">
                  <div className="w-5 h-5 rounded-full bg-white border-2 border-[#5C3D2E] flex items-center justify-center shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-[#5C3D2E]" />
                  </div>
                </div>

                {/* Card */}
                <div className="flex-1 bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 hover:shadow-md hover:border-[#E8DCCB] transition-all duration-200">
                  {/* Date */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-xs font-semibold text-zinc-500">{item.date}</span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Selesai
                    </span>
                  </div>

                  {/* Lokasi */}
                  <div className="flex items-start gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-[#A06C46] flex-shrink-0 mt-0.5" />
                    <p className="font-bold text-sm text-zinc-900 leading-tight">{item.landmark}</p>
                  </div>

                  {/* Info row */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-xs text-zinc-600 font-medium">{item.startTime} – {item.endTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#5C3D2E]/10 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#5C3D2E]" />
                      </div>
                      <span className="text-xs font-bold text-[#5C3D2E]">{item.duration}</span>
                    </div>

                    {/* Google Maps link */}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-xs font-semibold text-[#A06C46] hover:text-[#5C3D2E] transition-colors underline-offset-2 hover:underline"
                    >
                      Lihat Lokasi →
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
