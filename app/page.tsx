"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { experiences } from "@/data/experience";
import dynamic from "next/dynamic";

const FloatingSpace = dynamic(() => import("@/components/ui/FloatingSpace"), { ssr: false });
const BugBounty = dynamic(() => import("@/components/ui/BugBounty"), { ssr: false });

// ─── OS Theme ────────────────────────────────────────────────────────────────
const OS = {
  bg: "#0a0a0f",
  desktop: "#0d0d14",
  taskbar: "rgba(8,8,12,0.95)",
  window: "#111118",
  windowBorder: "rgba(255,255,255,0.10)",
  titlebar: "#18181f",
  titlebarActive: "#1e1e2a",
  accent: "#6366f1",       // indigo
  accentGlow: "rgba(99,102,241,0.25)",
  accentDim: "rgba(99,102,241,0.5)",
  green: "#22c55e",
  greenDim: "rgba(34,197,94,0.6)",
  amber: "#f59e0b",
  red: "#ef4444",
  text: "#f1f5f9",
  textMuted: "#cbd5e1",
  textDim: "#64748b",
  folderYellow: "#fbbf24",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface WinState {
  id: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minimized: boolean;
  focused: boolean;
  zIndex: number;
}

// ─── Desktop Icons ────────────────────────────────────────────────────────────
const DESKTOP_ICONS = [
  { id: "about",      label: "about.exe",     icon: "👤", row: 0 },
  { id: "projects",   label: "projects/",     icon: "📁", row: 1 },
  { id: "skills",     label: "skills.db",     icon: "⚡", row: 2 },
  { id: "experience", label: "experience.log",icon: "📋", row: 3 },
  { id: "terminal",   label: "terminal",      icon: "⬛", row: 4 },
  { id: "contact",    label: "contact.sh",    icon: "📡", row: 5 },
];

// ─── Boot Screen ──────────────────────────────────────────────────────────────
function BootScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const lines = [
    "RobinOS v3.2.1 — Full Stack Edition",
    "Initializing kernel modules...",
    "Loading AI orchestration layer...",
    "Mounting project filesystem...",
    "Starting experience daemon...",
    "Connecting to talent networks...",
    "System ready. Welcome.",
  ];

  useEffect(() => {
    const t = setInterval(() => {
      setStep(s => {
        if (s >= lines.length - 1) {
          clearInterval(t);
          setTimeout(onDone, 800);
          return s;
        }
        return s + 1;
      });
      setProgress(p => Math.min(p + 100 / lines.length, 100));
    }, 320);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Courier New', monospace", color: OS.green,
      zIndex: 9999,
    }}>
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>⬛</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 6, color: "#fff" }}>ROBIN OS</div>
        <div style={{ fontSize: 11, color: OS.green, opacity: 0.85, letterSpacing: 3, marginTop: 4 }}>Full Stack · AI Orchestrator</div>
      </div>

      <div style={{ width: 380, marginBottom: 24 }}>
        {lines.slice(0, step + 1).map((l, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ fontSize: 12, marginBottom: 5, color: OS.green }}
          >
            <span style={{ color: i === step ? OS.amber : OS.green, marginRight: 8 }}>{i < step ? "✓" : "▶"}</span>
            {l}
          </motion.div>
        ))}
      </div>

      <div style={{ width: 380, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
        <motion.div
          style={{ height: "100%", background: OS.accent, borderRadius: 2 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: OS.green }}>{Math.round(progress)}%</div>
    </div>
  );
}

// ─── Draggable Window ─────────────────────────────────────────────────────────
interface WindowProps {
  win: WinState;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onDrag: (x: number, y: number) => void;
  children: React.ReactNode;
}

