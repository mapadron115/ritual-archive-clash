'use strict';
// Ten more techniques from across the Ritual Archive library. Technique and art names follow the library; the fighters are original.
function selfCost(f, n) { f.hp = Math.max(1, f.hp - n); }
function inWord(f, o, range) { const dx = (o.x - f.x) * f.face; return dx > -20 && dx < range && o.st !== 'ko' && o.st !== 'down' && !o.inv && !(o.inf > 0); }
function say(S, f, txt) { ev(S, 'word', f.x + f.face * 60, f.y - 150, txt); }

// ---------- Blood Manipulation (Jujutsu Kaisen)
CH.push({ name: 'Mirela Voss', tech: 'Blood Manipulation', tag: 'Pays in health, hits hard', ip: 'Jujutsu Kaisen', hp: 1050, speed: 5.1, melee: 1, regen: 0.11, range: 260,
  passive: 'Punches and kicks heal you for a quarter of what they deal',
  look: { skin: '#f0d2c0', hair: '#f4f0f0', top: '#8f1026', pants: '#2a1218', accent: '#ff3355', style: 'bob' },
  mul: (S, f) => f.buff > 0 ? 1.25 : 1,
  dealt: (S, f, dmg, t, o) => { if (o.melee) f.hp = Math.min(CH[f.ch].hp, f.hp + dmg * 0.25); },
  arts: [
    { id: 'redscale', name: 'Flowing Red Scale', cost: 15, hp: 25, cd: 600, su: 8, re: 8, pose: 'sign', desc: 'Costs 25 health. For 6 s you move faster and every blow lands a quarter harder', ai: { min: 0, max: 900, p: .3 } },
    { id: 'bloodwheel', name: 'Slicing Exorcism', cost: 12, hp: 8, cd: 70, su: 10, re: 14, pose: 'throw', desc: 'Costs 8 health. A spinning wheel of blood flies across the stage. 75', ai: { min: 200, max: 900, p: .6 } },
    { id: 'piercing', name: 'Piercing Blood', cost: 30, hp: 30, cd: 260, su: 26, re: 24, pose: 'clap', desc: 'Costs 30 health. A line of blood across the whole stage. Jump it. 150', ai: { min: 150, max: 900, p: .5 } },
  ],
  dom: { kind: 'bloodsweep', name: 'Convergence', maximum: 1, desc: 'Maximum. Piercing Blood swept through everything in front of you: 240. Guarding takes most of it off' } });
ART.redscale = (S, f) => { f.buff = 360; ev(S, 'hum', f.x, f.y); };
ART.bloodwheel = (S, f) => { shoot(S, f, { k: 'orb', col: '#d4102e', spin: 1, vx: f.face * 16, vy: 0, r: 20, life: 80, dmg: 75, kb: 6, stun: 18 }); ev(S, 'slash', f.x + f.face * 60, f.y - 78); };
ART.piercing = (S, f, o) => {
  S.zones.push({ k: 'beam', o: f.i, x: f.x + f.face * 46, y: f.y - 74, face: f.face, t: 0, dur: 14, w: 18, col: '#d4102e' }); ev(S, 'beam', f.x, f.y - 74);
  if (beamHits(f, o, 50)) hit(S, f.i, o, f.x, { dmg: 150, kb: 12, stun: 26, chip: 0.25, guardDmg: 45 });
};
DOMAIN.bloodsweep = { dur: 70, tick(S, d, f, o) {
  d.hold = d.t < 66; if (d.t < 66) { f.st = 'cast'; f.vx *= 0.8; }
  if (d.t === 1) ev(S, 'charge', f.x, f.y - 74);
  if (d.t === 40) {
    S.zones.push({ k: 'beam', o: f.i, x: f.x + f.face * 46, y: f.y - 74, face: f.face, t: 0, dur: 24, w: 50, cone: 0.4, col: '#d4102e' }); ev(S, 'nuke', f.x, f.y - 74);
    if (beamHits(f, o, 70, 0.4)) hit(S, f.i, o, f.x, { dmg: 240, kb: 20, lift: 9, stun: 30, chip: 0.4, dom: 1, guardDmg: 0.01 });
  }
} };

