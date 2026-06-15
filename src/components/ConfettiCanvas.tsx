import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface ConfettiRef {
  burst: (x: number, y: number, count?: number) => void;
  celebrate: (count?: number) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  gravity: number;
  drag: number;
  shape: 'circle' | 'square' | 'heart' | 'star';
}

const COLORS = [
  '#FFD700', // Gold
  '#FF69B4', // Hot Pink
  '#DA70D6', // Orchid (Purple)
  '#9370DB', // Medium Purple
  '#FFA07A', // Light Salmon
  '#FFC0CB', // Pink
  '#87CEFA', // Light Sky Blue
  '#E6C280', // Soft Champagne
];

export const ConfettiCanvas = forwardRef<ConfettiRef, {}>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  // Function to create a single particle
  const createParticle = (x: number, y: number, isBurst: boolean = false): Particle => {
    const angle = isBurst 
      ? Math.random() * Math.PI * 2 
      : Math.PI / 2 + (Math.random() * 0.6 - 0.3); // downwards with some spread
    
    const speed = isBurst 
      ? Math.random() * 8 + 3 
      : Math.random() * 4 + 2;

    const shapes: Particle['shape'][] = ['circle', 'square', 'heart', 'star'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (isBurst ? Math.random() * 4 + 2 : 0),
      size: Math.random() * 8 + 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() * 6 - 3) * 2,
      opacity: 1,
      gravity: Math.random() * 0.15 + 0.1,
      drag: 0.98,
      shape,
    };
  };

  // Burst effect at a specific spot
  const burst = (x: number, y: number, count: number = 40) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push(createParticle(x, y, true));
    }
    particlesRef.current.push(...newParticles);
  };

  // Screen-wide celebration rains
  const celebrate = (count: number = 100) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    // Left side burst going right-up
    for (let i = 0; i < count / 2; i++) {
      const p = createParticle(0, canvas.height * 0.8, true);
      p.vx = Math.random() * 12 + 6;
      p.vy = -(Math.random() * 14 + 10);
      particlesRef.current.push(p);
    }

    // Right side burst going left-up
    for (let i = 0; i < count / 2; i++) {
      const p = createParticle(canvas.width, canvas.height * 0.8, true);
      p.vx = -(Math.random() * 12 + 6);
      p.vy = -(Math.random() * 14 + 10);
      particlesRef.current.push(p);
    }
  };

  // Expose functions to parent component
  useImperativeHandle(ref, () => ({
    burst,
    celebrate,
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const drawHeart = (c: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      c.beginPath();
      const topCurveHeight = size * 0.3;
      c.moveTo(x, y + topCurveHeight);
      // top left curve
      c.bezierCurveTo(
        x - size / 2, y - size / 2, 
        x - size, y + size / 3, 
        x, y + size
      );
      // top right curve
      c.bezierCurveTo(
        x + size, y + size / 3, 
        x + size / 2, y - size / 2, 
        x, y + topCurveHeight
      );
      c.closePath();
      c.fill();
    };

    const drawStar = (c: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
      let rot = Math.PI / 2 * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      c.beginPath();
      c.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        c.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        c.lineTo(x, y);
        rot += step;
      }
      c.lineTo(cx, cy - outerRadius);
      c.closePath();
      c.fill();
    };

    const updateAndDraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Apply physics
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.008; // slow fade

        if (p.opacity <= 0 || p.y > canvas.height + 20 || p.x < -20 || p.x > canvas.width + 20) {
          particles.splice(i, 1);
          continue;
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'square') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else if (p.shape === 'heart') {
          drawHeart(ctx, 0, -p.size / 2, p.size);
        } else if (p.shape === 'star') {
          drawStar(ctx, 0, 0, 5, p.size / 2, p.size / 4);
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(updateAndDraw);
    };

    updateAndDraw();

    // Spawn moderate random sparkles from top occasionally to keep visual interest
    const interval = setInterval(() => {
      if (document.hidden) return;
      // Only ambient spawn if under active celebration or if portal is open
      if (particlesRef.current.length < 50) {
        const randomX = Math.random() * canvas.width;
        particlesRef.current.push(createParticle(randomX, -10));
      }
    }, 450);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      clearInterval(interval);
    };
  }, []);

  return (
    <canvas
      id="confetti-canvas"
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
});

ConfettiCanvas.displayName = 'ConfettiCanvas';