function OSWindow({ win, onFocus, onClose, onMinimize, onDrag, children }: WindowProps) {
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
    dragging.current = true;
    offset.current = { x: e.clientX - win.x, y: e.clientY - win.y };
    onFocus();
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      onDrag(e.clientX - offset.current.x, e.clientY - offset.current.y);
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [onDrag]);

  if (win.minimized) return null;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onMouseDown={onFocus}
      style={{
        position: "fixed",
        left: win.x, top: win.y,
        width: win.w, height: win.h,
        zIndex: win.zIndex,
        background: OS.window,
        border: `1px solid ${win.focused ? "rgba(99,102,241,0.4)" : OS.windowBorder}`,
        borderRadius: 10,
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: win.focused
          ? `0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.2), 0 0 30px rgba(99,102,241,0.08)`
          : `0 12px 40px rgba(0,0,0,0.5)`,
        userSelect: "none",
      }}
    >
      {/* Title bar */}
      <div
        onMouseDown={onMouseDown}
        style={{
          height: 40, minHeight: 40,
          background: win.focused ? OS.titlebarActive : OS.titlebar,
          display: "flex", alignItems: "center", padding: "0 12px",
          cursor: "grab", gap: 8,
          borderBottom: `1px solid ${OS.windowBorder}`,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 8, marginRight: 8 }} data-no-drag>
          <button
            onClick={e => { e.stopPropagation(); onClose(); }}
            onMouseDown={e => e.stopPropagation()}
            title="Close"
            style={{
              width: 20, height: 20, borderRadius: "50%",
              background: "#ef4444",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, color: "#7f0000", fontWeight: 900, lineHeight: 1,
              flexShrink: 0,
            }}>×</button>
          <button
            onClick={e => { e.stopPropagation(); onMinimize(); }}
            onMouseDown={e => e.stopPropagation()}
            title="Minimize"
            style={{
              width: 20, height: 20, borderRadius: "50%",
              background: "#f59e0b",
              border: "none", cursor: "pointer", flexShrink: 0,
            }} />
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#22c55e", opacity: 0.3, flexShrink: 0 }} />
        </div>
        <span style={{ fontSize: 12, color: OS.textMuted, fontFamily: "monospace", marginRight: "auto" }}>
          {win.icon} {win.title}
        </span>
      </div>

      {/* Content */}
      <div data-no-drag style={{ flex: 1, overflow: "auto", position: "relative" }}>
        {children}
      </div>
    </motion.div>
  );
}

// ─── Window Contents ──────────────────────────────────────────────────────────