// ---------- Cursed Speech (Jujutsu Kaisen)
CH.push({ name: 'Oren Hale', tech: 'Cursed Speech', tag: 'Words that cannot be guarded', ip: 'Jujutsu Kaisen', hp: 950, speed: 5.2, melee: 0.95, regen: 0.115, range: 300,
  passive: 'Every word goes through a guard, and strains your throat: it costs you health',
  look: { skin: '#e6c4a4', hair: '#d9d2c0', top: '#2f3b33', pants: '#1a201c', accent: '#9be37a', style: 'bob' },
  arts: [
    { id: 'dontmove', name: "Don't Move", cost: 20, cd: 300, su: 10, re: 16, pose: 'cast1', desc: 'Costs 12 health. A foe within 460 in front of you is frozen for 1 s', ai: { min: 60, max: 440, p: .5 } },
    { id: 'blastaway', name: 'Blast Away', cost: 25, cd: 200, su: 10, re: 18, pose: 'cast1', desc: 'Costs 18 health. A foe within 380 is hurled away. 85, +40 into a wall', ai: { min: 0, max: 360, p: .6 } },
    { id: 'crushed', name: 'Get Crushed', cost: 35, cd: 320, su: 14, re: 22, pose: 'cast1', desc: 'Costs 25 health. A foe within 300 is slammed into the ground. 130', ai: { min: 0, max: 280, p: .6 } },
  ],
  dom: { kind: 'megaphone', name: 'Resounding Voice', maximum: 1, desc: 'Maximum. Costs 40 health. "Explode", through a megaphone: everything in front of you takes 230. Guarding takes most of it off' } });
ART.dontmove = (S, f, o) => { selfCost(f, 12); say(S, f, "DON'T MOVE"); if (inWord(f, o, 460)) hit(S, f.i, o, f.x, { dmg: 5, shock: 60, unblock: 1, noCounter: 1 }); };
ART.blastaway = (S, f, o) => { selfCost(f, 18); say(S, f, 'BLAST AWAY'); if (inWord(f, o, 380)) hit(S, f.i, o, f.x, { dmg: 85, kb: 20, lift: 6, stun: 26, wall: 40, unblock: 1, noCounter: 1 }); };
ART.crushed = (S, f, o) => { selfCost(f, 25); say(S, f, 'GET CRUSHED'); if (inWord(f, o, 300)) { if (hit(S, f.i, o, f.x, { dmg: 130, stun: 20, unblock: 1, noCounter: 1 }) && o.st !== 'ko') { o.st = 'down'; o.stT = 40; o.vx = 0; o.vy = 12; ev(S, 'thud', o.x, GROUND); } } };
DOMAIN.megaphone = { dur: 60, tick(S, d, f, o) {
  d.hold = d.t < 56; if (d.t < 56) { f.st = 'cast'; f.vx = 0; }
  if (d.t === 24) { selfCost(f, 40); say(S, f, 'EXPLODE'); ev(S, 'nuke', o.x, o.y - 70); if ((o.x - f.x) * f.face > -30) { ev(S, 'boom', o.x, o.y - 70, 160); hit(S, f.i, o, f.x, { dmg: 230, kb: 16, lift: 10, stun: 30, chip: 0.4, anyGuard: 1, dom: 1, guardDmg: 0.01 }); } }
} };

// ---------- Straw Doll (Jujutsu Kaisen)
CH.push({ name: 'Nell Garrick', tech: 'Straw Doll', tag: 'Plant nails, then set them off', ip: 'Jujutsu Kaisen', hp: 1000, speed: 5.2, melee: 1, regen: 0.115, range: 340,
  passive: 'Nails that land stay in the foe (three at most) until you set them off',
  look: { skin: '#eac9a8', hair: '#b5652a', top: '#24304a', pants: '#161c2c', accent: '#ffa64d', style: 'top' },
  arts: [
    { id: 'nail', name: 'Nail Projectile', cost: 12, cd: 50, su: 9, re: 12, pose: 'throw', desc: 'Hammer two nails across the stage. 24 each, and each one that lands stays in', ai: { min: 150, max: 900, p: .7 } },
    { id: 'hairpin', name: 'Hairpin', cost: 20, cd: 160, su: 8, re: 14, pose: 'clap', desc: 'Set off every nail in the foe, wherever they stand, through a guard. 34 a nail', ai: { min: 0, max: 900, p: .7 } },
    { id: 'resonance', name: 'Resonance', cost: 35, cd: 360, su: 16, re: 20, pose: 'slash', desc: 'Strike the doll: a foe you wounded in the last 4 s takes 70 anywhere, through a guard, and loses 25 CE', ai: { min: 0, max: 900, p: .6 } },
  ],
  dom: { kind: 'effigy', name: 'Grand Effigy Rite', desc: 'Three nails driven in from nowhere, then the hammer falls. About 240; guarding takes most of it off' } });
