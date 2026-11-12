'use strict';
// Fight simulation. State is plain data (so it can be sent over the network); step(S, inputs) advances one tick.
const W = 1280, H = 720, GROUND = 612, LEFT = 60, RIGHT = 1220, MAXCE = 100, TPS = 60;
const BTN = { L: 1, R: 2, U: 4, G: 8, P: 16, K: 32, A1: 64, A2: 128, A3: 256, DOM: 512 };
const DOM_HP = 0.3, GAUGE_MAX = 100, ROUND_TICKS = 99 * 60;

const BASIC = {
  p1: { su: 4, ac: 3, re: 8, dmg: 32, reach: 86, stun: 15, kb: 3, next: 'p2', pose: 'punch' },
  p2: { su: 4, ac: 3, re: 9, dmg: 36, reach: 88, stun: 16, kb: 4, next: 'p3', pose: 'punch2' },
  p3: { su: 7, ac: 4, re: 16, dmg: 58, reach: 96, stun: 22, kb: 11, lift: 7, pose: 'hook' },
  k: { su: 10, ac: 4, re: 16, dmg: 72, reach: 112, stun: 22, kb: 10, pose: 'kick', guardDmg: 45 },
  jp: { su: 4, ac: 8, re: 6, dmg: 42, reach: 80, stun: 16, kb: 4, air: 1, pose: 'jpunch' },
  jk: { su: 6, ac: 8, re: 8, dmg: 62, reach: 100, stun: 20, kb: 8, air: 1, pose: 'jkick' },
};
const ART = {};   // art id -> function(S, f, o, art), filled in fighters.js
const DOMAIN = {}; // domain kind -> { dur, tick(S, d, f, o) }

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function sgn(v) { return v < 0 ? -1 : 1; }
function rnd(S) { S.seed = (S.seed * 1664525 + 1013904223) >>> 0; return S.seed / 4294967296; }
function ev(S, k, x, y, a, b) { S.ev.push({ k, x: Math.round(x || 0), y: Math.round(y || 0), a, b }); }

function newFighter(i, ch) {
  return { i, ch, x: i ? 880 : 400, y: GROUND, vx: 0, vy: 0, face: i ? -1 : 1, hp: CH[ch].hp, ghost: CH[ch].hp, ce: 50,
    gauge: 0, guardHp: 100, st: 'idle', stT: 0, move: null, mt: 0, hitDone: 0, comboN: 0, cd: [0, 0, 0], domUsed: 0,
    prev: 0, buf: 0, bufT: 0, inf: 0, inv: 0, armor: 0, dis: 0, voided: 0, grab: 0, grabX: 0, air: 0, wall: 0, volley: 0, volleyN: 0, walkT: 0 };
}
function newMatch(c0, c1, seed) {
  const S = { t: 0, seed: seed || 12345, phase: 'intro', phaseT: 0, round: 1, timer: ROUND_TICKS, wins: [0, 0], f: [newFighter(0, c0), newFighter(1, c1)],
    proj: [], ents: [], zones: [], dom: null, ev: [], hitstop: 0, freeze: 0, winner: -1 };
  return S;
}
function newRound(S) {
  const g = [S.f[0].gauge, S.f[1].gauge];
  S.f = [newFighter(0, S.f[0].ch), newFighter(1, S.f[1].ch)];
  S.f[0].gauge = g[0] * 0.5; S.f[1].gauge = g[1] * 0.5;
  S.proj = []; S.ents = []; S.zones = []; S.dom = null; S.timer = ROUND_TICKS; S.phase = 'intro'; S.phaseT = 0; S.round++;
}
function maxHp(f) { return CH[f.ch].hp; }
function domReady(f) { return !f.domUsed && (f.gauge >= GAUGE_MAX || f.hp <= maxHp(f) * DOM_HP); }
function free(f) { return f.st === 'idle' || f.st === 'walk' || f.st === 'guard' || f.st === 'jump'; }

