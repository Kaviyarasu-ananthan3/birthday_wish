import { useEffect, useRef, useState } from 'react';
import { themes } from '../data.js';

export function ThemePicker({ theme, onChange, open, setOpen }) {
  const dialog = useRef(null);
  const [message, setMessage] = useState('Your choice is saved in this browser.');
  useEffect(() => {
    if (open && !dialog.current.open) { dialog.current.showModal(); dialog.current.querySelector('input:checked').focus(); }
    else if (!open && dialog.current.open) dialog.current.close();
  }, [open]);
  function select(id) {
    onChange(id);
    let saved = true;
    try { localStorage.setItem('monisha-color-theme', id); } catch { saved = false; }
    setMessage(`${themes.find(item => item.id === id).name} applied${saved ? ' and saved for next time.' : ' for this visit. Browser storage is unavailable.'}`);
  }
  return <><button className="theme-switch" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-controls="theme-dialog" aria-label="Choose color theme"><span aria-hidden="true">◉</span> Colors</button>
    <dialog ref={dialog} id="theme-dialog" aria-labelledby="theme-title" onClose={() => setOpen(false)} onClick={event => {
      if (event.target !== dialog.current) return;
      const r = dialog.current.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) setOpen(false);
    }}>
      <button className="theme-close" aria-label="Close color themes" onClick={() => setOpen(false)}>×</button><span className="chapter">MAKE IT FEEL LIKE YOU</span><h2 id="theme-title">Choose your <em>little universe.</em></h2><p className="theme-description">A new mood for every balloon, wish, and memory.</p>
      <fieldset className="theme-options"><legend className="visually-hidden">Color theme</legend>{themes.map(item => <label key={item.id} className="theme-option"><input type="radio" name="color-theme" value={item.id} checked={theme === item.id} onChange={() => select(item.id)} /><span className="theme-swatch" style={{ '--swatch-a': item.colors[0], '--swatch-b': item.colors[1], '--swatch-c': item.colors[2] }} aria-hidden="true"><i /><i /><i /></span><span className="theme-name">{item.name}<small>{item.description}</small></span><span className="theme-check" aria-hidden="true">✓</span></label>)}</fieldset>
      <p id="theme-status" role="status">{message}</p><button className="ink-button theme-done" onClick={() => setOpen(false)}>Keep these colors ✧</button>
    </dialog>
  </>;
}

export function FullscreenButton() {
  const [active, setActive] = useState(false), [busy, setBusy] = useState(false), [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const sync = () => setActive(!!document.fullscreenElement);
    sync(); document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  async function toggle() {
    setBusy(true);
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else throw new Error('Not supported');
      setUnavailable(false);
    } catch { setUnavailable(true); }
    finally { setBusy(false); }
  }
  return <button className="fullscreen-switch" onClick={toggle} disabled={busy} aria-pressed={active} aria-label={unavailable ? 'Full screen unavailable in this browser' : active ? 'Exit full screen' : 'Enter full screen'}>{unavailable ? 'Full screen unavailable' : active ? '⛶ Exit full screen' : '⛶ Full screen'}</button>;
}
