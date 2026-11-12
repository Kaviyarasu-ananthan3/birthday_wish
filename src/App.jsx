import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import ArcheryGame from './components/ArcheryGame.jsx';
import { Wish, Envelope, BirthdayCard } from './components/GreetingStages.jsx';
import { ThemePicker, FullscreenButton } from './components/Controls.jsx';
import { Starfield, Celebration, PointerSparkles } from './components/Effects.jsx';
import useSound from './hooks/useSound.js';
import { initialTheme } from './data.js';
import { DepthScene } from './components/DepthScene.jsx';
import Countdown from './components/Countdown.jsx';
import BirthdayFilm from './components/BirthdayFilm.jsx';
import AdventureReveal from './components/AdventureReveal.jsx';

export default function App() {
  const [stage, setStage] = useState(-1), [theme, setTheme] = useState(initialTheme);
  const [themeOpen, setThemeOpen] = useState(false), [burst, setBurst] = useState(0);
  const [filmOpen, setFilmOpen] = useState(false);
  const [opening, setOpening] = useState(false);
  const reduced = useReducedMotion(), sound = useSound(), shell = useRef(null);
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = getComputedStyle(document.documentElement).getPropertyValue('--theme-bg').trim();
  }, [theme]);
  const celebrate = useCallback(() => setBurst(value => value + 1), []);
  useEffect(() => {
    if (!opening) return;
    const reveal = setTimeout(() => { setStage(0); setBurst(0); }, reduced ? 100 : 950);
    const finish = setTimeout(() => setOpening(false), reduced ? 400 : 2500);
    return () => { clearTimeout(reveal); clearTimeout(finish); };
  }, [opening, reduced]);
  useEffect(() => {
    if (!opening && stage === 0) shell.current?.querySelector('h1')?.focus({ preventScroll: true });
  }, [opening, stage]);
  function goTo(next) {
    setStage(next);
    if (next === 3) { celebrate(); sound.play('chime'); }
    if (next === 0) setBurst(0);
  }
  function focusStage() {
    shell.current?.querySelector('h1')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  return <MotionConfig reducedMotion="user"><div inert={opening || undefined}><Starfield theme={theme} /><DepthScene stage={stage} /><PointerSparkles />
    <main className="experience">
      <audio ref={sound.musicRef} src={`${import.meta.env.BASE_URL}audio/birthday-song.mp3`} loop preload="none" aria-hidden="true" />
      <div className="keepsake-label">FOR MONISHA <span>♡</span> EVERY LITTLE THING, WITH LOVE</div>
      <AnimatePresence key={stage === 0 ? 'game' : 'greeting'} mode="wait" initial={false}>
        <motion.div key={stage} ref={shell} className="stage-shell" initial={{ opacity: 0, y: stage === 0 || reduced ? 0 : 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .35 }} onAnimationComplete={focusStage}>
          {stage === -1 && <Countdown onNext={() => { if (!opening) { setOpening(true); sound.play('chime'); } }} onWatchFilm={() => { setFilmOpen(true); if (!sound.enabled && !sound.busy) sound.toggle(); }} />}
          {stage === 0 && <ArcheryGame onNext={() => goTo(1)} celebrate={celebrate} playSound={sound.play} paused={themeOpen || opening} />}
          {stage === 1 && <Wish onNext={() => goTo(2)} celebrate={celebrate} playSound={sound.play} />}
          {stage === 2 && <Envelope onNext={() => goTo(3)} />}
          {stage === 3 && <BirthdayCard onReplay={() => goTo(0)} />}
        </motion.div>
      </AnimatePresence>
      {stage >= 0 && <div className="progress" aria-label="Greeting progress">{['PLAY', 'WISH', 'OPEN', 'LOVE'].map((name, index) => <span className="progress-item" key={name}><span className={stage === index ? 'current' : ''} aria-current={stage === index ? 'step' : undefined}>{name}</span>{index < 3 && <i />}</span>)}</div>}
      <button className="sound-switch" onClick={sound.toggle} disabled={sound.busy} aria-pressed={sound.enabled}>{sound.unavailable ? 'Sound unavailable' : sound.enabled ? '♫ Sound on' : '♪ Sound off'}</button>
    </main>
    <ThemePicker theme={theme} onChange={setTheme} open={themeOpen} setOpen={setThemeOpen} /><FullscreenButton />
    {burst > 0 && <Celebration key={burst} />}
    {filmOpen && <BirthdayFilm onClose={() => setFilmOpen(false)} />}
    </div>
    {opening && <AdventureReveal reduced={reduced} onSkip={() => { setOpening(false); goTo(0); }} />}
  </MotionConfig>;
}
