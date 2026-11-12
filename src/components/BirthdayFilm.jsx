import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BalloonArt } from './Artwork.jsx';
import CartoonFriends from './CartoonFriends.jsx';

export function BirthdayStickers({ className = '' }) {
  return <div className={`birthday-stickers ${className}`} aria-hidden="true">
    <div className="sticker sticker-gift"><div className="gift-model"><i className="gift-front" /><i className="gift-side" /><i className="gift-top" /><i className="gift-ribbon" /><i className="gift-bow bow-left" /><i className="gift-bow bow-right" /></div></div>
    <div className="sticker sticker-star"><svg viewBox="0 0 120 120"><path d="M60 8L76 41L112 46L86 72L92 109L60 91L28 109L34 72L8 46L44 41Z" fill="#9d603c" transform="translate(0 5)" /><path d="M60 8L76 41L112 46L86 72L92 109L60 91L28 109L34 72L8 46L44 41Z" fill="#edbd80" stroke="#fff0ca" strokeWidth="2" /><path d="M60 8L60 64L44 41Z M8 46L60 64L34 72Z M28 109L60 64L60 91Z" fill="#fff0cb" /><path d="M60 64L76 41L112 46Z M60 64L86 72L92 109Z" fill="#c88e56" /></svg></div>
    <div className="sticker sticker-balloon"><BalloonArt id={`sticker-${className || 'film'}`} /></div>
    <div className="sticker sticker-kiss"><span>xo</span><small>with love</small></div>
  </div>;
}

const scenes = [
  { label: 'A LITTLE FILM, JUST FOR YOU', title: 'Some people make', emphasis: 'life feel like magic.', text: 'And then there is you, Monisha.', detail: 'The smile. The kindness. The way you make everything brighter.' },
  { label: 'MY FAVOURITE PERSON', title: 'If I could wrap up', emphasis: 'all the love you deserve…', text: 'It would never fit in just one birthday.', detail: 'So here is a little piece of it, made just for you.' },
  { label: '13 NOVEMBER 2026', title: 'Happy birthday,', emphasis: 'Monisha.', text: 'You are my once in a universe.', detail: 'May your next chapter be your most beautiful one yet.' },
];

export default function BirthdayFilm({ onClose }) {
  const reduced = useReducedMotion();
  const dialog = useRef(null);
  const [scene, setScene] = useState(0);
  const [paused, setPaused] = useState(!!reduced);
  const remaining = useRef(5000);
  useEffect(() => {
    dialog.current.showModal();
  }, []);
  useEffect(() => { remaining.current = 5000; }, [scene]);
  useEffect(() => {
    if (paused || scene === scenes.length - 1) return;
    const started = performance.now();
    const timer = setTimeout(() => setScene(value => value + 1), remaining.current);
    return () => { clearTimeout(timer); remaining.current = Math.max(0, remaining.current - (performance.now() - started)); };
  }, [scene, paused]);
  const content = scenes[scene];
  return createPortal(<dialog ref={dialog} className={`birthday-film ${paused ? 'film-paused' : ''}`} aria-labelledby="film-title" onCancel={onClose} onClose={onClose}>
    <div className="film-letterbox film-letterbox-top" aria-hidden="true" /><div className="film-letterbox film-letterbox-bottom" aria-hidden="true" />
    <div className="film-atmosphere" aria-hidden="true"><div className="film-light light-left" /><div className="film-light light-right" /></div>
    <div className="film-topline"><span>FOR MONISHA · WITH LOVE</span><button className="film-close" onClick={onClose} autoFocus aria-label="Close birthday film">Close film <span aria-hidden="true">×</span></button></div>
    <BirthdayStickers className="film-stickers" />
    <CartoonFriends variant="film" />
    <div className="film-scenes"><AnimatePresence mode="wait"><motion.div className="film-scene" key={scene} initial={{ opacity: 0, scale: reduced ? 1 : .94, filter: reduced ? 'none' : 'blur(8px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: reduced ? 1 : 1.035 }} transition={{ duration: reduced ? 0 : .65 }}>
      <span className="film-scene-label">{content.label}</span>
      <h2 id="film-title">{content.title}<br /><em>{content.emphasis}</em></h2>
      <p className="film-message">{content.text}</p><p className="film-detail">{content.detail}</p>
      {scene === 2 && <button className="ink-button" onClick={onClose}>Back to your birthday surprise <span aria-hidden="true">♡</span></button>}
    </motion.div></AnimatePresence></div>
    <div className="film-controls"><div className="film-chapters" aria-label="Film scenes">{scenes.map((item, index) => <button key={item.label} onClick={() => setScene(index)} aria-label={`Show scene ${index + 1}`} aria-current={scene === index ? 'step' : undefined}><span className={scene === index ? 'film-progress active' : 'film-progress'} style={{ animationPlayState: paused ? 'paused' : 'running' }} /><span>0{index + 1}</span></button>)}</div><button className="film-pause" onClick={() => scene === 2 ? (setScene(0), setPaused(false)) : setPaused(value => !value)}>{scene === 2 ? 'Replay film' : paused ? 'Play film' : 'Pause film'}</button></div>
  </dialog>, document.body);
}
