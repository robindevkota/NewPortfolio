"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { experiences } from "@/data/experience";

// ── palette ───────────────────────────────────────────────────────
const T = {
  bg:       "#000d0d",
  panel:    "rgba(0,255,140,0.04)",
  border:   "rgba(0,255,140,0.22)",
  borderDim:"rgba(0,255,140,0.10)",
  green:    "#00ff8c",
  greenDim: "rgba(0,255,140,0.6)",
  blue:     "#00cfff",
  amber:    "#ffb800",
  white:    "#e8fff8",
  muted:    "#5a8888",   // brighter muted
  body:     "#b0d8d0",   // body text — crystal clear
  dim:      "#1a3030",
};

// ── scanlines overlay ─────────────────────────────────────────────
function Scanlines() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none",
      background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
    }} />
  );
}

// ── CRT flicker ───────────────────────────────────────────────────
function CRTFlicker() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const tick = () => {
      if (!ref.current) return;
      const flicker = Math.random() > 0.995;
      ref.current.style.opacity = flicker ? "0.92" : "1";
      setTimeout(tick, 50 + Math.random() * 100);
    };
    tick();
  }, []);
  return <div ref={ref} style={{ position: "fixed", inset: 0, zIndex: 9998, pointerEvents: "none", transition: "opacity 0.05s" }} />;
}

// ── corner brackets ───────────────────────────────────────────────
function Corners({ color = T.border }: { color?: string }) {
  const s = 18;
  const w = 2;
  const corner = (top: boolean, left: boolean) => ({
    position: "absolute" as const,
    [top ? "top" : "bottom"]: 0,
    [left ? "left" : "right"]: 0,
    width: s, height: s,
    borderTop:    top  ? `${w}px solid ${color}` : "none",
    borderBottom: !top ? `${w}px solid ${color}` : "none",
    borderLeft:   left  ? `${w}px solid ${color}` : "none",
    borderRight:  !left ? `${w}px solid ${color}` : "none",
  });
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <div style={corner(true, true)} />
      <div style={corner(true, false)} />
      <div style={corner(false, true)} />
      <div style={corner(false, false)} />
    </div>
  );
}

// ── terminal panel wrapper ────────────────────────────────────────
function Panel({ title, children, style }: { title?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      position: "relative",
      border: `1px solid ${T.border}`,
      background: T.panel,
      backdropFilter: "blur(4px)",
      ...style,
    }}>
      {title && (
        <div style={{
          borderBottom: `1px solid ${T.borderDim}`,
          padding: "6px 14px",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, display: "inline-block", boxShadow: `0 0 6px ${T.green}` }} />
          <span style={{ fontFamily: "monospace", fontSize: 11, color: T.green, letterSpacing: "0.12em", textTransform: "uppercase" }}>{title}</span>
        </div>
      )}
      {children}
      <Corners />
    </div>
  );
}

// ── blinking cursor ───────────────────────────────────────────────
function Cursor({ color = T.green }: { color?: string }) {
  const [on, setOn] = useState(true);
  useEffect(() => { const t = setInterval(() => setOn(p => !p), 530); return () => clearInterval(t); }, []);
  return <span style={{ display: "inline-block", width: 9, height: "1.1em", background: on ? color : "transparent", verticalAlign: "text-bottom", marginLeft: 2 }} />;
}

// ── typewriter ────────────────────────────────────────────────────
function TypeWriter({ text, delay = 0, speed = 30, color = T.green, onDone }: {
  text: string; delay?: number; speed?: number; color?: string; onDone?: () => void;
}) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const t = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(iv); setDone(true); onDone?.(); }
      }, speed);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [text, delay, speed, onDone]);
  return <span style={{ color, fontFamily: "monospace" }}>{displayed}{!done && <Cursor color={color} />}</span>;
}

// ── nav ───────────────────────────────────────────────────────────
const NAV = ["PROJECTS","SKILLS","EXPERIENCE","CONTACT"];

