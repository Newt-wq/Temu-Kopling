import { MapPinned, Coffee, Clock, HeartHandshake } from "lucide-react";
import Image from "next/image";

export default function AboutSection() {
  return (
    <section id="tentang" className="py-24 bg-[#FAFAFA] relative overflow-hidden font-sans">
      {/* Soft Premium Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#E6D5C3]/40 to-transparent rounded-full blur-[100px] opacity-70 pointer-events-none -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#D4B895]/20 to-transparent rounded-full blur-[120px] opacity-60 pointer-events-none translate-y-1/3 -translate-x-1/4" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Teks Penjelasan */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5C3D2E]/10 text-[#5C3D2E] text-sm font-bold mb-6">
              <HeartHandshake className="w-4 h-4" />
              <span>Tentang Kami</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-zinc-900 mb-6 leading-tight">
              Lebih Mudah Menemukan <br className="hidden md:block"/>
              <span className="text-[#A06C46]">Kopi Favoritmu</span>
            </h2>
            
            <p className="text-lg text-zinc-600 leading-relaxed mb-10 max-w-lg">
              <strong className="text-zinc-900 font-semibold">Temu Kopling</strong> hadir sebagai solusi cerdas untuk memantau lokasi mangkal rider kopi keliling. Tidak perlu lagi menunggu tanpa kepastian atau muter-muter mencarinya di jalanan.
            </p>
            
            <div className="space-y-8">
              {/* Point 1 */}
              <div className="flex gap-5 items-start group">
                <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center justify-center flex-shrink-0 text-[#8C5E3C] group-hover:scale-110 transition-transform duration-300">
                  <MapPinned className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xl text-zinc-900 mb-2">Lacak Titik Mangkal</h4>
                  <p className="text-zinc-600 leading-relaxed">Temukan lokasi pasti rider kopi keliling yang sedang berhenti dan melayani pembeli di sekitarmu secara real-time.</p>
                </div>
              </div>
              
              {/* Point 2 */}
              <div className="flex gap-5 items-start group">
                <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center justify-center flex-shrink-0 text-[#8C5E3C] group-hover:scale-110 transition-transform duration-300">
                  <Coffee className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xl text-zinc-900 mb-2">Beragam Pilihan Brand</h4>
                  <p className="text-zinc-600 leading-relaxed">Dari Jago, Kopi Susu Jalanan (KSJ), hingga Calf. Pantau semua brand kopi keliling favoritmu dalam satu platform.</p>
                </div>
              </div>
              
              {/* Point 3 */}
              <div className="flex gap-5 items-start group">
                <div className="w-14 h-14 rounded-2xl bg-white border border-zinc-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center justify-center flex-shrink-0 text-[#8C5E3C] group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xl text-zinc-900 mb-2">Pasti & Hemat Waktu</h4>
                  <p className="text-zinc-600 leading-relaxed">Langsung hampiri titik lokasi terdekat yang tertera di peta, membuat harimu lebih efisien tanpa tebak-tebakan.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Ilustrasi Visual */}
          <div className="order-1 lg:order-2 relative flex justify-center items-center">
            <div className="relative w-full max-w-md aspect-square">
              {/* Abstract decorative rings */}
              <div className="absolute inset-0 rounded-full border border-[#8C5E3C]/10 scale-105 animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border border-[#8C5E3C]/10 scale-100 animate-[spin_25s_linear_infinite_reverse]" />
              
              <div className="absolute inset-0 bg-gradient-to-tr from-[#8C5E3C]/10 to-transparent rounded-full blur-2xl" />
              
              {/* Main Image Container */}
              <div className="absolute inset-10 bg-white/60 backdrop-blur-3xl rounded-[2.5rem] border border-white shadow-[0_20px_60px_-15px_rgba(140,94,60,0.15)] flex items-center justify-center p-12 overflow-hidden transform transition-transform hover:-translate-y-2 duration-500">
                <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent z-0" />
                <Image 
                  src="/logo.png" 
                  alt="Temu Kopling Logo" 
                  width={300} 
                  height={300} 
                  className="object-contain relative z-10 drop-shadow-xl"
                  priority
                />
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
