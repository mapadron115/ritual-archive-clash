// Run: node tests/feel.cjs. No dependencies or browser required.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.join(__dirname, '..');
const context = vm.createContext({ console, assert });
const load = n => fs.readFileSync(path.join(root, 'src', n + '.js'), 'utf8');
vm.runInContext(['sim', 'fighters', 'fighters2', 'ai'].map(load).join('\n'), context);
vm.runInContext(`
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('PASS', name); }
function fight() { const S = newMatch(0, 1, 12345); S.phase = 'fight'; return S; }
function ticks(S, n, a = 0, b = 0) { for (let i = 0; i < n; i++) { step(S, [a, b]); S.ev.length = 0; } }
test('press/release in hit-stop preserves punch and freezes buffer age', () => {
  const S = fight(); S.hitstop = 20; const f = S.f[0];
  step(S, [BTN.P, 0]); ticks(S, 19); assert.equal(f.bufT, INPUT_BUFFER);
  step(S, [0, 0]); assert.equal(f.move, 'p1'); assert.equal(f.buf, 0);
  ticks(S, 40); assert.equal(f.move, null);
});
test('freeze preserves jump and time-stopped opponent preserves input', () => {
  const S = fight(); S.freeze = 30; step(S, [BTN.U, 0]); ticks(S, 29);
  step(S, [0, 0]); assert.equal(S.f[0].st, 'jump'); assert(S.f[0].vy < 0);
  const T = fight(); T.stop = {o: 1, t: 20}; step(T, [BTN.P, 0]); ticks(T, 19);
  assert.equal(T.f[0].bufT, INPUT_BUFFER); step(T, [0, 0]); assert.equal(T.f[0].move, 'p1');
});
test('jump buffers through recovery and before landing; held jump does not repeat', () => {
  const S = fight(); const f = S.f[0]; startMove(f, 'k'); f.mt = 27;
  step(S, [BTN.U, 0]); ticks(S, 3); assert.equal(f.st, 'jump');
  ticks(S, 65, BTN.U); assert.equal(f.st, 'idle');
  const T = fight(); T.f[0].y = GROUND - 2; T.f[0].vy = 3; T.f[0].st = 'jump';
  step(T, [BTN.U, 0]); step(T, [0, 0]); assert.equal(T.f[0].st, 'jump'); assert(T.f[0].vy < 0);
});
test('old commands expire and transitions reset buffers', () => {
  const S = fight(); S.f[0].st = 'stun'; S.f[0].stT = 30;
  step(S, [BTN.P, 0]); ticks(S, 40); assert.equal(S.f[0].move, null);
  S.f[0].buf = BTN.P; S.f[0].bufT = 9; newRound(S); assert.equal(S.f[0].buf, 0);
});
test('held punch never auto-repeats; explicit new press works while previous hold is set', () => {
  const S = fight(); ticks(S, 35, BTN.P); assert.equal(S.f[0].move, null);
  step(S, [BTN.P | (BTN.P << INPUT_SHIFT), 0]); assert.equal(S.f[0].move, 'p1');
});
test('three separate punch presses chain across hit-stop', () => {
  const S = fight(); S.seed = 1000; const f = S.f[0]; S.f[1].x = f.x + 75;
  step(S, [BTN.P, 0]); ticks(S, 4); assert(S.hitstop > 0);
  step(S, [0, 0]); step(S, [BTN.P, 0]);
  for (let i = 0; i < 15 && f.move !== 'p2'; i++) step(S, [0, 0]);
  assert.equal(f.move, 'p2'); step(S, [BTN.P, 0]);
  for (let i = 0; i < 20 && f.move !== 'p3'; i++) step(S, [0, 0]);
  assert.equal(f.move, 'p3');
});
function impact(attacker, defense, setup = () => {}) {
  const S = newMatch(0, 0, 12345); S.phase = 'fight'; S.f[0].x = 500; S.f[1].x = 580;
  const f = S.f[attacker], o = S.f[1 - attacker]; startMove(f, 'p1'); f.mt = BASIC.p1.su - 1;
  setup(o); const inputs = [0, 0]; inputs[o.i] = defense; step(S, inputs);
  return {S, o, damage: maxHp(o) - o.hp};
}
test('same-tick guard blocks identical damage from both player slots', () => {
  const a = impact(0, BTN.G), b = impact(1, BTN.G);
  assert.equal(a.damage, 4.7999999999999545); assert.equal(a.damage, b.damage);
  assert(a.S.ev.some(e => e.k === 'block')); assert(b.S.ev.some(e => e.k === 'block'));
});
test('released guard loses protection in both slots; attack retains priority', () => {
  for (const i of [0, 1]) {
    assert(impact(i, 0, o => o.st = 'guard').damage > 20);
    assert(impact(i, BTN.G | BTN.P).damage > 20);
  }
});
test('guard cannot cancel attack/hitstun or defend in air/backwards', () => {
  for (const setup of [o => startMove(o, 'k'), o => {o.st = 'hit'; o.stT = 20;},
    o => {o.y -= 20; o.st = 'jump';}, o => {o.dis = 10; o.face *= -1;}]) {
    for (const i of [0, 1]) assert(impact(i, BTN.G, setup).damage > 20);
  }
});
test('AI response waits 10 active ticks; freeze and repeated reads buy no reaction time', () => {
  const originalRandom = Math.random; Math.random = () => 0.01;
  try {
    const S = fight(); S.f[0].cd[2] = 20; S.f[0].x = 600; S.f[1].x = 400; startMove(S.f[1], 'a2');
    AI_MEM[0] = {until: 1000, b: 0};
    assert.equal(aiInput(S, 0), 0); const due = AI_MEM[0].reactAt;
    assert.equal(due, 11); aiInput(S, 0); assert.equal(AI_MEM[0].clock, 1);
    S.hitstop = 20; for (let n = 0; n < 20; n++) { S.t++; assert.equal(aiInput(S, 0), 0); }
    assert.equal(AI_MEM[0].clock, 1); S.hitstop = 0;
    for (let n = 0; n < 9; n++) { S.t++; assert.equal(aiInput(S, 0), 0); }
    S.t++; assert(aiInput(S, 0) & BTN.G);
    S.f[1].st = 'idle'; S.t++; aiInput(S, 0); assert.equal(AI_MEM[0].gt, 0);
  } finally { Math.random = originalRandom; }
});
test('buffered state survives JSON transport deterministically', () => {
  const S = fight(); S.freeze = 12; step(S, [BTN.P << INPUT_SHIFT, 0]);
  const T = JSON.parse(JSON.stringify(S));
  for (let n = 0; n < 40; n++) { step(S, [0, 0]); step(T, [0, 0]); }
  assert.equal(JSON.stringify(S), JSON.stringify(T));
});
console.log(passed + ' simulation regression groups passed');
`, context);

