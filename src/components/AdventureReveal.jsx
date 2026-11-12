export default function AdventureReveal({ reduced, onSkip }) {
  return <div className={`adventure-reveal ${reduced ? 'reveal-reduced' : ''}`} id="adventure-reveal" aria-label="Opening your birthday adventure">
    <div className="reveal-veil" aria-hidden="true" />
    <div className="reveal-curtain reveal-curtain-left" aria-hidden="true" />
    <div className="reveal-curtain reveal-curtain-right" aria-hidden="true" />
    <div className="reveal-light" aria-hidden="true" />
    <div className="reveal-title" role="status"><span>JUST FOR YOU, MONISHA</span><p>A little magic<br /><em>is about to unfold.</em></p><span className="reveal-heart" aria-hidden="true">♡</span></div>
    <button className="reveal-skip" onClick={onSkip} autoFocus>Skip intro <span aria-hidden="true">↗</span></button>
  </div>;
}
