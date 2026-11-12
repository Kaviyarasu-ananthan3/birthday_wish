import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { createPortal } from 'react-dom';
import PhotoMemories from './PhotoMemories.jsx';
import TypingLetter from './TypingLetter.jsx';
import { TiltSurface } from './DepthScene.jsx';

export function Wish({ onNext, celebrate, playSound }) {
  const [blown, setBlown] = useState(false);
  const [notificationsClosed, setNotificationsClosed] = useState(false);
  const reduced = useReducedMotion();
  return <section className={`greeting-stage ${blown ? 'wishes-received' : ''}`} id="wish-stage" aria-labelledby="wish-title"><TiltSurface className="paper wish-paper">
    <span className="corner left" aria-hidden="true">✧</span><span className="corner right" aria-hidden="true">✧</span>
    <header className="card-heading"><span className="chapter">02 · A LITTLE WISH</span><h1 id="wish-title" tabIndex={-1}>Close your eyes.<br /><em>Make a wish.</em></h1><p>Something big. Something tiny. Something just for you.<br />Keep it in your heart, Monisha.</p></header>
    <motion.div className="cake-scene" aria-hidden="true" initial={{ opacity: 0, y: reduced ? 0 : 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15, duration: .6 }}><span className="cake-spark s1">✧</span><span className="cake-spark s2">✦</span><div className="candle"><div className={`flame ${blown ? 'out' : ''}`} id="flame" /><div className="wick" /><div className="wax" />{blown && !reduced && <motion.div className="candle-smoke" initial={{ opacity: .7, y: 0, scale: .4 }} animate={{ opacity: 0, y: -90, scale: 2 }} transition={{ duration: 1.8 }} />}</div><div className="cake-top" /><div className="cake-body"><span>make a little magic</span></div><div className="cake-plate" /></motion.div>
    <p className="wish-note" id="wish-note" role="status">{blown ? 'Your wish is among the stars. May it find its way to you.' : 'May this next chapter be your loveliest yet.'}</p>
    {blown && !reduced && <div className="wish-heart-cloud" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <span key={i} style={{ '--heart-x': `${(i - 4) * 32}px`, '--heart-delay': `${i * .12}s` }}>♡</span>)}</div>}
    {blown ? <motion.button autoFocus className="ink-button" id="to-envelope" onClick={onNext} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Your birthday letter is here ♡</motion.button> : <button className="ink-button" id="blow-candle" onClick={() => { setBlown(true); celebrate(); playSound('wish'); }}>Blow out the candle ✧</button>}
    <span className="paper-footnote">ONE CANDLE. INFINITE POSSIBILITIES.</span>
  </TiltSurface>{blown && !notificationsClosed && createPortal(<aside className="birthday-notifications" aria-label="Birthday wishes">
    <button className="notification-close" onClick={() => setNotificationsClosed(true)} aria-label="Dismiss birthday notifications">Close</button>
    <div id="birthday-chat" className="notification-stack" aria-label="8 birthday messages" aria-live="polite" aria-relevant="additions">{[
      { title: 'Happy birthday, Monisha!', message: 'A little wish, a lot of love. Today is yours.' },
      { title: 'Make a wish', message: 'May all your dreams bloom this year.' },
      { title: 'You are so loved', message: 'You make every day brighter.' },
      { title: 'For my favourite person', message: 'More smiles, magic, and memories.' },
      { title: 'Keep that beautiful smile', message: 'A thousand reasons to smile today.' },
      { title: 'A little birthday magic', message: 'May lovely surprises find you.' },
      { title: 'Your next chapter', message: 'New adventures. Dreams coming true.' },
      { title: 'You deserve the sweetest day', message: 'Cake, laughter, and your favourite things.' },
    ].map((wish, index) => <motion.article className="birthday-notification" style={{ transformPerspective: 850 }} key={wish.title} initial={{ opacity: 0, x: reduced ? 0 : 40 }} animate={{ opacity: 1, x: 0, rotateY: reduced ? 0 : -8, rotateX: reduced ? 0 : 5 }} transition={{ duration: reduced ? 0 : .55, delay: reduced ? 0 : (Math.floor(index / 4) * 4 + [0, 2, 1, 3][index % 4]) * .3 }}>
      <span className="notification-meta">New Message <small>now</small></span>
      <h2>{wish.title}</h2><p>{wish.message}</p>
    </motion.article>)}</div>
  </aside>, document.body)}</section>;
}

