import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { captions, readStorage } from '../data.js';

export default function PhotoMemories() {
  const [photos, setPhotos] = useState(() => captions.map((_, index) => {
    const data = readStorage(`monisha-photo-${index}`); return data?.startsWith('data:image/') ? data : null;
  }));
  const [index, setIndex] = useState(0), [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Photos stay in this browser, just for you.');
  const input = useRef(null), picker = useRef(null), alive = useRef(true), objectUrl = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); };
  }, []);
  async function upload(event) {
    const file = event.target.files[0]; event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 15 * 1024 * 1024) {
      setStatus('Choose a JPG, PNG, or WebP photo smaller than 15 MB.'); return;
    }
    setBusy(true);
    const url = URL.createObjectURL(file); objectUrl.current = url;
    try {
      const image = new Image(); image.src = url; await image.decode();
      if (!alive.current) return;
      const scale = Math.min(1, 1000 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d');
      context.fillStyle = '#171723'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL('image/jpeg', .85);
      setPhotos(current => current.map((photo, i) => i === index ? data : photo));
      try { localStorage.setItem(`monisha-photo-${index}`, data); setStatus('Memory saved in this browser. Tap the photo to change it.'); }
      catch { setStatus('Photo added for this visit. Your browser could not save it.'); }
    } catch { if (alive.current) setStatus('That image could not be opened. Try another photo.'); }
    finally { URL.revokeObjectURL(url); objectUrl.current = null; if (alive.current) setBusy(false); }
  }
  function remove() {
    setPhotos(current => current.map((photo, i) => i === index ? null : photo));
    try { localStorage.removeItem(`monisha-photo-${index}`); setStatus('A fresh space for another little memory.'); }
    catch { setStatus('Photo removed for this visit. Browser storage is unavailable.'); }
    picker.current.focus();
  }
  return <div className="card-leaf photo-leaf"><span className="chapter">MY FAVOURITE LITTLE MEMORIES</span><div className="photo-frame">
    <button ref={picker} id="choose-photo" className="choose-photo" disabled={busy} onClick={() => input.current.click()} aria-label="Add or change this memory photo"><AnimatePresence mode="wait" initial={false}><motion.span key={`${index}-${!!photos[index]}`} className="photo-content" initial={{ opacity: 0, x: reduced ? 0 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduced ? 0 : -20 }} transition={{ duration: .25 }}>
      {photos[index] ? <img id="memory-photo" src={photos[index]} alt={`Monisha: ${captions[index]}`} /> : <span id="photo-placeholder"><span aria-hidden="true">♡</span>A little space<br />for your favourite photo<small>{busy ? 'Adding your memory…' : 'Tap to add a memory'}</small></span>}
    </motion.span></AnimatePresence></button>
    <input ref={input} id="photo-input" type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={upload} /><p id="photo-caption">{captions[index]}</p>
  </div><div className="photo-navigation"><button id="previous-photo" disabled={busy} onClick={() => setIndex((index + 2) % 3)} aria-label="Previous memory">←</button><span id="photo-count">0{index + 1} / 03</span><button id="next-photo" disabled={busy} onClick={() => setIndex((index + 1) % 3)} aria-label="Next memory">→</button></div>
    {photos[index] && <button className="quiet-button" id="remove-photo" disabled={busy} onClick={remove}>Remove this photo</button>}<p className="photo-status" id="photo-status" role="status">{status}</p><span className="pressed-flower" aria-hidden="true">❧</span>
  </div>;
}
