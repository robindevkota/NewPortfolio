"use client";

import { useState, useEffect, useCallback } from "react";

interface BootLine {
  text: string;
  delay: number;
  className?: string;
}

const bootLines: BootLine[] = [
  { text: "> Initializing Mission Control...", delay: 400 },
  { text: "> Loading systems...", delay: 300 },
  { text: "> Full Stack Engineer detected. AI Orchestrator online.", delay: 500, className: "text-[#00ff88]" },
  { text: "> 3 live products. 3+ years. Nepal.", delay: 400, className: "text-[#00ff88]" },
  { text: "> All systems nominal.", delay: 300, className: "text-[#64748b]" },
  { text: "> Ready.", delay: 200, className: "text-[#1a56db] font-bold" },
];

interface BootSequenceProps {
  onComplete: () => void;
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [currentText, setCurrentText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const [done, setDone] = useState(false);

  const startTyping = useCallback(
    (lineIndex: number) => {
      if (lineIndex >= bootLines.length) {
        setDone(true);
        setTimeout(onComplete, 800);
        return;
      }

      const line = bootLines[lineIndex];
      setIsTyping(true);
      setCharIndex(0);
      setCurrentText("");

      const interval = setInterval(() => {
        setCharIndex((prev) => {
          const next = prev + 1;
          setCurrentText(line.text.slice(0, next));
          if (next >= line.text.length) {
            clearInterval(interval);
            setIsTyping(false);
            setVisibleLines((prev) => prev + 1);
            setTimeout(() => startTyping(lineIndex + 1), line.delay);
            return next;
          }
          return next;
        });
      }, 25);
    },
    [onComplete]
  );

  useEffect(() => {
    startTyping(0);
  }, [startTyping]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]">
      <div className="w-full max-w-2xl px-8">
        <div className="font-mono text-sm leading-relaxed">
          {bootLines.slice(0, visibleLines).map((line, i) => (
            <p
              key={i}
              className={`${line.className || "text-[#f8fafc]"} animate-fade-in-up`}
              style={{ animationDelay: "0ms" }}
            >
              {line.text}
            </p>
          ))}
          {(isTyping || (!done && visibleLines < bootLines.length)) && (
            <p className="text-[#f8fafc]">
              {currentText}
              <span className="animate-blink text-[#00ff88]">_</span>
            </p>
          )}
          {done && (
            <p className="mt-4 text-center text-[#1a56db] font-bold animate-pulse-glow text-lg">
{'>'} Press Enter or click to enter Mission Control _
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
