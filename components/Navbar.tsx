"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, X, User, LogOut, Settings, ChevronDown, MessageCircle } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { io, Socket } from "socket.io-client";

const navLinks = [
  { name: "Beranda", href: "/" },
  { name: "Menu", href: "/#menu" },
  { name: "Tentang Kami", href: "/#tentang" },
  { name: "Kontak", href: "/#kontak" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [customerAuth, setCustomerAuth] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    setMounted(true);
    const auth = sessionStorage.getItem("customer_auth");
    if (auth) {
      const parsed = JSON.parse(auth);
      setCustomerAuth(parsed);

      // Join room notifikasi pribadi
      const socket = io("http://localhost:5000");
      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("join_user_room", parsed.id);
      });

      socket.on("new_notification", () => {
        // Jangan increment kalau sedang di halaman /pesan
        if (!window.location.pathname.startsWith("/pesan")) {
          setUnreadCount((c) => c + 1);
        }
      });

      return () => {
        socket.off("new_notification");
        socket.disconnect();
      };
    }
  }, []);

  // Reset badge saat buka halaman pesan
  useEffect(() => {
    if (pathname?.startsWith("/pesan")) {
      setUnreadCount(0);
    }
  }, [pathname]);

  const handleLogout = () => {
    sessionStorage.removeItem("customer_auth");
    setCustomerAuth(null);
    setProfileOpen(false);
    socketRef.current?.disconnect();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-20">
        {/* Kiri: Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center group">
            <div className="relative transition-transform group-hover:scale-105 duration-300">
              <Image
                src="/logo.png"
                alt="Temu Kopling Logo"
                width={130}
                height={70}
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Tengah: Links (Desktop) */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-semibold text-zinc-700 hover:text-[#5C3D2E] transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#5C3D2E] transition-all group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* Kanan */}
        <div className="flex items-center gap-3">
          {mounted && customerAuth ? (
            <div className="hidden md:flex items-center gap-2 relative">
              {/* Tombol Chat dengan Badge */}
              <Link
                href="/pesan"
                className="relative w-10 h-10 flex items-center justify-center rounded-full bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-[#5C3D2E] transition-colors"
                title="Riwayat Pesan"
                onClick={() => setUnreadCount(0)}
              >
                <MessageCircle className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full border border-zinc-200 hover:border-[#5C3D2E]/50 hover:bg-zinc-50 transition-colors"
              >
                <span className="text-sm font-semibold text-zinc-700 truncate max-w-[100px]">
                  {customerAuth.name.split(" ")[0]}
                </span>
                <div className="w-7 h-7 rounded-full bg-[#5C3D2E] overflow-hidden flex items-center justify-center">
                  {customerAuth.logo ? (
                    <img src={customerAuth.logo} alt={customerAuth.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-zinc-100 shadow-xl overflow-hidden z-50 py-1">
                    <div className="px-4 py-3 border-b border-zinc-50 bg-zinc-50/50">
                      <p className="text-sm font-bold text-zinc-900 truncate">{customerAuth.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{customerAuth.email}</p>
                    </div>
                    <Link
                      href="/edit-profil"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-zinc-400" />
                      Edit Profil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            mounted && (
              <Link
                href="/login"
                className="hidden md:flex items-center px-5 py-2.5 rounded-full bg-[#3D2314] text-white hover:bg-[#5C3D2E] transition-all duration-300 shadow-sm hover:shadow-md text-sm font-semibold tracking-wide"
              >
                Login
              </Link>
            )
          )}

          {/* Hamburger (Mobile only) */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="bg-white border-t border-zinc-100 px-6 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="py-3 px-4 rounded-xl text-sm font-semibold text-zinc-700 hover:text-[#5C3D2E] hover:bg-[#5C3D2E]/5 transition-all"
            >
              {link.name}
            </Link>
          ))}

          <div className="pt-4 mt-2 border-t border-zinc-100">
            {mounted && customerAuth ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 rounded-xl mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#5C3D2E] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {customerAuth.logo ? (
                      <img src={customerAuth.logo} alt={customerAuth.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">{customerAuth.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{customerAuth.email}</p>
                  </div>
                </div>
                <Link
                  href="/pesan"
                  onClick={() => { setMobileOpen(false); setUnreadCount(0); }}
                  className="flex items-center gap-3 w-full py-3 px-4 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-all"
                >
                  <div className="relative">
                    <MessageCircle className="w-5 h-5 text-zinc-400" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  Riwayat Pesan
                </Link>
                <Link
                  href="/edit-profil"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 w-full py-3 px-4 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-all"
                >
                  <Settings className="w-5 h-5 text-zinc-400" />
                  Edit Profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full py-3 px-4 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all text-left"
                >
                  <LogOut className="w-5 h-5 text-red-500" />
                  Keluar
                </button>
              </div>
            ) : (
              mounted && (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-full py-3.5 px-6 rounded-xl text-sm font-semibold text-white bg-[#3D2314] hover:bg-[#5C3D2E] transition-all duration-300 shadow-sm"
                >
                  Login
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