// Actual menu/input code in a small DOM shell: validate the event-to-step contract.
const events = {};
const uiContext = vm.createContext({ console, assert, setTimeout, requestAnimationFrame() {},
  window: {}, document: { getElementById() { return { getContext() { return {}; } }; }, querySelectorAll() { return []; } },
  addEventListener(name, fn) { events[name] = fn; } });
// Runtime integration covers the canvas/menu boot; this shell isolates input handlers.
vm.runInContext(load('sim') + '\n' + load('main').split('// ---------- boot')[0], uiContext);
uiContext.events = events;
vm.runInContext(`
G.running = true;
const key = (code, repeat = false) => ({code, repeat, preventDefault() {}});
events.keydown(key('KeyJ')); events.keyup(key('KeyJ'));
assert.equal(readKeys(BIND.solo), BTN.P << INPUT_SHIFT); assert.equal(readKeys(BIND.solo), 0);
events.keydown(key('KeyJ')); readKeys(BIND.solo); events.keydown(key('KeyJ', true));
assert.equal(readKeys(BIND.solo), BTN.P);
events.keydown(key('Comma')); events.keyup(key('Comma'));
assert.equal(readKeys(BIND.p1) & (BTN.P << INPUT_SHIFT), 0);
assert.equal(readKeys(BIND.p2), BTN.P << INPUT_SHIFT);
events.blur(); assert.equal(readKeys(BIND.solo), 0);
G.remoteIn = BTN.A1; G.remoteTap = BTN.A1;
assert.equal(readRemote(), BTN.A1 | (BTN.A1 << INPUT_SHIFT)); assert.equal(readRemote(), BTN.A1);
console.log('PASS keyboard taps, repeat suppression, local bindings, blur, remote edge consumption');
`, uiContext);
