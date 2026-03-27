"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, RotateCcw } from "lucide-react";

/* ── Inject global keyframes once ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Bricolage+Grotesque:wght@700;800&display=swap');

  @keyframes fcFabAppear {
    from { opacity: 0; transform: scale(0.7) translateY(12px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes fcFabPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(20,184,166,0.45), 0 6px 24px rgba(20,184,166,0.3); }
    60%       { box-shadow: 0 0 0 10px rgba(20,184,166,0), 0 6px 24px rgba(20,184,166,0.3); }
  }
  @keyframes fcLabelIn {
    from { opacity: 0; transform: translateX(8px); max-width: 0; }
    to   { opacity: 1; transform: translateX(0);   max-width: 160px; }
  }
  @keyframes fcCaret {
    0%, 100% { opacity: 1; } 50% { opacity: 0; }
  }
  @keyframes fcChatIn {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
  }
  @keyframes fcMsgIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fcBarRise {
    0%, 100% { height: 4px; opacity: 0.4; }
    50%      { height: 14px; opacity: 1; }
  }
  @keyframes fcEyeBlink {
    0%, 90%, 100% { transform: scaleY(1); }
    95%           { transform: scaleY(0.1); }
  }
  @keyframes fcIconSpin {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .fc-scroll::-webkit-scrollbar { width: 3px; }
  .fc-scroll::-webkit-scrollbar-thumb { background: #ccfbf1; border-radius: 99px; }
  .fc-scroll::-webkit-scrollbar-track { background: transparent; }

  .fc-input { background: transparent; border: none; outline: none; width: 100%; }
  .fc-input::placeholder { color: #94a3b8; }

  .fc-chip:hover {
    background: #f0fdfa !important;
    border-color: #5eead4 !important;
    color: #0f766e !important;
  }
  .fc-refresh:hover { border-color: rgba(255,255,255,0.7) !important; background: rgba(255,255,255,0.28) !important; }
  .fc-close-btn:hover { background: rgba(239,68,68,0.18) !important; border-color: rgba(239,68,68,0.5) !important; color: #fee2e2 !important; }
  .fc-send:hover { transform: scale(1.06); }
`;

function injectCSS() {
  if (typeof document === "undefined") return;
  if (document.getElementById("fc-styles")) return;
  const s = document.createElement("style");
  s.id = "fc-styles";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/* ── Custom Bot SVG Icon ── */
function BotIcon({ size = 24, spinning = false }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 44 44"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      style={spinning ? { animation: "fcIconSpin 1.6s linear infinite" } : {}}
    >
      <rect x="21" y="3" width="2.2" height="8" rx="1.1" fill="#14b8a6" />
      <circle cx="22.1" cy="2.5" r="2.5" fill="#0d9488" />
      <rect x="7" y="13" width="30" height="22" rx="8" fill="url(#botBodyL)" />
      <rect x="7" y="13" width="30" height="9" rx="8" fill="url(#botHL)" opacity="0.5" />
      <ellipse cx="16" cy="22.5" rx="2.5" ry="2.5" fill="white"
        style={{ animation: "fcEyeBlink 3.5s ease-in-out infinite" }} />
      <ellipse cx="28" cy="22.5" rx="2.5" ry="2.5" fill="white"
        style={{ animation: "fcEyeBlink 3.5s ease-in-out 0.4s infinite" }} />
      <circle cx="16.8" cy="21.8" r="1" fill="#0d9488" />
      <circle cx="28.8" cy="21.8" r="1" fill="#0d9488" />
      <rect x="15" y="29" width="14" height="2.5" rx="1.25" fill="white" opacity="0.35" />
      <rect x="3.5" y="20" width="3.5" height="8" rx="1.75" fill="#0d9488" opacity="0.7" />
      <rect x="37" y="20" width="3.5" height="8" rx="1.75" fill="#0d9488" opacity="0.7" />
      <defs>
        <linearGradient id="botBodyL" x1="7" y1="13" x2="37" y2="35" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <linearGradient id="botHL" x1="7" y1="13" x2="7" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Typewriter label ── */
const LABEL_TEXT = "Ask Finova";
function FabLabel() {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(LABEL_TEXT.slice(0, i));
      if (i >= LABEL_TEXT.length) { clearInterval(id); setDone(true); }
    }, 60);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      display: "flex", alignItems: "center",
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "10px",
      padding: "7px 13px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
      animation: "fcLabelIn 0.3s cubic-bezier(0.22,1,0.36,1) both",
      whiteSpace: "nowrap", overflow: "hidden",
      marginRight: "10px",
    }}>
      <span style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 500, fontSize: "13px",
        color: "#0f766e", letterSpacing: "0.01em",
      }}>
        {displayed}
      </span>
      {!done && (
        <span style={{
          display: "inline-block", width: "1.5px", height: "13px",
          background: "#14b8a6", marginLeft: "2px", borderRadius: "1px",
          animation: "fcCaret 0.7s step-end infinite",
        }} />
      )}
    </div>
  );
}