function ko(S, f) {
  if (S.phase !== 'fight') return;
  const o = S.f[1 - f.i];
  f.hp = 0; f.st = 'ko'; f.vy = -9; f.vx = -f.face * 6; f.air = 1;
  S.phase = 'ko'; S.phaseT = 0; S.dom = null; S.hitstop = 26;
  if (o.hp > 0) { S.wins[o.i]++; S.winner = o.i; } else S.winner = -1;
  ev(S, 'ko', f.x, f.y - 60);
}
function rawDmg(S, f, d) {
  if (f.st === 'ko' || S.phase !== 'fight') return;
  f.hp -= d; f.gauge = Math.min(GAUGE_MAX, f.gauge + d * 0.09);
  if (f.hp <= 0) ko(S, f);
}
// One blow on a fighter. o: {dmg, kb, lift, stun, chip, unblock, anyGuard, dom, guardDmg, shock}. sx is where it came from.
function hit(S, by, f, sx, o) {
  if (f.st === 'ko' || f.st === 'down' || f.inv > 0 || S.phase !== 'fight') return 0;
  const hx = f.x, hy = f.y - 70;
  if (f.inf > 0 && !o.dom) { ev(S, 'inf', hx, hy); return 0; }
  const atk = by >= 0 ? S.f[by] : null;
  const dir = Math.abs(sx - f.x) < 6 ? -f.face : sgn(f.x - sx);
  const guarding = (f.st === 'guard' || f.st === 'block') && (o.anyGuard || -dir === f.face);
  let dmg = o.dmg * (atk && o.melee ? CH[atk.ch].melee : 1);
  if (guarding && !o.unblock) {
    rawDmg(S, f, dmg * (o.chip || 0.15));
    f.guardHp -= o.guardDmg || o.dmg * 0.45;
    if (f.st !== 'ko') {
      if (f.guardHp <= 0 && !o.dom) { f.guardHp = 60; f.st = 'stun'; f.stT = 55; ev(S, 'break', hx, hy); }
      else { f.guardHp = Math.max(f.guardHp, 1); f.st = 'block'; f.stT = 10; f.vx = dir * (o.kb || 2) * 0.5; ev(S, 'block', hx, hy); }
    }
    if (atk) { atk.ce = Math.min(MAXCE, atk.ce + dmg * 0.02); atk.gauge = Math.min(GAUGE_MAX, atk.gauge + dmg * 0.03); }
    S.hitstop = Math.max(S.hitstop, 3);
    return 1;
  }
  const inCombo = f.st === 'hit' || f.st === 'stun';
  if (inCombo) f.comboN++; else f.comboN = 0;
  dmg *= Math.max(0.35, 1 - 0.12 * f.comboN);
  if (f.voided > 0 && !o.dom) dmg *= 0.6;
  if (guarding && o.unblock) { f.guardHp = 60; o = Object.assign({}, o, { stun: 45 }); ev(S, 'break', hx, hy); }
  if (atk) { atk.ce = Math.min(MAXCE, atk.ce + dmg * 0.06); atk.gauge = Math.min(GAUGE_MAX, atk.gauge + dmg * 0.07); }
  rawDmg(S, f, dmg);
  ev(S, 'hit', hx, hy, dmg, dir);
  S.hitstop = Math.max(S.hitstop, o.dom ? 2 : dmg > 80 ? 9 : dmg > 45 ? 6 : 4);
  if (f.st === 'ko') { f.vx = dir * 9; return 2; }
  if (f.armor) return 2;
  if (f.voided > 0 && o.dom) return 2;
  f.move = null; f.inf = 0;
  if (o.shock) { f.st = 'stun'; f.stT = o.shock; f.vx = 0; }
  else { f.st = 'hit'; f.stT = o.stun || 14; }
  f.vx = dir * (o.kb || 0);
  if (o.lift || f.y < GROUND) { f.vy = -(o.lift || 4); f.air = 1; f.y = Math.min(f.y, GROUND - 1); }
  if (o.wall) f.wall = o.wall;
  return 2;
}

function startMove(f, id) { f.st = 'atk'; f.move = id; f.mt = 0; f.hitDone = 0; f.buf = 0; f.inf = 0; }
function moveDef(f) { return f.move ? (BASIC[f.move] || CH[f.ch].arts[+f.move[1]]) : null; }

