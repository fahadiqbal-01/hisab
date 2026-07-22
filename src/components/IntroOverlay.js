"use client";
import React, { useState, useEffect } from "react";

export default function IntroOverlay() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Begin fade out transition after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
      
      // Fully remove component from DOM after CSS transition completes (500ms)
      const removeTimer = setTimeout(() => {
        setVisible(false);
      }, 500);
      
      return () => clearTimeout(removeTimer);
    }, 2500);

    return () => clearTimeout(fadeTimer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#071f18] transition-opacity duration-500 select-none ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-1000">
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-widest text-[#fcfbf2] font-serif">
          hisab
        </h1>
        <div className="flex gap-2 mt-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