ART.nail = (S, f) => { for (let n = 0; n < 2; n++) shoot(S, f, { k: 'nail', vx: f.face * 21, vy: -0.6 + n * 1.2, x: f.x + f.face * (50 - n * 26), y: f.y - 84 + n * 14, r: 9, life: 60, dmg: 24, kb: 2, stun: 13, nail: 1 }); ev(S, 'whoosh', f.x, f.y - 70); };
ART.hairpin_can = (S, f, o) => o.nails > 0;
ART.hairpin = (S, f, o) => { const n = o.nails; if (!n || o.st === 'ko') return; o.nails = 0; ev(S, 'boom', o.x, o.y - 70, 60 + n * 20); hit(S, f.i, o, o.x - o.face, { dmg: 34 * n, kb: 4, lift: 5 + n, stun: 20, unblock: 1, noCounter: 1 }); };
ART.resonance_can = (S, f, o) => S.t - o.hurtT < 240 || o.nails > 0;
ART.resonance = (S, f, o) => { ev(S, 'slash', f.x + f.face * 50, f.y - 40, 1); if (o.st === 'ko' || o.inf > 0) return; ev(S, 'zap', o.x, o.y - 70); if (hit(S, f.i, o, o.x - o.face, { dmg: 70, shock: 26, unblock: 1, noCounter: 1 })) o.ce = Math.max(0, o.ce - 25); };
DOMAIN.effigy = { dur: 80, tick(S, d, f, o) {
  d.hold = d.t < 76; if (d.t < 76) { f.st = 'cast'; f.vx = 0; }
  if (d.t === 10 || d.t === 24 || d.t === 38) { ev(S, 'rain', o.x, o.y - 70); hit(S, f.i, o, o.x - o.face, { dmg: 45, stun: 16, chip: 0.4, anyGuard: 1, dom: 1, guardDmg: 0.01 }); }
  if (d.t === 60) { ev(S, 'boom', o.x, o.y - 70, 150); hit(S, f.i, o, o.x - o.face, { dmg: 130, lift: 10, kb: 8, stun: 26, chip: 0.4, anyGuard: 1, dom: 1, guardDmg: 0.01 }); o.nails = 0; }
} };

// ---------- Golden Hour (Jujutsu Kaisen)
CH.push({ name: 'Lucan Pryce', tech: 'Golden Hour', tag: 'Stops time', ip: 'Jujutsu Kaisen', hp: 1000, speed: 5.3, melee: 1, regen: 0.115, range: 160,
  passive: 'Your blows on a foe held in stopped time land at 75%',
  look: { skin: '#d8b08c', hair: '#3a2a1a', top: '#f0c14b', pants: '#3a2f1a', accent: '#ffe07a', style: 'spiky' },
  mul: (S, f) => S.stop && S.stop.o === f.i ? 0.75 : 1,
  tick: (S, f) => { if (S.t % 10 === 0) { f.hist.push([f.x, f.hp]); if (f.hist.length > 18) f.hist.shift(); } },
  arts: [
    { id: 'goldenhour', name: 'Golden Hour', cost: 30, cd: 420, su: 6, re: 4, pose: 'sign', desc: 'Time stops for 1.1 s: the foe, their shots and their shikigami all hang still', ai: { min: 0, max: 260, p: .5 } },
    { id: 'knives', name: 'Suspended Volley', cost: 15, cd: 55, su: 9, re: 12, pose: 'throw', desc: 'Three thrown blades, 30 each', ai: { min: 180, max: 900, p: .6 } },
    { id: 'rewind', name: 'Samsara Rewind', cost: 40, cd: 900, su: 8, re: 10, pose: 'sign', desc: 'Go back to where you stood 3 s ago and take back up to 150 of the health you lost since', ai: { min: 0, max: 900, p: .25 } },
  ],
  dom: { kind: 'theworld', name: 'The World', desc: 'Time stops for 2.5 s. Your blows land at 75% while it lasts' } });
ART.goldenhour = (S, f) => { S.stop = { o: f.i, t: 66 }; ev(S, 'stop', f.x, f.y - 80); };
ART.knives = (S, f) => { for (let n = 0; n < 3; n++) shoot(S, f, { k: 'knife', vx: f.face * 18, vy: (n - 1) * 1.3, x: f.x + f.face * (40 + n * 8), y: f.y - 96 + n * 18, r: 9, life: 70, dmg: 30, kb: 2, stun: 12 }); ev(S, 'whoosh', f.x, f.y - 70); };
ART.rewind_can = (S, f) => f.hist.length > 6;
ART.rewind = (S, f) => { const h = f.hist[0]; ev(S, 'swap', f.x, f.y - 70, h[0], GROUND - 70); ev(S, 'stop', h[0], GROUND - 80); f.x = h[0]; f.y = GROUND; f.vy = 0; f.hp = Math.min(CH[f.ch].hp, Math.max(f.hp, Math.min(h[1], f.hp + 150))); f.hist = []; };
DOMAIN.theworld = { dur: 150, tick(S, d, f) { if (d.t === 1) { S.stop = { o: f.i, t: 150 }; ev(S, 'stop', f.x, f.y - 80); } } };

