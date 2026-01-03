const { step } = require('../js/physics-core');

test('step applies gravity and integrates position', ()=>{
  const body = { x:0, y:0, vx:0, vy:0, r:5 };
  const out = step(body, 1, { gravity: 10, drag:0, restitution:1 });
  expect(out.vy).toBeCloseTo(10);
  expect(out.y).toBeCloseTo(10);
});

test('step bounces on floor', ()=>{
  const body = { x:50, y:95, vx:0, vy:30, r:10 };
  const out = step(body, 1, { gravity:0, drag:0, restitution:0.5, bounds:{width:100,height:100} });
  // should reflect vy
  expect(out.y).toBeLessThanOrEqual(90);
  expect(out.vy).toBeLessThan(0);
});
