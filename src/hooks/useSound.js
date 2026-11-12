import { useCallback, useEffect, useRef, useState } from 'react';

export default function useSound() {
  const engine = useRef(null), gain = useRef(null), enabledRef = useRef(false);
  const musicRef = useRef(null);
  const [enabled, setEnabled] = useState(false), [busy, setBusy] = useState(false), [unavailable, setUnavailable] = useState(false);
  const play = useCallback(type => {
    const audio = engine.current;
    if (!enabledRef.current || !audio || audio.state !== 'running') return;
    const tone = (from, to, duration, delay = 0, shape = 'sine') => {
      const start = audio.currentTime + delay;
      const oscillator = audio.createOscillator(), envelope = audio.createGain();
      oscillator.type = shape; oscillator.frequency.setValueAtTime(from, start);
      oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
      envelope.gain.setValueAtTime(0, start); envelope.gain.linearRampToValueAtTime(.18, start + .02);
      envelope.gain.exponentialRampToValueAtTime(.001, start + duration);
      oscillator.connect(envelope); envelope.connect(gain.current);
      oscillator.start(start); oscillator.stop(start + duration);
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
    };
    if (type === 'shot') tone(900, 140, .35, 0, 'triangle');
    else [523.25, 659.25, 783.99, 1046.5].forEach((note, i) => tone(note, note, 1.1, i * .12));
  }, []);
  async function toggle() {
    if (enabledRef.current) {
      enabledRef.current = false;
      musicRef.current?.pause();
      if (engine.current) gain.current.gain.setTargetAtTime(0, engine.current.currentTime, .05);
      setEnabled(false);
      return;
    }
    setBusy(true);
    try {
      musicRef.current.volume = .4;
      // Start from the button gesture so mobile browsers can allow playback.
      const playback = musicRef.current.play();
      await playback;
      if (!engine.current) {
        const Engine = window.AudioContext || window.webkitAudioContext;
        if (Engine) {
          engine.current = new Engine(); gain.current = engine.current.createGain(); gain.current.gain.value = .22; gain.current.connect(engine.current.destination);
        }
      }
      engine.current?.resume().catch(() => {});
      if (engine.current) gain.current.gain.setTargetAtTime(.22, engine.current.currentTime, .05);
      enabledRef.current = true;
      setEnabled(true); setUnavailable(false);
      if (document.hidden) musicRef.current.pause();
    } catch {
      musicRef.current?.pause(); enabledRef.current = false;
      setEnabled(false); setUnavailable(true);
    }
    finally { setBusy(false); }
  }
  useEffect(() => {
    const music = musicRef.current;
    const failed = () => {
      music.pause(); enabledRef.current = false;
      if (engine.current) gain.current.gain.setTargetAtTime(0, engine.current.currentTime, .05);
      setEnabled(false); setUnavailable(true);
    };
    const visibility = () => {
      if (document.hidden) {
        music.pause(); engine.current?.suspend().catch(() => {});
      } else if (enabledRef.current) {
        music.play().catch(failed);
        engine.current?.resume().catch(() => {});
      }
    };
    music.addEventListener('error', failed);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      music.removeEventListener('error', failed);
      music.pause();
      if (engine.current) { engine.current.close().catch(() => {}); engine.current = null; }
    };
  }, []);
  return { enabled, busy, unavailable, toggle, play, musicRef };
}
