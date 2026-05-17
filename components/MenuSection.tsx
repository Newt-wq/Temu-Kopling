"use client";

import { useState } from "react";
import Image from "next/image";

// Data Dummy Brand dan Menu
const brands = [
  {
    id: "jago",
    name: "Jago Coffee",
    shortName: "Jago",
    logo: "/brand_coffe/Jago.jpeg",
    menus: [
      { id: 1, name: "Kopi Susu Jago", price: "Rp 18.000", desc: "Signature kopi susu khas Jago dengan paduan espresso dan gula aren.", image: "/brand_coffe/jago/kopi susu jago.png" },
      { id: 2, name: "Salted Caramel Latte", price: "Rp 22.000", desc: "Perpaduan manisnya karamel dan gurihnya sea salt dalam secangkir latte.", image: "/brand_coffe/jago/Salted Caramel Latte.png" },
      { id: 3, name: "Matcha Latte", price: "Rp 20.000", desc: "Teh hijau matcha premium yang lembut dan menenangkan.", image: "/brand_coffe/jago/matcha.png" },
      { id: 4, name: "Citrus Cold Brew", price: "Rp 20.000", desc: "Cold brew menyegarkan dengan sentuhan buah citrus asam manis.", image: "/brand_coffe/jago/Citrus Cold Brew.png" },
      { id: 5, name: "Chocolate", price: "Rp 18.000", desc: "Minuman cokelat pekat yang kaya rasa, cocok untuk yang tidak ngopi.", image: "/brand_coffe/jago/chocolate.png" },
    ]
  },
  {
    id: "ksj",
    name: "Kopi Susu Jalanan",
    shortName: "KSJ",
    logo: "/brand_coffe/KSJ.png",
    menus: [
      { id: 1, name: "Es Kopi Susu Sejuta Jiwa (KSJ)", price: "Rp 8.000", desc: "Sejuta Jiwa Latte.", image: "/brand_coffe/ksj/Eskopisususejutajiwa.jpeg" },
      { id: 2, name: "Es Americano", price: "Rp 8.000", desc: "Iced Americano.", image: "/brand_coffe/ksj/EsAmericano.jpeg" },
      { id: 3, name: "Es Lemonade", price: "Rp 8.000", desc: "Iced Lemonade.", image: "/brand_coffe/ksj/EsLemonade.jpeg" },
      { id: 4, name: "Es Kopi Vanilla", price: "Rp 10.000", desc: "Vanilla Latte.", image: "/brand_coffe/ksj/Eskopivanila.jpeg" },
      { id: 5, name: "Es Cokelat", price: "Rp 8.000", desc: "Iced Chocolate.", image: "/brand_coffe/ksj/EsCokelat.jpeg" },
    ]
  },
  {
    id: "calf",
    name: "Calf",
    shortName: "Calf",
    logo: "/brand_coffe/Calf.jpeg",
    menus: [
      { id: 1, name: "Es Kopi Reguler", price: "Rp 18.000", desc: "Es kopi susu reguler dengan resep autentik Calf.", image: "/brand_coffe/calf/eskopi-reg.png" },
      { id: 2, name: "Americano", price: "Rp 15.000", desc: "Kopi hitam klasik tanpa gula untuk pecinta rasa kopi sejati.", image: "/brand_coffe/calf/americano.png" },
      { id: 3, name: "Caramel Jeff", price: "Rp 22.000", desc: "Racikan rahasia Jeff dengan tambahan saus karamel lezat.", image: "/brand_coffe/calf/caramel-jeff.png" },
      { id: 4, name: "Liquid Jeff", price: "Rp 24.000", desc: "Signature drink Calf yang unik dan bikin nagih.", image: "/brand_coffe/calf/liquid-jeff.png" },
      { id: 5, name: "Mocha Jeff", price: "Rp 23.000", desc: "Perpaduan kopi dan cokelat khas racikan Calf.", image: "/brand_coffe/calf/mocha-jeff.png" },
    ]
  }
];

