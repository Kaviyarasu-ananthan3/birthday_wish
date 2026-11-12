import { useEffect } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';

export function DepthScene({ stage }) {
  const reduced = useReducedMotion();
  const pointerX = useMotionValue(0), pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 35, damping: 18 });
  const y = useSpring(pointerY, { stiffness: 35, damping: 18 });
  const rotateY = useTransform(x, [-20, 20], [-3, 3]);
  useEffect(() => {
    if (reduced) { pointerX.set(0); pointerY.set(0); return; }
    const move = event => {
      if (event.pointerType !== 'mouse') return;
      pointerX.set((event.clientX / innerWidth - .5) * 35);
      pointerY.set((event.clientY / innerHeight - .5) * 22);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [pointerX, pointerY, reduced]);
  return <div className="scene-depth" data-stage={stage} aria-hidden="true"><motion.div className="scene-world" style={{ x, y, rotateY }}>
    <div className="hanging-stars"><span>✧</span><span>✦</span><span>✧</span><span>✧</span><span>✦</span></div>
    <svg className="botanical botanical-left" viewBox="0 0 180 320" fill="none"><path d="M20 320C125 205 45 105 140 10M60 263Q5 235 24 185Q80 195 60 263M78 220Q140 220 149 166Q94 164 78 220M79 169Q22 148 40 105Q90 115 79 169M95 112Q151 116 165 62Q111 67 95 112M118 53Q78 34 99 7Q128 20 118 53" /></svg>
    <svg className="botanical botanical-right" viewBox="0 0 180 320" fill="none"><path d="M20 320C125 205 45 105 140 10M60 263Q5 235 24 185Q80 195 60 263M78 220Q140 220 149 166Q94 164 78 220M79 169Q22 148 40 105Q90 115 79 169M95 112Q151 116 165 62Q111 67 95 112M118 53Q78 34 99 7Q128 20 118 53" /></svg>
    <div className="nebula-light nebula-one" /><div className="nebula-light nebula-two" />
    <div className="orbital-planet planet-near"><div className="planet-sphere" /><div className="planet-ring" /></div>
    <div className="orbital-planet planet-far"><div className="planet-sphere" /></div>
    <div className="celestial-orbit orbit-a" /><div className="celestial-orbit orbit-b" />
    <div className="floating-gem gem-one"><div className="gem-heart" /></div>
    <div className="floating-gem gem-two"><div className="gem-heart" /></div>
    <div className="scene-floor"><div /><div /><div /></div>
    <div className="shooting-star shooting-one" /><div className="shooting-star shooting-two" />
  </motion.div></div>;
}

export function TiltSurface({ children, className = '' }) {
  const reduced = useReducedMotion();
  const targetX = useMotionValue(0), targetY = useMotionValue(0);
  const rotateX = useSpring(targetX, { stiffness: 120, damping: 22 });
  const rotateY = useSpring(targetY, { stiffness: 120, damping: 22 });
  function move(event) {
    if (reduced || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    targetX.set((.5 - (event.clientY - rect.top) / rect.height) * 7);
    targetY.set(((event.clientX - rect.left) / rect.width - .5) * 9);
  }
  useEffect(() => { if (reduced) { targetX.set(0); targetY.set(0); } }, [reduced, targetX, targetY]);
  return <motion.div className={`dimensional-surface ${className}`} onPointerMove={move} onPointerLeave={() => { targetX.set(0); targetY.set(0); }} style={{ rotateX, rotateY, transformPerspective: 1100 }}>
    {children}<span className="surface-glare" aria-hidden="true" />
  </motion.div>;
}