function SideNav({ active, onNav }: { active: string; onNav: (s: string) => void }) {
  return (
    <nav style={{
      position: "fixed", left: 0, top: 0, bottom: 0, width: 56, zIndex: 100,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      borderRight: `1px solid ${T.borderDim}`,
      background: "rgba(0,13,13,0.9)",
      backdropFilter: "blur(8px)",
      gap: 4,
    }}>
      {/* logo */}
      <div style={{ position: "absolute", top: 20, fontFamily: "monospace", fontSize: 11, color: T.green, fontWeight: 900, letterSpacing: 1 }}>RD</div>

      {NAV.map((item, i) => {
        const isActive = active === item;
        return (
          <button key={item} onClick={() => onNav(item)} style={{
            all: "unset", cursor: "pointer",
            writingMode: "vertical-rl", transform: "rotate(180deg)",
            fontFamily: "monospace", fontSize: 9, letterSpacing: "0.18em",
            color: isActive ? T.green : T.muted,
            padding: "12px 6px",
            borderLeft: isActive ? `2px solid ${T.green}` : "2px solid transparent",
            textShadow: isActive ? `0 0 10px ${T.green}` : "none",
            transition: "all .2s",
          }}>
            <span style={{ color: T.greenDim, marginBottom: 4, display: "block" }}>0{i+1}</span>
            {item}
          </button>
        );
      })}

      {/* status dot */}
      <div style={{ position: "absolute", bottom: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, boxShadow: `0 0 8px ${T.green}` }} />
        <span style={{ fontFamily: "monospace", fontSize: 8, color: T.muted, writingMode: "vertical-rl" }}>ONLINE</span>
      </div>
    </nav>
  );
}

