const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const ctx = vm.createContext({ console, assert });
vm.runInContext(['sim', 'fighters', 'fighters2', 'ai'].map(n => fs.readFileSync(path.join(root, 'src', n + '.js'), 'utf8')).join('\n'), ctx);
vm.runInContext(`
let randomSeed = 8473;
Math.random = () => { randomSeed = (randomSeed * 1664525 + 1013904223) >>> 0; return randomSeed / 4294967296; };
function finite(value) {
  if (typeof value === 'number') assert(Number.isFinite(value));
  else if (value && typeof value === 'object') for (const v of Object.values(value)) finite(v);
}
let arts = 0, domains = 0, matches = 0, totalTicks = 0;
for (let ch = 0; ch < CH.length; ch++) {
  for (let slot = 0; slot < 2; slot++) {
    for (let n = 0; n < 3; n++) {
      const S = newMatch(ch, ch, 1000 + ch); S.phase = 'fight';
      const f = S.f[slot], o = S.f[1-slot]; f.ce = 100;
      f.x = slot ? 620 : 500; o.x = slot ? 500 : 620;
      o.nails = 3; o.gum = 300; o.hurtT = 0; f.hist = Array.from({length: 10}, () => [f.x, f.hp]);
      const inputs = [0,0]; inputs[slot] = BTN['A'+(n+1)]; step(S, inputs);
      assert.equal(f.move, 'a'+n, CH[ch].tech + ': art ' + n);
      for(let t = 0; t < 180; t++) { step(S, [0,0]); S.ev.length = 0; }
      finite(S); arts++;
    }
    const S = newMatch(ch, ch, 1000+ch); S.phase = 'fight'; S.f[slot].gauge = 100;
    const inputs = [0,0]; inputs[slot] = BTN.DOM; step(S, inputs); assert.equal(S.f[slot].domUsed,1);
    for(let t = 0; t < 650; t++) { step(S,[0,0]); S.ev.length = 0; }
    finite(S); domains++;
  }
}
for (let a = 0; a < CH.length; a++) for (let b = 0; b < CH.length; b++) {
  const S = newMatch(a,b,1000+a*31+b); AI_MEM[0] = {}; AI_MEM[1] = {};
  let ticks = 0;
  while (S.phase !== 'over' && ticks < 24000) {
    step(S,[aiInput(S,0),aiInput(S,1)]); S.ev.length = 0;
    if (ticks % 120 === 0) finite(S); ticks++;
  }
  assert.equal(S.phase, 'over', CH[a].tech + ' vs ' + CH[b].tech);
  finite(S); totalTicks += ticks; matches++;
}
console.log(JSON.stringify({arts,domains,matches,totalTicks,status:'passed'}));
`, ctx);
