// Small physics core that is pure and testable.
function step(body, dt, opts){
  const g = opts.gravity || 0;
  const drag = opts.drag || 0;
  const restitution = opts.restitution || 1;

  // gravity
  body.vy += g * dt;

  // drag
  body.vx -= body.vx * drag * dt;
  body.vy -= body.vy * drag * dt;

  // integrate
  body.x += body.vx * dt;
  body.y += body.vy * dt;

  // bounds
  if(opts.bounds){
    const W = opts.bounds.width; const H = opts.bounds.height;
    if(body.x - body.r < 0){ body.x = body.r; body.vx = -body.vx * restitution; }
    if(body.x + body.r > W){ body.x = W - body.r; body.vx = -body.vx * restitution; }
    if(body.y - body.r < 0){ body.y = body.r; body.vy = -body.vy * restitution; }
    if(body.y + body.r > H){ body.y = H - body.r; body.vy = -body.vy * restitution; }
  }
  return body;
}

module.exports = { step };
