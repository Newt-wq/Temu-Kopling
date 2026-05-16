"use client";

import { useEffect, useRef, useState, memo } from "react";
import mapboxgl from "mapbox-gl";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

type MapboxMap = InstanceType<typeof mapboxgl.Map>;
type MapboxMarker = InstanceType<typeof mapboxgl.Marker>;

type Props = {
  isNgetem: boolean;
  riderPos: [number, number] | null; // [lat, lng]
  riderLogo?: string;
  riderName?: string;
  currentLivePos?: [number, number] | null;
};

function NgetemMapComponent({ isNgetem, riderPos, riderLogo, riderName = "Rider", currentLivePos }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markerRef = useRef<MapboxMarker | null>(null);
  const hasCenteredRef = useRef(false);
  const hasInitialLivePosCenteredRef = useRef(false);

  // Initialize Map
  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN;

    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [112.752, -7.2575], // Fallback temporarily
      zoom: 14,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true, maximumAge: 15000, timeout: 6000 },
      trackUserLocation: true,
      showUserHeading: true,
      showAccuracyCircle: false,
    });
    map.addControl(geolocate);

    map.on("load", () => {
      // Automatically trigger geolocate to show blue dot
      geolocate.trigger();
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      hasCenteredRef.current = false;
      hasInitialLivePosCenteredRef.current = false;
    };
  }, []);

  // Auto-center to live position if NOT ngetem yet
  useEffect(() => {
    if (!mapRef.current || isNgetem || !currentLivePos) return;
    
    if (!hasInitialLivePosCenteredRef.current) {
      mapRef.current.jumpTo({
        center: [currentLivePos[1], currentLivePos[0]],
        zoom: 16
      });
      hasInitialLivePosCenteredRef.current = true;
    }
  }, [currentLivePos, isNgetem]);

  // Update Marker when isNgetem and riderPos changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (!isNgetem || !riderPos) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      hasCenteredRef.current = false;
      return;
    }

    const size = 56;
    const color = "#5C3D2E";
    const logoUrl = riderLogo === "/brand_coffe/default.png" ? "" : (riderLogo || "");

    if (!markerRef.current) {
      const el = document.createElement("div");
      el.style.cssText = "display:flex;flex-direction:column;align-items:center;z-index:100;";
      el.innerHTML = `
        <div style="
          width:${size}px;height:${size}px;
          border-radius:50%;
          border:3px solid ${color};
          box-shadow:0 6px 24px rgba(92,61,46,0.5);
          background:#fff;
          display:flex;align-items:center;justify-content:center;
          overflow:hidden;
          animation:ngetem-pulse 2s infinite;
        ">
        ${logoUrl ? 
          `<img src="${logoUrl}" style="width:80%;height:80%;object-fit:contain;border-radius:50%;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
           <span style="display:none;font-size:18px;font-weight:700;color:#5C3D2E;">${riderName[0] || 'R'}</span>`
        :
          `<span style="font-size:18px;font-weight:700;color:#5C3D2E;">${riderName[0] || 'R'}</span>`
        }
        </div>
        <div style="
          width:0;height:0;
          border-left:8px solid transparent;
          border-right:8px solid transparent;
          border-top:12px solid ${color};
          margin-top:-2px;
        "></div>
      `;

      markerRef.current = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([riderPos[1], riderPos[0]]) // [lng, lat]
        .addTo(mapRef.current);
    } else {
      markerRef.current.setLngLat([riderPos[1], riderPos[0]]);
    }

    // Fly to location on first ngetem
    if (!hasCenteredRef.current) {
      mapRef.current.flyTo({
        center: [riderPos[1], riderPos[0]],
        zoom: 16,
        duration: 1200,
        essential: true,
      });
      hasCenteredRef.current = true;
    }
  }, [isNgetem, riderPos, riderLogo]);

  return (
    <div className="w-full h-full relative">
      <style>{`
        @keyframes ngetem-pulse {
          0% { box-shadow: 0 0 0 0 rgba(92,61,46,0.4); }
          70% { box-shadow: 0 0 0 15px rgba(92,61,46,0); }
          100% { box-shadow: 0 0 0 0 rgba(92,61,46,0); }
        }
      `}</style>
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px]" />
    </div>
  );
}

export default memo(NgetemMapComponent);

