import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#FAF8F5] border-t border-[#E8DCCB]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">

          {/* Kiri: Logo & Deskripsi */}
          <div className="flex flex-col space-y-3 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="Temu Kopling Logo"
                width={120}
                height={65}
                className="object-contain"
              />
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              Menyajikan kopi terbaik untuk menemani setiap momen spesial Anda. Temukan inspirasi di setiap tegukan.
            </p>
          </div>

          {/* Tengah: Tautan Cepat */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-bold text-[#3D2314] text-base">Tautan Cepat</h3>
            <ul className="flex flex-col space-y-2 text-sm text-zinc-500">
              <li>
                <Link href="/" className="hover:text-[#5C3D2E] transition-colors">Beranda</Link>
              </li>
              <li>
                <Link href="#menu" className="hover:text-[#5C3D2E] transition-colors">Menu</Link>
              </li>
              <li>
                <Link href="/cari-rider" className="hover:text-[#5C3D2E] transition-colors">Cari Rider</Link>
              </li>
              <li>
                <Link href="#tentang" className="hover:text-[#5C3D2E] transition-colors">Tentang Kami</Link>
              </li>
              <li>
                <Link href="#kontak" className="hover:text-[#5C3D2E] transition-colors">Kontak</Link>
              </li>
            </ul>
          </div>

          {/* Untuk Rider */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-bold text-[#3D2314] text-base">Area Rider</h3>
            <ul className="flex flex-col space-y-2 text-sm text-zinc-500">
              <li>
                <Link href="/rider-login" className="hover:text-[#5C3D2E] transition-colors">Masuk sebagai Rider</Link>
              </li>
              <li>
                <span className="text-zinc-400 text-xs">Punya akun rider? Login untuk mulai ngetem dan kelola menu kamu.</span>
              </li>
            </ul>
            <Link
              href="/rider-login"
              className="inline-flex items-center gap-2 mt-1 px-4 py-2 rounded-full bg-[#5C3D2E] text-white text-xs font-semibold hover:bg-[#4A2B12] transition-colors w-fit"
            >
              Login Rider →
            </Link>
          </div>

          {/* Kanan: Sosial Media */}
          <div className="flex flex-col space-y-3">
            <h3 className="font-bold text-[#3D2314] text-base">Ikuti Kami</h3>
            <div className="flex space-x-3">
              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm text-zinc-500 hover:text-[#E1306C] hover:shadow-md transition-all border border-zinc-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>

              {/* TikTok */}
              <a
                href="#"
                aria-label="TikTok"
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm text-zinc-500 hover:text-black hover:shadow-md transition-all border border-zinc-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
                </svg>
              </a>

              {/* WhatsApp */}
              <a
                href="#"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm text-zinc-500 hover:text-[#25D366] hover:shadow-md transition-all border border-zinc-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </a>
            </div>
            <p className="text-sm text-zinc-500">
              Hubungi kami untuk pemesanan atau pertanyaan lebih lanjut.
            </p>
          </div>

        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-[#E8DCCB] text-center">
          <p className="text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} Temu Kopling. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
