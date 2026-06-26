"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BootSequenceProps {
  onComplete: () => void;
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [decryptingKey, setDecryptingKey] = useState("0x4F92...DECODE");
  const containerRef = useRef<HTMLDivElement>(null);

  const logs = [
    { text: "ROM BIOS Version 3.5.2026.06", color: "text-text-muted" },
    { text: "CPU: Intel Core AI-augmented Virtual Core v8.0 @ 4.80GHz", color: "text-text-muted" },
    { text: "SYSTEM RAM: 32768MB (OK)", color: "text-text-muted" },
    { text: "DETECTING INTEGRATED SUBSYSTEMS...", color: "text-text-muted" },
    { text: " ▸ Node 01: [SaucyCreation - NewWeb Engine] ... ONLINE", color: "text-accent-cyan" },
    { text: " ▸ Node 02: [RoyalSuites - Room QR Service] ... ONLINE", color: "text-accent-cyan" },
    { text: " ▸ Node 03: [AgentInbox - Telegram Webhook] ... ONLINE", color: "text-accent-cyan" },
    { text: " ▸ Node 04: [Local Ollama 4GB VRAM SMC Bot] ... STANDBY", color: "text-accent-amber" },
    { text: "INITIALIZING NEURAL PORTFOLIO INTERFACE...", color: "text-text-muted" },
    { text: "[SECURITY] Decrypting engineer profiles... OK", color: "text-accent-green" },
    { text: "[DECODE] Hash Key: SHA-256 (Robin_Devkota_CV)", color: "text-accent-purple" },
  ];

  // Increment console log steps
  useEffect(() => {
    if (step < logs.length) {
      const delay = step === 0 ? 100 : Math.random() * 200 + 100;
      const timer = setTimeout(() => {
        setStep((s) => s + 1);
        // Scroll bootlogs automatically
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Loading progress bar starts after log items print
  useEffect(() => {
    if (step >= logs.length) {
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            return 100;
          }
          return p + Math.floor(Math.random() * 8) + 4;
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Simulate hash cracking decryption effect
  useEffect(() => {
    if (step >= logs.length && progress < 100) {
      const interval = setInterval(() => {
        const chars = "ABCDEF0123456789X$/_#@";
        let res = "0x";
        for (let i = 0; i < 8; i++) {
          res += chars[Math.floor(Math.random() * chars.length)];
        }
        setDecryptingKey(res + "...SYNC");
      }, 50);
      return () => clearInterval(interval);
    } else if (progress >= 100) {
      setDecryptingKey("KEY_MATCHED_GRANTED");
    }
  }, [step, progress]);

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#02040a] font-mono text-xs md:text-sm p-4 overflow-hidden select-none">
      {/* Scanline Backgrounds */}
      <div className="scanline-overlay" />
      <div className="scanline-rolling" />

      {/* Cyber Cornered Console Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl border border-accent-cyan/20 bg-bg-secondary/80 p-6 cyber-corner shadow-2xl shadow-accent-cyan/5 relative"
      >
        {/* Frame Corners Decoration */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-accent-cyan" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-accent-cyan" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-accent-cyan" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-accent-cyan" />

        {/* Panel Header */}
        <div className="flex justify-between items-center border-b border-accent-cyan/20 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan animate-pulse glow-dot-cyan" />
            <span className="text-[10px] text-accent-cyan uppercase tracking-widest font-bold">System Boot Sequence</span>
          </div>
          <span className="text-[10px] text-text-muted">HOST: ROBIN_PORTFOLIO</span>
        </div>

        {/* Console logs */}
        <div 
          ref={containerRef} 
          className="h-60 overflow-y-auto mb-6 flex flex-col gap-1.5 scrollbar-none pr-2"
        >
          {logs.slice(0, step).map((log, index) => (
            <div key={index} className="flex gap-2 items-start animate-fade-in-up">
              <span className="text-accent-cyan/40">[{String(index + 1).padStart(2, "0")}]</span>
              <p className={log.color}>{log.text}</p>
            </div>
          ))}

          {step < logs.length && (
            <div className="flex gap-2 items-center">
              <span className="text-accent-cyan/40">[{String(step + 1).padStart(2, "0")}]</span>
              <span className="w-2 h-4 bg-accent-cyan animate-blink" />
            </div>
          )}
        </div>

        {/* Progress Matrix and decryption key */}
        {step >= logs.length && (
          <div className="border-t border-accent-cyan/10 pt-4 flex flex-col gap-3 animate-fade-in-up">
            <div className="flex justify-between text-[11px]">
              <span className="text-text-muted">DECRYPTION HASH: <span className="text-accent-purple font-bold">{decryptingKey}</span></span>
              <span className="text-accent-cyan font-bold">{Math.min(progress, 100)}%</span>
            </div>

            {/* Load bar */}
            <div className="h-2 w-full bg-bg-primary border border-accent-cyan/20 p-0.5 rounded-sm relative overflow-hidden">
              <div 
                className="h-full bg-accent-cyan shadow-sm shadow-accent-cyan/50 transition-all duration-100"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            {/* Glowing CTA Button */}
            <AnimatePresence>
              {progress >= 100 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 flex flex-col items-center gap-2"
                >
                  <button
                    onClick={onComplete}
                    className="relative w-full py-3 px-6 bg-accent-cyan font-bold text-bg-primary border border-accent-cyan hover:bg-transparent hover:text-accent-cyan transition-all duration-300 shadow-lg hover:shadow-accent-cyan/20 active:scale-[0.98] cursor-pointer text-center uppercase tracking-widest text-[11px] group"
                  >
                    <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-bg-primary group-hover:border-accent-cyan" />
                    <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-bg-primary group-hover:border-accent-cyan" />
                    <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-bg-primary group-hover:border-accent-cyan" />
                    <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-bg-primary group-hover:border-accent-cyan" />
                    Enter Command Center
                  </button>
                  <span className="text-[10px] text-text-muted animate-blink">PRESS ANY KEY OR CLICK TO SYNCHRONIZE</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