function tryArt(S, f, o, n) {
  const a = CH[f.ch].arts[n];
  if (ART[a.id + '_re'] && ART[a.id + '_re'](S, f, o, a)) return true;
  const garden = S.dom && S.dom.k === 'garden' && S.dom.o === f.i && !S.freeze;
  const cost = garden ? 0 : a.cost;
  if (f.cd[n] > 0 || f.ce < cost) { ev(S, 'nope', f.x, f.y - 140, f.i); return false; }
  if (f.y < GROUND && !a.air) return false;
  f.ce -= cost; f.cd[n] = garden ? Math.ceil(a.cd / 3) : a.cd;
  startMove(f, 'a' + n);
  if (f.y >= GROUND) f.vx = 0;
  ev(S, 'cast', f.x, f.y - 80, f.ch, n);
  return true;
}
function startDomain(S, f, o) {
  if (!domReady(f) || f.y < GROUND || o.st === 'ko') return false;
  const c = CH[f.ch];
  f.domUsed = 1; f.gauge = 0; f.st = 'cast'; f.stT = 20; f.vx = 0; f.move = null; f.buf = 0; f.inf = 0;
  if (S.dom && S.dom.o !== f.i) {   // a second Domain meets the first: both break
    S.dom = null; S.freeze = 40; o.voided = 0; if (o.st === 'cast') { o.st = 'idle'; o.armor = 0; }
    f.vx = -f.face * 12; o.vx = -o.face * 12; f.st = 'hit'; f.stT = 20; if (o.st !== 'ko') { o.st = 'hit'; o.stT = 20; }
    ev(S, 'clash', (f.x + o.x) / 2, GROUND - 120);
    return true;
  }
  S.dom = { o: f.i, k: c.dom.kind, t: 0, dur: DOMAIN[c.dom.kind].dur, n: 0 };
  S.freeze = 60;
  ev(S, 'domain', f.x, f.y - 80, f.ch);
  return true;
}

function meleeCheck(S, f, o, m) {
  if (f.hitDone) return;
  const dx = (o.x - f.x) * f.face, dy = Math.abs(o.y - f.y);
  for (const e of S.ents) if (e.o !== f.i && e.hp > 0) {
    const ex = (e.x - f.x) * f.face;
    if (ex > -20 && ex < m.reach + 20 && Math.abs(e.y - f.y) < 110) { e.hp = 0; ev(S, 'poof', e.x, e.y - 30); }
  }
  if (dx > -24 && dx < m.reach + 22 && dy < 96) {
    const r = hit(S, f.i, o, f.x, { dmg: m.dmg, kb: m.kb, lift: m.lift, stun: m.stun, guardDmg: m.guardDmg, unblock: m.unblock, melee: 1, chip: m.chip });
    if (r || o.inf > 0) f.hitDone = 1;
  }
}