/* ── Typing indicator ── */
function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", padding: "4px 0" }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg,#e6fffa,#f0fdfa)",
        border: "1.5px solid #99f6e4",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <BotIcon size={18} />
      </div>
      <div style={{
        background: "#f8fafc", border: "1px solid #e2e8f0",
        borderRadius: "14px 14px 14px 3px",
        padding: "10px 14px",
        display: "flex", alignItems: "center", gap: "4px",
      }}>
        {[0, 0.15, 0.30].map((d, i) => (
          <div key={i} style={{
            width: 3, background: "#14b8a6", borderRadius: 99,
            animation: `fcBarRise 0.85s ease-in-out ${d}s infinite`,
            height: 4,
          }} />
        ))}
      </div>
    </div>
  );
}

/* ── Message bubble ── */
function Message({ msg, index }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      alignItems: "flex-end", gap: "8px",
      animation: `fcMsgIn 0.25s cubic-bezier(0.22,1,0.36,1) ${index * 0.03}s both`,
    }}>
      {!isUser && (
        <div style={{
          width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg,#e6fffa,#f0fdfa)",
          border: "1.5px solid #99f6e4",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <BotIcon size={18} />
        </div>
      )}
      <div style={{
        maxWidth: "74%",
        padding: "10px 14px",
        borderRadius: isUser ? "16px 16px 3px 16px" : "16px 16px 16px 3px",
        fontSize: "13.5px", lineHeight: "1.65",
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400,
        ...(isUser ? {
          background: "linear-gradient(135deg, #14b8a6, #0d9488)",
          color: "#fff",
          boxShadow: "0 3px 12px rgba(13,148,136,0.28)",
        } : {
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          color: "#1e293b",
        }),
      }}>
        {msg.content}
      </div>
    </div>
  );
}

