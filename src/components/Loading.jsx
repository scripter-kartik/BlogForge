"use client";
import { useState, useEffect } from "react";

export default function Loading() {
  const [particles, setParticles] = useState([]);
  const [dots, setDots] = useState("");

  useEffect(() => {
    // Generate random particle styles only on client
    const generated = Array.from({ length: 20 }).map(() => ({
      width: Math.random() * 4 + 2 + "px",
      height: Math.random() * 4 + 2 + "px",
      left: Math.random() * 100 + "%",
      top: Math.random() * 100 + "%",
      duration: Math.random() * 10 + 15 + "s",
      delay: Math.random() * 5 + "s",
    }));

    setParticles(generated);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a0a0e] via-[#1c1d1d] to-[#0f0a0d] z-50 overflow-hidden">

      {/* Background Particles */}
      <div className="absolute inset-0">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#f75555] opacity-20"
            style={{
              width: p.width,
              height: p.height,
              left: p.left,
              top: p.top,
              animation: `float ${p.duration} linear infinite`,
              animationDelay: p.delay
            }}
          />
        ))}
      </div>

      {/* Main loader */}
      <div className="relative flex flex-col items-center gap-8">
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 rounded-full bg-[#f75555] opacity-20 blur-2xl animate-pulse" />

          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#f75555] border-r-[#ff6666] animate-spin" style={{ animationDuration: "1.5s" }} />

          <div className="absolute inset-3 rounded-full border-4 border-transparent border-b-[#ff8888] border-l-[#ffaaaa] animate-spin-reverse" style={{ animationDuration: "2s" }} />

          <div className="absolute inset-6 rounded-full bg-gradient-to-br from-[#f75555] to-[#ff8888] animate-pulse-scale flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#1c1d1d] flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f75555] to-[#ff6666] animate-pulse" />
            </div>
          </div>

          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-[#f75555] shadow-lg shadow-[#f75555]/50"
              style={{
                top: "50%",
                left: "50%",
                animation: `orbit 3s linear infinite`,
                animationDelay: `${i * 0.75}s`,
                transformOrigin: "0 0"
              }}
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-[#f75555] via-[#ff6666] to-[#f75555] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            Loading{dots}
          </h2>

          <div className="w-64 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#f75555] via-[#ff6666] to-[#f75555] animate-progress bg-[length:200%_auto]" />
          </div>

          <p className="text-gray-400 text-sm mt-2 animate-pulse">Preparing your experience</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); }}
        @keyframes pulse-scale { 0%,100% {transform: scale(1);} 50% {transform: scale(1.1);} }
        @keyframes orbit { 0%{transform: translate(-50%,-50%) rotate(0deg) translateX(55px) rotate(0deg);} 100%{transform: translate(-50%,-50%) rotate(360deg) translateX(55px) rotate(-360deg);} }
        @keyframes gradient { 0%{background-position:0% 50%;} 50%{background-position:100% 50%;} 100%{background-position:0% 50%;} }
        @keyframes progress { 0%{transform:translateX(-100%);} 100%{transform:translateX(100%);} }
        @keyframes float { 0%,100%{transform:translateY(0) rotate(0);} 25%{transform:translateY(-20px) rotate(5deg);} 50%{transform:translateY(-10px) rotate(0);} 75%{transform:translateY(-15px) rotate(-5deg);} }
        .animate-gradient { animation: gradient 3s ease infinite; }
        .animate-progress { animation: progress 2s ease-in-out infinite; }
        .animate-pulse-scale { animation: pulse-scale 2s ease-in-out infinite; }
        .animate-spin-reverse { animation: spin-reverse 2s linear infinite; }
      `}</style>
    </div>
  );
}