// ---------- Full Counter (The Seven Deadly Sins)
CH.push({ name: 'Rook Tavish', tech: 'Full Counter', tag: 'Sends every blow back', ip: 'The Seven Deadly Sins', hp: 1000, speed: 5.2, melee: 1.05, regen: 0.105, range: 120, res: { name: 'REVENGE', max: 300 },
  passive: 'Every wound you take is banked as Revenge',
  look: { skin: '#c9966e', hair: '#1f2a38', top: '#2f7a5a', pants: '#1c2a26', accent: '#7dffb0', style: 'long' },
  hurt: (S, f, dmg) => { f.res = Math.min(300, f.res + dmg); },
  arts: [
    { id: 'counter', name: 'Full Counter', cost: 15, cd: 90, su: 2, re: 30, pose: 'guard', desc: 'For 0.4 s any blow or shot that reaches you is sent back at its owner, 40% harder. Miss the timing and you stand open', ai: { min: 0, max: 0, p: 0 } },
    { id: 'vanish', name: 'Counter Vanish', cost: 20, cd: 300, su: 8, re: 12, pose: 'slash', desc: 'Unmake every shot, shikigami and lingering art of the foe, and whatever they stuck on you', ai: { min: 0, max: 0, p: 0 } },
    { id: 'revenge', name: 'Revenge Counter', cost: 25, cd: 240, su: 12, re: 22, pose: 'hook', desc: 'One close blow that spends all your Revenge: 50, plus half of what you banked (190 at most)', ai: { min: 0, max: 120, p: .5 } },
  ],
  dom: { kind: 'absolute', name: 'Absolute Counter', maximum: 1, desc: 'Maximum. For 5 s every blow that reaches you goes straight back at full strength. The foe should hold their fire' } });
ART.counter = (S, f) => { f.counter = 26; ev(S, 'inf', f.x, f.y - 70); };
ART.vanish = (S, f) => { let n = 0; for (const p of S.proj) if (p.o !== f.i) { p.life = 0; n++; ev(S, 'pop', p.x, p.y); } for (const e of S.ents) if (e.o !== f.i) { e.hp = 0; n++; } for (const z of S.zones) if (z.o !== f.i) { z.t = z.dur; n++; } S.proj = S.proj.filter(p => p.life > 0); f.nails = 0; f.gum = 0; f.ce = Math.min(MAXCE, f.ce + n * 5); ev(S, 'slash', f.x + f.face * 60, f.y - 78, 1); };
ART.revenge = (S, f, o) => { const d = Math.min(190, 50 + f.res * 0.5); f.vx = f.face * 14; ev(S, 'slash', f.x + f.face * 70, f.y - 78, 1); if (strike(S, f, o, 130, { dmg: d, kb: 14, lift: 7, stun: 26, guardDmg: 50 })) f.res = 0; };
DOMAIN.absolute = { dur: 300, tick(S, d, f) { if (d.t === 1) ev(S, 'hum', f.x, f.y); f.abs = 2; } };

// ---------- Explosion (My Hero Academia)
CH.push({ name: 'Dax Morrow', tech: 'Explosion', tag: 'Blasts that throw him around', ip: 'My Hero Academia', hp: 1000, speed: 5.3, melee: 1, regen: 0.115, range: 150, res: { name: 'SWEAT', max: 6 },
  passive: 'Sweat builds each second and when you are hit; your next blast burns all of it, 8% harder a point',
  look: { skin: '#e2b996', hair: '#3b2f2a', top: '#23252b', pants: '#1a1b20', accent: '#ff8a2a', style: 'top' },
  tick: (S, f) => { if (S.t % 60 === 0 && S.phase === 'fight') f.res = Math.min(6, f.res + 1); },
  hurt: (S, f) => { f.res = Math.min(6, f.res + 1); },
  arts: [
    { id: 'blast', name: 'Explosion', cost: 15, cd: 60, su: 8, re: 16, pose: 'cast1', desc: 'A point-blank blast that throws the foe and kicks you back. 70', ai: { min: 0, max: 150, p: .7 } },
    { id: 'blastdash', name: 'Blast Dash', cost: 10, cd: 50, su: 3, re: 4, air: 1, pose: 'cast1', desc: 'Blast yourself forward through the air. Works in mid-air too', ai: { min: 300, max: 900, p: .5 } },
    { id: 'apshot', name: 'AP Shot', cost: 25, cd: 150, su: 14, re: 18, pose: 'clap', desc: 'A blast squeezed into a thin line across the stage. 85, and a third of it goes through a guard', ai: { min: 200, max: 900, p: .6 } },
  ],
  dom: { kind: 'howitzer', name: 'Howitzer Impact', maximum: 1, desc: 'Maximum. Leap, spin, and dive on where the foe stood a moment ago: 250 in a wide blast. Guarding takes most of it off' } });