function AboutContent() {
  return (
    <div style={{ padding: 28, fontFamily: "monospace", color: OS.text, height: "100%" }}>
      <div style={{ display: "flex", gap: 24, marginBottom: 28, alignItems: "flex-start" }}>
        <div style={{
          width: 72, height: 72, borderRadius: 14,
          background: `linear-gradient(135deg, ${OS.accent}, #818cf8)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, flexShrink: 0,
        }}>👤</div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Robin Devkota</div>
          <div style={{ fontSize: 13, color: OS.accent, marginBottom: 6 }}>Full Stack Engineer · AI Orchestrator</div>
          <div style={{ fontSize: 12, color: OS.textMuted }}>📍 Kathmandu, Nepal</div>
        </div>
      </div>

      <div style={{ fontSize: 13, lineHeight: 1.8, color: OS.textMuted, marginBottom: 24 }}>
        I build systems that <span style={{ color: OS.text }}>think, scale, and ship</span> — from real-time hotel management
        to AI agents that autonomously fix bugs in production codebases. 3+ years turning
        complex enterprise requirements into clean, working software.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        {[
          { label: "YEARS EXP", value: "3+" },
          { label: "PROJECTS SHIPPED", value: "38+" },
          { label: "LINES ELIMINATED", value: "16K+" },
        ].map(s => (
          <div key={s.label} style={{
            background: "rgba(255,255,255,0.03)", border: `1px solid ${OS.windowBorder}`,
            borderRadius: 8, padding: "14px 16px", textAlign: "center",
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: OS.accent }}>{s.value}</div>
            <div style={{ fontSize: 10, color: OS.textDim, letterSpacing: 1, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, color: OS.textDim }}>
        <span style={{ color: OS.accent }}>$</span> cat hobbies.txt<br />
        <span style={{ color: OS.textMuted }}>→ Building side projects at 2am, trading on NEPSE, obsessing over system design</span>
      </div>
    </div>
  );
}

function ProjectsContent({ onOpenProject }: { onOpenProject: (id: string) => void }) {
  return (
    <div style={{ padding: 20, fontFamily: "monospace" }}>
      <div style={{ fontSize: 11, color: OS.textDim, marginBottom: 16 }}>
        <span style={{ color: OS.accent }}>$</span> ls -la ~/projects/
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {projects.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => onOpenProject(p.id)}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${OS.windowBorder}`,
              borderRadius: 8, padding: "14px 16px", cursor: "pointer",
              transition: "all 0.15s",
            }}
            whileHover={{ background: "rgba(99,102,241,0.08)", borderColor: "rgba(99,102,241,0.3)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>
                {p.id === "royal-suites" ? "🏨" : p.id === "agentinbox" ? "🤖" : "🌐"}
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: OS.text }}>{p.name}</span>
              <span style={{ fontSize: 11, color: "#a5b4fc", background: "rgba(99,102,241,0.18)", padding: "3px 9px", borderRadius: 4, fontWeight: 500 }}>
                {p.tag}
              </span>
              <span style={{ marginLeft: "auto", fontSize: 12, color: OS.accent, fontWeight: 600 }}>→ open</span>
            </div>
            <div style={{ fontSize: 12, color: OS.textMuted, lineHeight: 1.6 }}>{p.description}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              {p.stack.slice(0, 4).map(t => (
                <span key={t} style={{ fontSize: 11, color: "#94a3b8", background: "rgba(255,255,255,0.07)", padding: "3px 8px", borderRadius: 4 }}>
                  {t}
                </span>
              ))}
              {p.stack.length > 4 && <span style={{ fontSize: 11, color: "#94a3b8" }}>+{p.stack.length - 4}</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ProjectDetailContent({ projectId }: { projectId: string }) {
  const p = projects.find(x => x.id === projectId);
  if (!p) return null;
  const emoji = p.id === "royal-suites" ? "🏨" : p.id === "agentinbox" ? "🤖" : "🌐";
  return (
    <div style={{ padding: 24, fontFamily: "monospace", color: OS.text }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <span style={{ fontSize: 36 }}>{emoji}</span>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{p.name}</div>
          <div style={{ fontSize: 12, color: OS.accent, marginTop: 2 }}>{p.tag}</div>
        </div>
        {p.url && (
          <a href={p.url} target="_blank" rel="noopener noreferrer"
            style={{ marginLeft: "auto", fontSize: 11, color: OS.accent, textDecoration: "none",
              border: `1px solid ${OS.accentDim}`, padding: "5px 12px", borderRadius: 6 }}>
            ↗ Live Site
          </a>
        )}
      </div>
      <div style={{ fontSize: 13, color: OS.textMuted, lineHeight: 1.8, marginBottom: 20 }}>
        {p.longDescription}
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: OS.textDim, marginBottom: 10, letterSpacing: 1 }}>HIGHLIGHTS</div>
        {p.highlights.map(h => (
          <div key={h} style={{ fontSize: 12, color: OS.textMuted, marginBottom: 6, display: "flex", gap: 8 }}>
            <span style={{ color: OS.green }}>✓</span> {h}
          </div>
        ))}
      </div>
      <div>
        <div style={{ fontSize: 11, color: OS.textDim, marginBottom: 10, letterSpacing: 1 }}>TECH STACK</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {p.stack.map(t => (
            <span key={t} style={{ fontSize: 11, color: OS.text, background: "rgba(99,102,241,0.1)",
              border: `1px solid rgba(99,102,241,0.2)`, padding: "4px 10px", borderRadius: 5 }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkillsContent() {
  return (
    <div style={{ padding: 20, fontFamily: "monospace" }}>
      <div style={{ fontSize: 11, color: OS.textDim, marginBottom: 16 }}>
        <span style={{ color: OS.accent }}>$</span> query skills.db --all
      </div>
      {skillGroups.map((g, gi) => (
        <div key={g.id} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: OS.accent, letterSpacing: 1, marginBottom: 8 }}>{g.label.toUpperCase()}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {g.items.map((item, ii) => (
              <motion.span
                key={item}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: gi * 0.05 + ii * 0.02 }}
                style={{
                  fontSize: 11, color: OS.text,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${OS.windowBorder}`,
                  padding: "4px 10px", borderRadius: 5,
                }}
              >
                {item}
              </motion.span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExperienceContent() {
  return (
    <div style={{ padding: 20, fontFamily: "monospace" }}>
      <div style={{ fontSize: 11, color: OS.textDim, marginBottom: 16 }}>
        <span style={{ color: OS.accent }}>$</span> tail -n 1000 experience.log
      </div>
      {experiences.map((exp, i) => (
        <motion.div key={exp.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          style={{
            marginBottom: 20, paddingBottom: 20,
            borderBottom: i < experiences.length - 1 ? `1px solid ${OS.windowBorder}` : "none",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: OS.text }}>{exp.role}</div>
              <div style={{ fontSize: 12, color: OS.accent, marginTop: 2 }}>{exp.company}</div>
            </div>
            <div style={{ fontSize: 11, color: OS.textDim, textAlign: "right" }}>
              <div>{exp.period}</div>
              <div>{exp.location}</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: OS.textMuted, lineHeight: 1.7, marginBottom: 10 }}>
            {exp.description}
          </div>
          {exp.achievements.map(a => (
            <div key={a} style={{ fontSize: 11, color: OS.textMuted, marginBottom: 4, display: "flex", gap: 8 }}>
              <span style={{ color: OS.green }}>→</span> {a}
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

function ContactContent() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  return (
    <div style={{ padding: 24, fontFamily: "monospace", color: OS.text }}>
      <div style={{ fontSize: 11, color: OS.textDim, marginBottom: 20 }}>
        <span style={{ color: OS.accent }}>$</span> ./contact.sh --mode=open
      </div>
      {!sent ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {(["name", "email", "message"] as const).map(field => (
            <div key={field}>
              <div style={{ fontSize: 11, color: OS.textDim, marginBottom: 5, letterSpacing: 1 }}>
                {field.toUpperCase()}
              </div>
              {field === "message" ? (
                <textarea
                  value={form[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  placeholder={`Enter ${field}...`}
                  rows={4}
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${OS.windowBorder}`, borderRadius: 6,
                    color: OS.text, fontFamily: "monospace", fontSize: 12,
                    padding: "10px 12px", outline: "none", resize: "none",
                    boxSizing: "border-box",
                  }}
                />
              ) : (
                <input
                  type={field === "email" ? "email" : "text"}
                  value={form[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  placeholder={`Enter ${field}...`}
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${OS.windowBorder}`, borderRadius: 6,
                    color: OS.text, fontFamily: "monospace", fontSize: 12,
                    padding: "10px 12px", outline: "none", boxSizing: "border-box",
                  }}
                />
              )}
            </div>
          ))}
          <button
            onClick={() => setSent(true)}
            style={{
              background: OS.accent, color: "#fff", border: "none",
              borderRadius: 6, padding: "10px 20px", cursor: "pointer",
              fontFamily: "monospace", fontSize: 12, fontWeight: 600,
              alignSelf: "flex-start", marginTop: 4,
            }}
          >
            ▶ send message
          </button>
          <div style={{ fontSize: 12, color: OS.textMuted, paddingTop: 8, borderTop: `1px solid ${OS.windowBorder}` }}>
            <div>📧 robindevkta0@gmail.com</div>
            <div style={{ marginTop: 6 }}>🔗 <a href="https://github.com/robindevkota" target="_blank" rel="noopener noreferrer" style={{ color: OS.accent }}>github.com/robindevkota</a></div>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📡</div>
          <div style={{ fontSize: 16, color: OS.green, fontWeight: 700, marginBottom: 8 }}>Signal transmitted!</div>
          <div style={{ fontSize: 12, color: OS.textMuted }}>I'll respond within 24 hours.</div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Terminal ─────────────────────────────────────────────────────────────────
const HELP_TEXT = `
Available commands:
  help          — show this help
  ls            — list files
  cat about     — read about Robin
  open projects — open projects window
  open skills   — open skills window
  open contact  — open contact form
  clear         — clear terminal
  hire robin    — ❤️
`.trim();

const FS_LS = `
drwxr-xr-x  about.exe
drwxr-xr-x  projects/
-rw-r--r--  skills.db
-rw-r--r--  experience.log
-rw-r--r--  contact.sh
`.trim();

const CAT_ABOUT = `
Robin Devkota — Full Stack Engineer · AI Orchestrator
─────────────────────────────────────────────────────
Location  : Kathmandu, Nepal
Email     : robindevkta0@gmail.com
Stack     : React · Next.js · Node.js · MongoDB · AI

"I build systems that think, scale, and ship."
`.trim();

function TerminalContent({ onCommand }: { onCommand: (cmd: string) => void }) {
  const [lines, setLines] = useState<{ type: "cmd" | "out" | "err" | "hire"; text: string }[]>([
    { type: "out", text: "RobinOS Terminal v1.0 — type 'help' for commands" },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    setLines(l => [...l, { type: "cmd", text: raw }]);

    if (!cmd) { setInput(""); return; }

    let out: { type: "cmd" | "out" | "err" | "hire"; text: string }[] = [];

    if (cmd === "help")             out = [{ type: "out", text: HELP_TEXT }];
    else if (cmd === "ls")          out = [{ type: "out", text: FS_LS }];
    else if (cmd === "cat about")   out = [{ type: "out", text: CAT_ABOUT }];
    else if (cmd === "clear")       { setLines([]); setInput(""); return; }
    else if (cmd === "open projects" || cmd === "open skills" || cmd === "open contact" || cmd === "open about" || cmd === "open experience") {
      const id = cmd.split(" ")[1];
      onCommand(id);
      out = [{ type: "out", text: `Opening ${id}...` }];
    }
    else if (cmd === "hire robin")  out = [{ type: "hire", text: "🎉 EXCELLENT DECISION. Sending offer letter..." }];
    else                            out = [{ type: "err", text: `command not found: ${cmd}. Try 'help'` }];

    setLines(l => [...l, ...out]);
    setInput("");
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        padding: "14px 16px", fontFamily: "'Courier New', monospace",
        fontSize: 12, color: OS.text, minHeight: "100%",
        background: "#09090f", cursor: "text",
      }}
    >
      {lines.map((l, i) => (
        <div key={i} style={{ marginBottom: 4, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
          {l.type === "cmd" && <><span style={{ color: OS.accent }}>robin@portfolio:~$</span> <span>{l.text}</span></>}
          {l.type === "out" && <span style={{ color: OS.textMuted }}>{l.text}</span>}
          {l.type === "err" && <span style={{ color: OS.red }}>{l.text}</span>}
          {l.type === "hire" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: "rgba(99,102,241,0.15)", border: `1px solid ${OS.accent}`,
                borderRadius: 6, padding: "10px 14px", color: OS.accent, fontWeight: 700,
                fontSize: 14,
              }}
            >
              {l.text}
              <div style={{ fontSize: 11, color: OS.textMuted, marginTop: 6, fontWeight: 400 }}>
                Contact: robindevkta0@gmail.com — Let's build something great.
              </div>
            </motion.div>
          )}
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
        <span style={{ color: OS.accent }}>robin@portfolio:~$</span>
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") run(input); }}
          style={{
            flex: 1, background: "transparent", border: "none",
            color: OS.text, fontFamily: "'Courier New', monospace",
            fontSize: 12, outline: "none",
          }}
        />
      </div>
      <div ref={bottomRef} />
    </div>
  );
}

// ─── Taskbar ──────────────────────────────────────────────────────────────────
function Taskbar({
  windows, time, onToggle, onFocus,
}: {
  windows: WinState[];
  time: string;
  onToggle: (id: string) => void;
  onFocus: (id: string) => void;
}) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, height: 48,
      background: OS.taskbar,
      backdropFilter: "blur(20px)",
      borderTop: `1px solid ${OS.windowBorder}`,
      display: "flex", alignItems: "center",
      padding: "0 16px", gap: 4, zIndex: 8000,
    }}>
      {/* OS Logo */}
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: `linear-gradient(135deg, ${OS.accent}, #818cf8)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, marginRight: 8, flexShrink: 0,
      }}>⬛</div>

      <div style={{ width: 1, height: 24, background: OS.windowBorder, marginRight: 8 }} />

      {/* Window buttons */}
      <div style={{ display: "flex", gap: 4, flex: 1 }}>
        {windows.map(w => (
          <button
            key={w.id}
            onClick={() => {
              if (w.minimized) onToggle(w.id);
              else if (w.focused) onToggle(w.id);
              else onFocus(w.id);
            }}
            style={{
              height: 32, padding: "0 12px",
              background: w.focused && !w.minimized ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${w.focused && !w.minimized ? "rgba(99,102,241,0.4)" : OS.windowBorder}`,
              borderRadius: 6, cursor: "pointer", color: w.focused && !w.minimized ? OS.text : OS.textDim,
              fontFamily: "monospace", fontSize: 11, display: "flex", alignItems: "center", gap: 6,
              transition: "all 0.15s",
            }}
          >
            <span>{w.icon}</span>
            <span style={{ maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {w.title}
            </span>
          </button>
        ))}
      </div>

      {/* Clock */}
      <div style={{ fontSize: 12, color: OS.textMuted, fontFamily: "monospace", flexShrink: 0 }}>
        {time}
      </div>
    </div>
  );
}

// ─── Wallpaper (Interactive Shockwave Kinetic Grid) ───────────────────────────
interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  strength: number;
  decay: number;
}

function Wallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    // Mouse coordinates with easing (lerp)
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
    };

    // List of active shockwave ripples
    let ripples: Ripple[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
      mouse.active = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Spawn a new shockwave ripple at click location
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: Math.max(width, height) * 0.9,
        speed: 10, // Pixels per frame
        strength: 45, // Max push in pixels
        decay: 0.95, // Decay factor
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    resize();

    // Configuration
    const gs = 55; // Grid spacing
    const maxDist = 220; // Magnetic warp radius
    const maxPush = 28; // Maximum warp push in pixels

    // Helper to calculate cursor & shockwave warped coordinate
    const getWarpedPoint = (origX: number, origY: number) => {
      let drawX = origX;
      let drawY = origY;

      // 1. Mouse Gravity Warp
      if (mouse.x > 0) {
        const dx = origX - mouse.x;
        const dy = origY - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist; // 0 to 1
          const easeForce = Math.sin(force * Math.PI / 2);
          const push = easeForce * maxPush;
          const angle = Math.atan2(dy, dx);
          drawX += Math.cos(angle) * push;
          drawY += Math.sin(angle) * push;
        }
      }

      // 2. Click Shockwave Warp (accumulated)
      ripples.forEach(r => {
        const dx = origX - r.x;
        const dy = origY - r.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const w = 70; // Shockwave thickness
        const diff = Math.abs(dist - r.radius);

        if (diff < w) {
          const force = (1 - diff / w) * (r.strength / 45); // 0 to 1 scaling
          const push = force * r.strength;
          const angle = Math.atan2(dy, dx);
          drawX += Math.cos(angle) * push;
          drawY += Math.sin(angle) * push;
        }
      });

      return { x: drawX, y: drawY };
    };

    // Subtle drifting nodes
    const particles: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    const particleCount = 35;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 1.2 + 0.4,
      });
    }

    let raf: number;

    const draw = () => {
      if (!canvas || !ctx) return;

      // Clear with background color
      ctx.fillStyle = OS.bg;
      ctx.fillRect(0, 0, width, height);

      // Lerp mouse coordinates to create smooth inertia
      if (mouse.active) {
        if (mouse.x === -1000) {
          mouse.x = mouse.targetX;
          mouse.y = mouse.targetY;
        } else {
          mouse.x += (mouse.targetX - mouse.x) * 0.08;
          mouse.y += (mouse.targetY - mouse.y) * 0.08;
        }
      } else {
        mouse.x += (-1000 - mouse.x) * 0.08;
        mouse.y += (-1000 - mouse.y) * 0.08;
      }

      // Update shockwave ripples
      ripples.forEach(r => {
        r.radius += r.speed;
        r.strength *= r.decay;
      });
      // Filter out dead ripples
      ripples = ripples.filter(r => r.radius < r.maxRadius && r.strength > 0.3);

      const cols = Math.ceil(width / gs) + 1;
      const rows = Math.ceil(height / gs) + 1;

      // ─── 1. DRAW WARPED GRID LINES ───
      ctx.beginPath();
      // Horizontal lines
      for (let r = 0; r < rows; r++) {
        const origY = r * gs;
        for (let c = 0; c < cols; c++) {
          const origX = c * gs;
          const p = getWarpedPoint(origX, origY);
          if (c === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
      }
      // Vertical lines
      for (let c = 0; c < cols; c++) {
        const origX = c * gs;
        for (let r = 0; r < rows; r++) {
          const origY = r * gs;
          const p = getWarpedPoint(origX, origY);
          if (r === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
      }
      // Base tech grid stroke
      ctx.strokeStyle = "rgba(99, 102, 241, 0.035)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Dynamic color-shifting cursor glow (cycles hue slightly over time)
      const dynamicHue = (Date.now() / 120) % 360;

      // Glowing cursor-reactive highlight pass
      if (mouse.x > 0) {
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, maxDist);
        grad.addColorStop(0, `hsla(${dynamicHue}, 85%, 65%, 0.24)`);
        grad.addColorStop(0.5, `hsla(${dynamicHue}, 85%, 65%, 0.07)`);
        grad.addColorStop(1, "rgba(99, 102, 241, 0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.25;
        ctx.stroke();
      }

      // Glowing click shockwaves (cyan/aqua wavefront pulse)
      ripples.forEach(r => {
        const innerR = Math.max(0, r.radius - 45);
        const outerR = r.radius + 45;
        const grad = ctx.createRadialGradient(r.x, r.y, innerR, r.x, r.y, outerR);
        
        const alpha = Math.max(0, (r.strength / 45) * 0.45);
        grad.addColorStop(0, "rgba(6, 182, 212, 0)");
        grad.addColorStop(0.5, `rgba(6, 182, 212, ${alpha})`);
        grad.addColorStop(1, "rgba(6, 182, 212, 0)");

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      });

      // ─── 2. DRAW INTERSECTION DOTS ───
      // Small default dots
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        const origY = r * gs;
        for (let c = 0; c < cols; c++) {
          const p = getWarpedPoint(c * gs, origY);
          ctx.moveTo(p.x + 0.8, p.y);
          ctx.arc(p.x, p.y, 0.8, 0, Math.PI * 2);
        }
      }
      ctx.fillStyle = "rgba(99, 102, 241, 0.12)";
      ctx.fill();

      // Bright highlighted dots near cursor
      if (mouse.x > 0) {
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          const origY = r * gs;
          for (let c = 0; c < cols; c++) {
            const origX = c * gs;
            const dx = origX - mouse.x;
            const dy = origY - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < maxDist) {
              const p = getWarpedPoint(origX, origY);
              const factor = (maxDist - dist) / maxDist;
              const rSize = 0.8 + factor * 1.3;
              ctx.moveTo(p.x + rSize, p.y);
              ctx.arc(p.x, p.y, rSize, 0, Math.PI * 2);
            }
          }
        }
        ctx.fillStyle = `hsla(${dynamicHue}, 85%, 65%, 0.45)`;
        ctx.fill();
      }

      // Highlighted shockwave dots (glowing cyan dots along wavefronts)
      ripples.forEach(r => {
        ctx.beginPath();
        for (let row = 0; row < rows; row++) {
          const origY = row * gs;
          for (let col = 0; col < cols; col++) {
            const origX = col * gs;
            const dx = origX - r.x;
            const dy = origY - r.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const w = 70;
            const diff = Math.abs(dist - r.radius);
            
            if (diff < w) {
              const p = getWarpedPoint(origX, origY);
              const factor = (1 - diff / w) * (r.strength / 45);
              const rSize = 0.8 + factor * 1.5;
              ctx.moveTo(p.x + rSize, p.y);
              ctx.arc(p.x, p.y, rSize, 0, Math.PI * 2);
            }
          }
        }
        ctx.fillStyle = `rgba(6, 182, 212, ${Math.max(0, (r.strength / 45) * 0.7)})`;
        ctx.fill();
      });

      // ─── 3. DRIFTING PARTICLES ───
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Add magnetic warping (cursor + ripples) to drifting particles
        let drawX = p.x;
        let drawY = p.y;
        
        // Mouse warp
        if (mouse.x > 0) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            const push = force * (maxPush * 0.7);
            const angle = Math.atan2(dy, dx);
            drawX += Math.cos(angle) * push;
            drawY += Math.sin(angle) * push;
          }
        }
        // Ripples warp
        ripples.forEach(r => {
          const dx = p.x - r.x;
          const dy = p.y - r.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const w = 70;
          const diff = Math.abs(dist - r.radius);
          if (diff < w) {
            const force = (1 - diff / w) * (r.strength / 45);
            const push = force * (r.strength * 0.7);
            const angle = Math.atan2(dy, dx);
            drawX += Math.cos(angle) * push;
            drawY += Math.sin(angle) * push;
          }
        });

        ctx.beginPath();
        ctx.arc(drawX, drawY, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(99, 102, 241, 0.25)";
        ctx.fill();
      });

      // Connections between close particles
      ctx.beginPath();
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            const pi = getWarpedPoint(particles[i].x, particles[i].y);
            const pj = getWarpedPoint(particles[j].x, particles[j].y);
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
          }
        }
      }
      ctx.strokeStyle = "rgba(99, 102, 241, 0.04)";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

// ─── Main App ─────────────────────────────────────────────────────────────────
let zCounter = 100;

const WINDOW_DEFAULTS: Record<string, Omit<WinState, "minimized" | "focused" | "zIndex">> = {
  about:      { id: "about",      title: "about.exe",      icon: "👤", x: 80,  y: 60,  w: 480, h: 440 },
  projects:   { id: "projects",   title: "projects/",      icon: "📁", x: 200, y: 80,  w: 540, h: 460 },
  skills:     { id: "skills",     title: "skills.db",      icon: "⚡", x: 320, y: 100, w: 500, h: 440 },
  experience: { id: "experience", title: "experience.log", icon: "📋", x: 100, y: 120, w: 560, h: 500 },
  terminal:   { id: "terminal",   title: "terminal",       icon: "⬛", x: 180, y: 90,  w: 560, h: 380 },
  contact:    { id: "contact",    title: "contact.sh",     icon: "📡", x: 260, y: 110, w: 480, h: 480 },
};

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [windows, setWindows] = useState<WinState[]>([]);
  const [projectDetail, setProjectDetail] = useState<string | null>(null);
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const openWindow = useCallback((id: string) => {
    setWindows(ws => {
      const existing = ws.find(w => w.id === id);
      if (existing) {
        return ws.map(w => w.id === id
          ? { ...w, minimized: false, focused: true, zIndex: ++zCounter }
          : { ...w, focused: false }
        );
      }
      const def = WINDOW_DEFAULTS[id];
      if (!def) return ws;
      const newWin: WinState = {
        ...def,
        minimized: false, focused: true, zIndex: ++zCounter,
      };
      return [...ws.map(w => ({ ...w, focused: false })), newWin];
    });
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows(ws => ws.filter(w => w.id !== id));
    if (id === "projects") setProjectDetail(null);
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, minimized: true, focused: false } : w));
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows(ws => ws.map(w =>
      w.id === id
        ? { ...w, focused: true, minimized: false, zIndex: ++zCounter }
        : { ...w, focused: false }
    ));
  }, []);

  const toggleWindow = useCallback((id: string) => {
    setWindows(ws => {
      const win = ws.find(w => w.id === id);
      if (!win) return ws;
      if (win.minimized) return ws.map(w => w.id === id ? { ...w, minimized: false, focused: true, zIndex: ++zCounter } : { ...w, focused: false });
      return ws.map(w => w.id === id ? { ...w, minimized: true, focused: false } : w);
    });
  }, []);

  const dragWindow = useCallback((id: string, x: number, y: number) => {
    setWindows(ws => ws.map(w => w.id === id ? { ...w, x: Math.max(0, x), y: Math.max(0, y) } : w));
  }, []);

  const handleTerminalCommand = useCallback((cmd: string) => {
    openWindow(cmd);
  }, [openWindow]);

  const handleOpenProject = useCallback((pid: string) => {
    setProjectDetail(pid);
    // open a project detail window
    const detailId = `proj-${pid}`;
    const proj = projects.find(p => p.id === pid);
    if (!proj) return;
    setWindows(ws => {
      const existing = ws.find(w => w.id === detailId);
      if (existing) {
        return ws.map(w => w.id === detailId
          ? { ...w, minimized: false, focused: true, zIndex: ++zCounter }
          : { ...w, focused: false }
        );
      }
      const newWin: WinState = {
        id: detailId, title: proj.name, icon: "📄",
        x: 260, y: 130, w: 520, h: 480,
        minimized: false, focused: true, zIndex: ++zCounter,
      };
      return [...ws.map(w => ({ ...w, focused: false })), newWin];
    });
  }, []);

  const renderWindowContent = (win: WinState) => {
    if (win.id === "about")      return <AboutContent />;
    if (win.id === "projects")   return <ProjectsContent onOpenProject={handleOpenProject} />;
    if (win.id === "skills")     return <SkillsContent />;
    if (win.id === "experience") return <ExperienceContent />;
    if (win.id === "contact")    return <ContactContent />;
    if (win.id === "terminal")   return <TerminalContent onCommand={handleTerminalCommand} />;
    if (win.id.startsWith("proj-")) {
      const pid = win.id.replace("proj-", "");
      return <ProjectDetailContent projectId={pid} />;
    }
    return null;
  };

  return (
    <>
      <AnimatePresence>
        {!booted && <BootScreen onDone={() => setBooted(true)} />}
      </AnimatePresence>

      {booted && (
        <>
          <Wallpaper />
          <FloatingSpace onProjectOpen={handleOpenProject} />
          <BugBounty />

          {/* Desktop icons */}
          <div style={{
            position: "fixed", left: 16, top: 20,
            display: "flex", flexDirection: "column", gap: 8, zIndex: 50,
          }}>
            {DESKTOP_ICONS.map((icon) => (
              <motion.button
                key={icon.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: icon.row * 0.06 }}
                onDoubleClick={() => openWindow(icon.id)}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${OS.windowBorder}`,
                  borderRadius: 8, padding: "8px 12px",
                  cursor: "pointer", display: "flex",
                  alignItems: "center", gap: 8, width: 160,
                  backdropFilter: "blur(8px)",
                  transition: "all 0.15s",
                }}
                whileHover={{
                  background: "rgba(99,102,241,0.1)",
                  borderColor: "rgba(99,102,241,0.3)",
                }}
              >
                <span style={{ fontSize: 18 }}>{icon.icon}</span>
                <span style={{ fontSize: 11, color: OS.text, fontFamily: "monospace" }}>{icon.label}</span>
              </motion.button>
            ))}

            {/* Download CV — sidebar button after contact */}
            <motion.a
              href="/Robin_Devkota_CV.pdf"
              download="Robin_Devkota_CV.pdf"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: DESKTOP_ICONS.length * 0.06 + 0.08 }}
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(129,140,248,0.08))",
                border: "1px solid rgba(99,102,241,0.45)",
                borderRadius: 8, padding: "8px 12px",
                cursor: "pointer", display: "flex",
                alignItems: "center", gap: 8, width: 160,
                backdropFilter: "blur(8px)",
                transition: "all 0.15s",
                textDecoration: "none",
                boxShadow: "0 0 10px rgba(99,102,241,0.12)",
                marginTop: 4,
              }}
              whileHover={{
                background: "rgba(99,102,241,0.28)",
                borderColor: "rgba(99,102,241,0.8)",
                boxShadow: "0 0 18px rgba(99,102,241,0.35)",
              }}
            >
              <span style={{ fontSize: 16 }}>📄</span>
              <span style={{ fontSize: 11, color: "#a5b4fc", fontFamily: "monospace", fontWeight: 700 }}>resume.pdf</span>
            </motion.a>
          </div>

          {/* Welcome message (only when no windows open) */}
          <AnimatePresence>
            {windows.length === 0 && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{
                  position: "fixed",
                  top: "50%",
                  left: 176,
                  right: 0,
                  transform: "translateY(-50%)",
                  textAlign: "center",
                  zIndex: 10,
                  pointerEvents: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace", letterSpacing: 3, marginBottom: 14 }}>
                  ROBIN OS — BUILD 2025
                </div>
                <div style={{ fontSize: 36, fontWeight: 800, color: "#ffffff", marginBottom: 10, lineHeight: 1.1 }}>
                  Welcome, Recruiter
                </div>
                <div style={{ fontSize: 15, color: "#cbd5e1", marginBottom: 28, lineHeight: 1.6 }}>
                  You're looking at Robin Devkota's portfolio.<br />
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>Double-click any file</span> on the left to explore.
                </div>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2.2 }}
                  style={{
                    fontSize: 12, color: "#64748b", fontFamily: "monospace",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  <span>←</span>
                  <span>double-click any icon to open</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Windows */}
          <AnimatePresence>
            {windows.map(win => (
              <OSWindow
                key={win.id}
                win={win}
                onFocus={() => focusWindow(win.id)}
                onClose={() => closeWindow(win.id)}
                onMinimize={() => minimizeWindow(win.id)}
                onDrag={(x, y) => dragWindow(win.id, x, y)}
              >
                {renderWindowContent(win)}
              </OSWindow>
            ))}
          </AnimatePresence>

          {/* Taskbar */}
          <Taskbar
            windows={windows}
            time={time}
            onToggle={toggleWindow}
            onFocus={focusWindow}
          />
        </>
      )}
    </>
  );
}
