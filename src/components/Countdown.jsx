import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { TiltSurface } from './DepthScene.jsx';
import { BirthdayStickers } from './BirthdayFilm.jsx';
import CartoonFriends from './CartoonFriends.jsx';

export const birthdayTime = Date.parse('2026-11-13T00:00:00+05:30');

function remainingTime() {
  return Math.max(0, Math.ceil((birthdayTime - Date.now()) / 1000));
}

export default function Countdown({ onNext, onWatchFilm }) {
  const [remaining, setRemaining] = useState(remainingTime);
  const reduced = useReducedMotion();
  useEffect(() => {
    const update = () => setRemaining(remainingTime());
    const timer = window.setInterval(update, 1000);
    document.addEventListener('visibilitychange', update);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', update); };
  }, []);
  const ready = remaining === 0;
  const units = [
    ['Days', Math.floor(remaining / 86400)],
    ['Hours', Math.floor(remaining / 3600) % 24],
    ['Minutes', Math.floor(remaining / 60) % 60],
    ['Seconds', remaining % 60],
  ];
  return <section className="countdown-stage" id="countdown-stage" aria-labelledby="countdown-title">
    <div className="countdown-copy">
      <span className="countdown-date"><i aria-hidden="true" /> A DATE MY HEART REMEMBERS</span>
      <h1 id="countdown-title" tabIndex={-1}>{ready ? 'The day is yours,' : 'Every second closer'}<br /><em>{ready ? 'Monisha.' : 'to celebrating you.'}</em></h1>
      <p className="countdown-intro">For the girl who makes ordinary moments feel extraordinary. <br />A little universe of love is waiting just for you, Monisha.</p>
      <div className="birthday-date"><span aria-hidden="true">✧</span><time dateTime="2026-11-13T00:00:00+05:30">13 November 2026</time><span className="birthday-timezone">MIDNIGHT · INDIA TIME</span></div>
      <div className="countdown-clock" role="timer" aria-label="Time until Monisha’s birthday" aria-live="off">
        {units.map(([label, value]) => <div className="countdown-unit" key={label}><div className="countdown-tile">
          {reduced ? <span className="countdown-number" data-unit={label.toLowerCase()}>{String(value).padStart(2, '0')}</span> : <AnimatePresence mode="popLayout" initial={false}><motion.span key={value} className="countdown-number" data-unit={label.toLowerCase()} initial={{ rotateX: -75, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} exit={{ rotateX: 75, opacity: 0 }} transition={{ duration: .28 }}>{String(value).padStart(2, '0')}</motion.span></AnimatePresence>}
        </div><span className="countdown-unit-label">{label}</span></div>)}
      </div>
      <p className="countdown-note" role="status">{ready ? 'Happy birthday, my favourite person. Your surprise is ready.' : 'Some people are worth counting every second for.'}</p>
      <button id="start-adventure" className="ink-button countdown-start" disabled={!ready} aria-describedby="birthday-unlock-note" onClick={() => { if (Date.now() >= birthdayTime) onNext(); }}>{ready ? 'Open your birthday surprise' : 'Take a little peek'} <span aria-hidden="true">↗</span></button>
      <button className="watch-film" disabled={!ready} aria-describedby="birthday-unlock-note" onClick={() => { if (Date.now() >= birthdayTime) onWatchFilm(); }}><span className="film-play-icon" aria-hidden="true">▶</span><span>Watch your little birthday film<small>A few moments. A whole lot of love.</small></span></button>
      <span className="countdown-preview-note" id="birthday-unlock-note">{ready ? 'Made with love. Every little part.' : 'Both surprises unlock at midnight on 13 November, India time.'}</span>
    </div>
    <TiltSurface className="countdown-art"><div className="love-sculpture has-cartoon-friends" aria-hidden="true">
      <BirthdayStickers className="hero-stickers" />
      <CartoonFriends />
      <div className="sculpture-halo" /><div className="sculpture-orbit orbit-front" /><div className="sculpture-orbit orbit-back" />
      <div className="sculpture-heart"><svg viewBox="0 0 240 220"><defs><radialGradient id="birthday-heart-light" cx="30%" cy="18%" r="85%"><stop offset="0" stopColor="#fff4e7" /><stop offset=".24" stopColor="#f4b8c5" /><stop offset=".6" stopColor="#bb647d" /><stop offset="1" stopColor="#522339" /></radialGradient><linearGradient id="birthday-heart-edge" x2="0" y2="1"><stop stopColor="#eab39f" /><stop offset="1" stopColor="#572334" /></linearGradient></defs><path className="heart-thickness" d="M120 196C95 175 19 124 19 69C19 8 91 1 120 48C149 1 221 8 221 69C221 124 145 175 120 196Z" fill="url(#birthday-heart-edge)" transform="translate(0 10)" /><path d="M120 196C95 175 19 124 19 69C19 8 91 1 120 48C149 1 221 8 221 69C221 124 145 175 120 196Z" fill="url(#birthday-heart-light)" stroke="#ffd5c688" /><path d="M42 79C33 39 75 21 94 48" fill="none" stroke="#fff5e8" strokeWidth="5" strokeLinecap="round" opacity=".5" /><path d="M132 171C172 142 193 110 198 87" fill="none" stroke="#f9b0bb" strokeWidth="2" opacity=".35" /></svg></div>
      <span className="sculpture-star star-one">✧</span><span className="sculpture-star star-two">✦</span><span className="sculpture-star star-three">✧</span>
      <span className="love-note note-one">you, always.</span><span className="love-note note-two">my favourite person ♡</span>
      <div className="sculpture-plinth" /><div className="sculpture-caption">ONE OF A KIND. JUST LIKE YOU.</div>
    </div></TiltSurface>
    <div className="countdown-footer"><span>01 / THE ANTICIPATION</span><span>A little play. A little wish. A whole lot of love.</span></div>
  </section>;
}