export function Envelope({ onNext }) {
  const [opening, setOpening] = useState(false);
  const timer = useRef(null), reduced = useReducedMotion();
  useEffect(() => () => clearTimeout(timer.current), []);
  function open() {
    if (opening) return;
    setOpening(true); timer.current = setTimeout(onNext, reduced ? 0 : 1300);
  }
  return <section className="greeting-stage envelope-stage" id="envelope-stage" aria-labelledby="envelope-title"><span className="chapter">03 · A WHOLE LOT OF LOVE</span><h1 id="envelope-title" tabIndex={-1}>Special delivery.<br /><em>For my favourite person.</em></h1>
    <TiltSurface className="envelope-tilt"><motion.button className={`envelope ${opening ? 'is-opening' : ''}`} id="open-card" aria-label="Open Monisha’s birthday greeting card" onClick={open} disabled={opening} animate={{ y: opening && !reduced ? 15 : 0, rotateX: reduced ? 0 : opening ? -4 : 8 }}>
      <motion.span className="envelope-letter" animate={opening ? { y: reduced ? 0 : -105, opacity: 1, z: reduced ? 0 : 35 } : { y: 0, z: 0 }} transition={{ duration: .7, delay: .4 }}>To Monisha,<br /><em>with love.</em></motion.span>
      <motion.span className="envelope-lid" aria-hidden="true" animate={{ rotateX: opening && !reduced ? -175 : 0, opacity: opening && reduced ? 0 : 1 }} transition={{ duration: .65 }} />
      <span className="envelope-fold" /><motion.span className="wax-seal" animate={opening ? { opacity: 0, scale: reduced ? 1 : 1.7 } : { opacity: 1, scale: 1 }}>♡</motion.span><span className="envelope-stamp">FOR YOU<br />✧</span>
    </motion.button></TiltSurface><p className="envelope-hint" role="status">{opening ? 'A little love, unfolding…' : 'Tap the heart to open your birthday card.'}</p>
  </section>;
}

export function BirthdayCard({ onReplay }) {
  const reduced = useReducedMotion();
  const [bookOpened, setBookOpened] = useState(false);
  const revealed = reduced || bookOpened;
  return <section className={`greeting-stage cinematic-keepsake birthday-book ${revealed ? 'book-opened' : 'book-opening'}`} id="card-stage" aria-labelledby="birthday-title">
    <div className="final-atmosphere" aria-hidden="true"><div className="final-light final-light-rose" /><div className="final-light final-light-gold" />{Array.from({ length: 12 }, (_, i) => <span className="final-mote" key={i} style={{ '--mote-x': `${(i * 37 + 9) % 100}%`, '--mote-y': `${(i * 23 + 7) % 100}%`, '--mote-delay': `${-i * 1.3}s`, '--mote-duration': `${7 + i % 5}s` }} />)}</div>
    <motion.div className="final-prologue" initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .8 }}><span>THE LOVELIEST CHAPTER</span><p>You, and all the magic ahead.</p></motion.div>
    <TiltSurface className="card-tilt"><motion.div className="open-card" initial={{ opacity: 0, y: reduced ? 0 : 45, scale: reduced ? 1 : .92, rotateY: reduced ? 0 : -14 }} animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }} transition={{ duration: reduced ? 0 : 1.5, ease: [.16, 1, .3, 1] }}>
    <PhotoMemories />
    <div className="card-leaf letter-leaf">
      {!revealed && <motion.div className="birthday-book-cover" aria-hidden="true" initial={{ rotateY: 0 }} animate={{ rotateY: -180 }} transition={{ delay: .65, duration: 2, ease: [.45, 0, .2, 1] }} onAnimationComplete={() => setBookOpened(true)}><div className="book-cover-front"><span>A STORY WORTH CELEBRATING</span><span className="book-cover-heart">♡</span><strong>For you,<br /><em>Monisha.</em></strong><small>13 NOVEMBER 2026</small></div><div className="book-cover-back" /></motion.div>}
      <div className="book-letter-content" inert={!revealed || undefined}>
      <span className="chapter">TODAY, THE UNIVERSE CELEBRATES YOU</span><h1 id="birthday-title" tabIndex={-1}>Happy Birthday,<br /><em>Monisha.</em></h1><span className="letter-rule" aria-hidden="true">✧</span>
      <TypingLetter started={revealed} />
      </div>
    </div>
  </motion.div></TiltSurface><div className="card-actions"><button className="quiet-button" id="replay" onClick={onReplay}>↻ Play our little adventure again</button><span>A keepsake made with love.</span></div></section>;
}
