'use client';

import { useEffect, useRef } from 'react';
import { createNoise3D } from 'simplex-noise';

export default function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create simplex noise instance
    const noise3D = createNoise3D();

    // Animation variables
    let time = 0;
    const lines = 30;
    let animationFrameId: number;

    const animate = () => {
      // Trail effect: fill with semi-transparent black
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const step = canvas.width / lines;

      // Draw 30 lines
      for (let i = 0; i < lines; i++) {
        ctx.beginPath();

        const xStart = i * step;
        let x = xStart;
        let y = canvas.height; // Start from bottom

        ctx.moveTo(x, y);

        // Draw line from bottom upwards
        while (y > 0) {
          // Apply simplex noise to x position
          x += Math.sin(noise3D(x * 0.003, y * 0.003, time)) * 2;

          ctx.lineTo(x, y);
          y -= 2; // Move up
        }

        // Create gradient from bottom (canvas.height) to 40% height
        const gradient = ctx.createLinearGradient(
          xStart,
          canvas.height,
          xStart,
          canvas.height * 0.4
        );

        // Calculate hue: 120 (green) to 260 (purple) based on line position
        const hue = 120 + (i / lines) * 140;

        // Add gradient stops with HSLA colors
        gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.8)`);
        gradient.addColorStop(0.5, `hsla(${hue}, 100%, 60%, 0.4)`);
        gradient.addColorStop(1, `hsla(${hue}, 100%, 70%, 0.1)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      time += 0.003; // Increment time for animation
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 bg-black"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