// ── hero section ──────────────────────────────────────────────────
function HeroSection() {
  const [line, setLine] = useState(0);
  const lines = [
    { text: "INITIALIZING MISSION CONTROL v1.0...", color: T.body,  speed: 18 },
    { text: "OPERATOR: Robin Devkota",              color: T.green,  speed: 25 },
    { text: "STATUS: Full Stack Engineer | AI Orchestrator", color: T.white, speed: 22 },
    { text: "UPTIME: 3+ years | PRODUCTS DEPLOYED: 3", color: T.blue, speed: 20 },
    { text: "CLEARANCE: AVAILABLE FOR HIRE ██████████ 100%", color: T.amber, speed: 18 },
  ];

  return (
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "0 40px 0 80px", position: "relative" }}>
      {/* grid bg */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(${T.borderDim} 1px, transparent 1px), linear-gradient(90deg, ${T.borderDim} 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      {/* radial fade */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 20%, #000d0d 80%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, width: "100%" }}>
        {/* top bar */}
        <div style={{ fontFamily: "monospace", fontSize: 12, color: T.body, marginBottom: 40, letterSpacing: "0.1em", display: "flex", gap: 24 }}>
          <span>SYS:{" "}<span style={{ color: T.green }}>NOMINAL</span></span>
          <span>NET:{" "}<span style={{ color: T.green }}>CONNECTED</span></span>
          <span>LOC:{" "}<span style={{ color: T.blue }}>KATHMANDU, NP</span></span>
          <span>TIME:{" "}<LiveTime /></span>
        </div>

        {/* terminal lines */}
        <div style={{ marginBottom: 48 }}>
          {lines.map((l, i) => (
            <div key={i} style={{ marginBottom: 10, display: "flex", alignItems: "flex-start", gap: 12, minHeight: 26 }}>
              <span style={{ fontFamily: "monospace", fontSize: 13, color: T.green, flexShrink: 0, marginTop: 2, opacity: 0.5 }}>
                {String(i + 1).padStart(2, "0")}{">"}
              </span>
              {i <= line && (
                <TypeWriter
                  text={l.text}
                  color={l.color}
                  speed={l.speed}
                  onDone={() => { if (i === line && line < lines.length - 1) setTimeout(() => setLine(p => p + 1), 200); }}
                />
              )}
            </div>
          ))}
        </div>

        {/* big name */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "monospace", fontSize: "clamp(52px, 7vw, 96px)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.03em" }}>
            <span style={{ color: T.green, textShadow: `0 0 40px ${T.green}, 0 0 80px rgba(0,255,140,0.3)` }}>ROBIN</span>
            <br />
            <span style={{ color: T.white }}>DEVKOTA</span>
          </div>
        </div>

        {/* stats bar */}
        <div style={{ display: "flex", gap: 0, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, marginBottom: 40 }}>
          {[
            ["03", "LIVE PRODUCTS"],
            ["35+","SITES GENERATED"],
            ["90%","BOILERPLATE CUT"],
            ["01", "NPM PACKAGE"],
          ].map(([n, l], i) => (
            <div key={l} style={{
              flex: 1, padding: "14px 20px", textAlign: "center",
              borderRight: i < 3 ? `1px solid ${T.borderDim}` : "none",
            }}>
              <div style={{ fontFamily: "monospace", fontSize: 28, fontWeight: 900, color: T.green, textShadow: `0 0 20px ${T.green}` }}>{n}</div>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: T.body, letterSpacing: "0.12em", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 16 }}>
          <a href="#projects" style={{
            fontFamily: "monospace", fontSize: 12, color: T.bg, background: T.green,
            padding: "12px 28px", textDecoration: "none", letterSpacing: "0.12em", fontWeight: 700,
            boxShadow: `0 0 30px rgba(0,255,140,0.4)`, transition: "all .2s",
          }}>[ VIEW PROJECTS ]</a>
          <a href="mailto:robindevkta0@gmail.com" style={{
            fontFamily: "monospace", fontSize: 12, color: T.green,
            padding: "12px 28px", textDecoration: "none", letterSpacing: "0.12em",
            border: `1px solid ${T.border}`, transition: "all .2s",
          }}>[ SEND SIGNAL ]</a>
        </div>
      </div>

      {/* right side HUD decorations */}
      <div style={{ position: "absolute", right: 40, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-end" }}>
        <RadarMini />
        <div style={{ fontFamily: "monospace", fontSize: 11, color: T.body, textAlign: "right", lineHeight: 2, letterSpacing: "0.1em" }}>
          <div>SIGNAL STRENGTH</div>
          <SignalBars />
          <div style={{ marginTop: 8 }}>ENCRYPTION: AES-256</div>
          <div>PROTOCOL: HTTPS</div>
        </div>
      </div>

      {/* scroll hint */}
      <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
        <div style={{ fontFamily: "monospace", fontSize: 9, color: T.muted, letterSpacing: "0.2em", marginBottom: 8 }}>SCROLL TO EXPLORE</div>
        <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, ${T.green}, transparent)`, margin: "0 auto" }} />
      </div>
    </section>
  );
}

function LiveTime() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("en-US", { hour12: false, timeZone: "Asia/Kathmandu" }));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);
  return <span style={{ color: T.blue }}>{t}</span>;
}

function RadarMini() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const s = 100;
    let angle = 0;
    let raf: number;
    // random blips
    const blips = Array.from({ length: 5 }, () => ({
      a: Math.random() * Math.PI * 2,
      r: Math.random() * 0.7 + 0.15,
      fade: 0,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, s, s);
      const cx = s / 2, cy = s / 2, r = s * 0.46;

      // circles
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath(); ctx.arc(cx, cy, r * i / 3, 0, Math.PI * 2);
        ctx.strokeStyle = T.borderDim; ctx.lineWidth = 1; ctx.stroke();
      }
      // cross
      ctx.strokeStyle = T.borderDim; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();

      // sweep
      const grad = ctx.createConicalGradient ? null : null;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle - 0.7, angle);
      ctx.closePath();
      ctx.fillStyle = `rgba(0,255,140,0.12)`; ctx.fill();
      // sweep line
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      ctx.strokeStyle = T.green; ctx.lineWidth = 1.5; ctx.stroke();

      // blips
      blips.forEach(b => {
        if (Math.abs(angle - b.a) < 0.15 || Math.abs(angle - b.a - Math.PI * 2) < 0.15) b.fade = 1;
        if (b.fade > 0) {
          const bx = cx + Math.cos(b.a) * b.r * r;
          const by = cy + Math.sin(b.a) * b.r * r;
          ctx.beginPath(); ctx.arc(bx, by, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,255,140,${b.fade})`; ctx.fill();
          b.fade = Math.max(0, b.fade - 0.008);
        }
      });

      angle = (angle + 0.025) % (Math.PI * 2);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div style={{ position: "relative" }}>
      <canvas ref={canvasRef} width={100} height={100} />
      <div style={{ position: "absolute", inset: 0, border: `1px solid ${T.borderDim}`, pointerEvents: "none" }} />
    </div>
  );
}

function SignalBars() {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "flex-end", marginTop: 4 }}>
      {[3, 5, 7, 9, 11].map((h, i) => (
        <div key={i} style={{ width: 6, height: h, background: i < 4 ? T.green : T.muted, boxShadow: i < 4 ? `0 0 4px ${T.green}` : "none" }} />
      ))}
    </div>
  );
}

