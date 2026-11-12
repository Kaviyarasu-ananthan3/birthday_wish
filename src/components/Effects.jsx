import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';

export function Starfield({ theme }) {
  const canvas = useRef(null), reduced = useReducedMotion();
  useEffect(() => {
    const element = canvas.current, context = element.getContext('2d');
    let stars = [], width = 0, height = 0, frame;
    const color = getComputedStyle(document.documentElement).getPropertyValue('--theme-glow').trim();
    function draw(time) {
      context.clearRect(0, 0, width, height);
      for (const star of stars) {
        context.globalAlpha = .2 + (Math.sin(time * .0007 + star.phase) + 1) * .23;
        context.fillStyle = color;
        context.beginPath(); context.arc(star.x, star.y, star.r, 0, Math.PI * 2); context.fill();
      }
      context.globalAlpha = 1;
    }
    function resize() {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      width = innerWidth; height = innerHeight; element.width = width * ratio; element.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      stars = Array.from({ length: Math.min(100, Math.floor(width * height / 9000)) }, () => ({ x: Math.random() * width, y: Math.random() * height, r: .4 + Math.random(), phase: Math.random() * Math.PI * 2 }));
      draw(0);
    }
    function tick(time) { draw(time); frame = requestAnimationFrame(tick); }
    function sync() { cancelAnimationFrame(frame); if (!document.hidden && !reduced) frame = requestAnimationFrame(tick); else draw(0); }
    resize(); sync();
    window.addEventListener('resize', resize); document.addEventListener('visibilitychange', sync);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', sync); };
  }, [theme, reduced]);
  return <><canvas ref={canvas} id="cosmic-sky" aria-hidden="true" /><div className="sky-dust" aria-hidden="true" /></>;
}

export function Celebration() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [pieces] = useState(() => Array.from({ length: 120 }, (_, i) => ({ id: i, x: Math.random() * 100, size: 9 + Math.random() * 15, duration: 3 + Math.random() * 2, delay: Math.random() * 5, drift: (Math.random() - .5) * 220 })));
  useEffect(() => { const timer = setTimeout(() => setVisible(false), 11000); return () => clearTimeout(timer); }, []);
  if (reduced || !visible) return null;
  return <><Fireworks /><div className="confetti-layer" id="confetti" aria-hidden="true">{pieces.map(piece => <span key={piece.id} className="confetti-piece" style={{ '--x': `${piece.x}%`, '--size': `${piece.size}px`, '--color': `var(${['--theme-pink', '--theme-glow', '--theme-accent'][piece.id % 3]})`, '--duration': `${piece.duration}s`, '--delay': `${piece.delay}s`, '--drift': `${piece.drift}px` }}>{['♡', '✧', '·', '✦'][piece.id % 4]}</span>)}</div></>;
}

function Fireworks() {
  const canvas = useRef(null);
  useEffect(() => {
    const element = canvas.current, context = element.getContext('2d');
    const style = getComputedStyle(document.documentElement);
    const colors = [...['--theme-accent', '--theme-pink', '--theme-glow'].map(key => style.getPropertyValue(key).trim()), '#ffd778', '#ffa4bd', '#b7e5ff'];
    let width, height, frame, previous = null, elapsed = 0, nextBurst = 0, wave = 0;
    let particles = [];
    function resize() {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      width = innerWidth; height = innerHeight;
      element.width = width * ratio; element.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    function burst() {
      const x = width * (.1 + Math.random() * .8), y = height * (.12 + Math.random() * .48);
      const color = colors[wave++ % colors.length];
      const count = width < 600 ? 40 : 70;
      for (let i = 0; i < count; i++) {
        const direction = i / count * Math.PI * 2, speed = (i % 3 === 0 ? 65 : 120) + Math.random() * 110;
        particles.push({ x, y, vx: Math.cos(direction) * speed, vy: Math.sin(direction) * speed, age: 0, life: 1.4 + Math.random() * .9, color: i % 5 === 0 ? '#fff2cb' : color });
      }
    }
    function tick(time) {
      const delta = previous === null ? 0 : Math.min((time - previous) / 1000, .04);
      previous = time; elapsed += delta;
      context.clearRect(0, 0, width, height);
      if (elapsed >= nextBurst && wave < 10) {
        burst();
        nextBurst += .7;
      }
      particles = particles.filter(particle => particle.age < particle.life);
      context.lineCap = 'round';
      for (const particle of particles) {
        const fromX = particle.x, fromY = particle.y;
        particle.age += delta; particle.vy += 38 * delta;
        particle.x += particle.vx * delta; particle.y += particle.vy * delta;
        context.globalAlpha = Math.max(0, 1 - particle.age / particle.life) * .8;
        context.strokeStyle = particle.color; context.lineWidth = 2;
        context.beginPath(); context.moveTo(fromX - particle.vx * .035, fromY - particle.vy * .035); context.lineTo(particle.x, particle.y); context.stroke();
      }
      context.globalAlpha = 1;
      if (elapsed < 10.5) frame = requestAnimationFrame(tick);
      else context.clearRect(0, 0, width, height);
    }
    function visibility() {
      cancelAnimationFrame(frame); previous = null;
      if (!document.hidden && elapsed < 10.5) frame = requestAnimationFrame(tick);
    }
    resize(); frame = requestAnimationFrame(tick);
    window.addEventListener('resize', resize); document.addEventListener('visibilitychange', visibility);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  return <canvas ref={canvas} className="fireworks-canvas" aria-hidden="true" />;
}

export function PointerSparkles() {
  const reduced = useReducedMotion();
  const [points, setPoints] = useState([]);
  useEffect(() => {
    if (reduced) { setPoints([]); return; }
    let previous = 0, sequence = 0;
    const timers = new Set();
    const move = event => {
      if (event.pointerType !== 'mouse' || document.hidden || performance.now() - previous < 85) return;
      previous = performance.now();
      const point = { id: sequence++, x: event.clientX, y: event.clientY };
      setPoints(current => [...current.slice(-8), point]);
      const timer = setTimeout(() => {
        timers.delete(timer); setPoints(current => current.filter(item => item.id !== point.id));
      }, 650);
      timers.add(timer);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => { window.removeEventListener('pointermove', move); timers.forEach(clearTimeout); };
  }, [reduced]);
  if (reduced) return null;
  return <div className="pointer-sparkles" aria-hidden="true">{points.map(point => <span key={point.id} style={{ left: point.x, top: point.y }}>{point.id % 3 ? '✧' : '♡'}</span>)}</div>;
}
