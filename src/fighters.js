'use strict';
// The five fighters. Technique and art names follow the Ritual Archive library; the fighters themselves are original.
const CH = [
  { name: 'Isolde Varn', tech: 'Limitless', tag: 'Controls space', hp: 1000, speed: 5.2, melee: 1, regen: 0.115,
    look: { skin: '#f1d3bd', hair: '#e9f2ff', top: '#1c2440', pants: '#141a2e', accent: '#59c8ff', style: 'long' },
    arts: [
      { id: 'blue', name: 'Lapse Blue', cost: 20, cd: 150, su: 12, re: 18, pose: 'cast1', desc: 'An orb ahead of you drags the foe in, then bursts. 85' },
      { id: 'red', name: 'Reversal Red', cost: 28, cd: 140, su: 12, re: 20, pose: 'cast1', desc: 'A short-range blast that hurls the foe away. 100, +45 into a wall' },
      { id: 'infinity', name: 'Infinity', cost: 30, cd: 420, su: 3, re: 5, pose: 'guard', desc: 'For 1.8 s nothing reaches you. You move slower; attacking ends it' },
    ],
    dom: { kind: 'void', name: 'Unlimited Void', desc: 'The foe is frozen for 1.6 s and takes 100. Your blows on them are weaker meanwhile' } },
  { name: 'Karasu Dain', tech: 'Shrine', tag: 'Cuts near and far', hp: 1000, speed: 5, melee: 1, regen: 0.11,
    look: { skin: '#d9a98a', hair: '#2a1418', top: '#7a1620', pants: '#1d1114', accent: '#ff4b4b', style: 'spiky' },
    arts: [
      { id: 'dismantle', name: 'Dismantle', cost: 12, cd: 34, su: 9, re: 14, pose: 'slash', desc: 'A fast flying cut across the stage. 50' },
      { id: 'cleave', name: 'Cleave', cost: 25, cd: 150, su: 16, re: 22, pose: 'slash', desc: 'A close cut that goes through a guard and breaks it. 95',
        melee: { at: 16, reach: 125, dmg: 95, kb: 9, stun: 24, unblock: 1 } },
      { id: 'flame', name: 'Divine Flame: Open', cost: 40, cd: 300, su: 34, re: 22, pose: 'bow', desc: 'A slow fire arrow that explodes. 140' },
    ],
    dom: { kind: 'shrine', name: 'Malevolent Shrine', desc: 'Cuts rain on the whole stage for 3 s. Up to 240; guarding takes most of it off' } },
  { name: 'Bram Otieno', tech: 'Boogie Woogie', tag: 'Swaps places on a clap', hp: 1000, speed: 5.4, melee: 1.05, regen: 0.105,
    look: { skin: '#8a5a3c', hair: '#1a1a1a', top: '#e9b23a', pants: '#2a2f3a', accent: '#ffd866', style: 'top' },
    arts: [
      { id: 'boogie', name: 'Boogie Woogie', cost: 10, cd: 40, su: 3, re: 8, air: 1, pose: 'clap', desc: 'Clap: swap places with the foe. Their shots in between become yours' },
      { id: 'stone', name: 'Imbued Stone', cost: 15, cd: 60, su: 8, re: 12, pose: 'throw', desc: 'Throw a bouncing stone (30). Press again to swap places with it' },
      { id: 'applause', name: 'Round of Applause', cost: 28, cd: 180, su: 6, re: 22, pose: 'clap', desc: 'Clap behind the foe and strike from their blind side. 95',
        melee: { at: 13, reach: 110, dmg: 95, kb: 12, lift: 6, stun: 24 } },
    ],
    dom: { kind: 'ovation', name: 'Standing Ovation', desc: 'Six claps, six blows from both sides. Up to 230; guarding takes most of it off' } },
  { name: 'Yuna Sable', tech: 'Ten Shadows', tag: 'Shikigami fight beside you', hp: 950, speed: 5.1, melee: 0.9, regen: 0.12,
    look: { skin: '#e8c7a8', hair: '#17131f', top: '#2b2440', pants: '#17131f', accent: '#a47bff', style: 'bob' },
    arts: [
      { id: 'dogs', name: 'Divine Dogs', cost: 22, cd: 300, su: 12, re: 14, pose: 'sign', desc: 'Two hounds run the foe down and bite (26 each, 4 bites). A blow dispels them' },
      { id: 'nue', name: 'Nue', cost: 25, cd: 240, su: 12, re: 16, pose: 'sign', desc: 'A winged shikigami dives on the foe. 55 and a shock that stuns' },
      { id: 'toad', name: 'Toad', cost: 20, cd: 200, su: 12, re: 26, pose: 'sign', desc: 'A tongue drags the foe to you, through a guard. 20' },
    ],
    dom: { kind: 'garden', name: 'Chimera Shadow Garden', desc: '7 s of shadow: the foe is slowed and drained (about 100), your shikigami are free and return fast' } },
  { name: 'Gideon Krail', tech: 'Cursed Cannon', tag: 'Raw long-range output', hp: 1100, speed: 4.3, melee: 1.05, regen: 0.115,
    look: { skin: '#c99b7a', hair: '#c7c2b8', top: '#3d4a3a', pants: '#252a24', accent: '#ffb347', style: 'buzz' },
    arts: [
      { id: 'granite', name: 'Granite Blast', cost: 22, cd: 80, su: 18, re: 26, pose: 'cannon', desc: 'A beam across the whole stage. Jump it. 115' },
      { id: 'grape', name: 'Grape Shot', cost: 25, cd: 130, su: 12, re: 20, pose: 'cannon', desc: 'Five pellets fanned upward, 30 each (three at most land)' },
      { id: 'guided', name: 'Guided Shell', cost: 30, cd: 300, su: 16, re: 20, pose: 'cannon', desc: 'A slow shell that follows the foe. 85' },
    ],
    dom: { kind: 'nuclear', name: 'Nuclear Shell', maximum: 1, desc: 'Maximum. Charge 1.2 s without flinching, then a huge cone: 290. Get behind him' } },
];

