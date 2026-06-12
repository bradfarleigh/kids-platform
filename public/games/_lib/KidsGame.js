/**
 * KidsGame — base class for all kids games.
 *
 * QUICK START
 * ───────────
 *   class MyGame extends KidsGame {
 *     init()  { /* build DOM, attach events *\/ }
 *     start() { /* reset state, begin play  *\/ }
 *   }
 *   document.addEventListener('DOMContentLoaded', () => {
 *     const g = new MyGame({ name: 'My Game' });
 *     g.init();
 *   });
 *
 * CALL FROM YOUR GAME
 * ───────────────────
 *   this.sound('pop'|'correct'|'wrong'|'cheer'|'click')
 *   this.correct(el?)          green flash + correct sound
 *   this.wrong(el?)            shake + wrong sound
 *   this.celebrate()           confetti burst (no overlay)
 *   this.showWin(stars, cb)    win overlay — cb called with 'again'|'home'
 *   this.showLose(msg, cb)     lose overlay — cb called with 'again'|'home'
 *   this.home()                navigate to /games/
 */
class KidsGame {
  constructor(config = {}) {
    this.name    = config.name    ?? 'Game';
    this.backUrl = config.backUrl ?? '../';
    this._ac     = null;
  }

  // ── Override in subclass ─────────────────────────────────────────
  init()  {}
  start() {}

  // ── Navigation ───────────────────────────────────────────────────
  home() { window.location.href = this.backUrl; }

  // ── Audio ────────────────────────────────────────────────────────
  sound(name) {
    const ctx = this._ctx();
    if (!ctx) return;
    (KidsGame._SFX[name] ?? KidsGame._SFX.click)(ctx);
  }

  // ── Feedback ─────────────────────────────────────────────────────
  correct(el) {
    this.sound('correct');
    if (el) this._flash(el, '#6BCB77');
  }

  wrong(el) {
    this.sound('wrong');
    if (el) this._shake(el);
  }

  celebrate() {
    this.sound('cheer');
    if (typeof launchConfetti === 'function') launchConfetti();
  }

  // ── Overlays ─────────────────────────────────────────────────────
  showWin(stars = 3, onAction) {
    this.celebrate();
    const msgs = ['You did it! 🎉', 'Great job! 🌟', 'Amazing! 🏆'];
    this._overlay({
      emoji: '⭐'.repeat(Math.min(stars, 3)),
      title: msgs[Math.min(stars, 3) - 1],
      primary:   { label: 'Play Again 🔄', cb: () => onAction?.('again') },
      secondary: { label: '🏠 Home',       cb: () => { onAction?.('home'); this.home(); } },
    });
  }

  showLose(message = "Don't give up! 💪", onAction) {
    this.sound('wrong');
    this._overlay({
      emoji: '💪',
      title: message,
      primary:   { label: 'Try Again 🔄', cb: () => onAction?.('again') },
      secondary: { label: '🏠 Home',      cb: () => { onAction?.('home'); this.home(); } },
    });
  }

  // ── Private ──────────────────────────────────────────────────────
  _ctx() {
    if (!this._ac) {
      try { this._ac = new (window.AudioContext || window.webkitAudioContext)(); }
      catch { return null; }
    }
    if (this._ac.state === 'suspended') this._ac.resume();
    return this._ac;
  }

  _flash(el, color) {
    const was = el.style.backgroundColor;
    el.style.transition = 'background-color .15s';
    el.style.backgroundColor = color;
    setTimeout(() => { el.style.transition = ''; el.style.backgroundColor = was; }, 380);
  }

  _shake(el) {
    el.classList.remove('kg-shake');
    void el.offsetWidth;
    el.classList.add('kg-shake');
    el.addEventListener('animationend', () => el.classList.remove('kg-shake'), { once: true });
  }

  _overlay({ emoji, title, primary, secondary }) {
    document.querySelector('.kg-overlay')?.remove();
    const d = document.createElement('div');
    d.className = 'kg-overlay';
    d.innerHTML = `
      <div class="kg-overlay-card">
        <div class="kg-overlay-emoji">${emoji}</div>
        <h2 class="kg-overlay-title">${title}</h2>
        <button class="btn btn-primary" id="_kgo-p">${primary.label}</button>
        <button class="btn btn-secondary" id="_kgo-s" style="margin-top:12px">${secondary.label}</button>
      </div>`;
    d.querySelector('#_kgo-p').onclick = () => { d.remove(); primary.cb(); };
    d.querySelector('#_kgo-s').onclick = () => { d.remove(); secondary.cb(); };
    document.body.appendChild(d);
  }

  // ── Sound definitions (Web Audio API — no files needed) ──────────
  static _SFX = {
    correct(ctx) {
      KidsGame._tone(ctx, 523.25, 0,    .12, 'sine');
      KidsGame._tone(ctx, 659.25, .10,  .15, 'sine');
    },
    wrong(ctx) {
      KidsGame._tone(ctx, 300, 0, .18, 'sawtooth', 200);
    },
    pop(ctx) {
      KidsGame._tone(ctx, 900, 0, .06, 'sine', 700);
    },
    cheer(ctx) {
      [523, 659, 784, 1047].forEach((f, i) =>
        KidsGame._tone(ctx, f, i * .11, .12, 'sine'));
    },
    click(ctx) {
      KidsGame._tone(ctx, 650, 0, .04, 'sine');
    },
  };

  static _tone(ctx, freq, delay, dur, type = 'sine', freqEnd) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.type = type;
    const t = ctx.currentTime + delay;
    o.frequency.setValueAtTime(freq, t);
    if (freqEnd != null) o.frequency.linearRampToValueAtTime(freqEnd, t + dur);
    g.gain.setValueAtTime(.28, t);
    g.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.start(t);
    o.stop(t + dur + .02);
  }
}
