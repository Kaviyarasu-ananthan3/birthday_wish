import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { balloonPositions } from '../data.js';
import { BalloonArt, BowArt } from './Artwork.jsx';

export default function ArcheryGame({ onNext, celebrate, playSound, paused }) {
  const reduced = useReducedMotion();
  const field = useRef(null), bow = useRef(null), arrow = useRef(null);
  const balloons = useRef([]), frame = useRef(0), hitIds = useRef(new Set()), flying = useRef(false);
  const [hits, setHits] = useState([]), [angle, setAngle] = useState(40), [inFlight, setInFlight] = useState(false);
  const [hint, setHint] = useState('Aim ahead of a balloon. Tap to fire, or use the slider and button.');
  const [burst, setBurst] = useState(null);
  const won = hits.length >= 5;

  useLayoutEffect(() => {
    document.body.classList.add('archery-active');
    return () => document.body.classList.remove('archery-active');
  }, []);
  useEffect(() => {
    document.getElementById('archery-title')?.focus({ preventScroll: true });
    return () => cancelAnimationFrame(frame.current);
  }, []);
  const finish = () => {
    flying.current = false; setInFlight(false);
    if (arrow.current) arrow.current.style.display = 'none';
  };
  useEffect(() => {
    const cancel = () => {
      cancelAnimationFrame(frame.current);
      if (flying.current) {
        flying.current = false; setInFlight(false);
        if (arrow.current) arrow.current.style.display = 'none';
        setHint('Take another aim — your balloons are still waiting.');
      }
    };
    const visibility = () => { if (document.hidden) cancel(); };
    window.addEventListener('resize', cancel);
    document.addEventListener('visibilitychange', visibility);
    if (paused) cancel();
    return () => { window.removeEventListener('resize', cancel); document.removeEventListener('visibilitychange', visibility); };
  }, [paused]);
  useEffect(() => {
    if (won) document.getElementById('to-wish')?.focus({ preventScroll: true });
  }, [won]);

  function aimAt(event) {
    if (flying.current || won || paused) return angle;
    const rect = field.current.getBoundingClientRect();
    const next = Math.max(5, Math.min(85, Math.atan2(bow.current.offsetTop - (event.clientY - rect.top), event.clientX - rect.left - bow.current.offsetLeft) * 180 / Math.PI));
    setAngle(next); return next;
  }
  function shoot(shotAngle = angle) {
    if (flying.current || hitIds.current.size >= 5 || paused) return;
    flying.current = true; setInFlight(true); playSound('shot');
    setHint('A little love, on its way…');
    const rect = field.current.getBoundingClientRect();
    const start = { x: bow.current.offsetLeft, y: bow.current.offsetTop };
    const radians = shotAngle * Math.PI / 180;
    let previous = null, distance = 0;
    arrow.current.style.display = 'block';
    function tick(time) {
      const delta = previous === null ? 0 : Math.min((time - previous) / 1000, .04);
      previous = time;
      // Measure moving targets each frame; substeps prevent skipped collisions.
      const targets = balloons.current.flatMap((element, id) => {
        if (!element || hitIds.current.has(id)) return [];
        const r = element.getBoundingClientRect();
        return [{ id, x: r.left - rect.left + r.width * .5, y: r.top - rect.top + r.height * 61 / 195, rx: r.width * 46 / 120 + 4, ry: r.height * 57 / 195 + 4 }];
      });
      for (let step = 0; step < 4; step++) {
        distance += 1000 * delta / 4;
        const x = start.x + Math.cos(radians) * distance, y = start.y - Math.sin(radians) * distance;
        arrow.current.style.left = `${x}px`; arrow.current.style.top = `${y}px`;
        arrow.current.style.transform = `translate(-85%,-50%) rotate(${-shotAngle}deg)`;
        const target = targets.find(t => ((x - t.x) / t.rx) ** 2 + ((y - t.y) / t.ry) ** 2 <= 1);
        if (target) {
          hitIds.current.add(target.id);
          const count = hitIds.current.size;
          setHits([...hitIds.current]); setBurst({ x: target.x, y: target.y, id: time });
          playSound('hit'); finish();
          setHint(count >= 5 ? 'All five collected! Your birthday wish is unlocked.' : `${count} of 5 popped! ${5 - count} more little bursts of love to go.`);
          if (count >= 5) celebrate();
          return;
        }
        if (x > rect.width + 40 || y < -40) {
          finish(); setHint('Aim a little ahead of a flying balloon. You have unlimited arrows.'); return;
        }
      }
      frame.current = requestAnimationFrame(tick);
    }
    frame.current = requestAnimationFrame(tick);
  }

  return <section className="greeting-stage" id="archery-stage" aria-labelledby="archery-title">
    <div className="paper">
      <header className="card-heading"><span className="chapter">FOR MY FAVOURITE PERSON · CHAPTER 01</span><h1 id="archery-title" tabIndex={-1}>The world is lovelier<br />with you in it, <em>Monisha.</em></h1><p>A little celebration for the person who means so much. <br />Pop 5 balloons. Collect a little love. Unwrap your surprise.</p></header>
      <div className="birthday-dedication" aria-hidden="true"><span>just for you</span><strong>Happy<br /><em>Birthday</em></strong><span>A WHOLE UNIVERSE OF LOVE</span></div>
      <div ref={field} className={`archery-field ${won ? 'target-hit' : ''}`} id="archery-field" role="group" aria-label="Archery game. Move to aim and click to shoot, or use the aim slider and shoot button." onPointerMove={aimAt} onClick={event => shoot(aimAt(event))}>
        <div className="field-stars" aria-hidden="true">✧ <span>✦</span><i>✧</i></div>
        {balloonPositions.map(([x, y], id) => <div key={id} ref={element => { balloons.current[id] = element; }} id={`balloon-${id}`} className={`balloon arena-balloon ${hits.includes(id) ? 'popped' : ''}`} hidden={won} aria-hidden="true" style={{ left: `${x * 100}%`, top: `${y * 100}%`, '--drift-x': `${id % 2 ? -22 : 22}px`, '--float-time': `${19 + id * 1.3}s`, '--float-delay': `${-(19 + id * 1.3) * (1.10 - y) / 1.28}s`, filter: `hue-rotate(${[0, 45, 270, 310, 20, 290, 335][id]}deg) drop-shadow(0 0 20px color-mix(in srgb, var(--theme-accent) 35%, transparent))` }}><BalloonArt id={id} /></div>)}
        <div className="aim-line" aria-hidden="true" hidden={won} style={{ transform: `rotate(${-angle}deg)` }} />
        <div ref={bow} className="bow" id="bow" aria-hidden="true" hidden={won} style={{ transform: `translate(-50%,-50%) rotate(${-angle}deg)` }}><BowArt /></div>
        <div ref={arrow} className="flying-arrow" id="flying-arrow" aria-hidden="true">⟶</div>
        {!reduced && burst && <div key={burst.id} className="hit-burst" style={{ left: burst.x, top: burst.y }} aria-hidden="true"><i className="pop-shockwave" /><i className="pop-shockwave echo" /><motion.b className="hit-reward" initial={{ opacity: 1, y: -25 }} animate={{ opacity: 0, y: -95 }} transition={{ duration: 1.3 }}>+1 LOVE</motion.b>{Array.from({ length: 14 }, (_, i) => <motion.span key={i} initial={{ x: 0, y: 0, opacity: 1, scale: .5 }} animate={{ x: Math.cos(i * Math.PI / 7) * (i % 2 ? 110 : 65), y: Math.sin(i * Math.PI / 7) * (i % 2 ? 110 : 65), opacity: 0, scale: 1.3, rotate: 90 }} transition={{ duration: .85 }}>{i % 3 ? '✧' : '♡'}</motion.span>)}</div>}
        <AnimatePresence>{won && <motion.div className="pop-message" id="pop-message" initial={{ opacity: 0, scale: reduced ? 1 : .85 }} animate={{ opacity: 1, scale: 1 }}><span>♡</span><p>Five little bursts of love.<br /><em>Now, a wish just for you.</em></p></motion.div>}</AnimatePresence>
        <div className="field-ground" aria-hidden="true" />
      </div>
      <div className="arena-score" role="status" aria-live="polite"><span>LOVE COLLECTED</span><strong><motion.span key={hits.length} id="pop-count" initial={{ scale: reduced ? 1 : 1.4 }} animate={{ scale: 1 }}>{hits.length}</motion.span> <small>/ 5</small></strong><div id="score-dots" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => i < hits.length ? '♥' : '○').join(' ')}</div></div>
      {!won && <div className="game-controls" id="game-controls"><label htmlFor="aim">Aim ↗</label><input id="aim" type="range" min="5" max="85" value={Math.round(angle)} onChange={event => setAngle(Number(event.target.value))} disabled={inFlight || paused} aria-label="Arrow angle in degrees" /><button className="ink-button" id="shoot" disabled={inFlight || paused} onClick={() => shoot()}>Let love fly ↗</button></div>}
      <p className="hint" id="game-hint" role="status">{hint}</p>
      {won && <button className="ink-button" id="to-wish" onClick={() => { if (hitIds.current.size >= 5) onNext(); }}>Time to make a wish ✧</button>}
    </div>
  </section>;
}