function shoot(S, f, p) { p.o = f.i; p.t = 0; if (p.x === undefined) p.x = f.x + f.face * 50; if (p.y === undefined) p.y = f.y - 78; S.proj.push(p); return p; }

// ---------- Limitless
ART.blue = (S, f) => { S.zones.push({ k: 'blue', o: f.i, x: clamp(f.x + f.face * 300, LEFT + 40, RIGHT - 40), y: GROUND - 85, t: 0, dur: 60 }); ev(S, 'hum', f.x, f.y); };
ART.red = (S, f) => { shoot(S, f, { k: 'red', vx: f.face * 17, vy: 0, r: 26, life: 26, dmg: 100, kb: 19, lift: 5, stun: 26, wall: 45, chip: 0.2 }); ev(S, 'blast', f.x, f.y - 78); };
ART.infinity = (S, f) => { f.inf = 108; ev(S, 'hum', f.x, f.y); };
DOMAIN.void = { dur: 100, tick(S, d, f, o) {
  if (d.t === 1) { o.st = 'stun'; o.stT = 100; o.voided = 100; o.move = null; o.vx = 0; o.inf = 0; }
  if (d.t % 10 === 0) { rawDmg(S, o, 10); ev(S, 'tick', o.x, o.y - 80); }
} };

// ---------- Shrine
ART.dismantle = (S, f) => { shoot(S, f, { k: 'cut', vx: f.face * 24, vy: 0, r: 18, life: 60, dmg: 50, kb: 3, stun: 13 }); ev(S, 'slash', f.x + f.face * 60, f.y - 78); };
ART.cleave = (S, f) => { ev(S, 'slash', f.x + f.face * 70, f.y - 78, 1); };
ART.flame = (S, f) => { shoot(S, f, { k: 'flame', vx: f.face * 13, vy: 0, r: 22, life: 120, explode: { r: 130, dmg: 140, kb: 12, lift: 9, stun: 26, chip: 0.25 } }); ev(S, 'blast', f.x, f.y - 78); };
DOMAIN.shrine = { dur: 192, tick(S, d, f, o) {
  if (d.t % 16 === 0) { ev(S, 'rain', o.x, o.y - 70); hit(S, f.i, o, o.x - o.face, { dmg: 20, stun: 7, chip: 0.4, anyGuard: 1, dom: 1, guardDmg: 0.01 }); }
} };

