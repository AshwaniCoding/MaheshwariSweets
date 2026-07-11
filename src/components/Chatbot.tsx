import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, HelpCircle, ArrowRight } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "bot",
      text: "Pranam! Namaste. Welcome to Maheshwari Sweets Satna. 🌸\n\nI am **Mithai**, your Royal AI Concierge. I can help you select the most premium traditional sweets, calculate shelf life, arrange wedding catering menus, or answer delivery details across Satna. How may I sweeten your day?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested Quick Prompts based on popular user queries in Satna
  const quickPrompts = [
    "Do you deliver in Pateri or Civil Lines?",
    "Suggest sweets for a wedding gifting box",
    "What is Satna's favourite breakfast?",
    "Show me healthy / sugar-free sweet options",
    "What is the shelf life of milk sweets?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: "u_" + Math.random().toString(36).substr(2, 9),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      // API call to Express backend proxying the Google Gemini API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("API call failed");
      }

      const data = await response.json();
      
      const botMsg: Message = {
        id: "b_" + Math.random().toString(36).substr(2, 9),
        sender: "bot",
        text: data.answer || "Pranam! I couldn't formulate a response right now. Please feel free to call our Station Road store at +91 7672 223456!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("AI chatbot error:", error);
      
      // Graceful local fallback if backend is slow/offline
      const botMsg: Message = {
        id: "b_err",
        sender: "bot",
        text: "Namaste! It seems my connection to the kitchen was interrupted, but as your Maheshwari Sweets helper, I can tell you that we serve the absolute best Kaju Katli, saffron Rasmalai, and fresh Poha Jalebi breakfast in Satna since 2001! We deliver all across Satna. How can I help you customize your order?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Collapsed Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group bg-maroon-900 text-gold-200 p-4 rounded-full shadow-2xl hover:shadow-maroon-900/30 border-2 border-gold-500 flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 animate-bounce"
          aria-label="Open AI Assistant"
        >
          <div className="absolute inset-0 rounded-full bg-gold-400 opacity-0 group-hover:animate-ping group-hover:opacity-10"></div>
          <MessageSquare size={24} className="text-gold-500 shrink-0" />
          <span className="absolute -top-1 -left-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-gold-500"></span>
          </span>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-bold text-xs uppercase tracking-wider text-gold-100 font-sans pl-0 group-hover:pl-2">
            Ask Mithai AI
          </span>
        </button>
      )}

      {/* Expanded Interactive Chat Drawer */}
      {isOpen && (
        <div className="bg-white rounded-2xl w-[350px] sm:w-[400px] h-[550px] shadow-2xl border border-gold-200/60 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-maroon-900 to-maroon-850 text-gold-100 p-4 border-b border-gold-500/30 flex justify-between items-center relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-600 via-gold-200 to-gold-600"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-maroon-950 flex items-center justify-center border border-gold-500">
                <Sparkles size={18} className="text-gold-400 animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif font-black text-sm text-gold-400 flex items-center gap-1.5">
                  Mithai AI Assistant
                  <span className="text-[9px] bg-gold-500 text-maroon-950 px-1 rounded-full font-sans font-bold uppercase tracking-wider">
                    Online
                  </span>
                </h3>
                <p className="text-[10px] text-stone-300">
                  Royal Sweets Concierge of Satna
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-maroon-800 text-gold-200/70 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#FCFAF7] space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <span className="text-[10px] text-stone-400 mb-1 font-mono">{m.timestamp}</span>
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed border ${
                    m.sender === "user"
                      ? "bg-maroon-900 text-white border-maroon-850 rounded-tr-none"
                      : "bg-white text-stone-800 border-stone-200 rounded-tl-none shadow-sm"
                  }`}
                >
                  {/* Handle Markdown Formatting manually for simplicity and speed */}
                  <div className="space-y-1">
                    {m.text.split("\n\n").map((para, pIdx) => {
                      if (para.startsWith("-") || para.startsWith("*")) {
                        return (
                          <ul key={pIdx} className="list-disc pl-4 space-y-1">
                            {para.split("\n").map((li, lIdx) => (
                              <li key={lIdx}>
                                {li.replace(/^[\s*-]+/, "").replace(/\*\*(.*?)\*\*/g, "$1")}
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      
                      // Bold formatting handler
                      const formattedText = para.split(/\*\*(.*?)\*\*/g).map((part, index) => {
                        return index % 2 === 1 ? <strong key={index} className="font-extrabold text-maroon-900">{part}</strong> : part;
                      });

                      return <p key={pIdx}>{formattedText}</p>;
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-stone-400 mb-1 font-mono">Typing...</span>
                <div className="bg-white border border-stone-150 rounded-2xl rounded-tl-none p-3 px-4 shadow-sm">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-maroon-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-maroon-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-maroon-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggester Section */}
          <div className="px-4 py-2 border-t border-stone-150 bg-stone-50 overflow-x-auto flex gap-2 no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="shrink-0 bg-white hover:bg-maroon-50 hover:text-maroon-900 border border-stone-200 hover:border-maroon-200 text-[10px] font-semibold text-stone-600 px-3 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <HelpCircle size={10} className="text-gold-500" />
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Form Input */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 border-t border-stone-200 bg-white flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about sweets, delivery, catering..."
              className="flex-1 bg-stone-50 border border-stone-200 focus:border-maroon-500 focus:outline-none rounded-xl px-4 py-2 text-xs text-stone-800"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="bg-maroon-900 hover:bg-maroon-800 text-gold-200 disabled:opacity-40 p-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
            >
              <Send size={15} />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
