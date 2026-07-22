"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [targetPath, setTargetPath] = useState("/sign-up");
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    // 1. Fetch session in background
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((session) => {
        if (session && Object.keys(session).length > 0) {
          setTargetPath("/dashboard");
        } else {
          setTargetPath("/sign-up");
        }
      })
      .catch(() => {
        setTargetPath("/sign-up");
      })
      .finally(() => {
        setSessionChecked(true);
      });

    // 2. Play intro animation for at least 2.5 seconds
    const timer = setTimeout(() => {
      setAnimationDone(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // 3. Once session is checked AND animation is done, redirect
  useEffect(() => {
    if (sessionChecked && animationDone) {
      router.replace(targetPath);
    }
  }, [sessionChecked, animationDone, targetPath, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#071f18] text-white select-none">
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
