"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Bug {
  id: number;
  x: number; // vw %
  y: number; // vh %
  life: number; // ms before it escapes
}

const SPAWN_INTERVAL = 1400;
const BUG_LIFETIME = 3200;
const MAX_BUGS = 5;

function BugSprite({ bug, onSquash, onEscape }: { bug: Bug; onSquash: () => void; onEscape: () => void }) {
  useEffect(() => {
    const t = setTimeout(onEscape, bug.life);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.button
      onClick={onSquash}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: [0, 5, -4, 3, 0],
        y: [0, -4, 3, -2, 0],
      }}
      exit={{ opacity: 0, scale: 1.7, rotate: 30, transition: { duration: 0.22 } }}
      transition={{
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 },
        x: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
        y: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
      }}
      whileHover={{ scale: 1.3 }}
      style={{
        position: "fixed",
        left: `${bug.x}vw`,
        top: `${bug.y}vh`,
        zIndex: 44,
        fontSize: 22,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 6,
        lineHeight: 1,
        filter: "drop-shadow(0 0 6px rgba(239,68,68,0.35))",
      }}
      title="squash it"
    >
      🐛
    </motion.button>
  );
}

export default function BugBounty() {
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [squashed, setSquashed] = useState(0);
  const [escaped, setEscaped] = useState(0);
  const [best, setBest] = useState(0);
  const idRef = useRef(0);

  useEffect(() => {
    setBest(Number(localStorage.getItem("bugBountyBest") || 0));
  }, []);

  useEffect(() => {
    if (squashed > best) {
      setBest(squashed);
      localStorage.setItem("bugBountyBest", String(squashed));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [squashed]);

  const spawn = useCallback(() => {
    setBugs(bs => {
      if (bs.length >= MAX_BUGS) return bs;
      const id = idRef.current++;
      return [
        ...bs,
        {
          id,
          x: 14 + Math.random() * 76,
          y: 16 + Math.random() * 62,
          life: BUG_LIFETIME,
        },
      ];
    });
  }, []);

  useEffect(() => {
    spawn();
    const t = setInterval(spawn, SPAWN_INTERVAL);
    return () => clearInterval(t);
  }, [spawn]);

  const squash = (id: number) => {
    setBugs(bs => bs.filter(b => b.id !== id));
    setSquashed(s => s + 1);
  };

  const escape = (id: number) => {
    setBugs(bs => bs.filter(b => b.id !== id));
    setEscaped(s => s + 1);
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 45,
          fontFamily: "monospace",
          fontSize: 11,
          color: "#94a3b8",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          padding: "8px 12px",
          textAlign: "right",
          pointerEvents: "none",
          backdropFilter: "blur(8px)",
        }}
      >
        <div style={{ letterSpacing: 1, color: "#6366f1", marginBottom: 4 }}>🐛 BUG BOUNTY</div>
        <div>
          squashed: <span style={{ color: "#22c55e" }}>{squashed}</span> · escaped:{" "}
          <span style={{ color: "#ef4444" }}>{escaped}</span>
        </div>
        <div style={{ color: "#64748b", marginTop: 2 }}>best: {best}</div>
      </div>

      <AnimatePresence>
        {bugs.map(bug => (
          <BugSprite key={bug.id} bug={bug} onSquash={() => squash(bug.id)} onEscape={() => escape(bug.id)} />
        ))}
      </AnimatePresence>
    </>
  );
}
