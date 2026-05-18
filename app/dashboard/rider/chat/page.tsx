"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, MessageCircle, Coffee, ArrowLeft } from "lucide-react";
import { useRiderAuth } from "@/app/dashboard/rider/layout";
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
  messages: Message[];
  unreadCount: number;
  lastAt: string;
};

const sortByLatest = (list: ChatSession[]) =>
  [...list].sort((a, b) => (b.lastAt > a.lastAt ? 1 : -1));

export default function RiderChatPage() {
  const { riderAuth } = useRiderAuth();
  const socketRef = useRef<Socket | null>(null);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!riderAuth) return;

    const sock = io("http://localhost:5000");
    socketRef.current = sock;

    // Join private notification room (reset badge dari layout)
    sock.on("connect", () => {
      sock.emit("join_user_room", riderAuth.id);
    });

    const buildChats = (dbMessages: any[]): ChatSession[] => {
      const map = new Map<string, ChatSession>();

      dbMessages.forEach((row) => {
        const d = row.message_data;
        if (d.riderId?.toString() !== riderAuth.id?.toString()) return;

        if (!map.has(d.chatId)) {
          map.set(d.chatId, {
            chatId: d.chatId,
            customer: d.customer || { id: "unknown", name: "Pelanggan" },
            riderId: d.riderId,
            messages: [],
            unreadCount: 0,
            lastAt: row.created_at || new Date(0).toISOString(),
          });
        }
        const chat = map.get(d.chatId)!;
        chat.messages.push({ ...d.message, rawTimestamp: row.created_at });
        if (row.created_at > chat.lastAt) chat.lastAt = row.created_at;
      });

      return sortByLatest(Array.from(map.values()));
    };

    sock.on("chat_history_loaded", async (data: any[]) => {
      const formed = buildChats(data);

      // Fetch foto profil customer dari Supabase
      const customerIds = [...new Set(formed.map(c => c.customer.id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, logo")
        .in("id", customerIds);

      let finalChats = formed;
      if (profiles) {
        const validChats: ChatSession[] = [];
        formed.forEach((chat) => {
          const p = profiles.find(x => x.id === chat.customer.id);
          if (p) {
            chat.customer = { ...chat.customer, name: p.name || chat.customer.name, logo: p.logo || "" };
            validChats.push(chat);
          }
        });
        finalChats = validChats;
      }

      setChats(prev => {
        // Preserve customer data yang sudah didapat dari live events
        const mergedFormed = finalChats.map(f => {
          const existing = prev.find(p => p.chatId === f.chatId);
          if (existing && existing.customer && existing.customer.name !== "Pelanggan") {
            return { ...f, customer: existing.customer };
          }
          return f;
        });
        return mergedFormed;
      });
    });

    // Pesan baru masuk
    sock.on("receive_message", (data: any) => {
      if (data.riderId?.toString() !== riderAuth.id?.toString()) return;

      setChats(prev => {
        const existing = prev.find(c => c.chatId === data.chatId);
        const now = new Date().toISOString();

        if (existing) {
          return sortByLatest(prev.map(c => {
            if (c.chatId !== data.chatId) return c;
            const alreadyHas = c.messages.some(m => m.text === data.message.text && m.timestamp === data.message.timestamp);
            if (alreadyHas) return c;
            const unread = activeChatId !== data.chatId && data.message.sender !== "rider"
              ? c.unreadCount + 1 : 0;
            return { ...c, messages: [...c.messages, data.message], lastAt: now, unreadCount: unread };
          }));
        }

        // Chat baru dari customer yang belum pernah chat → fetch ulang
        socketRef.current?.emit("request_chat_history");
        return prev;
      });
    });

    // Profile customer berubah → update di daftar chat
    sock.on("profile_updated", (data: any) => {
      if (data.role !== "customer") return;
      setChats(prev => prev.map(c => {
        if (c.customer.id.toString() !== data.userId.toString()) return c;
        return { ...c, customer: { ...c.customer, name: data.name, logo: data.logo } };
      }));
    });

    // Minta history saat halaman dibuka
    sock.emit("request_chat_history");

    return () => {
      sock.off("chat_history_loaded");
      sock.off("receive_message");
      sock.off("profile_updated");
      sock.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riderAuth]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, activeChatId]);

  // Buka chat + reset unread
  const openChat = (chatId: string) => {
    setActiveChatId(chatId);
    setChats(prev => prev.map(c => c.chatId === chatId ? { ...c, unreadCount: 0 } : c));
  };

  const activeChat = chats.find(c => c.chatId === activeChatId);

  const sendMessage = (text: string) => {
    if (!text.trim() || !activeChatId || !socketRef.current) return;

    const now = new Date();
    const newMessage: Message = {
      sender: "rider",
      text: text.trim(),
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
      customer: activeChat?.customer,
      riderId: riderAuth?.id,
      riderData: { riderName: riderAuth?.name, brand: riderAuth?.brand, logo: riderAuth?.logo },
      message: newMessage,
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
    setInputText("");
  };

  const handleTemplateClick = (template: string) => {
    sendMessage(template);
  };

  return (
    <div className="h-full flex flex-col bg-[#FAF8F5]">
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-0 md:px-6 py-0 md:py-6 overflow-hidden">
        <div className="flex-1 flex bg-white md:rounded-[2rem] md:shadow-2xl md:shadow-[#5C3D2E]/10 border border-[#E8DCCB]/50 overflow-hidden relative">

          {/* Sidebar - Daftar Chat */}
          <div className={`w-full md:w-[340px] bg-[#FAF8F5]/50 border-r border-[#E8DCCB]/60 flex flex-col absolute md:relative inset-0 z-10 transition-transform ${activeChatId ? "-translate-x-full md:translate-x-0" : "translate-x-0"}`}>
            <div className="p-6 border-b border-[#E8DCCB]/60 bg-white/50 backdrop-blur-sm">
              <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Pesan Masuk</h1>
              <p className="text-sm text-zinc-500 mt-1 font-medium">{chats.length} percakapan aktif</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-5 text-zinc-400">
                  <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-3">
                    <MessageCircle className="w-8 h-8 text-zinc-300" />
                  </div>
                  <p className="text-sm font-bold text-zinc-600 mb-1">Belum ada pesan</p>
                  <p className="text-xs">Pesan dari pelanggan akan muncul di sini.</p>
                </div>
              ) : (
                chats.map((chat) => {
                  const lastMsg = chat.messages[chat.messages.length - 1];
                  const isSelected = activeChatId === chat.chatId;
                  return (
                    <button
                      key={chat.chatId}
                      onClick={() => openChat(chat.chatId)}
                      className={`w-full text-left p-5 transition-all duration-300 flex items-center gap-4 relative group ${isSelected ? "bg-white shadow-[0_0_20px_rgba(92,61,46,0.05)] z-10" : "bg-transparent hover:bg-white"}`}
                    >
                      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#A06C46] to-[#5C3D2E] rounded-r-full" />}
                      <div className={`relative w-12 h-12 rounded-full overflow-hidden border-2 flex items-center justify-center flex-shrink-0 bg-zinc-100 transition-colors ${isSelected ? "border-[#5C3D2E]" : "border-white shadow-sm"}`}>
                        {chat.customer.logo ? (
                          <img src={chat.customer.logo} alt={chat.customer.name} className="w-full h-full object-contain p-1" onError={(e) => (e.currentTarget.style.display = 'none')} />
                        ) : (
                          <User className={`w-5 h-5 ${isSelected ? "text-[#5C3D2E]" : "text-zinc-400"}`} />
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
                          <p className={`font-bold text-[15px] truncate ${isSelected ? "text-[#5C3D2E]" : "text-zinc-900"}`}>
                            {chat.customer.name}
                          </p>
                          {lastMsg && (
                            <span className={`text-[10px] font-bold tracking-wide whitespace-nowrap ml-2 ${isSelected ? "text-[#A06C46]" : "text-zinc-400"}`}>{lastMsg.timestamp}</span>
                          )}
                        </div>
                        {lastMsg && (
                          <p className={`text-[13px] truncate ${chat.unreadCount > 0 ? "font-semibold text-zinc-900" : "text-zinc-500"}`}>
                            {lastMsg.sender === "rider" && <span className="opacity-70">Anda: </span>}
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
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-white shadow-xl rounded-full flex items-center justify-center mb-6">
                  <MessageCircle className="w-12 h-12 text-[#E8DCCB]" />
                </div>
                <p className="font-extrabold text-xl text-zinc-700 mb-2">Pilih Percakapan</p>
                <p className="text-sm text-zinc-500 font-medium">Klik pelanggan di samping untuk mulai membalas.</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="bg-white/80 backdrop-blur-xl px-5 py-4 flex items-center gap-4 border-b border-[#E8DCCB]/60 shrink-0">
                  <button onClick={() => setActiveChatId(null)} className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-[#FAF8F5] text-zinc-700 mr-1 flex-shrink-0">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#5C3D2E] flex items-center justify-center bg-zinc-100 flex-shrink-0">
                    {activeChat.customer.logo ? (
                      <img src={activeChat.customer.logo} alt={activeChat.customer.name} className="w-full h-full object-contain p-1" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    ) : (
                      <User className="w-6 h-6 text-[#5C3D2E]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-zinc-900 text-[15px] leading-tight mb-0.5">{activeChat.customer.name}</h3>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 bg-[#FAF8F5]">
                  {activeChat.messages.map((msg, idx) => {
                    const isMe = msg.sender === "rider";
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
                  {/* Chat Templates */}
                  <div className="flex gap-2 overflow-x-auto pb-3 mb-1 scrollbar-hide max-w-4xl mx-auto">
                    {[
                      "Siap, ditunggu ya!",
                      "Masih ngetem nih",
                      "Kopi sedang disiapkan",
                      "Otw ke sana sebentar"
                    ].map((template, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleTemplateClick(template)}
                        className="flex-shrink-0 text-[13px] font-medium text-zinc-600 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-full hover:bg-[#FAF8F5] hover:border-[#A06C46]/40 hover:text-[#5C3D2E] transition-all"
                      >
                        {template}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSend} className="flex items-center gap-3 max-w-4xl mx-auto">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Ketik balasan untuk pelanggan..."
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
