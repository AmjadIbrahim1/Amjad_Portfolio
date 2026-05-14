/**
 * cat.js
 * قطة صغيرة بهيكل جسمي كامل (رأس + جسم + أيدي + رجلين + ذيل)
 * بتجري ورا الـ cursor
 */
(function () {
  const canvas = document.getElementById('cat-canvas');
  const ctx    = canvas.getContext('2d');
  const hint   = document.getElementById('hint');

  // ── Canvas resize ──────────────────────────────────────────────
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ── State ───────────────────────────────────────────────────────
  let mouseX = window.innerWidth  / 2;
  let mouseY = window.innerHeight / 2;

  let catX = mouseX - 200;
  let catY = mouseY;

  let velX = 0;
  let velY = 0;

  let angle    = 0;   // direction cat faces (radians)
  let walkCycle = 0;  // 0‥2π
  let speed    = 0;
  let idleTime = 0;
  let blinkT   = 0;
  let tailWag  = 0;   // extra wag when idle

  // hide hint after first move
  let moved = false;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!moved) { moved = true; hint.classList.add('hidden'); }
  });

  // ── Colour palette (Green & Yellow) ────────────────────────────
  const C = {
    body:    '#339933',   // green
    bodyDark:'#267326',   // dark green
    belly:   '#F7DF1E',   // yellow
    nose:    '#cc7700',   // amber
    eye:     '#1a2e1a',   // dark green-black
    outline: '#1e5c1e',   // deep green
    paw:     '#4db34d',   // mid green
    whisker: 'rgba(247,223,30,0.7)',  // yellow whiskers
    tail:    '#4db34d',   // mid green
    tailTip: '#F7DF1E',   // yellow tail tip
  };

  // ── Drawing helpers ─────────────────────────────────────────────

  /** Rounded rect */
  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /** Draw the whole cat centred at (0,0), facing right by default.
   *  The caller sets ctx transform (translate + rotate) before calling. */
  function drawCat(walk, blink, tailAngle, running) {
    const s = 1; // scale — tweak here if needed

    // ── TAIL (drawn first so it's behind body) ──────────────────
    ctx.save();
    ctx.strokeStyle = C.tail;
    ctx.lineWidth   = 5 * s;
    ctx.lineCap     = 'round';
    // tail root is at back of body (-16, 4)
    // wag based on tailAngle
    const tx1 = -16 * s, ty1 = 4 * s;
    const cp1x = (-28 + Math.cos(tailAngle) * 10) * s;
    const cp1y = (14  + Math.sin(tailAngle) * 10) * s;
    const tx2  = (-22 + Math.cos(tailAngle) * 14) * s;
    const ty2  = (-10 + Math.sin(tailAngle) * 18) * s;

    ctx.beginPath();
    ctx.moveTo(tx1, ty1);
    ctx.bezierCurveTo(cp1x, cp1y, tx2 - 4, ty2 + 4, tx2, ty2);
    ctx.stroke();
    // tail tip
    ctx.fillStyle = C.tailTip;
    ctx.beginPath();
    ctx.arc(tx2, ty2, 4 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ── BACK LEGS ────────────────────────────────────────────────
    const rLegSwing = Math.sin(walk) * 12;
    // right back leg
    ctx.save();
    ctx.strokeStyle = C.bodyDark;
    ctx.lineWidth = 5 * s;
    ctx.lineCap   = 'round';
    ctx.beginPath();
    ctx.moveTo(-8 * s, 10 * s);
    ctx.lineTo((-8 + rLegSwing) * s, 24 * s);
    ctx.stroke();
    // paw
    ctx.fillStyle = C.paw;
    ctx.beginPath();
    ctx.ellipse((-8 + rLegSwing) * s, 26 * s, 5 * s, 3.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // left back leg
    ctx.save();
    ctx.strokeStyle = C.bodyDark;
    ctx.lineWidth = 5 * s;
    ctx.lineCap   = 'round';
    ctx.beginPath();
    ctx.moveTo(-4 * s, 10 * s);
    ctx.lineTo((-4 - rLegSwing) * s, 24 * s);
    ctx.stroke();
    ctx.fillStyle = C.paw;
    ctx.beginPath();
    ctx.ellipse((-4 - rLegSwing) * s, 26 * s, 5 * s, 3.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ── BODY ─────────────────────────────────────────────────────
    ctx.fillStyle = C.body;
    ctx.strokeStyle = C.outline;
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.ellipse(0, 6 * s, 16 * s, 12 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // belly patch
    ctx.fillStyle = C.belly;
    ctx.beginPath();
    ctx.ellipse(2 * s, 8 * s, 9 * s, 7 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── FRONT ARMS ───────────────────────────────────────────────
    const armSwing = Math.sin(walk + Math.PI) * 10;

    // right arm
    ctx.save();
    ctx.strokeStyle = C.body;
    ctx.lineWidth = 5 * s;
    ctx.lineCap   = 'round';
    ctx.beginPath();
    ctx.moveTo(10 * s, 2 * s);
    ctx.lineTo((16 + armSwing) * s, 14 * s);
    ctx.stroke();
    ctx.fillStyle = C.paw;
    ctx.beginPath();
    ctx.ellipse((16 + armSwing) * s, 17 * s, 5 * s, 3.5 * s, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // left arm
    ctx.save();
    ctx.strokeStyle = C.body;
    ctx.lineWidth = 5 * s;
    ctx.lineCap   = 'round';
    ctx.beginPath();
    ctx.moveTo(8 * s, 2 * s);
    ctx.lineTo((12 - armSwing) * s, 14 * s);
    ctx.stroke();
    ctx.fillStyle = C.paw;
    ctx.beginPath();
    ctx.ellipse((12 - armSwing) * s, 17 * s, 5 * s, 3.5 * s, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ── HEAD ─────────────────────────────────────────────────────
    // slight head bob when running
    const headBob = running ? Math.sin(walk * 2) * 2 : 0;

    // Ear left
    ctx.fillStyle   = C.body;
    ctx.strokeStyle = C.outline;
    ctx.lineWidth   = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(3 * s, (-16 + headBob) * s);
    ctx.lineTo(-2 * s, (-26 + headBob) * s);
    ctx.lineTo(10 * s, (-22 + headBob) * s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // inner ear
    ctx.fillStyle = C.belly;
    ctx.beginPath();
    ctx.moveTo(4 * s, (-17 + headBob) * s);
    ctx.lineTo(0 * s, (-23 + headBob) * s);
    ctx.lineTo(9 * s, (-20 + headBob) * s);
    ctx.closePath();
    ctx.fill();

    // Ear right
    ctx.fillStyle   = C.body;
    ctx.strokeStyle = C.outline;
    ctx.lineWidth   = 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(18 * s, (-16 + headBob) * s);
    ctx.lineTo(23 * s, (-26 + headBob) * s);
    ctx.lineTo(10 * s, (-22 + headBob) * s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // inner ear
    ctx.fillStyle = C.belly;
    ctx.beginPath();
    ctx.moveTo(17 * s, (-17 + headBob) * s);
    ctx.lineTo(21 * s, (-23 + headBob) * s);
    ctx.lineTo(11 * s, (-20 + headBob) * s);
    ctx.closePath();
    ctx.fill();

    // Head circle
    ctx.fillStyle   = C.body;
    ctx.strokeStyle = C.outline;
    ctx.lineWidth   = 1.5 * s;
    ctx.beginPath();
    ctx.arc(10 * s, (-10 + headBob) * s, 14 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cheek blush
    ctx.fillStyle = 'rgba(247,223,30,0.25)';
    ctx.beginPath();
    ctx.ellipse(4 * s,  (-7 + headBob) * s, 5 * s, 3 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(16 * s, (-7 + headBob) * s, 5 * s, 3 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    const eyeH = blink ? 0.8 : 8;
    // left eye
    ctx.fillStyle = C.eye;
    ctx.beginPath();
    ctx.ellipse(6 * s, (-11 + headBob) * s, 4 * s, eyeH * 0.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // right eye
    ctx.beginPath();
    ctx.ellipse(14 * s, (-11 + headBob) * s, 4 * s, eyeH * 0.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    // eye shine
    if (!blink) {
      ctx.fillStyle = '#F7DF1E';
      ctx.beginPath();
      ctx.arc(7.5 * s, (-12.5 + headBob) * s, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(15.5 * s, (-12.5 + headBob) * s, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // Nose
    ctx.fillStyle = C.nose;
    ctx.beginPath();
    ctx.moveTo(10 * s, (-5 + headBob) * s);
    ctx.lineTo(8 * s,  (-3 + headBob) * s);
    ctx.lineTo(12 * s, (-3 + headBob) * s);
    ctx.closePath();
    ctx.fill();

    // Mouth
    ctx.strokeStyle = C.outline;
    ctx.lineWidth   = 1.2 * s;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(8 * s,  (-3 + headBob) * s);
    ctx.quadraticCurveTo(7 * s, (0 + headBob) * s, 5 * s, (-1 + headBob) * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(12 * s, (-3 + headBob) * s);
    ctx.quadraticCurveTo(13 * s, (0 + headBob) * s, 15 * s, (-1 + headBob) * s);
    ctx.stroke();

    // Whiskers
    ctx.strokeStyle = C.whisker;
    ctx.lineWidth   = 1 * s;
    // left whiskers
    ctx.beginPath(); ctx.moveTo(9 * s, (-4 + headBob) * s); ctx.lineTo(-4 * s, (-5 + headBob) * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(9 * s, (-3 + headBob) * s); ctx.lineTo(-4 * s, (-1 + headBob) * s); ctx.stroke();
    // right whiskers
    ctx.beginPath(); ctx.moveTo(11 * s, (-4 + headBob) * s); ctx.lineTo(24 * s, (-5 + headBob) * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(11 * s, (-3 + headBob) * s); ctx.lineTo(24 * s, (-1 + headBob) * s); ctx.stroke();
  }

  // ── Main loop ───────────────────────────────────────────────────
  let last = performance.now();

  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    // Physics: cat chases mouse
    const dx = mouseX - catX;
    const dy = mouseY - catY;
    const dist = Math.hypot(dx, dy);

    // only move when far enough
    const STOP_DIST = 28;

    if (dist > STOP_DIST) {
      idleTime = 0;
      const accel   = 900;
      const friction = 8;
      velX += (dx / dist) * accel * dt;
      velY += (dy / dist) * accel * dt;
      velX -= velX * friction * dt;
      velY -= velY * friction * dt;

      // cap speed
      const maxSpeed = 340;
      const vLen = Math.hypot(velX, velY);
      if (vLen > maxSpeed) { velX = (velX / vLen) * maxSpeed; velY = (velY / vLen) * maxSpeed; }

      catX += velX * dt;
      catY += velY * dt;

      angle = Math.atan2(velY, velX);
      speed = vLen;
    } else {
      velX *= 0.85;
      velY *= 0.85;
      speed = Math.hypot(velX, velY);
      idleTime += dt;
    }

    // Walk cycle speed scales with movement speed
    walkCycle += (speed / 80) * dt * Math.PI * 2 * 3;

    // Blink
    blinkT += dt;
    const blink = (blinkT % 4) > 3.85; // blink every ~4s, lasts 0.15s
    if (blinkT > 4.2) blinkT = 0;

    // Tail wag when idle
    if (idleTime > 0.5) {
      tailWag += dt * 3;
    }
    const tailAngle = (speed > 20)
      ? Math.sin(walkCycle) * 0.6                     // wag while running
      : Math.sin(tailWag) * 0.8;                       // slow wag idle

    // ── Render ──────────────────────────────────────────────────
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // translate to cat pos, rotate to face direction
    // the cat drawing origin is roughly (10, -10) = chest/center
    ctx.translate(catX, catY);
    ctx.rotate(angle - Math.PI / 2);   // SVG cat faces up → rotate -90° then add direction

    const running = speed > 60;
    drawCat(walkCycle, blink, tailAngle, running);

    ctx.restore();

    // paw prints (optional: could add later)
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();