function upFighter(S, f, o, b) {
  const c = CH[f.ch];
  const pr = b & ~f.prev; f.prev = b;
  const act = pr & (BTN.P | BTN.K | BTN.A1 | BTN.A2 | BTN.A3 | BTN.DOM);
  if (act) { f.buf = act; f.bufT = 9; } else if (f.bufT > 0) { if (--f.bufT === 0) f.buf = 0; }
  const mine = S.dom && S.dom.o === f.i && S.dom.k === 'garden';
  for (let n = 0; n < 3; n++) if (f.cd[n] > 0) f.cd[n] -= 1;
  f.ce = Math.min(MAXCE, f.ce + c.regen);
  if (f.st !== 'guard' && f.st !== 'block' && f.guardHp < 100) f.guardHp += 0.3;
  if (f.inf > 0) f.inf--;
  if (f.inv > 0) f.inv--;
  if (f.dis > 0) f.dis--;
  if (f.voided > 0) f.voided--;
  if (f.ghost > f.hp) f.ghost = Math.max(f.hp, f.ghost - Math.max(1.2, (f.ghost - f.hp) * 0.05));
  const slow = (S.dom && S.dom.k === 'garden' && S.dom.o !== f.i) ? 0.5 : (f.inf > 0 ? 0.6 : 1);
  const grounded = f.y >= GROUND;
  const dirIn = (b & BTN.R ? 1 : 0) - (b & BTN.L ? 1 : 0);

  if (f.grab > 0) { f.grab--; f.x += (f.grabX - f.x) * 0.3; f.vx = 0; }
  switch (f.st) {
    case 'ko': break;
    case 'hit':
      if (--f.stT <= 0 && grounded && !f.air) f.st = 'idle';
      break;
    case 'down': f.vx *= 0.8; if (--f.stT <= 0) { f.st = 'idle'; f.inv = 14; f.comboN = 0; } break;
    case 'stun': f.vx *= 0.8; if (--f.stT <= 0) { f.st = 'idle'; f.comboN = 0; } break;
    case 'cast': f.vx *= 0.8; if (!(S.dom && S.dom.o === f.i && S.dom.hold) && --f.stT <= 0) f.st = 'idle'; break;
    case 'block': f.vx *= 0.8; if (--f.stT <= 0) f.st = (b & BTN.G) ? 'guard' : 'idle'; break;
    case 'atk': {
      const m = moveDef(f); f.mt++;
      if (grounded && !m.air) f.vx *= 0.7;
      if (BASIC[f.move]) {
        if (f.mt >= m.su && f.mt < m.su + m.ac) meleeCheck(S, f, o, m);
        if (f.mt === m.su) ev(S, 'whoosh', f.x + f.face * 50, f.y - 70);
        if (m.next && f.mt >= m.su + m.ac && (f.buf & BTN.P)) { startMove(f, m.next); f.vx = f.face * 3; break; }
        if (m.air && grounded) { f.st = 'idle'; f.move = null; break; }
      } else {
        if (f.mt === m.su && ART[m.id]) ART[m.id](S, f, o, m);
        if (m.melee && f.st === 'atk' && f.mt >= m.melee.at && f.mt < m.melee.at + 4) meleeCheck(S, f, o, m.melee);
      }
      if (f.st === 'atk' && f.mt >= m.su + (m.ac || 0) + m.re && !(m.air && !grounded && BASIC[f.move])) { f.st = grounded ? 'idle' : 'jump'; f.move = null; }
      break;
    }
    default: {
      if (grounded) {
        if (!f.dis) f.face = o.x >= f.x ? 1 : -1;
        f.comboN = 0;
        if ((f.buf & BTN.DOM) && startDomain(S, f, o)) break;
        if (f.buf & BTN.A1) { f.buf = 0; if (tryArt(S, f, o, 0)) break; }
        if (f.buf & BTN.A2) { f.buf = 0; if (tryArt(S, f, o, 1)) break; }
        if (f.buf & BTN.A3) { f.buf = 0; if (tryArt(S, f, o, 2)) break; }
        if (f.buf & BTN.P) { startMove(f, 'p1'); break; }
        if (f.buf & BTN.K) { startMove(f, 'k'); break; }
        if (b & BTN.G) { f.st = 'guard'; f.vx = 0; break; }
        if (pr & BTN.U) { f.st = 'jump'; f.vy = -17.5 * (slow < 1 ? 0.85 : 1); f.vx = dirIn * c.speed * 0.9 * slow; f.y = GROUND - 1; ev(S, 'jump', f.x, f.y); break; }
        f.vx = dirIn * c.speed * (dirIn === f.face ? 1 : 0.8) * slow;
        f.st = dirIn ? 'walk' : 'idle';
        if (dirIn) f.walkT++;
      } else {
        f.st = 'jump';
        f.vx += dirIn * 0.25; f.vx = clamp(f.vx, -c.speed, c.speed);
        if (f.buf & BTN.A1) { f.buf = 0; if (tryArt(S, f, o, 0)) break; }
        if (f.buf & BTN.A2) { f.buf = 0; if (tryArt(S, f, o, 1)) break; }
        if (f.buf & BTN.P) { startMove(f, 'jp'); break; }
        if (f.buf & BTN.K) { startMove(f, 'jk'); break; }
      }
    }
  }
  // physics
  if (f.st === 'hit' || f.st === 'ko') f.vx *= (f.y >= GROUND ? 0.86 : 0.985);
  f.x += f.vx; f.y += f.vy;
  if (f.y < GROUND) f.vy += 0.95;
  if (f.y >= GROUND && f.vy >= 0) {
    if (f.vy > 3) ev(S, 'land', f.x, GROUND);
    f.y = GROUND; f.vy = 0;
    if (f.air) { f.air = 0; if (f.st === 'hit') { f.st = 'down'; f.stT = 34; ev(S, 'thud', f.x, GROUND); } }
    if (f.st === 'jump') f.st = 'idle';
  }
  if (f.x < LEFT || f.x > RIGHT) {
    f.x = clamp(f.x, LEFT, RIGHT);
    if ((f.st === 'hit' || f.st === 'ko' || f.st === 'down') && (Math.abs(f.vx) > 7 || f.wall)) {
      ev(S, 'wall', f.x, f.y - 70);
      if (f.wall) { const w = f.wall; f.wall = 0; rawDmg(S, f, w); }
      f.vx *= -0.4;
    }
  }
  if (f.st !== 'hit' && !(f.st === 'down' && f.stT > 24)) f.wall = 0;
}

