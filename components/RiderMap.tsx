"use client";

import { useEffect, useRef, useState, memo } from "react";
import mapboxgl from "mapbox-gl";
import { Rider } from "@/app/cari-rider/page";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

type MapboxMap = InstanceType<typeof mapboxgl.Map>;
type MapboxMarker = InstanceType<typeof mapboxgl.Marker>;

type Props = {
  activeRiders: Rider[];
  selectedRider: Rider | null;
  onSelectRider: (rider: Rider | null) => void;
  currentLivePos?: [number, number] | null;
  onOpenMenu: (rider: Rider) => void;
  onOpenChat: (rider: Rider) => void;
  onOpenMaps: (rider: Rider) => void;
};

// ── Custom marker element builder ───────────────────────────────────────────
// We use a separate function to keep the component clean
function createMarkerElement(rider: Rider): HTMLElement {
  const size = 56;
  const color = "#5C3D2E";
  const wrap = document.createElement("div");
  // Remove transition:transform on the wrap element because it fights with Mapbox's continuous translate updates during map panning, causing wobble.
  wrap.style.cssText = "display:flex;flex-direction:column;align-items:center;cursor:pointer;z-index:100;";
  
  wrap.innerHTML = `
    <div data-circle style="
      width:${size}px;height:${size}px;
      border-radius:50%;
      border:3px solid ${color};
      box-shadow:0 6px 24px rgba(92,61,46,0.5);
      background:#fff;
      display:flex;align-items:center;justify-content:center;
      overflow:hidden;
      animation:ngetem-pulse 2s infinite;
      transition:all .2s cubic-bezier(0.4, 0, 0.2, 1);
    ">
      <img
        src="${rider.logo}"
        style="width:80%;height:80%;object-fit:contain;border-radius:50%;"
        onerror="this.parentNode.innerHTML='<span style=font-size:18px;font-weight:700;color:#5C3D2E;>${rider.name[0]}</span>'"
      />
    </div>
    <div data-tri style="
      width:0;height:0;
      border-left:8px solid transparent;
      border-right:8px solid transparent;
      border-top:12px solid ${color};
      margin-top:-2px;
      transition:border-top-color .2s;
    "></div>
  `;
  return wrap;
}

function updateMarkerStyle(el: HTMLElement, isSelected: boolean) {
  const circle = el.querySelector("[data-circle]") as HTMLDivElement | null;
  const tri = el.querySelector("[data-tri]") as HTMLDivElement | null;
  
  if (circle) {
    circle.style.borderColor = isSelected ? "#A06C46" : "#5C3D2E"; // highlight when selected
    circle.style.transform = isSelected ? "scale(1.1) translateY(-4px)" : "scale(1) translateY(0)";
  }
  if (tri) {
    tri.style.borderTopColor = isSelected ? "#A06C46" : "#5C3D2E";
  }
  el.style.zIndex = isSelected ? "100" : "1";
}