function sweat(f) { const k = 1 + f.res * 0.08; f.res = 0; return k; }
ART.blast = (S, f, o) => { const k = sweat(f); ev(S, 'boom', f.x + f.face * 90, f.y - 74, 70); strike(S, f, o, 150, { dmg: 70 * k, kb: 13, lift: 6, stun: 22, guardDmg: 40 }, 150); f.vx = -f.face * 7; };
ART.blastdash = (S, f) => { ev(S, 'boom', f.x - f.face * 30, f.y - 50, 40); f.vx = f.face * 15; f.vy = f.y >= GROUND ? -10 : -8; f.y = Math.min(f.y, GROUND - 1); f.st = 'jump'; f.move = null; };
ART.apshot = (S, f, o) => { const k = sweat(f); S.zones.push({ k: 'beam', o: f.i, x: f.x + f.face * 46, y: f.y - 74, face: f.face, t: 0, dur: 12, w: 12, col: '#ff8a2a' }); ev(S, 'beam', f.x, f.y - 74); if (beamHits(f, o, 44)) hit(S, f.i, o, f.x, { dmg: 85 * k, kb: 9, stun: 22, chip: 0.33 }); };
DOMAIN.howitzer = { dur: 60, tick(S, d, f, o) {
  d.hold = d.t < 56; if (d.t < 56) f.st = 'cast';
  if (d.t === 1) { f.vy = -24; f.vx = 0; f.y = GROUND - 1; f.inv = 50; ev(S, 'boom', f.x, GROUND, 60); }
  if (d.t === 20) { d.tx = clamp(o.x, LEFT, RIGHT); S.zones.push({ k: 'target', o: f.i, x: d.tx, y: GROUND, t: 0, dur: 26, r: 150 }); }
  if (d.t > 20 && d.t < 46) { f.x += (d.tx - f.x) * 0.2; f.vy = Math.max(f.vy, 0) + 1.2; }
  if (d.t === 46) { f.x = d.tx; f.y = GROUND; f.vy = 0; f.face = o.x >= f.x ? 1 : -1; f.res = 0; ev(S, 'nuke', f.x, GROUND - 40); ev(S, 'boom', f.x, GROUND - 40, 170); if (Math.abs(o.x - f.x) < 155 && o.y > GROUND - 190) hit(S, f.i, o, f.x, { dmg: 250, kb: 18, lift: 12, stun: 30, chip: 0.4, anyGuard: 1, dom: 1, guardDmg: 0.01 }); }
} };

// ---------- Bungee Gum (Hunter x Hunter)
CH.push({ name: 'Pim Larkspur', tech: 'Bungee Gum', tag: 'Sticks a strand on you, then pulls', ip: 'Hunter x Hunter', hp: 1000, speed: 5.3, melee: 1, regen: 0.115, range: 300,
  passive: 'A strand that touches the foe stays stuck for 5 s, even through a guard',
  look: { skin: '#f3dccb', hair: '#4a6fd8', top: '#f4f0f6', pants: '#3b2a4a', accent: '#ff7ac8', style: 'bob' },
  tick: (S, f, o) => {
    if (f.sling > 0) { f.sling--; const dx = o.x - f.x; f.face = sgn(dx); if (Math.abs(dx) > 80) { f.x += sgn(dx) * Math.min(28, Math.abs(dx) - 70); f.vy = 0; } else { f.sling = 0; o.gum = 0; hit(S, f.i, o, f.x, { dmg: 80, kb: 15, lift: 8, stun: 26, guardDmg: 45 }); } if (f.sling === 0 && f.st === 'atk') { f.st = f.y >= GROUND ? 'idle' : 'jump'; f.move = null; } }
  },
  arts: [
    { id: 'gum', name: 'Bungee Gum', cost: 10, cd: 60, su: 8, re: 12, pose: 'throw', desc: 'Flick a strand across the stage. 15, and it sticks, guard or no guard', ai: { min: 120, max: 900, p: .8 } },
    { id: 'contract', name: 'Contract', cost: 15, cd: 200, su: 6, re: 14, pose: 'sign', desc: 'Needs a strand on the foe. Snap it short: they are dragged to your feet, through a guard. 30', ai: { min: 150, max: 900, p: .7 } },
    { id: 'slingshot', name: 'Slingshot', cost: 25, cd: 200, su: 8, re: 18, pose: 'hook', desc: 'Needs a strand on the foe. Sling yourself along it into a flying blow. 80', ai: { min: 150, max: 900, p: .6 } },
  ],
  dom: { kind: 'web', name: 'Web of Strings', maximum: 1, desc: 'Maximum. Strands from every side slam the foe back and forth three times. About 200; guarding takes most of it off' } });