function upProj(S) {
  for (const p of S.proj) {
    const t = S.f[1 - p.o];
    p.life--; p.t = (p.t || 0) + 1;
    if (p.homing && t.st !== 'ko') {
      const want = Math.atan2(t.y - 70 - p.y, t.x - p.x), cur = Math.atan2(p.vy, p.vx);
      let d = want - cur; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      const a = cur + clamp(d, -p.homing, p.homing), sp = Math.hypot(p.vx, p.vy);
      p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp;
    }
    if (p.grav) { p.vy += p.grav; if (p.y > GROUND - p.r && p.vy > 0) { p.y = GROUND - p.r; p.vy *= -0.62; p.vx *= 0.85; } }
    p.x += p.vx; p.y += p.vy;
    let boom = p.life <= 0 || p.x < LEFT - 30 || p.x > RIGHT + 30 || (!p.grav && p.y > GROUND);
    for (const e of S.ents) if (e.o !== p.o && e.hp > 0 && Math.abs(e.x - p.x) < 30 + p.r && Math.abs(e.y - 30 - p.y) < 50 + p.r) { e.hp = 0; ev(S, 'poof', e.x, e.y - 30); if (!p.pierce) boom = true; }
    if (!boom && Math.abs(t.x - p.x) < 24 + p.r && p.y > t.y - 125 - p.r && p.y < t.y + p.r) {
      if (p.volley && t.volley === p.volley && t.volleyN >= 3) { p.life = 0; continue; }
      if (p.volley) { if (t.volley !== p.volley) { t.volley = p.volley; t.volleyN = 0; } t.volleyN++; }
      if (!p.explode) hit(S, p.o, t, p.x - p.vx * 3, p);
      boom = true;
    }
    if (boom) {
      p.life = 0;
      if (p.explode) {
        ev(S, 'boom', p.x, p.y, p.explode.r);
        if (Math.abs(t.x - p.x) < p.explode.r && Math.abs(t.y - 60 - p.y) < p.explode.r + 30) hit(S, p.o, t, p.x, p.explode);
      } else ev(S, 'pop', p.x, p.y, p.k);
    }
  }
  S.proj = S.proj.filter(p => p.life > 0);
}

function upEnts(S) {
  for (const e of S.ents) {
    const t = S.f[1 - e.o]; e.life--; e.t++;
    if (e.cd > 0) e.cd--;
    if (e.k === 'dog') {
      const dx = t.x - e.x; e.face = sgn(dx);
      if (Math.abs(dx) > 46) e.x += e.face * 7.5;
      else if (e.cd <= 0 && t.y > GROUND - 90 && t.st !== 'ko' && t.st !== 'down') {
        e.cd = 44; e.bite = 10;
        hit(S, e.o, t, e.x, { dmg: 22, stun: 12, kb: 2 }); if (--e.n <= 0) e.life = Math.min(e.life, 12);
      }
      if (e.bite > 0) e.bite--;
    } else if (e.k === 'nue') {
      e.x += e.vx; e.y += e.vy;
      if (!e.done && Math.abs(t.x - e.x) < 50 && Math.abs(t.y - 70 - e.y) < 70) { e.done = 1; hit(S, e.o, t, e.x - e.vx, { dmg: 55, shock: 34, chip: 0.2 }); ev(S, 'zap', t.x, t.y - 70); }
      if (e.y > GROUND - 40) { e.vy = -Math.abs(e.vy) * 0.6; }
    }
  }
  for (const e of S.ents) if ((e.life <= 0 || e.hp <= 0) && !e.gone) { e.gone = 1; if (e.hp > 0) ev(S, 'poof', e.x, e.y - 30); }
  S.ents = S.ents.filter(e => !e.gone);
}

