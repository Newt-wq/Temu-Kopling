"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, User, MessageCircle, ArrowLeft, Coffee } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { io, Socket } from "socket.io-client";
import { supabase } from "@/lib/supabase";

type Message = {
  sender: "customer" | "rider";
  text: string;
  timestamp: string;
  rawTimestamp?: string;
};

type ChatSession = {
  chatId: string;
  customer: { id: string; name: string; logo?: string };
  riderId: string | number;
  riderData: { riderName: string; brand: string; logo: string };
  messages: Message[];
  unreadCount: number;
  lastAt: string; // ISO timestamp untuk sorting
};

const sortByLatest = (list: ChatSession[]) =>
  [...list].sort((a, b) => (b.lastAt > a.lastAt ? 1 : -1));

export default function PesanPage() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [customerAuth, setCustomerAuth] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Auth check
  useEffect(() => {
    const auth = sessionStorage.getItem("customer_auth");
    if (auth) {
      setCustomerAuth(JSON.parse(auth));
      setCheckingAuth(false);
    } else {
      router.replace("/login");
    }
  }, [router]);

  // Socket + data loading
  useEffect(() => {
    if (!customerAuth) return;

    const sock = io("http://localhost:5000");
    socketRef.current = sock;

    // Join private notification room
    sock.on("connect", () => {
      sock.emit("join_user_room", customerAuth.id);
    });

    const buildChats = async (dbMessages: any[]) => {
      const map = new Map<string, ChatSession>();

      dbMessages.forEach((row) => {
        const d = row.message_data;
        if (!d.customer || d.customer.id !== customerAuth.id) return;

        if (!map.has(d.chatId)) {
          map.set(d.chatId, {
            chatId: d.chatId,
            customer: d.customer,
            riderId: d.riderId,
            riderData: { riderName: "Rider", brand: "Temu Kopling", logo: "" },
            messages: [],
            unreadCount: 0,
            lastAt: row.created_at || new Date(0).toISOString(),
          });
        }
        const chat = map.get(d.chatId)!;
        chat.messages.push({ ...d.message, rawTimestamp: row.created_at });
        if (row.created_at > chat.lastAt) chat.lastAt = row.created_at;

        // Ambil profil rider dari pesan terbaru yang dikirim rider
        // (rider selalu menyertakan riderData terkini dari sessionStorage saat kirim pesan)
        if (d.message?.sender === "rider" && d.riderData) {
          chat.riderData = {
            riderName: d.riderData.riderName || chat.riderData.riderName,
            brand: d.riderData.brand || chat.riderData.brand,
            logo: d.riderData.logo || chat.riderData.logo,
          };
        }
      });

      const formed = sortByLatest(Array.from(map.values()));

      // Selalu ambil profil terbaru dari database, jangan pakai data sisa dari pesan lama
      const uniqueRiderIds = Array.from(new Set(formed.map(c => c.riderId.toString())));

      if (uniqueRiderIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, brand, logo")
          .in("id", uniqueRiderIds);

        if (profiles) {
          profiles.forEach((p) => {
            const chat = formed.find(c => c.riderId.toString() === p.id);
            if (chat) {
              chat.riderData = { riderName: p.name, brand: p.brand || "Temu Kopling", logo: p.logo || "" };
            }
          });
        }
      }

      return formed;
    };

    sock.on("chat_history_loaded", async (data: any[]) => {
      const formed = await buildChats(data);
      setChats(prev => {
        const shells = prev.filter(c => c.messages.length === 0 && !formed.find(f => f.chatId === c.chatId));
        // Preserve riderData yang sudah didapat dari live events (active_riders_update / profile_updated)
        const mergedFormed = formed.map(f => {
          const existing = prev.find(p => p.chatId === f.chatId);
          if (existing && existing.riderData && existing.riderData.riderName !== "Rider") {
            return { ...f, riderData: existing.riderData };
          }
          return f;
        });
        return sortByLatest([...shells, ...mergedFormed]);
      });
    });

    // Pesan baru → refresh history (chat akan naik ke atas otomatis)
    sock.on("receive_message", (data: any) => {
      // Tambahkan pesan baru langsung ke state (tanpa re-fetch jika sudah ada chat-nya)
      setChats(prev => {
        const existing = prev.find(c => c.chatId === data.chatId);
        if (existing) {
          const now = new Date().toISOString();
          return sortByLatest(prev.map(c => {
            if (c.chatId !== data.chatId) return c;
            const alreadyHas = c.messages.some(m => m.text === data.message.text && m.timestamp === data.message.timestamp);
            if (alreadyHas) return c;
            const unread = activeChatId !== data.chatId ? c.unreadCount + 1 : 0;
            return { ...c, messages: [...c.messages, data.message], lastAt: now, unreadCount: unread };
          }));
        }
        // Jika chat baru → fetch ulang
        sock.emit("request_chat_history", null);
        return prev;
      });
    });

    // Profile rider berubah → update riderData di chat
    sock.on("profile_updated", (data: any) => {
      if (data.role !== "rider") return;
      setChats(prev => prev.map(c => {
        if (c.riderId.toString() !== data.userId.toString()) return c;
        return { ...c, riderData: { riderName: data.name, brand: data.brand, logo: data.logo } };
      }));
    });

    // Sinkronisasi data terbaru dari list rider yang sedang aktif (bypass RLS lag)
    sock.on("active_riders_update", (riders: any[]) => {
      setChats(prev => prev.map(c => {
        const activeRider = riders.find((r: any) => r.id.toString() === c.riderId.toString());
        if (activeRider) {
          return {
            ...c,
            riderData: {
              riderName: activeRider.name,
              brand: activeRider.brand || c.riderData.brand,
              logo: activeRider.logo || c.riderData.logo
            }
          };
        }
        return c;
      }));
    });

    // Minta history saat pertama buka
    sock.emit("request_chat_history", null);

    // Buka chat dari URL param riderId
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const riderIdParam = params.get("riderId");
      if (riderIdParam) {
        const expectedChatId = `chat_${customerAuth.id}_${riderIdParam}`;
        setActiveChatId(expectedChatId);
        setChats(prev => {
          if (prev.find(c => c.riderId.toString() === riderIdParam)) return prev;
          return [...prev, {
            chatId: expectedChatId,
            customer: customerAuth,
            riderId: riderIdParam,
            riderData: { riderName: "Rider", brand: "Temu Kopling", logo: "" },
            messages: [],
            unreadCount: 0,
            lastAt: new Date(0).toISOString(),
          }];
        });
      }
    }

    return () => {
      sock.off("chat_history_loaded");
      sock.off("receive_message");
      sock.off("profile_updated");
      sock.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerAuth]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, activeChatId]);

  // Reset unread saat buka chat
  const openChat = (chatId: string) => {
    setActiveChatId(chatId);
    setChats(prev => prev.map(c => c.chatId === chatId ? { ...c, unreadCount: 0 } : c));
  };

  const activeChat = chats.find(c => c.chatId === activeChatId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId || !socketRef.current) return;

    const now = new Date();
    const newMessage: Message = {
      sender: "customer",
      text: inputText.trim(),
      timestamp: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      rawTimestamp: now.toISOString(),
    };

    // Optimistic UI
    setChats(prev => sortByLatest(prev.map(c => {
      if (c.chatId !== activeChatId) return c;
      return { ...c, messages: [...c.messages, newMessage], lastAt: now.toISOString() };
    })));

    socketRef.current.emit("send_message", {
      chatId: activeChatId,
      customer: customerAuth,
      riderId: activeChat?.riderId,
      message: newMessage,
    });
    setInputText("");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#5C3D2E] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-500 font-medium">Memuat pesan...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#FAF8F5]">
      <Navbar />
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-0 md:px-6 py-0 md:py-6 overflow-hidden">
        <div className="flex-1 flex bg-white md:rounded-[2rem] md:shadow-2xl md:shadow-[#5C3D2E]/10 border border-[#E8DCCB]/50 overflow-hidden relative">

          {/* Sidebar - Daftar Chat */}
          <div className={`w-full md:w-[340px] bg-[#FAF8F5]/50 border-r border-[#E8DCCB]/60 flex flex-col absolute md:relative inset-0 z-10 transition-transform ${activeChatId ? "-translate-x-full md:translate-x-0" : "translate-x-0"}`}>
            <div className="p-6 border-b border-[#E8DCCB]/60 bg-white/50 backdrop-blur-sm flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Pesan</h1>
                <p className="text-sm text-zinc-500 mt-1 font-medium">{chats.length} percakapan aktif</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-5 text-zinc-400">
                  <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-3">
                    <MessageCircle className="w-8 h-8 text-zinc-300" />
                  </div>
                  <p className="text-sm font-bold text-zinc-600 mb-1">Belum ada obrolan</p>
                  <p className="text-xs">Pergi ke peta untuk cari kopi dan mulai chat.</p>
                  <Link href="/cari-rider" className="mt-4 text-[#A06C46] text-xs font-bold hover:underline">Lihat Peta Sekarang →</Link>
                </div>
              ) : (
                chats.map((chat) => {
                  const lastMsg = chat.messages[chat.messages.length - 1];
                  const isSelected = activeChatId === chat.chatId;
                  return (
                    <button
                      key={chat.chatId}
                      onClick={() => openChat(chat.chatId)}
                      className={`w-full text-left p-5 transition-all duration-300 flex items-center gap-4 relative group ${isSelected ? "bg-white shadow-[0_0_20px_rgba(92,61,46,0.05)] z-10" : "bg-transparent hover:bg-white hover:shadow-[0_0_15px_rgba(0,0,0,0.03)]"}`}
                    >
                      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#A06C46] to-[#5C3D2E] rounded-r-full" />}
                      <div className={`relative w-14 h-14 rounded-full overflow-hidden border-2 flex-shrink-0 flex items-center justify-center bg-[#FAF8F5] transition-colors ${isSelected ? "border-[#5C3D2E]" : "border-white shadow-sm"}`}>
                        {chat.riderData.logo ? (
                          <img src={chat.riderData.logo} alt={chat.riderData.riderName} className="w-full h-full object-contain p-1" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        ) : (
                          <Coffee className="w-6 h-6 text-[#A06C46]/50" />
                        )}
                        {/* Unread badge */}
                        {chat.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                            {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className={`font-bold text-[15px] truncate transition-colors ${isSelected ? "text-[#5C3D2E]" : "text-zinc-900"}`}>
                            {chat.riderData.riderName}
                          </p>
                          {lastMsg && (
                            <span className={`text-[10px] font-bold tracking-wide whitespace-nowrap ml-2 ${isSelected ? "text-[#A06C46]" : "text-zinc-400"}`}>{lastMsg.timestamp}</span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-[#A06C46]/80 mb-1">{chat.riderData.brand}</p>
                        {lastMsg && (
                          <p className={`text-[13px] truncate ${chat.unreadCount > 0 ? "font-semibold text-zinc-900" : "text-zinc-500"}`}>
                            {lastMsg.sender === "customer" && <span className="opacity-70">Anda: </span>}
                            {lastMsg.text}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className={`flex-1 flex flex-col bg-white absolute md:relative inset-0 z-20 transition-transform ${activeChatId ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}>
            {!activeChat ? (
              <div className="hidden md:flex flex-1 flex-col items-center justify-center">
                <div className="w-24 h-24 bg-white shadow-xl rounded-full flex items-center justify-center mb-6">
                  <MessageCircle className="w-12 h-12 text-[#E8DCCB]" />
                </div>
                <p className="font-extrabold text-xl text-zinc-700 mb-2">Mulai Obrolan</p>
                <p className="text-sm text-zinc-500 font-medium">Pilih rider dari daftar di samping.</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="bg-white/80 backdrop-blur-xl px-5 py-4 flex items-center gap-4 border-b border-[#E8DCCB]/60 shrink-0">
                  <button onClick={() => setActiveChatId(null)} className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-[#FAF8F5] text-zinc-700 mr-1 flex-shrink-0">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#5C3D2E] flex items-center justify-center bg-[#FAF8F5] flex-shrink-0">
                    {activeChat.riderData.logo ? (
                      <img src={activeChat.riderData.logo} alt={activeChat.riderData.riderName} className="w-full h-full object-contain p-1" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    ) : (
                      <Coffee className="w-5 h-5 text-[#A06C46]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-zinc-900 text-[15px] leading-tight mb-0.5">{activeChat.riderData.riderName}</h3>
                    <p className="text-xs font-bold text-[#A06C46]">{activeChat.riderData.brand}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 bg-[#FAF8F5]">
                  {activeChat.messages.map((msg, idx) => {
                    const isMe = msg.sender === "customer";
                    return (
                      <div key={idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[75%] px-5 py-3.5 rounded-[1.25rem] shadow-sm ${isMe ? "bg-gradient-to-br from-[#A06C46] to-[#5C3D2E] text-white rounded-br-sm" : "bg-white border border-[#E8DCCB]/60 text-zinc-800 rounded-bl-sm"}`}>
                          <p className="text-[15px] leading-relaxed">{msg.text}</p>
                        </div>
                        <span className="text-[11px] font-bold text-zinc-400 mt-1.5 px-1">{msg.timestamp}</span>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="bg-white p-4 md:p-6 border-t border-[#E8DCCB]/60 shrink-0">
                  <form onSubmit={handleSend} className="flex items-center gap-3 max-w-4xl mx-auto">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Ketik balasanmu di sini..."
                      className="flex-1 bg-[#FAF8F5] border-2 border-[#E8DCCB]/50 rounded-full px-6 py-3.5 text-[15px] text-zinc-900 placeholder:text-zinc-400 font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5C3D2E]/10 focus:border-[#5C3D2E] transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="w-14 h-14 rounded-full bg-gradient-to-b from-[#A06C46] to-[#5C3D2E] flex items-center justify-center text-white disabled:opacity-50 transition-all shadow-lg flex-shrink-0"
                    >
                      <Send className="w-[22px] h-[22px]" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