ART.gum = (S, f) => { shoot(S, f, { k: 'gum', vx: f.face * 21, vy: 0, r: 12, life: 46, dmg: 15, kb: 1, stun: 10, gum: 1 }); ev(S, 'whoosh', f.x, f.y - 70); };
ART.contract_can = (S, f, o) => o.gum > 0;
ART.contract = (S, f, o) => { if (!(o.gum > 0) || o.st === 'ko' || o.st === 'down') return; o.gum = 0; ev(S, 'summon', o.x, o.y - 60); if (hit(S, f.i, o, f.x, { dmg: 30, unblock: 1, stun: 30, noCounter: 1 }) && o.st !== 'ko') { o.grab = 12; o.grabX = clamp(f.x + f.face * 74, LEFT, RIGHT); o.st = 'stun'; o.stT = 26; o.vx = 0; } };
ART.slingshot_can = (S, f, o) => o.gum > 0;
ART.slingshot = (S, f) => { f.sling = 16; ev(S, 'whoosh', f.x, f.y - 70); };
DOMAIN.web = { dur: 84, tick(S, d, f, o) {
  d.hold = d.t < 80; if (d.t < 80) { f.st = 'cast'; f.vx = 0; }
  if (d.t === 14 || d.t === 38 || d.t === 62) { d.n++; const s = d.n % 2 ? 1 : -1; ev(S, 'slash', o.x, o.y - 70, 1); hit(S, f.i, o, o.x - s, { dmg: 80, kb: 22, lift: 13, stun: 26, chip: 0.4, anyGuard: 1, dom: 1, guardDmg: 0.01 }); }
} };

// ---------- Jajanken (Hunter x Hunter)
CH.push({ name: 'Finn Okoro', tech: 'Jajanken', tag: 'Charge the fist, call the hand', ip: 'Hunter x Hunter', hp: 1100, speed: 5.3, melee: 1.15, regen: 0.115, range: 110,
  look: { skin: '#9c6b4a', hair: '#20262e', top: '#2f8f7a', pants: '#2a2f33', accent: '#7fffd0', style: 'buzz' },
  arts: [
    { id: 'rock', name: 'Rock', cost: 15, cd: 90, su: 14, re: 20, hold: 75, pose: 'hook', desc: 'Hold the key to charge, up to three stages; let go to lunge. 80 / 120 / 160 / 200. You stand open while charging', ai: { min: 0, max: 220, p: .6, hold: 16 } },
    { id: 'paper', name: 'Paper', cost: 15, cd: 70, su: 10, re: 14, pose: 'cast1', desc: 'The same conviction, thrown across the stage. 72', ai: { min: 250, max: 900, p: .7 } },
    { id: 'scissors', name: 'Scissors', cost: 20, cd: 110, su: 9, re: 18, pose: 'slash', desc: 'A blade of aura with twice a punch\'s reach. 80', ai: { min: 110, max: 230, p: .7 } },
  ],
  dom: { kind: 'allout', name: 'Everything I Have', maximum: 1, desc: 'Maximum. One full-charge Rock that crosses half the stage: 300. Guarding takes most of it off. Your Cursed Energy empties after' } });