// ── Component ────────────────────────────────────────────────────────────────
function RiderMapComponent({
  activeRiders,
  selectedRider,
  onSelectRider,
  currentLivePos,
  onOpenMenu,
  onOpenChat,
  onOpenMaps
}: Props) {
  // Helper to calculate distance in km
  const getDistanceText = (lat1?: number, lon1?: number, lat2?: number, lon2?: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return "Jarak belum diketahui";
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;  
    const dLon = (lon2 - lon1) * Math.PI / 180; 
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return `Jarak <b>\${(R * c).toFixed(1)} km</b> dari kamu`;
  };
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Map<string, { marker: MapboxMarker; el: HTMLElement }>>(new Map());
  const hasInitialLivePosCenteredRef = useRef(false);

  // ── Init map ─────────────────────────────────────────────────────────────
  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_TOKEN;

    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [112.7521, -7.2575], // Default Surabaya
      zoom: 13,
      antialias: true
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true, maximumAge: 15000, timeout: 6000 },
      trackUserLocation: false,
      showAccuracyCircle: false,
    });
    map.addControl(geolocate);

    map.on("load", () => {
      geolocate.trigger();
    });

    map.on("click", (e: any) => {
      // Only deselect if we didn't click a marker
      if (e.originalEvent.target.closest('[data-circle]')) return;
      onSelectRider(null);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
      hasInitialLivePosCenteredRef.current = false;
    };
  }, [onSelectRider]);

  // Auto-center to live position once
  useEffect(() => {
    if (!mapRef.current || !currentLivePos) return;
    
    if (!hasInitialLivePosCenteredRef.current) {
      mapRef.current.jumpTo({
        center: [currentLivePos[1], currentLivePos[0]],
        zoom: 13
      });
      hasInitialLivePosCenteredRef.current = true;
    }
  }, [currentLivePos]);

  // ── Sync markers ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    const currentRiderIds = new Set(activeRiders.map(r => String(r.id)));

    // 1. Remove markers that are no longer active
    for (const [id, data] of markersRef.current.entries()) {
      if (!currentRiderIds.has(id)) {
        data.marker.remove();
        markersRef.current.delete(id);
      }
    }

    // 2. Add or Update markers
    activeRiders.forEach((rider) => {
      const id = String(rider.id);
      const existing = markersRef.current.get(id);

      if (existing) {
        existing.marker.setLngLat([rider.lng, rider.lat]);
        updateMarkerStyle(existing.el, selectedRider?.id === rider.id);
        
        // Ensure popup state matches selected state
        const popup = existing.marker.getPopup();
        if (popup) {
          if (selectedRider?.id === rider.id && !popup.isOpen()) {
            existing.marker.togglePopup();
          } else if (selectedRider?.id !== rider.id && popup.isOpen()) {
            existing.marker.togglePopup();
          }
        }
      } else {
        const el = createMarkerElement(rider);
        
        // Create premium popup attached to pin matching the user's design
        const popupContent = document.createElement("div");
        popupContent.className = "flex flex-col gap-3.5 w-[260px] md:w-[280px] font-sans pt-1";
        
        const timeStr = rider.startTime 
          ? new Date(rider.startTime).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})
          : '';

        const distText = currentLivePos 
          ? getDistanceText(currentLivePos[0], currentLivePos[1], rider.lat, rider.lng) 
          : "Jarak belum diketahui";

        popupContent.innerHTML = `
          <!-- Header -->
          <div class="flex items-start gap-3 pr-6 relative">
            <div class="w-12 h-12 rounded-full border-2 border-[#5C3D2E]/10 bg-white p-0.5 flex-shrink-0">
              <img src="${rider.logo}" class="w-full h-full rounded-full object-contain" onerror="this.src='/brand_coffe/default.png'" />
            </div>
            <div class="min-w-0 flex-1 pt-0.5">
              <div class="flex items-center justify-between mb-1">
                <p class="font-extrabold text-[15px] text-zinc-900 leading-none truncate">${rider.name}</p>
                <div class="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 flex-shrink-0">
                  <div class="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)] animate-pulse"></div>
                  <span class="text-[9px] font-bold text-green-700 uppercase tracking-wider">Ngetem</span>
                </div>
              </div>
              <div class="inline-flex items-center gap-1 bg-[#A06C46]/10 px-1.5 py-0.5 rounded">
                <svg class="text-[#A06C46]" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
                <span class="text-[10px] font-bold text-[#A06C46]">${rider.brand || 'Brand'}</span>
              </div>
            </div>
          </div>

          <!-- Info Card -->
          <div class="bg-[#FAF8F5] border border-[#E8DCCB]/80 rounded-[14px] p-3 flex flex-col gap-2.5 shadow-inner">
            <div class="flex items-start gap-3">
              <div class="w-5 flex justify-center mt-0.5">
                <svg class="flex-shrink-0 text-[#A06C46]" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <span class="text-xs font-medium text-zinc-600 leading-snug">
                Patokan lokasi di <span class="font-bold text-zinc-800">${rider.landmark || 'sekitar titik ini'}</span>
              </span>
            </div>
            <div class="w-full h-px bg-[#E8DCCB]/40"></div>
            <div class="flex items-center gap-3">
              <div class="w-5 flex justify-center">
                <svg class="flex-shrink-0 text-[#A06C46]" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <span class="text-xs font-medium text-zinc-600">
                Sudah ngetem sejak pukul <span class="font-bold text-zinc-800">${timeStr} WIB</span>
              </span>
            </div>
            <div class="w-full h-px bg-[#E8DCCB]/40"></div>
            <div class="flex items-center gap-3">
              <div class="w-5 flex justify-center">
                <svg class="flex-shrink-0 text-[#A06C46]" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </div>
              <span class="text-xs font-medium text-zinc-600">
                Jaraknya sekitar <span class="font-bold text-zinc-800">${distText}</span> dari lokasimu
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-2 mt-1">
            <button id="btn-map-${rider.id}" class="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-b from-[#6B4C36] to-[#5C3D2E] text-white text-[13px] font-bold rounded-xl hover:from-[#5C3D2E] hover:to-[#4A2B12] transition-all shadow-[0_4px_12px_rgba(92,61,46,0.3)] hover:-translate-y-0.5 active:translate-y-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              Lihat Rute
            </button>
            <div class="flex gap-2">
              <button id="btn-chat-${rider.id}" class="flex-1 py-2.5 flex items-center justify-center gap-1.5 bg-white border border-zinc-200 text-zinc-700 text-xs font-bold rounded-xl hover:bg-zinc-50 transition-colors shadow-sm active:bg-zinc-100">
                <svg class="text-[#A06C46]" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                Chat Rider
              </button>
              <button id="btn-menu-${rider.id}" class="flex-1 py-2.5 flex items-center justify-center gap-1.5 bg-white border border-zinc-200 text-zinc-700 text-xs font-bold rounded-xl hover:bg-zinc-50 transition-colors shadow-sm active:bg-zinc-100">
                <svg class="text-[#A06C46]" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
                Lihat Menu
              </button>
            </div>
          </div>
        `;

        // Bind event listeners using the passed down callbacks
        popupContent.querySelector(`#btn-menu-${rider.id}`)?.addEventListener('click', () => onOpenMenu(rider));
        popupContent.querySelector(`#btn-chat-${rider.id}`)?.addEventListener('click', () => onOpenChat(rider));
        popupContent.querySelector(`#btn-map-${rider.id}`)?.addEventListener('click', () => onOpenMaps(rider));

        const popupOffsets: any = {
          'top': [0, 15], // If popup renders below, add 15px space from bottom tip
          'bottom': [0, -80], // If popup renders above, go up 65px (pin height) + 15px space
          'left': [35, -45], // Right side
          'right': [-35, -45], // Left side
          'top-left': [0, 15],
          'top-right': [0, 15],
          'bottom-left': [0, -80],
          'bottom-right': [0, -80]
        };

        const popup = new mapboxgl.Popup({
          offset: popupOffsets,
          closeButton: true, // Show the close button 'x' as seen in the image
          closeOnClick: false,
          className: "custom-rider-popup"
        }).setDOMContent(popupContent);

        // Notify parent state when mapbox auto-opens or closes popup
        popup.on('open', () => onSelectRider(rider));
        popup.on('close', () => {
           // Provide a slight delay so clicking another marker doesn't immediately set to null then quickly back
           setTimeout(() => {
             if (!popup.isOpen()) onSelectRider(null);
           }, 100);
        });
        
        const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([rider.lng, rider.lat])
          .setPopup(popup)
          .addTo(mapRef.current!);

        markersRef.current.set(id, { marker, el });
        updateMarkerStyle(el, selectedRider?.id === rider.id);
        
        // Open immediately if it's the selected rider initially
        if (selectedRider?.id === rider.id) {
          marker.togglePopup();
        }
      }
    });
  }, [activeRiders, selectedRider, onSelectRider, onOpenMenu, onOpenChat, onOpenMaps, currentLivePos]);

  // Remove the flyTo animation entirely since the user requested the map to stop shifting around
  useEffect(() => {
    // Intentionally left blank to prevent auto panning.
    // The Mapbox Popup will now naturally appear next to the pin without moving the map.
  }, [selectedRider]);

  return (
    <div className="w-full h-full relative group">
      <style>{`
        @keyframes ngetem-pulse {
          0% { box-shadow: 0 0 0 0 rgba(92,61,46,0.4); }
          70% { box-shadow: 0 0 0 15px rgba(92,61,46,0); }
          100% { box-shadow: 0 0 0 0 rgba(92,61,46,0); }
        }
        /* Override Mapbox default 240px max-width which breaks our layout */
        .custom-rider-popup {
          max-width: none !important;
          z-index: 50;
        }
        /* Custom styling for Mapbox popup to match the clean design */
        .custom-rider-popup .mapboxgl-popup-content {
          padding: 16px;
          border-radius: 20px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
          border: 1px solid rgba(232, 220, 203, 0.8);
          font-family: inherit;
        }
        .custom-rider-popup .mapboxgl-popup-close-button {
          font-size: 24px;
          color: #a1a1aa;
          padding: 6px 12px;
          border-radius: 0 20px 0 0;
          z-index: 10;
          outline: none;
        }
        .custom-rider-popup .mapboxgl-popup-close-button:hover {
          background-color: transparent;
          color: #3f3f46;
        }
        .custom-rider-popup .mapboxgl-popup-tip {
          border-top-color: white;
        }
      `}</style>
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[400px]"
        style={{ borderRadius: "inherit" }}
      />
    </div>
  );
}

// Wrap with memo to prevent unnecessary re-renders from parent
export default memo(RiderMapComponent);

