"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, MessageCircle } from "lucide-react";

type Message = {
  sender: "customer" | "rider";
  text: string;
  timestamp: string;
};

type ChatSession = {
  chatId: string;
  customer: { id: string; name: string };
  riderId: number;
  messages: Message[];
};

export default function RiderChatPage() {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [riderAuth, setRiderAuth] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadChats = () => {
    const authData = sessionStorage.getItem("rider_auth");
    if (!authData) return;
    const auth = JSON.parse(authData);
    setRiderAuth(auth);

    const data = localStorage.getItem("temu_chats");
    if (data) {
      const parsed = JSON.parse(data);
      const myChats: ChatSession[] = [];
      
      Object.keys(parsed).forEach(key => {
        const session = parsed[key];
        // Only load chats for this specific rider
        if (session.riderId === auth.id) {
          myChats.push({
            chatId: key,
            customer: session.customer,
            riderId: session.riderId,
            messages: session.messages || [],
          });
        }
      });
      
      setChats(myChats);
    }
  };

  useEffect(() => {
    loadChats();

    const handleStorage = () => {
      loadChats();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("temu_chat_update", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("temu_chat_update", handleStorage);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, activeChatId]);

  const activeChat = chats.find(c => c.chatId === activeChatId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    const newMessage: Message = {
      sender: "rider",
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }),
    };

    // Update local state temporarily for snappy UI
    const updatedChats = chats.map(c => {
      if (c.chatId === activeChatId) {
        return { ...c, messages: [...c.messages, newMessage] };
      }
      return c;
    });
    setChats(updatedChats);
    setInputText("");

    // Save to localStorage
    const data = localStorage.getItem("temu_chats");
    const parsed = data ? JSON.parse(data) : {};
    
    if (parsed[activeChatId]) {
      parsed[activeChatId].messages.push(newMessage);
      localStorage.setItem("temu_chats", JSON.stringify(parsed));
      window.dispatchEvent(new Event("temu_chat_update"));
    }
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
                  onClick={() => setActiveChatId(chat.chatId)}
                  className={`w-full text-left p-5 transition-all duration-300 flex items-center gap-4 relative group ${
                    isSelected 
                      ? "bg-white shadow-[0_0_20px_rgba(92,61,46,0.05)] z-10" 
                      : "bg-transparent hover:bg-white hover:shadow-[0_0_15px_rgba(0,0,0,0.03)]"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#A06C46] to-[#5C3D2E] rounded-r-full" />
                  )}
                  <div className={`relative w-12 h-12 rounded-full overflow-hidden border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? "border-[#5C3D2E] bg-[#5C3D2E]/5" : "border-white bg-zinc-100 shadow-sm group-hover:border-[#E8DCCB]"
                  }`}>
                    <User className={`w-5 h-5 ${isSelected ? "text-[#5C3D2E]" : "text-zinc-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className={`font-bold text-[15px] truncate transition-colors ${
                        isSelected ? "text-[#5C3D2E]" : "text-zinc-900 group-hover:text-[#5C3D2E]"
                      }`}>
                        {chat.customer.name}
                      </p>
                      {lastMsg && (
                        <span className={`text-[10px] font-bold tracking-wide whitespace-nowrap ml-2 ${
                          isSelected ? "text-[#A06C46]" : "text-zinc-400"
                        }`}>{lastMsg.timestamp}</span>
                      )}
                    </div>
                    {lastMsg && (
                      <p className={`text-[13px] truncate ${
                        isSelected ? "text-zinc-700" : "text-zinc-500"
                      }`}>
                        {lastMsg.sender === "rider" ? (
                          <span className="font-semibold opacity-70">Anda: </span>
                        ) : null}
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
          <div className="flex-1 flex flex-col items-center justify-center bg-[url('/pattern-light.svg')] bg-repeat opacity-90">
            <div className="w-24 h-24 bg-white shadow-xl rounded-full flex items-center justify-center mb-6">
              <MessageCircle className="w-12 h-12 text-[#E8DCCB]" />
            </div>
            <p className="font-extrabold text-xl text-zinc-700 mb-2">Pilih Percakapan</p>
            <p className="text-sm text-zinc-500 font-medium">Klik salah satu pelanggan di samping untuk mulai membalas.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="bg-white/80 backdrop-blur-xl px-5 py-4 flex items-center gap-4 border-b border-[#E8DCCB]/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] shrink-0 z-10">
              <button 
                onClick={() => setActiveChatId(null)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-[#FAF8F5] text-zinc-700 mr-1 flex-shrink-0 hover:bg-[#E8DCCB]/50 transition-colors"
              >
                ←
              </button>
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#5C3D2E] bg-white flex items-center justify-center flex-shrink-0 shadow-md">
                <User className="w-6 h-6 text-[#5C3D2E]" />
              </div>
              <div>
                <h3 className="font-extrabold text-zinc-900 text-[15px] leading-tight mb-0.5">{activeChat.customer.name}</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-xs text-green-600 font-bold tracking-wide">Pelanggan Aktif</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 bg-[#FAF8F5] relative">
              <div className="absolute inset-0 bg-[url('/pattern-light.svg')] bg-repeat opacity-[0.03] pointer-events-none" />
              
              {activeChat.messages.map((msg, idx) => {
                const isMe = msg.sender === "rider";
                return (
                  <div key={idx} className={`flex flex-col relative z-10 ${isMe ? "items-end" : "items-start"}`}>
                    <div className={`max-w-[75%] px-5 py-3.5 rounded-[1.25rem] shadow-sm ${
                      isMe 
                        ? "bg-gradient-to-br from-[#A06C46] to-[#5C3D2E] text-white rounded-br-sm shadow-[#5C3D2E]/20" 
                        : "bg-white border border-[#E8DCCB]/60 text-zinc-800 rounded-bl-sm"
                    }`}>
                      <p className="text-[15px] leading-relaxed">{msg.text}</p>
                    </div>
                    <span className="text-[11px] font-bold text-zinc-400 mt-1.5 px-1">{msg.timestamp}</span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="bg-white p-4 md:p-6 border-t border-[#E8DCCB]/60 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10">
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
                  className="w-14 h-14 rounded-full bg-gradient-to-b from-[#A06C46] to-[#5C3D2E] flex items-center justify-center text-white disabled:opacity-50 disabled:from-zinc-300 disabled:to-zinc-400 disabled:shadow-none transition-all shadow-lg shadow-[#5C3D2E]/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex-shrink-0 group"
                >
                  <Send className="w-[22px] h-[22px] mr-0.5 transition-transform group-hover:translate-x-1" />
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