ART.rock = (S, f, o) => { const st = Math.min(3, Math.floor(f.chg / 25)); say(S, f, 'ROCK!'); f.vx = f.face * (14 + st * 4); f.x += f.face * 30; ev(S, 'boom', f.x + f.face * 80, f.y - 74, 40 + st * 30); strike(S, f, o, 150, { dmg: [80, 120, 160, 200][st], kb: 10 + st * 4, lift: 4 + st * 2, stun: 22 + st * 2, guardDmg: 40 + st * 25, melee: 1 }); };
ART.paper = (S, f) => { say(S, f, 'PAPER!'); shoot(S, f, { k: 'orb', col: '#7fffd0', vx: f.face * 15, vy: 0, r: 20, life: 80, dmg: 72, kb: 8, stun: 18 }); ev(S, 'blast', f.x, f.y - 78); };
ART.scissors = (S, f, o) => { say(S, f, 'SCISSORS!'); ev(S, 'slash', f.x + f.face * 120, f.y - 78, 1); strike(S, f, o, 205, { dmg: 80, kb: 8, stun: 20, chip: 0.3 }); };
DOMAIN.allout = { dur: 56, tick(S, d, f, o) {
  d.hold = d.t < 52; if (d.t < 52) f.st = 'cast';
  if (d.t === 1) { ev(S, 'charge', f.x, f.y - 74); f.armor = 1; }
  if (d.t === 24) say(S, f, 'ROCK!!');
  if (d.t >= 24 && d.t < 40 && !d.done) { const dx = (o.x - f.x) * f.face; if (dx > 110) f.x += f.face * Math.min(38, dx - 100); else { d.done = 1; f.armor = 0; ev(S, 'nuke', o.x, o.y - 70); ev(S, 'boom', o.x, o.y - 70, 150); if (dx > -40) hit(S, f.i, o, f.x, { dmg: 300, kb: 24, lift: 10, stun: 30, chip: 0.4, dom: 1, guardDmg: 0.01 }); f.ce = 0; } }
  if (d.t === 40) { f.armor = 0; if (!d.done) f.ce = 0; }
} };

// ---------- Judgement Cut (Devil May Cry)
CH.push({ name: 'Corvin Ashe', tech: 'Judgement Cut', tag: 'Cuts the place you are standing', ip: 'Devil May Cry', hp: 950, speed: 5.4, melee: 1.05, regen: 0.115, range: 330, res: { name: 'FOCUS', max: 10 },
  passive: 'Landing blows builds Concentration (each point sharpens Judgement Cut); being hit loses 2',
  look: { skin: '#e9d6c8', hair: '#15181f', top: '#1f5a66', pants: '#161a22', accent: '#6fe8ff', style: 'long' },
  dealt: (S, f) => { f.res = Math.min(10, f.res + 1); },
  hurt: (S, f) => { f.res = Math.max(0, f.res - 2); },
  arts: [
    { id: 'jcut', name: 'Judgement Cut', cost: 20, cd: 80, su: 8, re: 16, pose: 'slashw', desc: 'Space is cut where the foe stands, a moment later. Keep moving to slip it. 62, +3 a point of Concentration', ai: { min: 150, max: 900, p: .7 } },
    { id: 'trick', name: 'Trick', cost: 12, cd: 110, su: 4, re: 6, air: 1, pose: 'guard', desc: 'Step through space to the foe\'s back', ai: { min: 300, max: 900, p: .3 } },
    { id: 'rapid', name: 'Rapid Slash', cost: 22, cd: 150, su: 10, re: 16, pose: 'slash', desc: 'Dash a third of the stage, cutting whatever you pass through. 70', ai: { min: 80, max: 330, p: .6 } },
  ],
  dom: { kind: 'jce', name: 'Judgement Cut End', maximum: 1, desc: 'Maximum. Seven cuts through the whole stage at once. About 220; guarding takes most of it off' } });
ART.jcut = (S, f, o) => { S.zones.push({ k: 'mark', o: f.i, x: o.x, y: o.y - 70, t: 0, dur: 34, delay: 22, r: 85, dmg: 62 + f.res * 3 }); ev(S, 'hum', o.x, o.y - 70); };
ART.trick = (S, f, o) => { if (o.st === 'ko') return; const side = o.face; let nx = o.x - side * 64; if (nx < LEFT || nx > RIGHT) nx = o.x + side * 64; ev(S, 'swap', f.x, f.y - 70, nx, o.y - 70); f.x = nx; f.y = o.y; f.vy = 0; f.face = o.x >= f.x ? 1 : -1; f.st = f.y >= GROUND ? 'idle' : 'jump'; f.move = null; };
ART.rapid = (S, f, o) => { const x0 = f.x, nx = clamp(f.x + f.face * 360, LEFT, RIGHT); ev(S, 'dash', x0, f.y - 70, nx, f.y - 70); if ((o.x - x0) * f.face > -20 && (o.x - nx) * f.face < 40 && Math.abs(o.y - f.y) < 110) hit(S, f.i, o, x0, { dmg: 70, kb: 3, lift: 6, stun: 24, guardDmg: 35 }); f.x = nx; };
DOMAIN.jce = { dur: 72, tick(S, d, f, o) {
  d.hold = d.t < 68; if (d.t < 68) { f.st = 'cast'; f.vx = 0; }
  if (d.t % 8 === 0 && d.t <= 56) { ev(S, 'rain', o.x, o.y - 70); ev(S, 'cuts', 200 + (d.t * 131) % 880, 250 + (d.t * 53) % 300, 90); hit(S, f.i, o, o.x - o.face, { dmg: 32, stun: 7, chip: 0.4, anyGuard: 1, dom: 1, guardDmg: 0.01 }); }
} };

