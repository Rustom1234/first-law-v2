/** First-visit nudge for touch users: there is no visible scrollbar, so on load we show a
 * brief "swipe to explore" hint that loops a few times and then fades. Dismissed permanently
 * the moment the user actually interacts (touch, wheel, or scroll), and never shown again
 * this session. Self-contained, purely decorative: owns its own element, no scroll state. */
export class SwipeHint {
  private el: HTMLElement | null = null;
  private dismissed = false;

  constructor() {
    const isTouch = window.matchMedia?.('(pointer: coarse)').matches ?? false;
    if (!isTouch) return;

    const hint = document.createElement('div');
    hint.className = 'swipe-hint';
    hint.setAttribute('aria-hidden', 'true');

    const track = document.createElement('div');
    track.className = 'swipe-hint__track';
    const dot = document.createElement('div');
    dot.className = 'swipe-hint__dot';
    track.appendChild(dot);
    hint.appendChild(track);

    const label = document.createElement('p');
    label.className = 'swipe-hint__label';
    label.textContent = 'Swipe to explore';
    hint.appendChild(label);

    document.body.appendChild(hint);
    this.el = hint;

    const dismiss = (): void => {
      if (this.dismissed || !this.el) return;
      this.dismissed = true;
      this.el.classList.add('swipe-hint--dismissed');
      const node = this.el;
      window.setTimeout(() => node.remove(), 500);
      window.removeEventListener('touchstart', dismiss);
      window.removeEventListener('wheel', dismiss);
      window.removeEventListener('scroll', dismiss);
    };

    window.addEventListener('touchstart', dismiss, { once: true, passive: true });
    window.addEventListener('wheel', dismiss, { once: true, passive: true });
    window.addEventListener('scroll', dismiss, { once: true, passive: true });
  }
}