function upZones(S) {
  for (const z of S.zones) {
    z.t++;
    if (z.k === 'blue') {
      const t = S.f[1 - z.o], dx = z.x - t.x;
      if (z.t < 48 && Math.abs(dx) < 420 && t.st !== 'ko' && t.st !== 'down' && !t.inf) {
        const pull = (t.st === 'guard' || t.st === 'block') ? 2.4 : 5.2;
        if (Math.abs(dx) > 8) t.x += sgn(dx) * Math.min(pull, Math.abs(dx));
        if (t.y < GROUND) t.vy += 0.4;
      }
      if (z.t === 48) { ev(S, 'boom', z.x, z.y, 110); if (Math.abs(dx) < 115 && t.y > GROUND - 200) hit(S, z.o, t, z.x - S.f[z.o].face * 10, { dmg: 85, kb: 6, lift: 9, stun: 24 }); }
    }
  }
  S.zones = S.zones.filter(z => z.t < z.dur);
}

function upDomain(S) {
  const d = S.dom; if (!d) return;
  const f = S.f[d.o], o = S.f[1 - d.o];
  if (f.st === 'ko' || S.phase !== 'fight') { S.dom = null; return; }
  d.t++;
  DOMAIN[d.k].tick(S, d, f, o);
  if (S.dom === d && d.t >= d.dur) { S.dom = null; f.armor = 0; ev(S, 'domend', f.x, f.y); }
}

function step(S, inp) {
  S.t++;
  if (S.freeze > 0) { S.freeze--; return; }
  if (S.hitstop > 0) { S.hitstop--; return; }
  let a = inp[0] | 0, b = inp[1] | 0;
  if (S.phase === 'intro') { a = b = 0; if (++S.phaseT === 1) ev(S, 'round', 0, 0, S.round); if (S.phaseT >= 100) { S.phase = 'fight'; ev(S, 'fight'); } }
  else if (S.phase === 'ko') {
    a = b = 0;
    if (++S.phaseT >= 170) { if (S.wins[0] >= 2 || S.wins[1] >= 2) { S.phase = 'over'; ev(S, 'over', 0, 0, S.wins[0] >= 2 ? 0 : 1); } else newRound(S); return; }
  } else if (S.phase === 'over') { a = b = 0; }
  else if (--S.timer <= 0) {
    const r0 = S.f[0].hp / maxHp(S.f[0]), r1 = S.f[1].hp / maxHp(S.f[1]);
    if (r0 === r1) { S.phase = 'ko'; S.phaseT = 0; S.winner = -1; ev(S, 'ko', 640, 300); }
    else { const l = S.f[r0 < r1 ? 0 : 1]; l.hp = 0.0001; ko(S, l); l.hp = 0; }
  }
  upFighter(S, S.f[0], S.f[1], a);
  upFighter(S, S.f[1], S.f[0], b);
  // bodies push apart
  const f = S.f[0], g = S.f[1], dx = g.x - f.x;
  if (Math.abs(dx) < 46 && Math.abs(f.y - g.y) < 100 && f.st !== 'ko' && g.st !== 'ko' && !f.grab && !g.grab) {
    const push = (46 - Math.abs(dx)) / 2, s = dx === 0 ? (f.i ? -1 : 1) : sgn(dx);
    f.x = clamp(f.x - s * push, LEFT, RIGHT); g.x = clamp(g.x + s * push, LEFT, RIGHT);
  }
  upProj(S); upEnts(S); upZones(S); upDomain(S);
}
