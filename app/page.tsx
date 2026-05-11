import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MenuSection from "@/components/MenuSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-b from-[#FFFCF8] to-[#F7EFE5]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-6 md:pt-10 pb-16 md:pb-20 w-full relative overflow-hidden">

          {/* Dekorasi Cahaya Halus (Glow) */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#D4A373]/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-[#8B5E3C]/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Mobile: stack vertikal — teks → gambar → tombol */}
          <div className="flex flex-col md:hidden items-center text-center gap-6 relative z-10 pt-6">

            {/* 1. Headline */}
            <h1 className="text-3xl font-extrabold text-zinc-900 leading-tight tracking-tight">
              Temukan Kopi Keliling <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5C3D2E] to-[#A06C46]">Di Sekitarmu</span>
            </h1>

            {/* 2. Deskripsi */}
            <p className="text-sm text-zinc-600 leading-relaxed max-w-xs">
              Tidak perlu menebak-nebak kapan kopi keliling lewat. Cari tahu lokasi <span className="font-semibold text-zinc-800">pin mangkal</span> rider Temu Kopling hari ini dan hampiri sekarang juga!
            </p>

            {/* 3. Gambar — center */}
            <div className="relative w-64 h-64 flex-shrink-0">
              <Image
                src="/heroes/riders.png"
                alt="Ilustrasi Kopi Keliling"
                fill
                sizes="300px"
                className="object-contain drop-shadow-xl"
                priority
              />
            </div>

            {/* 4. Tombol Aksi */}
            <div className="flex flex-col w-full gap-3 pb-4">
              <Link
                href="/cari-rider"
                className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#A06C46] to-[#5C3D2E] text-white rounded-full font-bold text-base hover:from-[#B57C54] hover:to-[#4A2B12] transition-all duration-300 shadow-lg ring-4 ring-[#A06C46]/20"
              >
                <MapPin className="w-5 h-5 animate-bounce" />
                <span>Cari Lokasi Rider</span>
              </Link>
              <Link
                href="#menu"
                className="flex items-center justify-center px-8 py-3.5 rounded-full font-semibold text-base text-zinc-700 bg-white border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all duration-300"
              >
                Lihat Menu
              </Link>
            </div>
          </div>

          {/* Desktop: 2 kolom side-by-side */}
          <div className="hidden md:grid md:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10 min-h-[calc(100vh-160px)]">

            {/* Teks & Tombol */}
            <div className="flex flex-col space-y-6 text-left pt-8 lg:pt-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-[#E8DCCB] text-[#5C3D2E] text-sm font-medium w-max shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                Pantau Lokasi Mangkal Rider
              </div>

              <h1 className="text-5xl lg:text-6xl font-extrabold text-zinc-900 leading-[1.15] tracking-tight">
                Temukan Kopi Keliling <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5C3D2E] to-[#A06C46]">Di Sekitarmu</span>
              </h1>

              <p className="text-lg text-zinc-600 leading-relaxed max-w-lg">
                Tidak perlu menebak-nebak kapan kopi keliling lewat. Cari tahu lokasi <span className="font-semibold text-zinc-800">pin mangkal</span> rider Temu Kopling hari ini dan hampiri sekarang juga!
              </p>

              <div className="flex flex-row items-center gap-4 pt-2">
                <Link
                  href="/cari-rider"
                  className="flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-[#A06C46] to-[#5C3D2E] text-white rounded-full font-bold text-lg hover:from-[#B57C54] hover:to-[#4A2B12] transition-all duration-300 shadow-xl shadow-[#A06C46]/40 hover:shadow-2xl hover:-translate-y-1 ring-4 ring-[#A06C46]/30"
                >
                  <MapPin className="w-6 h-6 animate-bounce" />
                  <span>Cari Lokasi Rider</span>
                </Link>
                <Link
                  href="#menu"
                  className="flex items-center justify-center px-8 py-3.5 rounded-full font-semibold text-base text-zinc-700 bg-white border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all duration-300"
                >
                  Lihat Menu
                </Link>
              </div>
            </div>

            {/* Gambar Desktop */}
            <div className="relative w-full aspect-square flex items-center justify-center lg:scale-110 lg:translate-x-6 xl:translate-x-10 transition-transform">
              <Image
                src="/heroes/riders.png"
                alt="Ilustrasi Kopi Keliling"
                fill
                sizes="50vw"
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>

          </div>
        </div>
      </div>
      
      {/* Menu Section */}
      <MenuSection />
      
      {/* About Section */}
      <AboutSection />
      
      {/* Contact Section */}
      <ContactSection />

      <Footer />
    </>
  );
}
