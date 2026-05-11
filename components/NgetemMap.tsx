"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function createRiderMarker(isActive: boolean) {
  const size = 52;
  const color = isActive ? "#5C3D2E" : "#E8DCCB";
  return L.divIcon({
    className: "",
    html: `
      <div style="width:${size}px;height:${size}px;border-radius:50%;border:3px solid ${color};box-shadow:0 4px 16px rgba(92,61,46,0.4);background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;">
        <img src="/brand_coffe/Jago.jpeg" style="width:80%;height:80%;object-fit:contain;border-radius:50%;" />
      </div>
      <div style="width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:10px solid ${color};margin:0 auto;margin-top:-1px;"></div>
    `,
    iconSize: [size, size + 12],
    iconAnchor: [size / 2, size + 12],
  });
}

function FlyTo({ pos }: { pos: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.flyTo(pos, 16, { animate: true, duration: 1 });
  }, [pos, map]);
  return null;
}

type Props = {
  isNgetem: boolean;
  riderPos: [number, number] | null;
};

export default function NgetemMap({ isNgetem, riderPos }: Props) {
  return (
    <MapContainer center={[-7.2575, 112.752]} zoom={14} className="w-full h-full z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo pos={riderPos} />
      {riderPos && (
        <Marker position={riderPos} icon={createRiderMarker(isNgetem)} />
      )}
    </MapContainer>
  );
}
