import { useEffect, useRef } from 'react';
import styles from './RainBackground.module.css';

/**
 * Immersive, continuous rain rendered on a full-screen canvas.
 * Lightweight: a single rAF loop drives a pool of raindrops that wrap
 * around the viewport. Respects devicePixelRatio and reduced-motion.
 */
export default function RainBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let drops = [];
    let rafId = 0;
    let lastTime = 0;

    const DROP_COUNT_BASE = 220;

    function makeDrop(initial = false) {
      const speed = 320 + Math.random() * 520; // px / second
      return {
        x: Math.random() * width,
        y: initial ? Math.random() * height : -40,
        len: 8 + Math.random() * 18,
        speed,
        // thinner, faster drops are fainter
        alpha: 0.12 + (speed / 840) * 0.35,
        width: 0.6 + Math.random() * 1.1,
      };
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = prefersReduced
        ? 40
        : Math.round(DROP_COUNT_BASE * Math.min(1.4, width / 1280));
      drops = Array.from({ length: count }, () => makeDrop(true));
    }

    function draw(dt) {
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = 'round';

      for (const d of drops) {
        d.y += d.speed * dt;

        // slight diagonal for a wind feel
        const tailX = d.x - d.len * 0.18;
        const tailY = d.y - d.len;

        const grad = ctx.createLinearGradient(tailX, tailY, d.x, d.y);
        grad.addColorStop(0, 'rgba(160, 220, 255, 0)');
        grad.addColorStop(1, `rgba(190, 235, 255, ${d.alpha})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = d.width;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();

        if (d.y - d.len > height) {
          Object.assign(d, makeDrop(false));
        }
      }

      rafId = requestAnimationFrame((t) => {
        const now = t;
        const delta = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0.016;
        lastTime = now;
        draw(delta);
      });
    }

    resize();
    window.addEventListener('resize', resize);
    rafId = requestAnimationFrame((t) => {
      lastTime = t;
      draw(0.016);
    });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
