"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { riders, Rider } from "@/lib/riders-data";
import { MessageCircle, Navigation, Coffee } from "lucide-react";

// Fix default marker icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom brand marker
function createBrandMarker(logoUrl: string, isSelected: boolean) {
  const size = isSelected ? 52 : 44;
  const ring = isSelected ? "3px solid #5C3D2E" : "2px solid #E8DCCB";
  const shadow = isSelected
    ? "0 4px 16px rgba(92,61,46,0.5)"
    : "0 2px 8px rgba(0,0,0,0.2)";

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${size}px; height:${size}px;
        border-radius:50%;
        border:${ring};
        box-shadow:${shadow};
        background:#fff;
        display:flex; align-items:center; justify-content:center;
        overflow:hidden;
        transition:all 0.2s;
        cursor:pointer;
      ">
        <img src="${logoUrl}" style="width:80%;height:80%;object-fit:contain;border-radius:50%;" />
      </div>
      <div style="
        width:0; height:0;
        border-left:6px solid transparent;
        border-right:6px solid transparent;
        border-top:8px solid ${isSelected ? "#5C3D2E" : "#E8DCCB"};
        margin:0 auto;
        margin-top:-1px;
      "></div>
    `,
    iconSize: [size, size + 10],
    iconAnchor: [size / 2, size + 10],
    popupAnchor: [0, -(size + 12)],
  });
}

// Auto-fly to selected rider
function FlyToRider({ rider }: { rider: Rider | null }) {
  const map = useMap();
  useEffect(() => {
    if (rider) {
      map.flyTo([rider.lat, rider.lng], 16, { animate: true, duration: 0.8 });
    }
  }, [rider, map]);
  return null;
}

type Props = {
  selectedRider: Rider | null;
  onSelectRider: (rider: Rider) => void;
  onChatClick?: (rider: Rider) => void;
};

export default function RiderMap({ selectedRider, onSelectRider, onChatClick }: Props) {
  const mapRef = useRef<any>(null);

  return (
    <MapContainer
      center={[-7.2575, 112.7521]}
      zoom={14}
      className="w-full h-full z-0"
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FlyToRider rider={selectedRider} />

      {riders.map((rider) => (
        <Marker
          key={rider.id}
          position={[rider.lat, rider.lng]}
          icon={createBrandMarker(rider.logo, selectedRider?.id === rider.id)}
          eventHandlers={{ click: () => onSelectRider(rider) }}
        >
          <Popup
            className="rider-popup"
            minWidth={240}
            maxWidth={280}
            closeButton={true}
          >
            <div className="font-sans p-1" style={{minWidth: "240px"}}>
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#5C3D2E] flex items-center justify-center font-bold text-white text-sm">
                  {rider.riderName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-zinc-900 text-sm leading-tight">{rider.riderName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <img src={rider.logo} alt={rider.brand} className="w-3.5 h-3.5 rounded-full object-contain border border-zinc-200 bg-white" />
                    <p className="text-xs text-[#A06C46] font-semibold">{rider.brand}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Ngetem
                </span>
              </div>

              {/* Info rows */}
              <div className="bg-zinc-50 rounded-xl px-3 py-2.5 mb-3 space-y-2">
                {/* Patokan */}
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-[#A06C46] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  <p className="text-xs text-zinc-700 font-medium">{rider.landmark}</p>
                </div>
                {/* Jam ngetem */}
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-[#A06C46] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <p className="text-xs text-zinc-700 font-medium">Ngetem sejak <span className="font-bold text-zinc-900">{rider.ngetemSince}</span></p>
                </div>
                {/* Jarak */}
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-[#A06C46] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  <p className="text-xs text-zinc-700 font-medium">Jarak <span className="font-bold text-zinc-900">{rider.distance}</span> dari kamu</p>
                </div>
              </div>

              {/* CTA: Lihat Rute — OSRM gratis */}
              <a
                href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;${rider.lat},${rider.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#5C3D2E] text-white text-xs font-bold hover:bg-[#4A2B12] transition-colors mb-2 no-underline"
                style={{display:"flex", textDecoration:"none", color:"white"}}
              >
                <Navigation className="w-3.5 h-3.5" />
                Lihat Rute
              </a>

              {/* Sekunder */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onChatClick?.(rider);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-semibold hover:bg-zinc-50 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Chat Rider
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-semibold hover:bg-zinc-50 transition-colors">
                  <Coffee className="w-3.5 h-3.5" />
                  Lihat Menu
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
