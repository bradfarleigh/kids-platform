function launchConfetti(duration = 3500) {
  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position: 'fixed', top: 0, left: 0,
    width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: 999,
  });
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const COLORS = ['#FF6B6B','#4ECDC4','#FFE66D','#6BCB77','#A78BFA','#FB923C','#F9A8D4','#7DD3FC'];

  const particles = Array.from({ length: 130 }, () => ({
    x:  Math.random() * canvas.width,
    y:  -20 - Math.random() * 120,
    vx: (Math.random() - .5) * 6,
    vy: Math.random() * 4 + 2,
    w:  Math.random() * 12 + 6,
    h:  Math.random() * 7  + 4,
    r:  Math.random() * Math.PI * 2,
    dr: (Math.random() - .5) * .28,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));

  let t0 = null;

  function draw(ts) {
    if (!t0) t0 = ts;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.vy += .06; p.r += p.dr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (ts - t0 < duration) requestAnimationFrame(draw);
    else canvas.remove();
  }

  requestAnimationFrame(draw);
}