// ---------- Boogie Woogie
function swapPlaces(S, f, o) {
  const x = f.x, y = f.y; ev(S, 'swap', f.x, f.y - 70, o.x, o.y - 70);
  for (const p of S.proj) if (p.o === o.i && p.x > Math.min(f.x, o.x) - 20 && p.x < Math.max(f.x, o.x) + 20) p.o = f.i;
  f.x = o.x; f.y = o.y; o.x = x; o.y = y;
  if (f.y < GROUND) f.air = f.air; if (o.y < GROUND && o.st !== 'hit') o.st = free(o) ? 'jump' : o.st;
  f.face = o.x >= f.x ? 1 : -1; o.dis = 16;
}
ART.boogie = (S, f, o) => {
  ev(S, 'clap', f.x + f.face * 20, f.y - 85);
  if (o.st === 'ko' || o.st === 'down' || o.inf > 0) { if (o.inf > 0) ev(S, 'inf', o.x, o.y - 70); return; }
  swapPlaces(S, f, o);
  if (f.y < GROUND) { f.st = 'jump'; f.move = null; }
};
ART.stone = (S, f) => { shoot(S, f, { k: 'stone', vx: f.face * 9, vy: -9, grav: 0.6, r: 14, life: 170, dmg: 30, kb: 3, stun: 14 }); ev(S, 'whoosh', f.x, f.y - 70); };
ART.stone_re = (S, f) => {
  const p = S.proj.find(q => q.k === 'stone' && q.o === f.i); if (!p || !free(f)) return false;
  ev(S, 'clap', f.x, f.y - 85); ev(S, 'swap', f.x, f.y - 70, p.x, p.y);
  const x = f.x, y = f.y; f.x = clamp(p.x, LEFT, RIGHT); f.y = Math.min(GROUND, p.y + 14); p.x = x; p.y = y - 60;
  f.vy = 0; if (f.y < GROUND) f.st = 'jump';
  return true;
};
ART.applause = (S, f, o) => {
  ev(S, 'clap', f.x + f.face * 20, f.y - 85);
  if (o.st === 'ko' || o.st === 'down') return;
  const side = f.x < o.x ? 1 : -1; let nx = o.x + side * 62;
  if (nx < LEFT || nx > RIGHT) nx = o.x - side * 62;
  ev(S, 'swap', f.x, f.y - 70, nx, o.y - 70);
  f.x = nx; f.y = GROUND; f.vy = 0; f.face = o.x >= f.x ? 1 : -1; o.dis = 16;
};
DOMAIN.ovation = { dur: 96, tick(S, d, f, o) {
  d.hold = d.t < 90; f.st = 'cast'; f.vx = 0;
  if (d.t % 14 === 1 && d.n < 6) {
    d.n++; const side = d.n % 2 ? 1 : -1; let nx = clamp(o.x + side * 60, LEFT, RIGHT);
    ev(S, 'clap', f.x, f.y - 85); ev(S, 'swap', f.x, f.y - 70, nx, o.y - 70);
    f.x = nx; f.y = GROUND; f.vy = 0; f.face = o.x >= f.x ? 1 : -1; d.pose = d.t;
    hit(S, f.i, o, f.x, d.n < 6 ? { dmg: 38, stun: 15, chip: 0.4, anyGuard: 1, dom: 1, guardDmg: 0.01 } : { dmg: 40, stun: 24, kb: 14, lift: 8, chip: 0.4, anyGuard: 1, dom: 1, guardDmg: 0.01 });
  }
} };