// ── projects section ──────────────────────────────────────────────
function ProjectsSection() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section id="projects" style={{ padding: "80px 80px 80px 100px" }}>
      <SectionHeader num="01" title="DEPLOYED SYSTEMS" sub="Live production — 3 active nodes" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16, marginTop: 32 }}>
        {projects.map((p, i) => (
          <motion.div key={p.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12, duration: 0.5 }}>
            <Panel title={`NODE_${String(i+1).padStart(2,"0")} // ${p.tag.toUpperCase()}`} style={{ cursor: "pointer" }}>
              <div style={{ padding: "20px 20px 16px" }} onClick={() => setOpen(open === p.id ? null : p.id)}>
                {/* header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h3 style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 900, color: T.green, textShadow: `0 0 12px ${T.green}`, margin: 0 }}>{p.name.toUpperCase()}</h3>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontFamily: "monospace", fontSize: 10, color: T.blue, textDecoration: "none", border: `1px solid ${T.blue}`, padding: "3px 8px", letterSpacing: "0.1em" }}>VISIT ↗</a>
                </div>

                <p style={{ fontFamily: "monospace", fontSize: 13, color: T.body, lineHeight: 1.8, marginBottom: 16 }}>{p.description}</p>

                {/* status bar */}
                <div style={{ fontFamily: "monospace", fontSize: 11, color: T.muted, marginBottom: 14, display: "flex", gap: 20 }}>
                  <span>STATUS: <span style={{ color: T.green }}>ONLINE</span></span>
                  <span>UPTIME: <span style={{ color: T.green }}>99.9%</span></span>
                </div>

                {/* highlights */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                  {p.highlights.map(h => (
                    <span key={h} style={{ fontFamily: "monospace", fontSize: 11, color: T.green, border: `1px solid ${T.border}`, padding: "4px 10px", letterSpacing: "0.05em" }}>
                      {"▸ "}{h}
                    </span>
                  ))}
                </div>

                {/* expand toggle */}
                <div style={{ fontFamily: "monospace", fontSize: 11, color: T.blue, textAlign: "right", letterSpacing: "0.1em" }}>
                  {open === p.id ? "[ − COLLAPSE ]" : "[ + EXPAND STACK ]"}
                </div>
              </div>

              {/* expanded */}
              <AnimatePresence>
                {open === p.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                    <div style={{ borderTop: `1px solid ${T.borderDim}`, padding: "16px 20px" }}>
                      <div style={{ fontFamily: "monospace", fontSize: 11, color: T.muted, marginBottom: 10, letterSpacing: "0.1em" }}>TECH STACK:</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {p.stack.map(s => (
                          <span key={s} style={{ fontFamily: "monospace", fontSize: 12, color: T.blue, border: `1px solid rgba(0,207,255,0.35)`, padding: "5px 10px" }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Panel>
          </motion.div>
        ))}
      </div>

      {/* other projects */}
      <div style={{ marginTop: 48 }}>
        <div style={{ fontFamily: "monospace", fontSize: 12, color: T.body, letterSpacing: "0.12em", marginBottom: 16 }}>// ADDITIONAL MODULES (NON-PRODUCTION)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          {[
            ["HeloSarkar",      "Gov grievance portal",           "Next.js · MongoDB"],
            ["Waiterless SaaS", "QR-ordering + KDS",             "Socket.io · Turborepo"],
            ["NEPSE Tracker",   "100% OOS win rate signals",      "Python · GH Actions"],
            ["Local AI",        "Codebase AI on RTX 3050",        "Ollama · ChromaDB"],
            ["live-browser-mcp","88% cheaper Playwright MCP",     "TypeScript · CDP"],
            ["Forex Bot",       "SMC algorithmic trading",        "Python · MT5"],
          ].map(([name, desc, tech]) => (
            <div key={name} style={{ border: `1px solid ${T.borderDim}`, padding: "14px 16px", background: "rgba(0,255,140,0.02)" }}>
              <div style={{ fontFamily: "monospace", fontSize: 13, color: T.green, fontWeight: 700, marginBottom: 6 }}>{name}</div>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: T.body, marginBottom: 8, lineHeight: 1.5 }}>{desc}</div>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: T.blue }}>{tech}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── skills section ────────────────────────────────────────────────
function SkillsSection() {
  return (
    <section id="skills" style={{ padding: "80px 80px 80px 100px", borderTop: `1px solid ${T.borderDim}` }}>
      <SectionHeader num="02" title="SYSTEM MODULES" sub="Loaded capabilities — hover to inspect" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginTop: 32 }}>
        {skillGroups.map((g, i) => (
          <motion.div key={g.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, duration: 0.5 }}>
            <Panel title={`MODULE // ${g.label}`} style={{ height: "100%" }}>
              <div style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {g.items.map(s => (
                    <SkillPill key={s} label={s} />
                  ))}
                </div>
              </div>
            </Panel>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function SkillPill({ label }: { label: string }) {
  const [hov, setHov] = useState(false);
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: "monospace", fontSize: 12, padding: "6px 12px",
        border: `1px solid ${hov ? T.green : T.border}`,
        color: hov ? T.bg : T.body,
        background: hov ? T.green : "rgba(0,255,140,0.04)",
        boxShadow: hov ? `0 0 14px ${T.green}` : "none",
        cursor: "default", transition: "all .15s", letterSpacing: "0.05em",
      }}
    >{label}</span>
  );
}

// ── experience section ────────────────────────────────────────────
function ExperienceSection() {
  return (
    <section id="experience" style={{ padding: "80px 80px 80px 100px", borderTop: `1px solid ${T.borderDim}` }}>
      <SectionHeader num="03" title="MISSION LOG" sub="Operational history — 3+ years active" />

      <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 20 }}>
        {experiences.map((e, i) => (
          <motion.div key={e.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15, duration: 0.5 }}>
            <Panel title={`LOG_ENTRY_${String(i+1).padStart(2,"0")}`}>
              <div style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
                  <div>
                    <h3 style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 900, color: T.green, margin: "0 0 4px", textTransform: "uppercase" }}>{e.role}</h3>
                    <div style={{ fontFamily: "monospace", fontSize: 12, color: T.blue, letterSpacing: "0.08em" }}>{e.company}</div>
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 12, color: T.body, border: `1px solid ${T.border}`, padding: "5px 14px", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
                    PERIOD: {e.period}
                  </div>
                </div>

                <p style={{ fontFamily: "monospace", fontSize: 13, color: T.body, lineHeight: 1.8, marginBottom: 18 }}>{e.description}</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {e.achievements.map(a => (
                    <div key={a} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ color: T.green, fontFamily: "monospace", fontSize: 12, flexShrink: 0, marginTop: 1 }}>▸</span>
                      <span style={{ fontFamily: "monospace", fontSize: 13, color: T.body, lineHeight: 1.7 }}>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── contact section ───────────────────────────────────────────────
function ContactSection() {
  const [sent, setSent] = useState(false);
  return (
    <section id="contact" style={{ padding: "80px 80px 80px 100px", borderTop: `1px solid ${T.borderDim}` }}>
      <SectionHeader num="04" title="OPEN CHANNEL" sub="Transmission ready — all frequencies clear" />

      <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, maxWidth: 900 }}>
        <Panel title="SIGNAL TRANSMISSION">
          <div style={{ padding: "24px" }}>
            <div style={{ fontFamily: "monospace", fontSize: 13, color: T.body, lineHeight: 2.2, marginBottom: 24 }}>
              <div><span style={{ color: T.green }}>STATUS:</span> ACTIVELY SEEKING OPPORTUNITIES</div>
              <div><span style={{ color: T.green }}>ROLE:</span> Full Stack Engineer / AI Orchestrator</div>
              <div><span style={{ color: T.green }}>LOCATION:</span> Kathmandu, Nepal (Remote OK)</div>
              <div><span style={{ color: T.green }}>RESPONSE:</span> &lt; 24 hours</div>
            </div>

            <a href="mailto:robindevkta0@gmail.com" style={{
              display: "block", fontFamily: "monospace", fontSize: 12, color: T.bg,
              background: T.green, padding: "14px 24px", textDecoration: "none",
              letterSpacing: "0.12em", fontWeight: 700, textAlign: "center",
              boxShadow: `0 0 30px rgba(0,255,140,0.35)`, transition: "all .2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 0 60px rgba(0,255,140,0.6)`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 0 30px rgba(0,255,140,0.35)`; }}
            >
              INITIATE CONTACT ↗
            </a>
            <div style={{ fontFamily: "monospace", fontSize: 12, color: T.body, textAlign: "center", marginTop: 8 }}>robindevkta0@gmail.com</div>
          </div>
        </Panel>

        <Panel title="NETWORK LINKS">
          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "GITHUB", sub: "github.com/robindevkota", href: "https://github.com/robindevkota", color: T.white },
              { label: "LINKEDIN", sub: "linkedin.com/in/robin-devkota", href: "https://linkedin.com/in/robin-devkota", color: T.blue },
              { label: "LIVE PRODUCTS", sub: "royalsuitesnp.com", href: "https://royalsuitesnp.com", color: T.green },
            ].map(({ label, sub, href, color }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 16px", border: `1px solid ${T.borderDim}`, textDecoration: "none",
                background: "rgba(0,255,140,0.02)", transition: "all .2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = T.border; (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,255,140,0.06)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = T.borderDim; (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,255,140,0.02)"; }}
              >
                <div>
                  <div style={{ fontFamily: "monospace", fontSize: 13, color, fontWeight: 700, letterSpacing: "0.1em" }}>{label}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: T.body, marginTop: 3 }}>{sub}</div>
                </div>
                <span style={{ fontFamily: "monospace", color: T.muted, fontSize: 14 }}>↗</span>
              </a>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}

