"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, User, MessageCircle } from "lucide-react";
import Image from "next/image";
import { Rider } from "@/lib/riders-data";

type Message = {
  sender: "customer" | "rider";
  text: string;
  timestamp: string;
};

type Props = {
  rider: Rider;
  customerAuth: any;
  onClose: () => void;
};

export default function ChatOverlay({ rider, customerAuth, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatId = `chat_${customerAuth.id}_${rider.id}`;

  const loadMessages = () => {
    const data = localStorage.getItem("temu_chats");
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed[chatId]) {
        setMessages(parsed[chatId].messages || []);
      }
    }
  };

  useEffect(() => {
    loadMessages();

    const handleStorage = () => {
      loadMessages();
    };

    window.addEventListener("storage", handleStorage);
    // Custom event to listen within the same window
    window.addEventListener("temu_chat_update", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("temu_chat_update", handleStorage);
    };
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      sender: "customer",
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputText("");

    // Save to localStorage
    const data = localStorage.getItem("temu_chats");
    const parsed = data ? JSON.parse(data) : {};
    parsed[chatId] = {
      customer: { id: customerAuth.id, name: customerAuth.name },
      riderId: rider.id,
      messages: updatedMessages
    };
    localStorage.setItem("temu_chats", JSON.stringify(parsed));
    
    // Dispatch custom event for same-window updates
    window.dispatchEvent(new Event("temu_chat_update"));
  };

  return (
    <div className="fixed inset-0 z-50 flex md:items-center md:justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full h-full md:h-auto md:max-h-[600px] md:max-w-md bg-[#FAF8F5] md:rounded-2xl flex flex-col shadow-2xl relative animate-in slide-in-from-bottom-full md:slide-in-from-bottom-8 md:zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-zinc-100 shadow-sm md:rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-200 bg-white">
              <Image src={rider.logo} alt={rider.brand} fill className="object-contain p-1" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm leading-tight">{rider.riderName}</h3>
              <p className="text-xs text-[#A06C46] font-semibold">{rider.brand}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-[#5C3D2E]/10 rounded-full flex items-center justify-center mb-3">
                <MessageCircle className="w-8 h-8 text-[#5C3D2E]" />
              </div>
              <p className="text-sm font-bold text-zinc-700">Mulai Obrolan</p>
              <p className="text-xs text-zinc-500 mt-1">Kirim pesan ke {rider.riderName} untuk tanya stok atau info lainnya.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.sender === "customer" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  msg.sender === "customer" 
                    ? "bg-[#5C3D2E] text-white rounded-br-none" 
                    : "bg-white border border-zinc-200 text-zinc-800 rounded-bl-none shadow-sm"
                }`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
                <span className="text-[10px] text-zinc-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white p-3 border-t border-zinc-100 md:rounded-b-2xl shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tulis pesan..."
              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-full px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/30 focus:border-[#5C3D2E]"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-full bg-[#A06C46] flex items-center justify-center text-white disabled:opacity-50 disabled:bg-zinc-300 transition-colors"
            >
              <Send className="w-4 h-4 mr-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