// ---------- Ten Shadows
ART.dogs = (S, f) => {
  S.ents = S.ents.filter(e => !(e.k === 'dog' && e.o === f.i));
  for (let n = 0; n < 2; n++) S.ents.push({ k: 'dog', o: f.i, x: f.x + f.face * (30 + n * 34), y: GROUND, face: f.face, hp: 1, life: 320, t: 0, cd: 10 + n * 22, n: 2, v: n });
  ev(S, 'summon', f.x + f.face * 40, GROUND);
};
ART.nue = (S, f, o) => {
  const sx = f.x - f.face * 40, sy = GROUND - 380, dx = o.x - sx, dy = (o.y - 70) - sy, l = Math.hypot(dx, dy) || 1;
  S.ents.push({ k: 'nue', o: f.i, x: sx, y: sy, vx: dx / l * 13, vy: dy / l * 13, face: sgn(dx), hp: 1, life: 80, t: 0, cd: 0 });
  ev(S, 'summon', sx, sy);
};
ART.toad = (S, f, o) => {
  const dx = (o.x - f.x) * f.face, ok = dx > 0 && dx < 500 && Math.abs(o.y - f.y) < 120 && o.st !== 'ko' && o.st !== 'down' && !o.inv;
  S.zones.push({ k: 'tongue', o: f.i, x: f.x + f.face * 46, y: GROUND, tx: ok && !o.inf ? o.x : f.x + f.face * 500, face: f.face, hitFoe: ok && !o.inf, t: 0, dur: 16 });
  ev(S, 'summon', f.x + f.face * 46, GROUND);
  if (!ok) return;
  if (o.inf > 0) { ev(S, 'inf', o.x, o.y - 70); return; }
  if (hit(S, f.i, o, f.x, { dmg: 20, unblock: 1, stun: 30 }) && o.st !== 'ko') { o.grab = 12; o.grabX = clamp(f.x + f.face * 74, LEFT, RIGHT); o.st = 'stun'; o.stT = 28; o.vx = 0; }
};
DOMAIN.garden = { dur: 420, tick(S, d, f, o) {
  if (d.t === 1) { ART.dogs(S, f, o); f.cd = [0, 0, 0]; }
  if (d.t % 24 === 0 && o.y >= GROUND - 4) { rawDmg(S, o, 6); ev(S, 'tick', o.x, o.y - 10); }
} };

// ---------- Cursed Cannon
function beamHits(f, o, half, slope) { const dx = (o.x - f.x) * f.face; return dx > -10 && Math.abs((o.y - 60) - (f.y - 74)) < half + dx * (slope || 0); }
ART.granite = (S, f, o) => {
  S.zones.push({ k: 'beam', o: f.i, x: f.x + f.face * 46, y: f.y - 74, face: f.face, t: 0, dur: 16, w: 30 });
  ev(S, 'beam', f.x, f.y - 74);
  for (const e of S.ents) if (e.o !== f.i && (e.x - f.x) * f.face > 0 && Math.abs(e.y - 30 - (f.y - 74)) < 60) e.hp = 0;
  if (beamHits(f, o, 58)) hit(S, f.i, o, f.x, { dmg: 115, kb: 14, stun: 24, chip: 0.25, guardDmg: 40 });
  f.vx = -f.face * 7;
};
ART.grape = (S, f) => {
  const id = S.t;
  for (let n = 0; n < 5; n++) { const a = (-42 + n * 11.5) * Math.PI / 180; shoot(S, f, { k: 'pellet', vx: f.face * Math.cos(a) * 16, vy: Math.sin(a) * 16, r: 12, life: 30, dmg: 30, kb: 5, stun: 13, volley: id }); }
  ev(S, 'blast', f.x, f.y - 78); f.vx = -f.face * 4;
};
ART.guided = (S, f) => { shoot(S, f, { k: 'shell', vx: f.face * 6.5, vy: -2, r: 16, life: 210, homing: 0.07, dmg: 85, kb: 9, lift: 5, stun: 22, chip: 0.2 }); ev(S, 'blast', f.x, f.y - 78); };
DOMAIN.nuclear = { dur: 100, tick(S, d, f, o) {
  d.hold = d.t < 96;
  if (d.t === 1) { f.armor = 1; ev(S, 'charge', f.x, f.y - 74); }
  if (d.t < 96) { f.st = 'cast'; f.vx *= 0.8; }
  if (d.t === 72) {
    f.armor = 0;
    S.zones.push({ k: 'beam', o: f.i, x: f.x + f.face * 46, y: f.y - 74, face: f.face, t: 0, dur: 26, w: 70, cone: 0.42 });
    ev(S, 'nuke', f.x, f.y - 74);
    for (const e of S.ents) if (e.o !== f.i && (e.x - f.x) * f.face > 0) e.hp = 0;
    if (beamHits(f, o, 80, 0.42)) hit(S, f.i, o, f.x, { dmg: 290, kb: 22, lift: 10, stun: 30, chip: 0.4, dom: 1, guardDmg: 0.01 });
    f.vx = -f.face * 12;
  }
} };
