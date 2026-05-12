// src/components/Chat.jsx
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useStore } from "../store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, User, Bot, AlertCircle } from "lucide-react";

export default function Chat() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { messages, addMessage, composition, setComposition, resetChat } = useStore();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    addMessage({ role: "user", content: input });
    const currentInput = input;
    setInput("");

    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const res = await axios.post(`${apiUrl}/chat`, {
        message: currentInput,
        composition: composition,
        history: messages
      });

      if (res.data.html) {
        setComposition(res.data.html);
        addMessage({
          role: "assistant",
          content: res.data.html,
        });
      }

    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      addMessage({
        role: "assistant",
        content: `❌ Error: ${errorMsg}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] border-r border-white/[0.08]">
      {/* Header with New Chat */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary" size={20} />
          <span className="font-bold text-sm font-outfit tracking-tight">Studio</span>
        </div>
        <button
          onClick={resetChat}
          className="p-2 px-3 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] hover:border-primary/40 transition-all text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 group"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:animate-pulse" />
          New Chat
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
      >
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-12 space-y-6"
            >
              <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-2">
                <Sparkles size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-outfit gradient-text">videnGenAI</h1>
                <p className="text-muted-foreground text-sm mt-2">Describe your vision, and I'll build the DSL.</p>
              </div>
              
              <div className="grid gap-2 max-w-xs mx-auto">
                {[
                  "Create a 5-sec intro with 'Welcome'",
                  "Add a red background with a title",
                  "Animate text with a smooth fade-in"
                ].map((s) => (
                  <button 
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-left p-3 text-xs rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] transition-colors text-muted-foreground hover:text-white"
                  >
                    "{s}"
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === 'user' ? 'bg-primary text-black' : 'bg-white/[0.05] text-white/50'
                }`}>
                  {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm ${
                  m.role === 'user' 
                    ? 'bg-primary text-black font-medium rounded-tr-none' 
                    : 'bg-white/[0.05] border border-white/[0.08] text-white/90 rounded-tl-none'
                }`}>
                  {m.role === 'assistant' && (m.content.includes('<div') || m.content.includes('<h1')) ? (
                    <div className="space-y-2">
                      <p className="font-semibold text-primary/80">✨ Composition Updated</p>
                      <pre className="bg-black/40 p-3 rounded-lg overflow-x-auto text-[10px] font-mono border border-white/10 max-h-48">
                        <code>{m.content}</code>
                      </pre>
                    </div>
                  ) : m.content.startsWith('❌') ? (
                    <div className="flex gap-2 text-red-400">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{m.content}</span>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </motion.div>
            ))
          )}
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center">
                <Bot size={16} className="text-white/50 animate-pulse" />
              </div>
              <div className="bg-white/[0.05] border border-white/[0.08] p-3 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1 h-1 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1 h-1 bg-white/50 rounded-full animate-bounce"></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-6 border-t border-white/[0.08] bg-[#080808]">
        <div className="relative flex items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
            placeholder="Type your message..."
            disabled={loading}
            className="w-full bg-white/[0.03] border border-white/[0.1] rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="absolute right-2 p-2 rounded-xl bg-primary text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}


