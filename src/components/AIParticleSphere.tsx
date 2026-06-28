"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  px: number;
  py: number;
  color: string;
}

export default function AIParticleSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const particles: Particle[] = [];
    const count = 75;
    const radius = Math.min(width, height) * 0.35;

    // Generate particles on a sphere surface
    for (let i = 0; i < count; i++) {
      const theta = Math.acos(Math.random() * 2 - 1);
      const phi = Math.random() * Math.PI * 2;

      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);

      particles.push({
        x,
        y,
        z,
        px: 0,
        py: 0,
        color: i % 3 === 0 ? "#3b82f6" : i % 3 === 1 ? "#10b981" : "#8b5cf6",
      });
    }

    const angleY = 0.002;
    const angleX = 0.001;

    // Mouse coordinates relative to canvas center
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = (e.clientX - rect.left) - width / 2;
      targetMouseY = (e.clientY - rect.top) - height / 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse damping
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Adjust rotation speed based on mouse
      const currentAngleY = angleY + mouseX * 0.00002;
      const currentAngleX = angleX + mouseY * 0.00002;

      const cosY = Math.cos(currentAngleY);
      const sinY = Math.sin(currentAngleY);
      const cosX = Math.cos(currentAngleX);
      const sinX = Math.sin(currentAngleX);

      // Perspective projection parameters
      const fov = 400;
      const cx = width / 2;
      const cy = height / 2;

      // Update and project particles
      particles.forEach((p) => {
        // Rotate Y
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;

        // Rotate X
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.y * sinX;

        p.x = x1;
        p.y = y2;
        p.z = z2;

        // Translate and project to 2D
        const perspective = fov / (fov + z2);
        p.px = cx + x1 * perspective;
        p.py = cy + y2 * perspective;
      });

      // Draw lines between close particles
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const pi = particles[i];
          const pj = particles[j];

          const dx = pi.px - pj.px;
          const dy = pi.py - pj.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Only connect if they are close enough and not too deep in Z
          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.25 * (fov / (fov + Math.max(pi.z, pj.z)));
            ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(pi.px, pi.py);
            ctx.lineTo(pj.px, pj.py);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        const perspective = fov / (fov + p.z);
        const radiusVal = Math.max(1, 4 * perspective);

        // Adjust alpha based on depth (Z)
        const alpha = 0.2 + 0.8 * perspective;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.px, p.py, radiusVal, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Outer Glow Ring */}
      <div className="absolute h-64 w-64 md:h-80 md:w-80 rounded-full border border-dashed border-brand-blue/30 dark:border-brand-purple/20 animate-spin-slow" />
      <div className="absolute h-80 w-80 md:h-96 md:w-96 rounded-full border border-dotted border-brand-emerald/20 animate-spin-slow [animation-direction:reverse]" />
      
      {/* Canvas */}
      <canvas ref={canvasRef} className="w-full h-full max-w-[500px] max-h-[500px]" />
    </div>
  );
}
