"use client";

import { CheckCircle, MapPin, Clock, Calendar } from "lucide-react";

type HistoryItem = {
  id: number;
  date: string;
  landmark: string;
  duration: string;
  startTime: string;
  endTime: string;
  lat: number;
  lng: number;
};

const riwayat: HistoryItem[] = [
  { id: 1, date: "Rabu, 7 Mei 2025", landmark: "Depan Alfamart Sudirman", duration: "2j 30m", startTime: "07:30", endTime: "10:00", lat: -7.2575, lng: 112.7521 },
  { id: 2, date: "Selasa, 6 Mei 2025", landmark: "Parkiran Stasiun Gubeng", duration: "3j 15m", startTime: "08:00", endTime: "11:15", lat: -7.2654, lng: 112.7516 },
  { id: 3, date: "Senin, 5 Mei 2025", landmark: "Depan RS Siloam Surabaya", duration: "1j 45m", startTime: "09:00", endTime: "10:45", lat: -7.2571, lng: 112.7408 },
  { id: 4, date: "Sabtu, 3 Mei 2025", landmark: "Trotoar Jl. Basuki Rahmat", duration: "4j 00m", startTime: "07:00", endTime: "11:00", lat: -7.2545, lng: 112.7560 },
  { id: 5, date: "Jumat, 2 Mei 2025", landmark: "Halte Bus Diponegoro", duration: "2j 00m", startTime: "10:00", endTime: "12:00", lat: -7.2530, lng: 112.7590 },
  { id: 6, date: "Kamis, 1 Mei 2025", landmark: "Pintu Perumahan Griya Indah", duration: "3j 30m", startTime: "07:30", endTime: "11:00", lat: -7.2590, lng: 112.7440 },
];

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
  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-zinc-900">Riwayat Ngetem</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Semua sesi ngetem yang sudah selesai</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <StatCard label="Total Sesi" value={String(riwayat.length)} sub="bulan ini" />
        <StatCard label="Total Durasi" value="17j" sub="akumulasi" />
        <StatCard label="Rata-rata" value="2j 49m" sub="per sesi" />
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Garis vertikal */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-zinc-200" />

        <div className="space-y-4">
          {riwayat.map((item, i) => (
            <div key={item.id} className="flex gap-4 group">
              {/* Dot */}
              <div className="flex-shrink-0 w-10 flex items-start justify-center pt-3">
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

                  {/* OSM mini link */}
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${item.lat}&mlon=${item.lng}&zoom=16`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-xs font-semibold text-[#A06C46] hover:text-[#5C3D2E] transition-colors underline-offset-2 hover:underline"
                  >
                    Lihat Lokasi →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
