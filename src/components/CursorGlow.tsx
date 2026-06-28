"use client";

import React, { useEffect, useState } from "react";

export default function CursorGlow() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if device supports hover/fine pointer (desktop mouse)
    const mediaQuery = window.matchMedia("(pointer: fine)");
    if (!mediaQuery.matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-30 cursor-glow opacity-30 dark:opacity-60 transition-opacity duration-300 hidden md:block" 
      aria-hidden="true"
    />
  );
}
