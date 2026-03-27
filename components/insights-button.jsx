"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "./ui/button";
import { Sparkles, X, TrendingUp, AlertTriangle, CheckCircle, Info } from "lucide-react";

function getInsightMeta(text = "") {
  const lower = text.toLowerCase();
  if (lower.includes("over") || lower.includes("exceed") || lower.includes("warn") || lower.includes("risk"))
    return { Icon: AlertTriangle, color: "#ef4444", bg: "#fef2f2", border: "#fecaca" };
  if (lower.includes("save") || lower.includes("reduc") || lower.includes("optim") || lower.includes("good") || lower.includes("well"))
    return { Icon: CheckCircle, color: "#10b981", bg: "#f0fdf4", border: "#a7f3d0" };
  if (lower.includes("trend") || lower.includes("increas") || lower.includes("grow") || lower.includes("high"))
    return { Icon: TrendingUp, color: "#0d9488", bg: "#f0fdfa", border: "#99f6e4" };
  return { Icon: Info, color: "#0d9488", bg: "#f0fdfa", border: "#99f6e4" };
}

// Keyframes injected once into <head>
const STYLES = `
  @keyframes finovaOverlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes finovaOverlayOut {
    from { opacity: 1; }
    to   { opacity: 0; }
  }
  @keyframes finovaModalIn {
    0%   { opacity: 0; transform: translate(-50%, -48%) scale(0.95); }
    60%  { transform: translate(-50%, -50%) scale(1.015); }
    100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }
  @keyframes finovaModalOut {
    from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    to   { opacity: 0; transform: translate(-50%, -46%) scale(0.96); }
  }
  @keyframes slideUpCard {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmerFinova {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes sparkleRotate {
    0%   { transform: rotate(0deg) scale(1); }
    50%  { transform: rotate(180deg) scale(1.15); }
    100% { transform: rotate(360deg) scale(1); }
  }
`;

function injectStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("finova-modal-styles")) return;
  const tag = document.createElement("style");
  tag.id = "finova-modal-styles";
  tag.textContent = STYLES;
  document.head.appendChild(tag);
}

export default function InsightsButton() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    injectStyles();
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleOpen = async () => {
    setOpen(true);
    setClosing(false);
    setLoading(true);
    setInsights([]);
    try {
      const res = await fetch("/api/insights");
      const data = await res.json();
      setInsights(data.insights || []);
    } catch {
      setInsights(["Failed to generate insights. Please try again."]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 200);
  };

  const modal = open ? (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99998,
          backgroundColor: "rgba(15, 23, 42, 0.5)",
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          animation: closing
            ? "finovaOverlayOut 0.2s ease forwards"
            : "finovaOverlayIn 0.2s ease forwards",
        }}
      />

      {/* ── Modal ── */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 99999,
          width: "min(92vw, 490px)",
          maxHeight: "82vh",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.06), 0 24px 60px rgba(0,0,0,0.2)",
          overflow: "hidden",
          animation: closing
            ? "finovaModalOut 0.2s ease forwards"
            : "finovaModalIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "18px 20px 16px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(120deg, #f0fdfa 0%, #f8fffd 50%, #ffffff 100%)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "11px",
                background: "linear-gradient(135deg, #0d9488 0%, #2dd4bf 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 10px rgba(13,148,136,0.4)",
                animation: loading ? "sparkleRotate 1.8s linear infinite" : "none",
              }}
            >
              <Sparkles size={17} color="#ffffff" />
            </div>
            <div>
              <p
                style={{
                  margin: 0,
                  fontWeight: 700,
                  fontSize: "15px",
                  color: "#0f172a",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                AI Insights
              </p>
              <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                Powered by Finova Intelligence
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#94a3b8",
              transition: "background 0.15s, border-color 0.15s, color 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fee2e2";
              e.currentTarget.style.borderColor = "#fca5a5";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f8fafc";
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Body ── */}
        <div
          style={{
            padding: "18px 20px 20px",
            overflowY: "auto",
            flex: 1,
            scrollbarWidth: "thin",
            scrollbarColor: "#e2e8f0 transparent",
          }}
        >
          {loading ? (
            <LoadingSkeleton />
          ) : insights.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              {insights.map((insight, i) => (
                <InsightCard key={i} text={insight} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {!loading && insights.length > 0 && (
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              background: "#fafafa",
              flexShrink: 0,
            }}
          >
            <button
              onClick={handleOpen}
              style={{
                padding: "7px 16px",
                borderRadius: "9px",
                border: "1px solid #e2e8f0",
                background: "#ffffff",
                fontSize: "13px",
                fontWeight: 500,
                color: "#475569",
                cursor: "pointer",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#0d9488";
                e.currentTarget.style.color = "#0d9488";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.color = "#475569";
              }}
            >
              Refresh
            </button>
            <button
              onClick={handleClose}
              style={{
                padding: "7px 18px",
                borderRadius: "9px",
                border: "none",
                background: "linear-gradient(135deg, #0d9488, #14b8a6)",
                fontSize: "13px",
                fontWeight: 600,
                color: "#ffffff",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(13,148,136,0.35)",
                transition: "opacity 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.85";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(13,148,136,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(13,148,136,0.35)";
              }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </>
  ) : null;

  return (
    <>
      <Button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-2 bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 hover:border-teal-400 hover:text-teal-800 transition-colors shadow-sm"
      >
        <Sparkles size={18} className="text-teal-500" />
        <span className="hidden md:inline">AI Insights</span>
      </Button>

      {/* ✅ Portal: renders directly in <body>, bypasses ALL parent stacking contexts */}
      {typeof document !== "undefined" && createPortal(modal, document.body)}
    </>
  );
}

/* ── Insight Card ── */
function InsightCard({ text, index }) {
  const { Icon, color, bg, border } = getInsightMeta(text);
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: "12px",
        background: bg,
        border: `1px solid ${border}`,
        display: "flex",
        gap: "10px",
        alignItems: "flex-start",
        animation: `slideUpCard 0.32s cubic-bezier(0.22,1,0.36,1) ${index * 0.07}s both`,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "8px",
          background: color + "1a",
          border: `1px solid ${color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: "1px",
        }}
      >
        <Icon size={14} color={color} />
      </div>
      <p style={{ margin: 0, fontSize: "13.5px", color: "#1e293b", lineHeight: "1.6", fontWeight: 400 }}>
        {text}
      </p>
    </div>
  );
}

/* ── Loading Skeleton ── */
function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
      <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>
        Analyzing your transactions…
      </p>
      {[1, 2, 3].map((_, i) => (
        <div
          key={i}
          style={{
            height: i === 1 ? 68 : 52,
            borderRadius: "12px",
            background: "linear-gradient(90deg, #f1f5f9 25%, #e6f7f5 50%, #f1f5f9 75%)",
            backgroundSize: "300% 100%",
            animation: `shimmerFinova 1.6s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Empty State ── */
function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "32px 0 24px" }}>
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "16px",
          background: "linear-gradient(135deg, #f0fdfa, #ccfbf1)",
          border: "1px solid #99f6e4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 14px",
        }}
      >
        <Sparkles size={24} color="#0d9488" />
      </div>
      <p style={{ margin: 0, fontWeight: 600, color: "#0f172a", fontSize: "14px" }}>No insights yet</p>
      <p style={{ margin: "5px 0 0", color: "#94a3b8", fontSize: "13px", lineHeight: 1.5 }}>
        Add more transactions to unlock
        <br />AI-powered spending insights.
      </p>
    </div>
  );
}