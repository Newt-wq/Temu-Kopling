"use client";

import { useState, useEffect, useRef, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MapPin, Coffee, ClipboardList, LogOut, Menu, X, MessageCircle, User, Settings } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { supabase } from "@/lib/supabase";

// ============================================================
// Context: data rider session dibagi ke semua halaman
// ============================================================
type RiderSession = { id: string; name: string; brand: string; logo: string; email: string };
type RiderCtx = { riderAuth: RiderSession | null };

export const RiderContext = createContext<RiderCtx>({ riderAuth: null });
export function useRiderAuth() { return useContext(RiderContext); }

// ============================================================
const navItems = [
  { label: "Ngetem",  href: "/dashboard/rider/ngetem",   icon: MapPin },
  { label: "Menu",    href: "/dashboard/rider/menu",      icon: Coffee },
  { label: "Riwayat", href: "/dashboard/rider/riwayat",   icon: ClipboardList },
  { label: "Chat",    href: "/dashboard/rider/chat",      icon: MessageCircle },
  { label: "Edit Profil", href: "/dashboard/rider/edit-profil", icon: Settings },
];

function Sidebar({ rider, unreadChat, onClose, onLogout }: {
  rider: RiderSession; unreadChat: number; onClose?: () => void; onLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-6 pb-5 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#A06C46] flex-shrink-0 flex items-center justify-center">
              {rider.logo ? (
                <img src={rider.logo} alt={rider.brand} className="w-full h-full object-contain p-0.5" />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                  <Coffee className="w-5 h-5 text-white/70" />
                </div>
              )}
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{rider.name}</p>
              <p className="text-white/50 text-xs">{rider.brand}</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-white/40 hover:text-white md:hidden">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          const isChat = item.label === "Chat";
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-[#A06C46] text-white shadow-lg shadow-[#A06C46]/30"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <div className="relative flex-shrink-0">
                <Icon className="w-5 h-5" />
                {isChat && unreadChat > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadChat > 9 ? "9+" : unreadChat}
                  </span>
                )}
              </div>
              {item.label}
              {isChat && unreadChat > 0 && (
                <span className="ml-auto min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadChat > 9 ? "9+" : unreadChat}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Keluar
        </button>
      </div>
    </div>
  );
}

export default function RiderDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rider, setRider] = useState<RiderSession | null>(null);
  const [checking, setChecking] = useState(true);
  const [unreadChat, setUnreadChat] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  // Auth guard + socket setup
  useEffect(() => {
    const raw = sessionStorage.getItem("rider_auth");
    if (!raw) { router.replace("/rider-login"); return; }
    try {
      const auth = JSON.parse(raw);
      setRider(auth);
      setChecking(false);

      // Join notification room
      const socket = io("http://localhost:5000");
      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("join_user_room", auth.id);
      });

      socket.on("new_notification", () => {
        if (!window.location.pathname.startsWith("/dashboard/rider/chat")) {
          setUnreadChat((c) => c + 1);
        }
      });

      return () => {
        socket.off("new_notification");
        socket.disconnect();
      };
    } catch {
      router.replace("/rider-login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset badge saat buka halaman chat
  useEffect(() => {
    if (pathname?.startsWith("/dashboard/rider/chat")) {
      setUnreadChat(0);
    }
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem("rider_auth");
    socketRef.current?.disconnect();
    router.push("/rider-login");
  };

  const currentPage = navItems.find((n) => pathname.startsWith(n.href))?.label ?? "Dashboard";

  if (checking || !rider) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#1A0D06] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#A06C46]/30 border-t-[#A06C46] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/40 text-sm font-medium">Memverifikasi sesi...</p>
        </div>
      </div>
    );
  }

  const initials = rider.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <RiderContext.Provider value={{ riderAuth: rider }}>
      <div className="fixed inset-0 z-[200] bg-[#F7F3EE] flex overflow-hidden">
        {/* Sidebar Desktop */}
        <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-[#1A0D06] flex-shrink-0">
          <Sidebar rider={rider} unreadChat={unreadChat} onLogout={handleLogout} />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#1A0D06] shadow-2xl">
              <Sidebar rider={rider} unreadChat={unreadChat} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
            </aside>
          </div>
        )}

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile top bar */}
          <header className="md:hidden flex items-center justify-between px-5 h-14 bg-white border-b border-zinc-100 flex-shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-200 text-zinc-700"
            >
              <Menu className="w-4 h-4" />
            </button>
            <p className="font-bold text-zinc-900 text-sm">{currentPage}</p>
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-[#A06C46]/15 overflow-hidden flex items-center justify-center">
                {rider.logo ? (
                  <img src={rider.logo} alt={rider.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#A06C46] font-bold text-xs">{initials}</span>
                )}
              </div>
              {unreadChat > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                  {unreadChat}
                </span>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </RiderContext.Provider>
  );
}
