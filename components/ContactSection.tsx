import { Mail, Phone, MapPin, Bike, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ContactSection() {
  return (
    <section id="kontak" className="pt-20 pb-14 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 mb-3">
            Hubungi <span className="text-[#A06C46]">Kami</span>
          </h2>
          <p className="text-base md:text-lg text-zinc-500 max-w-xl mx-auto leading-relaxed">
            Punya pertanyaan seputar layanan Temu Kopling? Atau ingin berkolaborasi? Jangan ragu untuk menghubungi kami.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-stretch">

          {/* Kiri: Info Kontak */}
          <div className="bg-white rounded-3xl p-8 border border-[#E8DCCB] shadow-sm flex flex-col justify-center gap-6">
            {/* Email */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-[#FAF8F5] border border-[#E8DCCB] flex items-center justify-center text-[#5C3D2E]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-0.5">Email</p>
                <a
                  href="mailto:info@temukopling.com"
                  className="text-base font-bold text-zinc-900 hover:text-[#A06C46] transition-colors break-all"
                >
                  info@temukopling.com
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-[#FAF8F5] border border-[#E8DCCB] flex items-center justify-center text-[#5C3D2E]">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-0.5">WhatsApp / Telepon</p>
                <a
                  href="https://wa.me/6285888770484"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-bold text-zinc-900 hover:text-[#A06C46] transition-colors"
                >
                  +62 858-8877-0484
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex-shrink-0 rounded-2xl bg-[#FAF8F5] border border-[#E8DCCB] flex items-center justify-center text-[#5C3D2E]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mb-0.5">Alamat Kantor</p>
                <p className="text-base font-bold text-zinc-900">Jl. Raya Cipayung No. 88, Cipayung, Jakarta Timur</p>
              </div>
            </div>
          </div>

          {/* Kanan: CTA Daftar Rider */}
          <div className="bg-[#4A2B12] rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-xl flex flex-col justify-between gap-8">
            {/* Dekorasi */}
            <div className="absolute top-0 right-0 w-56 h-56 bg-white/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none -translate-x-1/4 translate-y-1/4" />

            <div className="relative z-10">
              <div className="mb-5 w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <Bike className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>

              <h3 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight leading-snug">
                Jadi Rider Kami
              </h3>

              <p className="text-white/75 text-base leading-relaxed max-w-sm">
                Dapatkan penghasilan tambahan sambil berkeliling kota menghantarkan aroma kopi. Bergabunglah dengan ratusan rider Temu Kopling!
              </p>
            </div>

            <div className="relative z-10">
              <a
                href="https://wa.me/6285888770484?text=Halo%2C%20saya%20tertarik%20untuk%20bergabung%20menjadi%20rider%20kopi%20keliling%20di%20Temu%20Kopling."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#8C5E3C] hover:bg-[#A06C46] text-white px-7 py-3.5 rounded-full font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto justify-center sm:justify-start"
              >
                <span>Daftar Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