export default function MenuSection() {
  const [activeBrand, setActiveBrand] = useState(brands[0].id);
  const currentBrandData = brands.find(brand => brand.id === activeBrand) || brands[0];

  return (
    <section id="menu" className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 mb-3">
            Eksplorasi <span className="text-[#A06C46]">Menu Kopi</span>
          </h2>
          <p className="text-sm md:text-base text-zinc-500 max-w-xl mx-auto leading-relaxed">
            Pilih brand kopi keliling favoritmu dan lihat daftar menu racikan terbaik yang tersedia hari ini.
          </p>
        </div>

        {/* Filter Brand — scroll horizontal di mobile, centered di desktop */}
        <div className="relative mb-10">
          {/* Fade edge kiri & kanan (hanya mobile) */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white to-transparent z-10 md:hidden" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent z-10 md:hidden" />

          <div className="flex gap-3 overflow-x-auto md:overflow-visible md:justify-center md:flex-wrap pb-2 px-1 scrollbar-hide snap-x snap-mandatory">
            {brands.map((brand) => {
              const isActive = activeBrand === brand.id;
              return (
                <button
                  key={brand.id}
                  onClick={() => setActiveBrand(brand.id)}
                  className={`relative snap-start flex-shrink-0 flex flex-col items-center gap-2 pt-3 pb-4 px-5 rounded-2xl transition-all duration-300 border-2 min-w-[96px] md:min-w-0 md:flex-row md:gap-3 md:px-6 ${
                    isActive
                      ? "border-[#5C3D2E] bg-[#5C3D2E]/5 shadow-md"
                      : "border-zinc-100 bg-white hover:border-[#A06C46]/50 hover:bg-zinc-50"
                  }`}
                >
                  {/* Logo bulat */}
                  <div className="relative w-11 h-11 rounded-full overflow-hidden bg-white shadow-sm border border-zinc-200 flex-shrink-0 flex items-center justify-center">
                    <Image
                      src={brand.logo}
                      alt={`Logo ${brand.name}`}
                      fill
                      className="object-contain p-1"
                    />
                  </div>

                  {/* Nama — pendek di mobile, penuh di desktop */}
                  <span className={`font-bold text-xs md:text-sm leading-tight text-center md:text-left whitespace-nowrap ${
                    isActive ? "text-[#5C3D2E]" : "text-zinc-500"
                  }`}>
                    <span className="md:hidden">{brand.shortName}</span>
                    <span className="hidden md:inline">{brand.name}</span>
                  </span>

                  {/* Bar aktif di bawah tombol */}
                  {isActive && (
                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#5C3D2E] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel Menu */}
        <div className="bg-[#FAF8F5] rounded-3xl p-5 md:p-10 border border-[#F2E8DB]">

          {/* Header panel — brand aktif */}
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 pb-5 md:pb-6 border-b border-[#E8DCCB]">
            <div className="relative w-14 h-14 md:w-20 md:h-20 flex-shrink-0 rounded-full overflow-hidden border border-zinc-200 shadow-sm bg-white">
              <Image
                src={currentBrandData.logo}
                alt={`Logo ${currentBrandData.name}`}
                fill
                className="object-contain p-2"
              />
            </div>
            <div>
              <h3 className="text-lg md:text-2xl font-bold text-zinc-900 leading-tight">
                Menu {currentBrandData.name}
              </h3>
              <p className="text-xs md:text-sm text-[#A06C46] font-medium mt-0.5">
                Tersedia via Rider Keliling
              </p>
            </div>
          </div>

          {/* Grid Kartu Menu — 1 kolom di mobile agar gambar & info tetap terbaca */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentBrandData.menus.map((menu) => (
              <div
                key={menu.id}
                className="bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {/* Gambar */}
                <div className="relative w-full h-[360px] bg-[#FAF8F5] overflow-hidden flex items-center justify-center p-4">
                  <img
                    src={menu.image}
                    alt={menu.name}
                    className="w-auto h-auto max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <h4 className="font-bold text-zinc-900 text-lg leading-tight">{menu.name}</h4>
                    <span className="font-bold text-base text-[#5C3D2E] whitespace-nowrap bg-[#5C3D2E]/10 px-2 py-1 rounded-lg flex-shrink-0">
                      {menu.price}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-sm leading-relaxed flex-grow">
                    {menu.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
