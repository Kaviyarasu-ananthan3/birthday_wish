import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

const paragraphs = [
  ['salutation', 'My dearest Monisha,'],
  ['', 'If the universe were a canvas, you would be its most beautiful masterpiece. If life were a sky, you would be the brightest star that makes even the darkest nights worth looking at.'],
  ['', 'You are like the first light of sunrise, turning ordinary moments into something magical. Like a gentle breeze on a summer evening, your presence brings a kind of peace words could never describe.'],
  ['', 'Some people are like passing seasons, but you are like spring — bringing colour, warmth, and life wherever you go.'],
  ['', 'On your special day, I wish you a sky full of dreams, oceans of happiness, and a thousand beautiful sunsets to remind you how precious life is.'],
  ['', 'May every road lead you to something wonderful, every star guide you towards your dreams, and every new chapter be more beautiful than the last.'],
  ['letter-emphasis', 'If life is a journey, I hope you always find reasons to smile along the way.'],
  ['signature', "Forever wishing you the universe's very best. With all my love ♡"],
];
const total = paragraphs.reduce((sum, [, text]) => sum + text.length, 0);

export default function TypingLetter({ started = true }) {
  const reduced = useReducedMotion();
  const [characters, setCharacters] = useState(0);
  useEffect(() => {
    if (reduced || !started) return;
    let frame;
    const start = performance.now();
    function type(now) {
      const next = Math.min(total, Math.max(0, Math.floor((now - start - 900) / 18)));
      setCharacters(next);
      if (next < total) frame = requestAnimationFrame(type);
    }
    frame = requestAnimationFrame(type);
    return () => cancelAnimationFrame(frame);
  }, [reduced, started]);
  const count = reduced ? total : characters;
  let offset = 0;
  return <div className="typing-letter" data-typing={count < total ? 'true' : 'false'}>
    {paragraphs.map(([className, text], index) => {
      const visible = Math.max(0, Math.min(text.length, count - offset));
      const active = started && count >= offset && count < offset + text.length;
      offset += text.length;
      return <p key={index} className={`typed-paragraph ${className}`}>
        <span className="visually-hidden">{text}</span>
        <span className="typing-space" aria-hidden="true">{text}</span>
        <span className="typing-text" aria-hidden="true">{text.slice(0, visible)}{active && <span className="typing-cursor" />}</span>
      </p>;
    })}
  </div>;
}
