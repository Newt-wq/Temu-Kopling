import { MapPinned, Coffee, Clock, HeartHandshake } from "lucide-react";
import Image from "next/image";

export default function AboutSection() {
  return (
    <section id="tentang" className="py-24 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#FAF8F5] rounded-l-[100px] opacity-50 pointer-events-none hidden lg:block"></div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Teks Penjelasan */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5C3D2E]/10 text-[#5C3D2E] text-sm font-bold mb-6">
              <HeartHandshake className="w-4 h-4" />
              <span>Tentang Kami</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-zinc-900 mb-6 leading-tight">
              Menghubungkan Kamu dengan <span className="text-[#A06C46]">Kopi Favoritmu</span>
            </h2>
            
            <p className="text-lg text-zinc-600 leading-relaxed mb-8">
              <strong className="text-zinc-900">Temu Kopling</strong> hadir sebagai solusi cerdas untuk memantau titik lokasi mangkal rider kopi keliling. Tidak perlu lagi menunggu tanpa kepastian atau menebak kapan kopi langgananmu lewat.
            </p>
            
            <div className="space-y-6">
              {/* Point 1 */}
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-[#A06C46]/10 flex items-center justify-center flex-shrink-0 text-[#A06C46]">
                  <MapPinned className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xl text-zinc-900 mb-1">Cari Titik Mangkal</h4>
                  <p className="text-zinc-600">Temukan lokasi pasti rider kopi keliling yang sedang berhenti dan melayani pembeli di sekitarmu.</p>
                </div>
              </div>
              
              {/* Point 2 */}
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-[#5C3D2E]/10 flex items-center justify-center flex-shrink-0 text-[#5C3D2E]">
                  <Coffee className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xl text-zinc-900 mb-1">Beragam Pilihan Brand</h4>
                  <p className="text-zinc-600">Mulai dari Jago, Kopi Susu Jalanan (KSJ), hingga Calf, pantau semua brand favoritmu dalam satu platform.</p>
                </div>
              </div>
              
              {/* Point 3 */}
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-xl text-zinc-900 mb-1">Lebih Pasti, Hemat Waktu</h4>
                  <p className="text-zinc-600">Langsung hampiri titik lokasi terdekat tanpa harus muter-muter mencarinya di jalanan.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Ilustrasi Visual */}
          <div className="relative">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#A06C46] to-[#5C3D2E] rounded-3xl rotate-3 opacity-10"></div>
              <div className="absolute inset-0 bg-white rounded-3xl -rotate-3 border border-zinc-100 shadow-xl overflow-hidden flex items-center justify-center p-8">
                <Image 
                  src="/logo.png" 
                  alt="Temu Kopling Logo" 
                  width={300} 
                  height={300} 
                  className="object-contain"
                />
              </div>
              
              {/* Dekorasi Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-lg border border-zinc-100 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <MapPinned className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 font-medium">Status Rider</p>
                  <p className="text-sm font-bold text-zinc-900">Sedang Mangkal</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