// ---------- Gamma Rage (Marvel)
CH.push({ name: 'Greta Holm', tech: 'Gamma Rage', tag: 'The more it hurts, the harder she hits', ip: 'Marvel', hp: 1100, speed: 4.6, melee: 1.05, regen: 0.1, range: 120, res: { name: 'RAGE', max: 10 },
  passive: 'Wounds build Rage: punches and kicks land 2% harder a point, and from Rage 5 you slowly heal',
  look: { skin: '#d6a98a', hair: '#5a3b2a', top: '#5b3f8a', pants: '#2a2338', accent: '#b8ff5a', style: 'buzz' },
  hurt: (S, f, dmg) => { f.res = Math.min(10, f.res + dmg / 45); },
  mul: (S, f, t, o) => (o.melee ? 1 + f.res * 0.02 : 1) * (f.big > 0 ? 1.2 : 1),
  tick: (S, f, o) => {
    if (f.res >= 5 && f.hp > 0 && S.phase === 'fight') f.hp = Math.min(CH[f.ch].hp, f.hp + 0.03);
    if (f.leap && f.y >= GROUND) { f.leap = 0; ev(S, 'boom', f.x, GROUND - 20, 130); if (Math.abs(o.x - f.x) < 140 && o.y > GROUND - 120) hit(S, f.i, o, f.x, { dmg: 75, kb: 10, lift: 9, stun: 24, guardDmg: 40 }); }
  },
  arts: [
    { id: 'thunderclap', name: 'Thunder Clap', cost: 18, cd: 110, su: 12, re: 16, pose: 'clap', desc: 'A shockwave from your palms, a third of the stage long. 75 and a long shove', ai: { min: 0, max: 280, p: .6 } },
    { id: 'hulkleap', name: 'Hulk Leap', cost: 22, cd: 180, su: 6, re: 6, pose: 'jump', desc: 'Leap onto where the foe stands; the landing bursts. 75', ai: { min: 250, max: 900, p: .7 } },
    { id: 'quake', name: 'Gamma Quake', cost: 35, cd: 300, su: 20, re: 22, pose: 'hook', desc: 'Strike the ground: a wave runs out both ways along it. Jump it. 80', ai: { min: 100, max: 700, p: .4 } },
  ],
  dom: { kind: 'worldbreaker', name: 'Worldbreaker', maximum: 1, desc: 'Maximum. For 7 s you are huge: everything you do lands 20% harder and blows under 70 do not make you flinch' } });
ART.thunderclap = (S, f) => { shoot(S, f, { k: 'wave', col: '#b8ff5a', vx: f.face * 13, vy: 0, r: 40, life: 22, dmg: 75, kb: 16, stun: 22, x: f.x + f.face * 60, y: f.y - 70 }); ev(S, 'clap', f.x + f.face * 30, f.y - 85); ev(S, 'blast', f.x, f.y - 78); };
ART.hulkleap = (S, f, o) => { f.vx = clamp((o.x - f.x) / 41, -15, 15); f.vy = -19; f.y = GROUND - 1; f.st = 'jump'; f.move = null; f.leap = 1; ev(S, 'jump', f.x, GROUND); };
ART.quake = (S, f) => { for (const s of [-1, 1]) shoot(S, f, { k: 'wave', col: '#c9a26b', ground: 1, vx: s * 12, vy: 0, r: 26, life: 50, dmg: 80, kb: 6, lift: 10, stun: 24, x: f.x + s * 40, y: GROUND - 26 }); ev(S, 'boom', f.x + f.face * 40, GROUND - 10, 80); ev(S, 'thud', f.x, GROUND); };
DOMAIN.worldbreaker = { dur: 420, tick(S, d, f, o) {
  if (d.t === 1) { f.big = 420; f.res = 10; ev(S, 'boom', f.x, f.y - 70, 200); if (Math.abs(o.x - f.x) < 260) hit(S, f.i, o, f.x, { dmg: 60, kb: 20, lift: 6, stun: 22, chip: 0.4, dom: 1, guardDmg: 0.01 }); }
} };