/* ── Main ── */
export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const chatWindowRef = useRef(null);  // ← NEW: ref for the chat window
  const INITIAL_MESSAGE = { role: "assistant", content: "Hi 👋 I'm Finova AI. Ask me anything about your finances." };

  const [messages, setMessages] = useState(() => {
    if (typeof window === "undefined") return [INITIAL_MESSAGE];
    try {
      const saved = localStorage.getItem("finova_chat_history");
      return saved ? JSON.parse(saved) : [INITIAL_MESSAGE];
    } catch {
      return [INITIAL_MESSAGE];
    }
  });
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const suggestions = [
    "How am I doing this month?",
    "What about last month?",
    "Which project costs more?",
    "Where can I cut spending?",
  ];

  useEffect(() => { injectCSS(); }, []);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("finova_chat_history", JSON.stringify(messages.slice(-30)));
    } catch {}
  }, [messages]);

  useEffect(() => {
    const show = setTimeout(() => setShowLabel(true), 1200);
    const hide = setTimeout(() => setShowLabel(false), 7500);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 320);
  }, [open]);

  // ── NEW: Close on outside click ──
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (chatWindowRef.current && !chatWindowRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  /* ── sendMessage with conversation history ── */
  const sendMessage = async (custom) => {
    const msg = (custom || input).trim();
    if (!msg) return;

    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Exclude the opening greeting, cap at last 10 turns to control token usage
    const history = newMessages
      .slice(1)
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await res.json();
      setMessages(p => [...p, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(p => [...p, { role: "assistant", content: "Something went wrong. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    const fresh = [INITIAL_MESSAGE];
    setMessages(fresh);
    try { localStorage.removeItem("finova_chat_history"); } catch {}
  };

  return (
    <>
      {/* ── FAB ── */}
      {!open && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 9998,
          display: "flex", alignItems: "center",
          animation: "fcFabAppear 0.5s cubic-bezier(0.22,1,0.36,1) both",
        }}>
          {showLabel && <FabLabel />}
          <button
            onClick={() => { setOpen(true); setShowLabel(false); }}
            title="Chat with Finova AI"
            style={{
              width: 58, height: 58, borderRadius: "18px", border: "none",
              background: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
              cursor: "pointer",
              animation: "fcFabPulse 2.6s ease-in-out infinite",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "transform 0.2s, border-radius 0.2s",
              boxShadow: "0 6px 24px rgba(13,148,136,0.35)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "scale(1.08) rotate(-6deg)";
              e.currentTarget.style.borderRadius = "50%";
              setShowLabel(true);
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1) rotate(0deg)";
              e.currentTarget.style.borderRadius = "18px";
            }}
          >
            <BotIcon size={32} />
          </button>
        </div>
      )}

      {/* ── Chat Window ── */}
      {open && (
        <div
          ref={chatWindowRef}  // ← NEW: attach ref to chat window
          style={{
            position: "fixed", bottom: 28, right: 28, zIndex: 9999,
            width: "min(92vw, 375px)", height: 548,
            display: "flex", flexDirection: "column",
            background: "#ffffff",
            borderRadius: "22px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px rgba(0,0,0,0.03), 0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(20,184,166,0.08)",
            overflow: "hidden",
            animation: "fcChatIn 0.32s cubic-bezier(0.22,1,0.36,1) forwards",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>

          {/* Header */}
          <div style={{
            padding: "14px 16px",
            background: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0, position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: -20, right: 60, width: 80, height: 80,
              borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", bottom: -30, right: 20, width: 100, height: 100,
              borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none",
            }} />

            <div style={{ display: "flex", alignItems: "center", gap: "11px", position: "relative" }}>
              <div style={{
                width: 44, height: 44, borderRadius: "14px",
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.3)",
              }}>
                <BotIcon size={28} spinning={loading} />
              </div>
              <div>
                <p style={{
                  margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700, fontSize: "15px",
                  color: "#ffffff", letterSpacing: "-0.01em",
                }}>Finova AI</p>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#a7f3d0", boxShadow: "0 0 5px rgba(167,243,208,0.8)",
                  }} />
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", fontWeight: 300, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {loading ? "Thinking…" : "Online · Ready to help"}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px", position: "relative" }}>
              <button onClick={clearChat} title="Clear" className="fc-refresh" style={{
                width: 30, height: 30, borderRadius: "9px",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.9)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.15s",
              }}><RotateCcw size={13} /></button>
              <button onClick={() => setOpen(false)} className="fc-close-btn" style={{
                width: 30, height: 30, borderRadius: "9px",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.9)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.15s",
              }}><X size={14} /></button>
            </div>
          </div>

          {/* Accent line */}
          <div style={{
            height: "2px", flexShrink: 0,
            background: "linear-gradient(90deg, #5eead4, #14b8a6, #0d9488)",
          }} />

          {/* Messages */}
          <div className="fc-scroll" style={{
            flex: 1, overflowY: "auto",
            padding: "16px 14px",
            display: "flex", flexDirection: "column", gap: "12px",
            background: "#fafcff",
          }}>
            {messages.map((msg, i) => <Message key={i} msg={msg} index={i} />)}
            {loading && <TypingDots />}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {!loading && messages.length <= 2 && (
            <div style={{
              padding: "10px 14px 6px",
              display: "flex", flexWrap: "wrap", gap: "6px",
              background: "#fafcff",
              borderTop: "1px solid #f1f5f9",
            }}>
              <p style={{
                width: "100%", margin: "0 0 6px",
                fontSize: "10.5px", color: "#94a3b8",
                fontWeight: 500, letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>Suggestions</p>
              {suggestions.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} className="fc-chip" style={{
                  fontSize: "11.5px", padding: "5px 11px",
                  borderRadius: "99px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc", color: "#475569",
                  cursor: "pointer", transition: "all 0.15s",
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400,
                }}>{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{
            padding: "10px 12px 14px",
            background: "#ffffff",
            borderTop: "1px solid #f1f5f9",
            display: "flex", gap: "8px", alignItems: "center",
            flexShrink: 0,
          }}>
            <div
              style={{
                flex: 1, display: "flex", alignItems: "center",
                background: "#f8fafc", border: "1.5px solid #e2e8f0",
                borderRadius: "14px", padding: "0 14px",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocusCapture={e => {
                e.currentTarget.style.borderColor = "#5eead4";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(94,234,212,0.18)";
                e.currentTarget.style.background = "#ffffff";
              }}
              onBlurCapture={e => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.background = "#f8fafc";
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Ask anything…"
                className="fc-input"
                style={{
                  color: "#1e293b", fontSize: "13.5px",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 400, padding: "11px 0",
                }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className={input.trim() && !loading ? "fc-send" : ""}
              style={{
                width: 42, height: 42, borderRadius: "13px", border: "none",
                background: input.trim() && !loading
                  ? "linear-gradient(135deg, #14b8a6, #0d9488)"
                  : "#f1f5f9",
                color: input.trim() && !loading ? "#fff" : "#cbd5e1",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: input.trim() && !loading ? "pointer" : "default",
                transition: "all 0.2s",
                boxShadow: input.trim() && !loading ? "0 4px 12px rgba(13,148,136,0.35)" : "none",
                flexShrink: 0,
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}