// ── shared section header ─────────────────────────────────────────
function SectionHeader({ num, title, sub }: { num: string; title: string; sub: string }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <span style={{ fontFamily: "monospace", fontSize: 11, color: T.muted, letterSpacing: "0.1em" }}>[{num}]</span>
        <div style={{ height: 1, flex: 1, background: `linear-gradient(to right, ${T.border}, transparent)` }} />
      </div>
      <h2 style={{ fontFamily: "monospace", fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 900, color: T.green, margin: "0 0 6px", letterSpacing: "0.05em", textShadow: `0 0 30px rgba(0,255,140,0.3)` }}>
        {title}
      </h2>
      <div style={{ fontFamily: "monospace", fontSize: 13, color: T.body, letterSpacing: "0.08em", marginTop: 4 }}>// {sub}</div>
    </div>
  );
}

// ── boot screen ───────────────────────────────────────────────────
function BootScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const bootLines = [
    "BIOS v2.4.1 — POST OK",
    "Loading kernel modules...",
    "Mounting filesystem... OK",
    "Starting network services... OK",
    "Establishing secure connection... OK",
    "MISSION CONTROL ONLINE",
  ];
  useEffect(() => {
    if (step < bootLines.length) {
      const t = setTimeout(() => setStep(p => p + 1), step === 0 ? 300 : 380);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(onDone, 600);
      return () => clearTimeout(t);
    }
  }, [step]);

  return (
    <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.6 }} style={{
      position: "fixed", inset: 0, background: "#000d0d", zIndex: 10000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ width: 480 }}>
        <div style={{ fontFamily: "monospace", fontSize: 10, color: T.muted, marginBottom: 24, letterSpacing: "0.1em" }}>
          ROBIN DEVKOTA // PORTFOLIO // MISSION CONTROL v1.0
        </div>
        {bootLines.slice(0, step).map((l, i) => (
          <div key={i} style={{ fontFamily: "monospace", fontSize: 12, color: i === bootLines.length - 1 ? T.green : T.muted, marginBottom: 6, letterSpacing: "0.05em" }}>
            <span style={{ color: T.greenDim, marginRight: 10 }}>{i === bootLines.length - 1 ? "✓" : ">"}</span>
            {l}
          </div>
        ))}
        {step >= bootLines.length && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
            marginTop: 24, fontFamily: "monospace", fontSize: 11, color: T.green,
            textShadow: `0 0 20px ${T.green}`, letterSpacing: "0.2em",
          }}>
            ████████████████████ 100%
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ── root ──────────────────────────────────────────────────────────
export default function Home() {
  const [booted, setBooted] = useState(false);
  const [active, setActive] = useState("PROJECTS");

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ background: T.bg, color: T.white, minHeight: "100vh" }}>
      <Scanlines />
      <CRTFlicker />

      <AnimatePresence>
        {!booted && <BootScreen onDone={() => setBooted(true)} />}
      </AnimatePresence>

      {booted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <SideNav active={active} onNav={scrollTo} />
          <div style={{ marginLeft: 56 }}>
            <HeroSection />
            <ProjectsSection />
            <SkillsSection />
            <ExperienceSection />
            <ContactSection />

            {/* footer */}
            <footer style={{ borderTop: `1px solid ${T.borderDim}`, padding: "20px 80px", display: "flex", justifyContent: "space-between", alignItems: "center", marginLeft: 0 }}>
              <span style={{ fontFamily: "monospace", fontSize: 10, color: T.muted }}>© 2026 ROBIN DEVKOTA // ALL SYSTEMS NOMINAL</span>
              <span style={{ fontFamily: "monospace", fontSize: 10, color: T.muted }}>MISSION CONTROL v1.0</span>
            </footer>
          </div>
        </motion.div>
      )}
    </div>
  );
}
