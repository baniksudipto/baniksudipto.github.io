const canvas = document.getElementById('playfield');
const ctx = canvas.getContext('2d', { alpha: true });

let W = 0, H = 0;

const controls = {
    gravity: document.getElementById('gravity'),
    drag: document.getElementById('drag'),
    startPause: document.getElementById('startPause'),
    reset: document.getElementById('reset'),
    speed: document.getElementById('speed'),
    score: document.getElementById('score'),
    combo: document.getElementById('combo'),
    high: document.getElementById('high')
  };

  // == State ================================================================
  const state = {
    ball: { x: 0, y: 0, r: 20, vx: 0, vy: 0, mass: 1 },
    running: false,
    totalTime: 0,
    lastFrame: null,
    obstacles: [],
    powerUps: [],
    particles: [],
    score: 0,
    combo: 1,
    lastCollectTime: 0,
    powerUpActive: null,
    audioCtx: null
  };

  const config = {
    obstacle: { minR: 10, maxR: 30, minPoints: 1, maxPoints: 8, lifetime: 8 },
    comboResetTime: 1.5, // seconds
    wasdAcc: 700, // px/s^2
    restitution: 0.9
  };

  // == Utilities ============================================================
  function nowSeconds(){ return performance.now() / 1000; }
  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function getControlValue(el, scale = 1){ return (el ? parseFloat(el.value) : 0) * scale; }

  // == Canvas sizing (DPR-aware) ===========================================
  function resizeCanvas(){
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    W = rect.width; H = rect.height;
    canvas.width = Math.max(1, Math.floor(W * dpr));
    canvas.height = Math.max(1, Math.floor(H * dpr));
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // adapt ball radius and clamp position
    const b = state.ball;
    b.r = Math.max(12, Math.min(40, Math.round(Math.min(W, H) * 0.035)));
    b.x = clamp(b.x || W * 0.5, b.r, Math.max(b.r, W - b.r));
    b.y = clamp(b.y || H * 0.25, b.r, Math.max(b.r, H - b.r));
  }
  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();

  // initialize UI from storage
  if(controls.combo) controls.combo.textContent = state.combo;
  if(controls.high) controls.high.textContent = localStorage.getItem('phy-high') || 0;

  // == Audio & Effects =====================================================
  function ensureAudio(){ if(!state.audioCtx) state.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
  function playCollectSound(){
    try{
      ensureAudio();
      const ctxA = state.audioCtx; const o = ctxA.createOscillator(); const g = ctxA.createGain();
      o.type = 'sine'; o.frequency.value = 420 + Math.random() * 180;
      g.gain.value = 0.001; o.connect(g); g.connect(ctxA.destination);
      o.start(); g.gain.exponentialRampToValueAtTime(0.15, ctxA.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctxA.currentTime + 0.18);
      o.stop(ctxA.currentTime + 0.2);
    }catch(e){ /* ignore audio errors */ }
  }

  function spawnParticles(x, y, color, amount = 12){
    for(let i = 0; i < amount; i++){
      const ang = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 140;
      state.particles.push({ x, y, vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed, life: 0.6 + Math.random() * 0.6, col: color });
    }
  }

  function updateParticles(dt){
    for(let i = state.particles.length - 1; i >= 0; i--){
      const p = state.particles[i]; p.vy += 300 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      if(p.life <= 0) state.particles.splice(i, 1);
    }
  }

  function drawParticles(){
    for(const p of state.particles){ ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(1, Math.min(4, p.life * 3)), 0, Math.PI * 2); ctx.fillStyle = p.col; ctx.fill(); }
  }

  // == Obstacles & Power-ups ===============================================
  function scheduleNextObstacle(){
    if(!state.running) return; // only schedule while running
    const interval = 1200 + Math.random() * 3000;
    if(state._obsTimer) clearTimeout(state._obsTimer);
    state._obsTimer = setTimeout(spawnObstacle, interval);
  }

  function spawnObstacle(){
    const r = Math.random() * (config.obstacle.maxR - config.obstacle.minR) + config.obstacle.minR;
    let x, y, attempts = 0;
    do{ x = Math.random() * (W - 2 * r) + r; y = Math.random() * (H - 2 * r) + r; attempts++; }
    while(Math.hypot(x - state.ball.x, y - state.ball.y) < (state.ball.r + r + 40) && attempts < 20);

    const moving = Math.random() < 0.35;
    const baseX = x, baseY = y; const amp = moving ? (20 + Math.random() * 60) : 0; const freq = moving ? (0.8 + Math.random() * 1.6) : 0;
    const axis = moving ? (Math.random() < 0.5 ? 'x' : 'y') : null;
    const pointsBase = Math.ceil(Math.random() * (config.obstacle.maxPoints - config.obstacle.minPoints) + config.obstacle.minPoints);
    const points = moving ? Math.ceil(pointsBase * 1.8) : pointsBase;
    state.obstacles.push({ x, y, r, points, ttl: config.obstacle.lifetime, moving, baseX, baseY, amp, freq, axis, phase: Math.random() * Math.PI * 2 });
    scheduleNextObstacle();
  }

  function updateObstacles(dt){
    for(let i = state.obstacles.length - 1; i >= 0; i--){
      const o = state.obstacles[i]; if(o.moving){ if(o.axis === 'x') o.x = o.baseX + Math.sin(state.totalTime * o.freq + o.phase) * o.amp; else o.y = o.baseY + Math.sin(state.totalTime * o.freq + o.phase) * o.amp; }
      o.ttl -= dt; if(o.ttl <= 0){ state.obstacles.splice(i, 1); continue; }

      const dist = Math.hypot(o.x - state.ball.x, o.y - state.ball.y);
      if(dist <= (o.r + state.ball.r)){
        // combo logic
        const tNow = nowSeconds(); if(tNow - state.lastCollectTime <= config.comboResetTime) state.combo = Math.min(8, state.combo + 1); else state.combo = 1;
        state.lastCollectTime = tNow; const earned = Math.round(o.points * state.combo); state.score += earned;
        if(controls.score) controls.score.textContent = state.score; if(controls.combo) controls.combo.textContent = state.combo;
        spawnParticles(o.x, o.y, 'rgba(255,200,80,0.95)', 16); playCollectSound(); state.ball.vx *= -0.35; state.ball.vy *= -0.35;
        state.obstacles.splice(i, 1);
        const prevHigh = parseInt(localStorage.getItem('phy-high') || '0', 10); if(state.score > prevHigh){ localStorage.setItem('phy-high', String(state.score)); if(controls.high) controls.high.textContent = state.score; }
      }
    }
  }

  // Power-ups
  function scheduleNextPower(){
    if(!state.running) return; // only schedule while running
    const interval = 7000 + Math.random() * 10000;
    if(state._powerTimer) clearTimeout(state._powerTimer);
    state._powerTimer = setTimeout(spawnPowerUp, interval);
  }
  function spawnPowerUp(){ const types = ['magnet', 'speed']; const type = types[Math.random() < 0.6 ? 0 : 1]; const r = 12 + Math.random() * 14; let x, y, a = 0; do{ x = Math.random() * (W - 2 * r) + r; y = Math.random() * (H - 2 * r) + r; a++; }while(Math.hypot(x - state.ball.x, y - state.ball.y) < state.ball.r + r + 80 && a < 20); state.powerUps.push({ x, y, r, type, ttl: 10 }); scheduleNextPower(); }

  function updatePowerUps(dt){
    for(let i = state.powerUps.length - 1; i >= 0; i--){
      const p = state.powerUps[i]; p.ttl -= dt; if(p.ttl <= 0){ state.powerUps.splice(i, 1); continue; }
      const dist = Math.hypot(p.x - state.ball.x, p.y - state.ball.y);
      if(dist <= p.r + state.ball.r){ state.powerUpActive = { type: p.type, timeLeft: 6 }; spawnParticles(p.x, p.y, p.type === 'magnet' ? 'rgba(120,190,255,0.95)' : 'rgba(160,255,160,0.95)', 20); playCollectSound(); state.powerUps.splice(i, 1); }
    }

    if(state.powerUpActive){ state.powerUpActive.timeLeft -= dt; if(state.powerUpActive.timeLeft <= 0) state.powerUpActive = null; }
    if(state.powerUpActive && state.powerUpActive.type === 'magnet'){
      const magnetRadius = 120; for(let j = state.obstacles.length - 1; j >= 0; j--){ const o = state.obstacles[j]; const d = Math.hypot(o.x - state.ball.x, o.y - state.ball.y); if(d <= magnetRadius){ const tNow = nowSeconds(); if(tNow - state.lastCollectTime <= config.comboResetTime) state.combo = Math.min(8, state.combo + 1); else state.combo = 1; state.lastCollectTime = tNow; const earned = Math.round(o.points * state.combo); state.score += earned; if(controls.score) controls.score.textContent = state.score; if(controls.combo) controls.combo.textContent = state.combo; spawnParticles(o.x, o.y, 'rgba(255,200,80,0.95)', 10); playCollectSound(); state.obstacles.splice(j, 1); } }
      const prevHigh = parseInt(localStorage.getItem('phy-high') || '0', 10); if(state.score > prevHigh){ localStorage.setItem('phy-high', String(state.score)); if(controls.high) controls.high.textContent = state.score; }
    }
  }

  // == Physics step ========================================================
  function stepPhysics(dt, keys){
    const b = state.ball;
    // WASD control acceleration
    const acc = config.wasdAcc; if(keys['KeyW']) b.vy -= acc * dt; if(keys['KeyS']) b.vy += acc * dt; if(keys['KeyA']) b.vx -= acc * dt; if(keys['KeyD']) b.vx += acc * dt;

    const g = getControlValue(controls.gravity, 1);
    const dragCoef = getControlValue(controls.drag, 0.01);
    const restitution = config.restitution;
    b.vy += g * dt; b.vx -= b.vx * dragCoef * dt; b.vy -= b.vy * dragCoef * dt;
    b.x += b.vx * dt; b.y += b.vy * dt;

    // wall collisions
    if(b.x - b.r < 0){ b.x = b.r; b.vx = -b.vx * restitution; } else if(b.x + b.r > W){ b.x = W - b.r; b.vx = -b.vx * restitution; }
    if(b.y - b.r < 0){ b.y = b.r; b.vy = -b.vy * restitution; } else if(b.y + b.r > H){ b.y = H - b.r; b.vy = -b.vy * restitution; if(Math.abs(b.vy) < 8) b.vy = 0; }
  }

  // == Rendering ===========================================================
  function draw(){
    ctx.clearRect(0, 0, W, H);
    // grid
    const grid = Math.max(24, Math.round(Math.min(W, H) / 20));
    ctx.save(); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(11,42,58,0.06)'; ctx.globalAlpha = 0.9;
    for(let x = 0; x <= W; x += grid){ ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); ctx.stroke(); }
    for(let y = 0; y <= H; y += grid){ ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke(); }
    ctx.restore();

    // subtle ground
    const grd = ctx.createLinearGradient(0, H * 0.6, 0, H); grd.addColorStop(0, 'rgba(0,0,0,0.02)'); grd.addColorStop(1, 'rgba(0,0,0,0.06)'); ctx.fillStyle = grd; ctx.fillRect(0, H * 0.6, W, H * 0.4);

    // shadow
    const shadowY = Math.min(H, state.ball.y + state.ball.r * 0.6); ctx.beginPath(); ctx.ellipse(state.ball.x, shadowY + state.ball.r * 0.55, state.ball.r * 0.9, state.ball.r * 0.45, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(2,10,20,0.25)'; ctx.fill();

    // obstacles
    for(const o of state.obstacles){ ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,165,80,0.95)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(160,80,20,0.9)'; ctx.stroke(); ctx.fillStyle = '#08212b'; ctx.font = Math.max(10, Math.round(o.r * 0.6)) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.points, o.x, o.y); }

    // power-ups
    for(const p of state.powerUps){ ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = p.type === 'magnet' ? 'rgba(120,190,255,0.95)' : 'rgba(160,255,160,0.95)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(30,80,80,0.6)'; ctx.stroke(); ctx.fillStyle = '#04232b'; ctx.font = Math.max(10, Math.round(p.r * 0.6)) + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.type === 'magnet' ? 'M' : 'S', p.x, p.y); }

    // ball
    const b = state.ball; const grad = ctx.createRadialGradient(b.x - b.r * 0.4, b.y - b.r * 0.5, b.r * 0.1, b.x, b.y, b.r); grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.2, '#d6f6ff'); grad.addColorStop(1, '#5aa6d8'); ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill(); ctx.lineWidth = Math.max(1, b.r * 0.06); ctx.strokeStyle = 'rgba(12,44,65,0.6)'; ctx.stroke(); ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + b.vx * 0.12, b.y + b.vy * 0.12); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 2; ctx.stroke();

    // UI numbers
    if(controls.speed) controls.speed.textContent = Math.round(Math.hypot(b.vx, b.vy));

    // particles and aura
    drawParticles(); if(state.powerUpActive && state.powerUpActive.type === 'magnet'){ ctx.beginPath(); ctx.arc(b.x, b.y, 120, 0, Math.PI * 2); ctx.fillStyle = 'rgba(120,190,255,0.06)'; ctx.fill(); }
  }

  // == Main loop ===========================================================
  function frame(ts){ if(!state.lastFrame) state.lastFrame = ts; const dt = Math.min(0.05, (ts - state.lastFrame) / 1000); state.lastFrame = ts; state.totalTime += dt; if(state.running) stepPhysics(dt, keysPressed); updateObstacles(dt); updateParticles(dt); updatePowerUps(dt); draw(); requestAnimationFrame(frame); }
  requestAnimationFrame(frame);

  // == Controls & Input ===================================================
  controls.startPause.addEventListener('click', ()=>{
    state.running = !state.running;
    controls.startPause.textContent = state.running ? 'Pause' : 'Start';
    if(state.running){
      // begin spawning when started
      scheduleNextObstacle();
      scheduleNextPower();
    }else{
      // stop future spawns while paused
      if(state._obsTimer) { clearTimeout(state._obsTimer); state._obsTimer = null; }
      if(state._powerTimer) { clearTimeout(state._powerTimer); state._powerTimer = null; }
    }
  });
  controls.reset.addEventListener('click', ()=>{
    state.running = false; controls.startPause.textContent = 'Start';
    state.ball.x = W * 0.5; state.ball.y = H * 0.25;
    state.ball.vx = 0; state.ball.vy = 0;
    // clear game entities and timers
    state.obstacles.length = 0; state.powerUps.length = 0; state.particles.length = 0;
    if(state._obsTimer){ clearTimeout(state._obsTimer); state._obsTimer = null; }
    if(state._powerTimer){ clearTimeout(state._powerTimer); state._powerTimer = null; }
    state.score = 0; state.combo = 1; state.lastCollectTime = 0; state.powerUpActive = null;
    if(controls.score) controls.score.textContent = 0; if(controls.combo) controls.combo.textContent = state.combo;
  });
  // initial velocity controls removed

  // pointer drag launch
  let dragging = false, dragStart = null;
  canvas.addEventListener('pointerdown', (e)=>{ const r = canvas.getBoundingClientRect(); const cx = e.clientX - r.left, cy = e.clientY - r.top; const dist = Math.hypot(cx - state.ball.x, cy - state.ball.y); if(dist <= state.ball.r * 1.2){ dragging = true; dragStart = { x: cx, y: cy }; canvas.setPointerCapture(e.pointerId); state.running = false; controls.startPause.textContent = 'Start'; } });
  canvas.addEventListener('pointermove', (e)=>{ if(!dragging) return; const r = canvas.getBoundingClientRect(); state.ball.x = e.clientX - r.left; state.ball.y = e.clientY - r.top; });
  canvas.addEventListener('pointerup', (e)=>{ if(!dragging) return; dragging = false; canvas.releasePointerCapture(e.pointerId); const r = canvas.getBoundingClientRect(); const cx = e.clientX - r.left, cy = e.clientY - r.top; const dx = cx - (dragStart ? dragStart.x : cx), dy = cy - (dragStart ? dragStart.y : cy); state.ball.vx = dx * 8; state.ball.vy = dy * 8; dragStart = null; });

  // WASD handling
  const keysPressed = {}; window.addEventListener('keydown', (e)=>{ if(['KeyW','KeyA','KeyS','KeyD'].includes(e.code)) keysPressed[e.code] = true; if(e.code === 'Space'){ e.preventDefault(); state.running = !state.running; controls.startPause.textContent = state.running ? 'Pause' : 'Start'; } if(e.key === 'r' || e.key === 'R') controls.reset.click(); });
  window.addEventListener('keyup', (e)=>{ if(['KeyW','KeyA','KeyS','KeyD'].includes(e.code)) keysPressed[e.code] = false; });

  // spawners start when player clicks Start
