'use strict';
// Drawing: stage, fighters (jointed figures), effects, HUD. Reads the state; never changes it.
const FX = { parts: [], rings: [], lines: [], shake: 0, flash: 0, flashCol: '#fff', banner: null, ghosts: [], nope: [0, 0] };
const POSE_CACHE = [null, null];
let BG = null;

const P = {
  idle: { lean: .08, af: [.7, 1.5], ab: [.3, 1.7], lf: [.35, -.4], lb: [-.35, -.25], dy: 4 },
  guard: { lean: -.06, af: [1.25, 1.7], ab: [1.05, 1.8], lf: [.4, -.5], lb: [-.4, -.3], dy: 9 },
  wind: { lean: -.1, af: [-.4, 1.9], ab: [.5, 1.6], lf: [.35, -.4], lb: [-.35, -.25], dy: 5 },
  punch: { lean: .28, af: [1.55, .05], ab: [-.2, 1.6], lf: [.55, -.35], lb: [-.55, -.1], dy: 7 },
  punch2: { lean: .3, af: [-.3, 1.7], ab: [1.6, .05], lf: [.5, -.35], lb: [-.6, -.1], dy: 7 },
  hook: { lean: .42, af: [2.0, .7], ab: [-.5, 1.2], lf: [.6, -.4], lb: [-.7, -.1], dy: 8 },
  kickw: { lean: -.1, af: [.3, 1.3], ab: [-.4, 1], lf: [1.0, -1.5], lb: [-.1, -.1], dy: 2 },
  kick: { lean: -.34, af: [.2, 1.2], ab: [-.7, .8], lf: [1.75, 0], lb: [-.12, -.08], dy: 0 },
  jump: { lean: .1, af: [.5, 1.2], ab: [-.4, 1], lf: [.9, -1.3], lb: [.3, -1.2], dy: 0 },
  jpunch: { lean: .3, af: [1.9, .05], ab: [-.4, 1.4], lf: [.7, -1.2], lb: [.1, -1.1], dy: 0 },
  jkick: { lean: -.2, af: [.3, 1.1], ab: [-.6, .9], lf: [1.25, 0], lb: [.2, -1.5], dy: 0 },
  hit: { lean: -.42, hd: -.35, af: [-.6, .5], ab: [-1, .4], lf: [.25, -.3], lb: [-.3, -.4], dy: 4 },
  stun: { lean: .32, hd: .45, af: [.1, .2], ab: [0, .2], lf: [.15, -.25], lb: [-.15, -.25], dy: 8 },
  cast1: { lean: .12, af: [1.6, 0], ab: [.2, 1.7], lf: [.5, -.4], lb: [-.5, -.15], dy: 6 },
  clap: { lean: .12, af: [1.35, .45], ab: [1.3, .5], lf: [.4, -.4], lb: [-.4, -.2], dy: 5 },
  clapw: { lean: .0, af: [.9, 1.4], ab: [.2, 1.2], lf: [.4, -.4], lb: [-.4, -.2], dy: 5 },
  slash: { lean: .34, af: [1.2, -.2], ab: [-.4, 1.2], lf: [.6, -.4], lb: [-.6, -.1], dy: 8 },
  slashw: { lean: -.15, af: [2.7, .3], ab: [.4, 1.5], lf: [.4, -.4], lb: [-.4, -.2], dy: 5 },
  bow: { lean: -.05, af: [1.6, 0], ab: [1.45, 1.5], lf: [.5, -.35], lb: [-.5, -.2], dy: 6 },
  sign: { lean: .16, af: [1.1, 1.15], ab: [1.0, 1.25], lf: [.45, -.6], lb: [-.45, -.4], dy: 12 },
  cannon: { lean: .04, af: [1.57, 0], ab: [1.2, .45], lf: [.55, -.55], lb: [-.65, -.2], dy: 11 },
  throw: { lean: .3, af: [1.5, .1], ab: [-.3, 1.4], lf: [.55, -.35], lb: [-.55, -.1], dy: 7 },
  win: { lean: -.05, af: [2.9, .1], ab: [.2, .4], lf: [.2, -.1], lb: [-.2, -.1], dy: 0 },
};
const WIND = { punch: 'wind', punch2: 'punch', hook: 'wind', kick: 'kickw', slash: 'slashw', clap: 'clapw', throw: 'wind', jkick: 'jump', jpunch: 'jump' };

function targetPose(S, f) {
  const t = S.t;
  if (f.st === 'atk') { const m = moveDef(f); const nm = m.pose; return P[f.mt < m.su * 0.7 && WIND[nm] ? WIND[nm] : nm] || P.cast1; }
  if (f.st === 'cast') { const k = CH[f.ch].dom.kind; if (k === 'ovation') return P.hook; return P[k === 'nuclear' ? 'cannon' : k === 'garden' ? 'sign' : k === 'shrine' ? 'slashw' : 'clap']; }
  if (f.st === 'guard' || f.st === 'block') return P.guard;
  if (f.st === 'hit' || f.st === 'down' || f.st === 'ko') return P.hit;
  if (f.st === 'stun') return P.stun;
  if (f.st === 'jump') return P.jump;
  if (S.phase === 'over' && S.wins[f.i] >= 2) return P.win;
  if (f.st === 'walk') { const s = Math.sin(f.walkT * 0.22), c = Math.cos(f.walkT * 0.22); return { lean: .12, af: [.7 - s * .3, 1.4], ab: [.3 + s * .3, 1.6], lf: [s * .55, -.25 - Math.max(0, c) * .5], lb: [-s * .55, -.25 - Math.max(0, -c) * .5], dy: 4 + Math.abs(c) * 3 }; }
  const b = Math.sin(t * 0.07) * .03; return { lean: .08 + b, af: [.7, 1.5 + b * 2], ab: [.3, 1.7 + b * 2], lf: [.35, -.4], lb: [-.35, -.25], dy: 4 + b * 40 };
}
function lerpPose(a, b, k) {
  const L = (x, y) => x + (y - x) * k, V = (x, y) => [L(x[0], y[0]), L(x[1], y[1])];
  return { lean: L(a.lean, b.lean), hd: L(a.hd || 0, b.hd || 0), af: V(a.af, b.af), ab: V(a.ab, b.ab), lf: V(a.lf, b.lf), lb: V(a.lb, b.lb), dy: L(a.dy || 0, b.dy || 0) };
}
function shade(hex, k) { const n = parseInt(hex.slice(1), 16); const r = Math.round(((n >> 16) & 255) * k), g = Math.round(((n >> 8) & 255) * k), b = Math.round((n & 255) * k); return `rgb(${r},${g},${b})`; }
function limb(c, x1, y1, x2, y2, w, col) {
  c.lineCap = 'round'; c.strokeStyle = '#0b0b12'; c.lineWidth = w + 5; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
}
function seg(x, y, a, len) { return [x + Math.sin(a) * len, y + Math.cos(a) * len]; }

function drawFighter(c, S, f, alpha) {
  const lk = CH[f.ch].look; let p = targetPose(S, f);
  const pc = POSE_CACHE[f.i]; p = POSE_CACHE[f.i] = pc ? lerpPose(pc, p, 0.42) : lerpPose(p, p, 1);
  c.save(); c.translate(f.x, f.y); c.globalAlpha = alpha || 1;
  // shadow
  c.save(); c.translate(0, GROUND - f.y); c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(0, 2, 38 * Math.max(.4, 1 - (GROUND - f.y) / 400), 8, 0, 0, 7); c.fill(); c.restore();
  c.scale(f.face, 1);
  let rot = 0;
  if (f.st === 'down') rot = -1.45; else if (f.st === 'ko') rot = f.y >= GROUND ? -1.5 : -0.9; else if (f.st === 'hit' && f.air) rot = -0.7;
  if (f.st === 'stun') rot = Math.sin(S.t * 0.3) * 0.05;
  if (rot) { c.translate(0, -8); c.rotate(rot); }
  if (f.inv > 0 && S.t % 4 < 2) c.globalAlpha *= 0.5;
  const hipY = -62 + p.dy, hip = [0, hipY];
  const neck = seg(0, hipY, Math.PI + p.lean, -0) ; const nx = Math.sin(p.lean) * 48, ny = hipY - Math.cos(p.lean) * 48;
  const drawLeg = (l, col) => { const k = seg(hip[0], hip[1], l[0], 31), ft = seg(k[0], k[1], l[0] + l[1], 33); limb(c, hip[0], hip[1], k[0], k[1], 15, col); limb(c, k[0], k[1], ft[0], ft[1], 13, col); limb(c, ft[0], ft[1], ft[0] + 11, ft[1] + 1, 9, '#15151c'); };
  const drawArm = (a, col, front) => { const sx = nx - (front ? 2 : -2), sy = ny + 8; const e = seg(sx, sy, a[0], 25), h = seg(e[0], e[1], a[0] + a[1], 25); limb(c, sx, sy, e[0], e[1], 12, col); limb(c, e[0], e[1], h[0], h[1], 11, col); c.fillStyle = '#0b0b12'; c.beginPath(); c.arc(h[0], h[1], 9.5, 0, 7); c.fill(); c.fillStyle = front ? lk.skin : shade(lk.skin, .8); c.beginPath(); c.arc(h[0], h[1], 7, 0, 7); c.fill(); return h; };
  drawArm(p.ab, shade(lk.top, .7), false);
  drawLeg(p.lb, shade(lk.pants, .75));
  // torso
  limb(c, 0, hipY, nx, ny, 27, lk.top);
  c.strokeStyle = lk.accent; c.lineWidth = 4; c.beginPath(); c.moveTo(-12, hipY - 2); c.lineTo(12, hipY - 2); c.stroke();
  drawLeg(p.lf, lk.pants);
  // head
  const ha = p.lean + (p.hd || 0), hx = nx + Math.sin(ha) * 20, hy = ny - Math.cos(ha) * 20;
  c.fillStyle = '#0b0b12'; c.beginPath(); c.arc(hx, hy, 17, 0, 7); c.fill();
  c.fillStyle = lk.skin; c.beginPath(); c.arc(hx, hy, 14.5, 0, 7); c.fill();
  c.fillStyle = lk.hair; c.beginPath();
  if (lk.style === 'buzz') { c.arc(hx, hy, 15, Math.PI * 1.05, Math.PI * 1.9); c.fill(); }
  else { c.arc(hx - 1, hy - 2, 16, Math.PI * 0.75, Math.PI * 1.95); c.fill(); }
  if (lk.style === 'spiky') for (let n = 0; n < 5; n++) { const a = Math.PI * (1.05 + n * .2); c.beginPath(); c.moveTo(hx + Math.cos(a - .18) * 14, hy + Math.sin(a - .18) * 14); c.lineTo(hx + Math.cos(a) * 27 - 4, hy + Math.sin(a) * 27); c.lineTo(hx + Math.cos(a + .18) * 14, hy + Math.sin(a + .18) * 14); c.fill(); }
  if (lk.style === 'long') { const sw = Math.sin(S.t * .08 + f.i) * 4 - f.vx * 1.5; c.beginPath(); c.moveTo(hx - 13, hy - 8); c.quadraticCurveTo(hx - 30 + sw, hy + 20, hx - 22 + sw * 1.5, hy + 52); c.lineTo(hx - 8, hy + 12); c.fill(); }
  if (lk.style === 'top') { c.beginPath(); c.arc(hx - 5, hy - 19, 8, 0, 7); c.fill(); }
  if (lk.style === 'bob') { c.beginPath(); c.moveTo(hx - 15, hy - 4); c.lineTo(hx - 17, hy + 14); c.lineTo(hx - 4, hy + 10); c.lineTo(hx - 2, hy - 8); c.fill(); }
  c.fillStyle = '#0b0b12'; c.fillRect(hx + 5, hy - 3, 6, f.st === 'hit' || f.st === 'stun' || f.st === 'ko' ? 1.5 : 3.5);
  const hand = drawArm(p.af, lk.top, true);
  // technique glow on the hand while casting
  if ((f.st === 'atk' && !BASIC[f.move]) || f.st === 'cast') { c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(hand[0], hand[1], 0, hand[0], hand[1], 30); g.addColorStop(0, lk.accent); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(hand[0], hand[1], 30, 0, 7); c.fill(); c.globalCompositeOperation = 'source-over'; }
  c.restore();
  if (f.inf > 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(120,210,255,${.35 + .2 * Math.sin(S.t * .4)})`; c.lineWidth = 3; c.beginPath(); c.ellipse(f.x, f.y - 66, 54, 84, 0, 0, 7); c.stroke(); c.setLineDash([6, 10]); c.lineDashOffset = S.t; c.beginPath(); c.ellipse(f.x, f.y - 66, 62, 92, 0, 0, 7); c.stroke(); c.restore(); }
  if (f.st === 'stun') { c.fillStyle = '#ffe36b'; for (let n = 0; n < 3; n++) { const a = S.t * .15 + n * 2.1; c.beginPath(); c.arc(f.x + Math.cos(a) * 22, f.y - 150 + Math.sin(a) * 6, 4, 0, 7); c.fill(); } }
}

function makeBG() {
  BG = document.createElement('canvas'); BG.width = W; BG.height = H; const c = BG.getContext('2d');
  let g = c.createLinearGradient(0, 0, 0, GROUND); g.addColorStop(0, '#161a3a'); g.addColorStop(.55, '#5a3463'); g.addColorStop(1, '#e58a5c'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.fillStyle = 'rgba(255,240,220,.9)'; c.beginPath(); c.arc(960, 170, 54, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,220,190,.12)'; c.beginPath(); c.arc(960, 170, 110, 0, 7); c.fill();
  let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  c.fillStyle = 'rgba(255,255,255,.7)'; for (let n = 0; n < 70; n++) c.fillRect(r() * W, r() * 260, 1.6, 1.6);
  for (let layer = 0; layer < 2; layer++) {
    c.fillStyle = layer ? '#1d1630' : '#3a2750'; let x = -20;
    while (x < W) { const w = 50 + r() * 90, h = (layer ? 90 : 160) + r() * 150; c.fillRect(x, GROUND - 40 - h, w, h + 40); if (layer) { c.fillStyle = 'rgba(255,200,120,.55)'; for (let k = 0; k < 6; k++) c.fillRect(x + 8 + r() * (w - 20), GROUND - 30 - r() * h, 5, 7); c.fillStyle = '#1d1630'; } x += w + 6; }
  }
  g = c.createLinearGradient(0, GROUND - 40, 0, H); g.addColorStop(0, '#2c2338'); g.addColorStop(1, '#0f0c16'); c.fillStyle = g; c.fillRect(0, GROUND - 40, W, H);
  c.strokeStyle = 'rgba(255,255,255,.06)'; c.lineWidth = 2; for (let n = -8; n <= 8; n++) { c.beginPath(); c.moveTo(640 + n * 90, GROUND - 40); c.lineTo(640 + n * 260, H); c.stroke(); }
  for (let y = GROUND - 40; y < H; y += 26 + (y - GROUND + 40) * .4) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  c.strokeStyle = '#0d0a14'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, GROUND - 92); c.lineTo(W, GROUND - 92); c.stroke(); c.lineWidth = 3; for (let x = 20; x < W; x += 62) { c.beginPath(); c.moveTo(x, GROUND - 92); c.lineTo(x, GROUND - 40); c.stroke(); }
  for (const x of [150, 1130]) { c.fillStyle = '#0d0a14'; c.fillRect(x - 4, GROUND - 230, 8, 190); c.fillStyle = '#ffb35c'; c.fillRect(x - 13, GROUND - 250, 26, 30); const lg = c.createRadialGradient(x, GROUND - 235, 0, x, GROUND - 235, 120); lg.addColorStop(0, 'rgba(255,170,80,.35)'); lg.addColorStop(1, 'rgba(255,170,80,0)'); c.fillStyle = lg; c.fillRect(x - 120, GROUND - 355, 240, 240); }
}

function burst(x, y, n, col, sp, life) { for (let k = 0; k < n; k++) { const a = Math.random() * 7, v = sp * (.3 + Math.random()); FX.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: life || 22, t: 0, col, s: 2 + Math.random() * 3 }); } }
function fxEvent(S, e) {
  const A = c => CH[S.f[c] ? S.f[c].ch : 0].look.accent;
  switch (e.k) {
    case 'hit': burst(e.x, e.y, 6 + e.a / 8, '#fff2b0', 4 + e.a / 20); FX.rings.push({ x: e.x, y: e.y, r: 8, vr: 5 + e.a / 25, t: 0, life: 10, col: '#fff' }); FX.shake = Math.max(FX.shake, Math.min(14, 3 + e.a / 12)); break;
    case 'block': burst(e.x, e.y, 5, '#9fd0ff', 3); FX.rings.push({ x: e.x, y: e.y, r: 14, vr: 3, t: 0, life: 8, col: '#9fd0ff' }); break;
    case 'break': burst(e.x, e.y, 24, '#ffe36b', 8); FX.shake = 10; FX.banner = { txt: 'GUARD BREAK', t: 0, life: 40, small: 1 }; break;
    case 'inf': FX.rings.push({ x: e.x, y: e.y, r: 40, vr: 2, t: 0, life: 14, col: '#7fd6ff' }); break;
    case 'clap': FX.rings.push({ x: e.x, y: e.y, r: 6, vr: 9, t: 0, life: 12, col: '#ffe9a0' }); burst(e.x, e.y, 8, '#ffe9a0', 5); break;
    case 'swap': FX.lines.push({ x1: e.x, y1: e.y, x2: e.a, y2: e.b, t: 0, life: 12, col: '#ffe9a0', w: 5 }); burst(e.x, e.y, 10, '#ffd866', 4); burst(e.a, e.b, 10, '#ffd866', 4); FX.flash = .18; FX.flashCol = '#ffe9a0'; break;
    case 'slash': FX.lines.push({ x1: e.x - 50, y1: e.y - 40 - (e.a ? 20 : 0), x2: e.x + 50, y2: e.y + 40 + (e.a ? 20 : 0), t: 0, life: 9, col: '#ff5a5a', w: e.a ? 9 : 5 }); break;
    case 'rain': for (let n = 0; n < 3; n++) { const x = e.x + (Math.random() - .5) * 160, y = e.y + (Math.random() - .5) * 120, a = Math.random() * 3; FX.lines.push({ x1: x - Math.cos(a) * 70, y1: y - Math.sin(a) * 70, x2: x + Math.cos(a) * 70, y2: y + Math.sin(a) * 70, t: 0, life: 8, col: '#ff3b3b', w: 4 }); } for (let n = 0; n < 4; n++) { const x = Math.random() * W, y = 150 + Math.random() * 450; FX.lines.push({ x1: x - 60, y1: y - 40, x2: x + 60, y2: y + 40, t: 0, life: 8, col: 'rgba(255,60,60,.5)', w: 3 }); } break;
    case 'boom': burst(e.x, e.y, 30, '#ffb347', 9, 30); FX.rings.push({ x: e.x, y: e.y, r: 10, vr: e.a / 9, t: 0, life: 14, col: '#ffd9a0' }); FX.shake = 12; FX.flash = .25; FX.flashCol = '#fff'; break;
    case 'pop': burst(e.x, e.y, 6, '#ddd', 3); break;
    case 'poof': burst(e.x, e.y, 14, '#5b3fa8', 4, 26); break;
    case 'summon': burst(e.x, e.y - 10, 16, '#7a5cff', 5, 26); FX.rings.push({ x: e.x, y: e.y, r: 10, vr: 5, t: 0, life: 12, col: '#a47bff' }); break;
    case 'zap': burst(e.x, e.y, 16, '#fff799', 7); FX.flash = .2; FX.flashCol = '#fff799'; break;
    case 'beam': FX.shake = 9; FX.flash = .2; FX.flashCol = '#ffd9a0'; break;
    case 'nuke': FX.shake = 26; FX.flash = .8; FX.flashCol = '#fff'; break;
    case 'blast': burst(e.x, e.y, 8, '#fff', 5); break;
    case 'wall': burst(e.x, e.y, 16, '#ccc', 6); FX.shake = 12; break;
    case 'thud': burst(e.x, e.y, 8, '#998', 3); FX.shake = Math.max(FX.shake, 5); break;
    case 'land': burst(e.x, e.y, 4, '#887', 2); break;
    case 'tick': burst(e.x, e.y, 3, '#c9b8ff', 2); break;
    case 'ko': FX.banner = { txt: 'K.O.', t: 0, life: 120 }; FX.flash = .6; FX.flashCol = '#fff'; FX.shake = 18; break;
    case 'round': FX.banner = { txt: 'ROUND ' + e.a, t: 0, life: 70 }; break;
    case 'fight': FX.banner = { txt: 'FIGHT', t: 0, life: 45 }; break;
    case 'domain': { const d = CH[e.a].dom; FX.banner = { txt: d.name.toUpperCase(), sub: d.maximum ? 'MAXIMUM' : 'DOMAIN EXPANSION', t: 0, life: 70, col: CH[e.a].look.accent }; FX.flash = .5; FX.flashCol = CH[e.a].look.accent; break; }
    case 'clash': FX.banner = { txt: 'DOMAIN CLASH', t: 0, life: 60 }; FX.flash = .9; FX.flashCol = '#fff'; FX.shake = 24; burst(e.x, e.y, 60, '#fff', 12, 40); break;
    case 'nope': FX.nope[e.a] = 18; break;
  }
  if (typeof sfx === 'function') sfx(e);
}
function fxTick() {
  for (const p of FX.parts) { p.t++; p.x += p.vx; p.y += p.vy; p.vy += .25; p.vx *= .95; }
  FX.parts = FX.parts.filter(p => p.t < p.life); if (FX.parts.length > 500) FX.parts.splice(0, FX.parts.length - 500);
  for (const r of FX.rings) { r.t++; r.r += r.vr; } FX.rings = FX.rings.filter(r => r.t < r.life);
  for (const l of FX.lines) l.t++; FX.lines = FX.lines.filter(l => l.t < l.life);
  FX.shake *= .85; FX.flash *= .86; if (FX.banner && ++FX.banner.t > FX.banner.life) FX.banner = null;
  if (FX.nope[0] > 0) FX.nope[0]--; if (FX.nope[1] > 0) FX.nope[1]--;
}

function drawDomainBack(c, S) {
  const d = S.dom; if (!d) return; const a = Math.min(1, (S.freeze ? 60 - S.freeze : 60) / 30) * Math.min(1, (d.dur - d.t) / 15 + .2), t = S.t;
  c.save(); c.globalAlpha = a * .88;
  if (d.k === 'void') { c.fillStyle = '#04040c'; c.fillRect(0, 0, W, H); c.globalAlpha = a; for (let n = 0; n < 90; n++) { const x = (n * 197 + t * (1 + n % 3)) % W, y = (n * 113) % H; c.fillStyle = n % 7 ? '#cfe8ff' : '#59c8ff'; c.fillRect(x, y, 2 + n % 3, 2); } c.strokeStyle = 'rgba(210,235,255,.8)'; c.lineWidth = 5; c.beginPath(); c.arc(640, 300, 150 + Math.sin(t * .05) * 6, 0, 7); c.stroke(); c.fillStyle = '#000'; c.beginPath(); c.arc(640, 300, 120, 0, 7); c.fill(); }
  else if (d.k === 'shrine') { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a0306'); g.addColorStop(1, '#090102'); c.fillStyle = g; c.fillRect(0, 0, W, H); c.globalAlpha = a; c.fillStyle = '#12060a'; for (let n = 0; n < 7; n++) { const x = 250 + n * 130; c.beginPath(); c.moveTo(x, GROUND - 40); c.quadraticCurveTo(x + (n - 3) * 20, 250, 640 + (n - 3) * 50, 170); c.lineTo(640 + (n - 3) * 50 + 14, 170); c.quadraticCurveTo(x + (n - 3) * 20 + 26, 260, x + 26, GROUND - 40); c.fill(); } c.fillRect(480, 140, 320, 26); c.fillRect(520, 100, 240, 20); c.fillStyle = 'rgba(160,10,20,.5)'; c.fillRect(0, GROUND, W, H - GROUND); }
  else if (d.k === 'garden') { c.fillStyle = '#07050f'; c.fillRect(0, 0, W, H); c.globalAlpha = a; for (let n = 0; n < 8; n++) { c.strokeStyle = `rgba(140,100,255,${.25 - n * .02})`; c.lineWidth = 3; c.beginPath(); c.ellipse(640, GROUND + 40, (t * 2 + n * 110) % 900, ((t * 2 + n * 110) % 900) * .12, 0, 0, 7); c.stroke(); } c.fillStyle = '#0d0920'; c.fillRect(0, GROUND, W, H - GROUND); }
  else if (d.k === 'ovation') { c.fillStyle = '#0c0a06'; c.fillRect(0, 0, W, H); c.globalAlpha = a * .5; const o = S.f[1 - d.o]; const g = c.createRadialGradient(o.x, 0, 0, o.x, GROUND, 520); g.addColorStop(0, '#ffe9a0'); g.addColorStop(1, 'rgba(255,233,160,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(o.x - 40, 0); c.lineTo(o.x + 40, 0); c.lineTo(o.x + 220, GROUND + 20); c.lineTo(o.x - 220, GROUND + 20); c.fill(); }
  else if (d.k === 'nuclear') { c.globalAlpha = a * Math.min(.8, d.t / 70); c.fillStyle = '#2a1203'; c.fillRect(0, 0, W, H); }
  c.restore();
}

function drawWorld(c, S) {
  if (!BG) makeBG();
  const sx = (Math.random() - .5) * FX.shake, sy = (Math.random() - .5) * FX.shake;
  c.save(); c.translate(sx, sy); c.drawImage(BG, 0, 0);
  drawDomainBack(c, S);
  // zones behind fighters
  for (const z of S.zones) {
    const col = CH[S.f[z.o].ch].look.accent;
    if (z.k === 'blue') { const k = z.t < 48 ? 1 : 1 + (z.t - 48) / 4; c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(z.x, z.y, 0, z.x, z.y, 70 * k); g.addColorStop(0, '#fff'); g.addColorStop(.25, '#3aa0ff'); g.addColorStop(1, 'rgba(0,40,160,0)'); c.fillStyle = g; c.beginPath(); c.arc(z.x, z.y, 70 * k, 0, 7); c.fill(); c.strokeStyle = 'rgba(120,190,255,.7)'; c.lineWidth = 2; for (let n = 0; n < 3; n++) { const r = 150 - ((z.t * 5 + n * 50) % 150); c.beginPath(); c.arc(z.x, z.y, r, 0, 7); c.stroke(); } c.restore(); }
    if (z.k === 'tongue') { const k = Math.sin(Math.min(1, z.t / z.dur) * Math.PI); c.fillStyle = '#0b0b12'; c.beginPath(); c.ellipse(z.x, GROUND - 22, 36, 26, 0, 0, 7); c.fill(); c.fillStyle = '#3d2f6b'; c.beginPath(); c.ellipse(z.x, GROUND - 22, 32, 22, 0, 0, 7); c.fill(); c.fillStyle = '#e8e0ff'; c.beginPath(); c.arc(z.x + z.face * 12, GROUND - 40, 6, 0, 7); c.fill(); c.strokeStyle = '#d0608a'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(z.x + z.face * 20, GROUND - 26); c.lineTo(z.x + (z.tx - z.x) * (z.hitFoe ? Math.max(k, .25) : k), GROUND - 60); c.stroke(); }
  }
  for (const e of S.ents) {
    c.save(); c.translate(e.x, e.y); c.scale(e.face, 1);
    if (e.k === 'dog') { const run = Math.sin(e.t * .6) * 8, b = e.bite > 0 ? 8 : 0; c.fillStyle = '#0b0b12'; c.strokeStyle = '#0b0b12'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(-18, -24); c.lineTo(-22 - run, 0); c.moveTo(14, -24); c.lineTo(18 + run, 0); c.stroke(); c.fillStyle = e.v ? '#1b1626' : '#e9e6f2'; c.strokeStyle = '#0b0b12'; c.lineWidth = 3; c.beginPath(); c.ellipse(0, -30, 30, 14, 0, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.ellipse(30 + b, -40, 14, 11, -.3, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.moveTo(24, -50); c.lineTo(28, -64); c.lineTo(36, -50); c.fill(); c.stroke(); c.beginPath(); c.moveTo(-28, -34); c.quadraticCurveTo(-46, -50, -40, -62); c.stroke(); c.fillStyle = '#a47bff'; c.fillRect(34 + b, -44, 4, 3); }
    else if (e.k === 'nue') { const fl = Math.sin(e.t * .5) * 22; c.fillStyle = '#e2a23a'; c.strokeStyle = '#0b0b12'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 0); c.lineTo(-50, -30 - fl); c.lineTo(-20, 6); c.fill(); c.stroke(); c.beginPath(); c.moveTo(0, 0); c.lineTo(-40, 24 + fl); c.lineTo(-14, 8); c.fill(); c.stroke(); c.beginPath(); c.ellipse(0, 0, 26, 13, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#f4efe6'; c.beginPath(); c.arc(22, -2, 10, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#0b0b12'; c.fillRect(24, -5, 4, 4); c.globalCompositeOperation = 'lighter'; c.strokeStyle = '#fff799'; c.lineWidth = 2; c.beginPath(); c.moveTo(-10, 10); c.lineTo(-4 + fl * .3, 26); c.lineTo(6, 20); c.lineTo(10, 38); c.stroke(); }
    c.restore();
  }
  const order = S.f[0].st === 'atk' ? [1, 0] : [0, 1];
  for (const i of order) drawFighter(c, S, S.f[i]);
  c.save();
  for (const z of S.zones) if (z.k === 'beam') {
    const k = 1 - z.t / z.dur, len = 1400; c.globalCompositeOperation = 'lighter';
    c.save(); c.translate(z.x, z.y); c.scale(z.face, 1);
    const far = z.w * k + (z.cone ? len * z.cone : 0); let g = c.createLinearGradient(0, -far, 0, far); g.addColorStop(0, 'rgba(255,140,40,0)'); g.addColorStop(.5, `rgba(255,220,160,${k})`); g.addColorStop(1, 'rgba(255,140,40,0)'); c.fillStyle = g;
    c.beginPath(); c.moveTo(0, -z.w * k); c.lineTo(len, -far); c.lineTo(len, far); c.lineTo(0, z.w * k); c.fill();
    c.fillStyle = `rgba(255,255,255,${k})`; c.beginPath(); c.moveTo(0, -z.w * k * .35); c.lineTo(len, -far * .35); c.lineTo(len, far * .35); c.lineTo(0, z.w * k * .35); c.fill(); c.beginPath(); c.arc(0, 0, z.w * 1.2 * k, 0, 7); c.fill(); c.restore();
  }
  c.globalCompositeOperation = 'source-over';
  for (const p of S.proj) {
    c.save(); c.translate(p.x, p.y); const a = Math.atan2(p.vy, p.vx);
    if (p.k === 'cut') { c.rotate(a); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,90,90,.9)'; c.lineWidth = 4; c.beginPath(); c.arc(-30, 0, 44, -.9, .9); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5; c.beginPath(); c.arc(-30, 0, 44, -.7, .7); c.stroke(); }
    else if (p.k === 'red' || p.k === 'flame' || p.k === 'shell') { const col = p.k === 'red' ? '#ff3a4a' : p.k === 'flame' ? '#ff8a2a' : '#ffb347'; c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(0, 0, 0, 0, 0, p.r * 2.2); g.addColorStop(0, '#fff'); g.addColorStop(.35, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, p.r * 2.2, 0, 7); c.fill(); c.rotate(a); c.fillStyle = col; c.globalAlpha = .5; c.beginPath(); c.moveTo(0, -p.r * .7); c.lineTo(-p.r * 4, 0); c.lineTo(0, p.r * .7); c.fill(); if (p.k === 'shell') { c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.fillStyle = '#2b2b2b'; c.fillRect(-12, -6, 22, 12); } }
    else if (p.k === 'pellet') { c.globalCompositeOperation = 'lighter'; c.fillStyle = '#ffd9a0'; c.beginPath(); c.arc(0, 0, 9, 0, 7); c.fill(); c.rotate(a); c.fillStyle = 'rgba(255,170,70,.5)'; c.fillRect(-30, -4, 30, 8); }
    else if (p.k === 'stone') { c.rotate(p.t * .2); c.fillStyle = '#0b0b12'; c.beginPath(); c.arc(0, 0, 15, 0, 7); c.fill(); c.fillStyle = '#8c8577'; c.beginPath(); c.moveTo(-11, -5); c.lineTo(-3, -12); c.lineTo(10, -7); c.lineTo(12, 5); c.lineTo(2, 12); c.lineTo(-10, 8); c.fill(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,216,102,.8)'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 19 + Math.sin(p.t * .3) * 2, 0, 7); c.stroke(); }
    c.restore();
  }
  // effects
  c.globalCompositeOperation = 'lighter';
  for (const l of FX.lines) { const k = 1 - l.t / l.life; c.strokeStyle = l.col; c.globalAlpha = k; c.lineWidth = l.w * k + 1; c.lineCap = 'round'; c.beginPath(); c.moveTo(l.x1, l.y1); c.lineTo(l.x2, l.y2); c.stroke(); }
  for (const r of FX.rings) { c.globalAlpha = 1 - r.t / r.life; c.strokeStyle = r.col; c.lineWidth = 4; c.beginPath(); c.arc(r.x, r.y, r.r, 0, 7); c.stroke(); }
  for (const p of FX.parts) { c.globalAlpha = 1 - p.t / p.life; c.fillStyle = p.col; c.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s); }
  c.restore(); c.restore();
  if (S.dom && S.dom.k === 'nuclear' && S.dom.t < 72 && !S.freeze) { const f = S.f[S.dom.o], k = S.dom.t / 72; c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(255,180,70,${.3 + k * .6})`; c.lineWidth = 3; for (let n = 0; n < 3; n++) { c.beginPath(); c.arc(f.x + f.face * 50, f.y - 74, (1 - ((S.dom.t * 3 + n * 30) % 90) / 90) * 120, 0, 7); c.stroke(); } c.fillStyle = `rgba(255,${200 + k * 55},${120 + k * 135},.9)`; c.beginPath(); c.arc(f.x + f.face * 50, f.y - 74, 8 + k * 26, 0, 7); c.fill(); c.restore(); }
  if (FX.flash > .02) { c.globalAlpha = FX.flash; c.fillStyle = FX.flashCol; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
}

function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
const FONT = '"Segoe UI", system-ui, sans-serif';

// labels[i] = { P, K, G, A1, A2, A3, DOM, move } key names for that player, or null (computer / remote)
function drawHUD(c, S, labels) {
  c.textBaseline = 'middle';
  for (let i = 0; i < 2; i++) {
    const f = S.f[i], ch = CH[f.ch], mh = ch.hp, left = i === 0, bw = 500, x0 = left ? 40 : W - 40 - bw, y0 = 34;
    // health
    c.fillStyle = 'rgba(8,8,14,.8)'; rr(c, x0 - 4, y0 - 4, bw + 8, 34, 6); c.fill();
    const fillBar = (frac, col, y, h) => { const w = bw * clamp(frac, 0, 1); c.fillStyle = col; c.fillRect(left ? x0 + bw - w : x0, y, w, h); };
    fillBar(f.ghost / mh, '#b3362e', y0, 26);
    const low = f.hp <= mh * DOM_HP; let g = c.createLinearGradient(0, y0, 0, y0 + 26); g.addColorStop(0, low ? '#ffb347' : '#8dff9a'); g.addColorStop(1, low ? '#e0662a' : '#2fae58'); fillBar(f.hp / mh, g, y0, 26);
    c.fillStyle = 'rgba(255,255,255,.5)'; const mx = left ? x0 + bw - bw * DOM_HP : x0 + bw * DOM_HP; c.fillRect(mx - 1, y0, 2, 26);
    // CE and guard
    c.fillStyle = 'rgba(8,8,14,.8)'; rr(c, x0 - 4, y0 + 34, bw * .7 + 8, 18, 5); c.fill(); const cw = bw * .7;
    c.fillStyle = ch.look.accent; const w = cw * f.ce / MAXCE; c.fillRect(left ? x0 : x0 + bw - w, y0 + 38, w, 10);
    c.fillStyle = 'rgba(255,255,255,.35)'; for (let n = 1; n < 10; n++) c.fillRect(left ? x0 + cw * n / 10 : x0 + bw - cw * n / 10, y0 + 38, 1, 10);
    c.font = `700 13px ${FONT}`; c.fillStyle = '#fff'; c.textAlign = left ? 'left' : 'right';
    c.fillText(`CE ${Math.floor(f.ce)}`, left ? x0 + cw + 14 : x0 + bw - cw - 14, y0 + 43);
    c.font = `800 20px ${FONT}`; c.fillText(ch.name.toUpperCase(), left ? x0 : x0 + bw, y0 - 16);
    c.font = `600 13px ${FONT}`; c.fillStyle = ch.look.accent; c.textAlign = left ? 'right' : 'left'; c.fillText(ch.tech.toUpperCase(), left ? x0 + bw : x0, y0 - 15);
    for (let n = 0; n < 2; n++) { c.beginPath(); c.arc(left ? x0 + bw - 12 - n * 22 : x0 + 12 + n * 22, y0 + 44, 7, 0, 7); c.fillStyle = S.wins[i] > n ? '#ffd866' : 'rgba(8,8,14,.8)'; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.stroke(); }
    // guard meter under the fighter when it matters
    if (f.guardHp < 99) { c.fillStyle = 'rgba(8,8,14,.7)'; c.fillRect(f.x - 26, f.y + 10, 52, 6); c.fillStyle = f.guardHp < 35 ? '#ff5a5a' : '#9fd0ff'; c.fillRect(f.x - 25, f.y + 11, 50 * f.guardHp / 100, 4); }
    // ability cards
    const lab = labels[i], cwid = 142, gap = 6, total = cwid * 4 + gap * 3, cx0 = left ? 30 : W - 30 - total, cy = H - 86;
    for (let n = 0; n < 4; n++) {
      const x = cx0 + n * (cwid + gap), isDom = n === 3, a = isDom ? ch.dom : ch.arts[n];
      const ready = isDom ? domReady(f) : (f.cd[n] <= 0 && f.ce >= a.cost), used = isDom && f.domUsed;
      c.fillStyle = ready ? 'rgba(14,14,24,.92)' : 'rgba(14,14,24,.72)'; rr(c, x, cy, cwid, 64, 8); c.fill();
      c.strokeStyle = ready ? ch.look.accent : 'rgba(255,255,255,.18)'; c.lineWidth = ready ? 2.5 : 1.5;
      if (isDom && ready) { c.lineWidth = 3 + Math.sin(S.t * .2) * 1.5; c.strokeStyle = '#fff'; }
      if (!isDom && FX.nope[i] > 0 && !ready) c.strokeStyle = '#ff5a5a';
      rr(c, x, cy, cwid, 64, 8); c.stroke();
      c.globalAlpha = ready ? 1 : .55;
      if (lab) { c.fillStyle = ready ? ch.look.accent : '#888'; rr(c, x + 8, cy + 8, 30, 26, 5); c.fill(); c.fillStyle = '#0b0b12'; c.font = `800 ${lab[isDom ? 'DOM' : 'A' + (n + 1)].length > 1 ? 11 : 16}px ${FONT}`; c.textAlign = 'center'; c.fillText(lab[isDom ? 'DOM' : 'A' + (n + 1)], x + 23, cy + 22); }
      c.textAlign = 'left'; c.fillStyle = '#fff'; c.font = `700 ${a.name.length > 16 ? 11 : 13}px ${FONT}`; c.fillText(a.name, x + (lab ? 46 : 10), cy + 21);
      c.font = `600 12px ${FONT}`;
      if (isDom) { c.fillStyle = used ? '#888' : ready ? '#fff' : '#bbb'; c.fillText(used ? 'Used this round' : ready ? 'READY' : (ch.dom.maximum ? 'Maximum' : 'Domain') + ' · gauge or 30% HP', x + 10, cy + 47); if (!used && !ready) { c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(x + 8, cy + 56, cwid - 16, 3); c.fillStyle = '#fff'; c.fillRect(x + 8, cy + 56, (cwid - 16) * f.gauge / GAUGE_MAX, 3); } }
      else { c.fillStyle = f.ce >= a.cost ? ch.look.accent : '#ff7a7a'; c.fillText(a.cost + ' CE', x + 10, cy + 47); if (f.cd[n] > 0) { c.fillStyle = '#ddd'; c.textAlign = 'right'; c.fillText((f.cd[n] / 60).toFixed(1) + 's', x + cwid - 10, cy + 47); c.globalAlpha = 1; c.fillStyle = 'rgba(255,255,255,.75)'; c.fillRect(x + 8, cy + 56, (cwid - 16) * (1 - f.cd[n] / a.cd), 3); } }
      c.globalAlpha = 1;
    }
    if (lab) { c.font = `600 12px ${FONT}`; c.fillStyle = 'rgba(255,255,255,.75)'; c.textAlign = left ? 'left' : 'right'; c.fillText(`Move ${lab.move}   Jump ${lab.U}   Guard ${lab.G}   Punch ${lab.P} (x3)   Kick ${lab.K}`, left ? cx0 + 2 : cx0 + total - 2, cy - 12); }
    else { c.font = `600 12px ${FONT}`; c.fillStyle = 'rgba(255,255,255,.6)'; c.textAlign = left ? 'left' : 'right'; c.fillText(labels.other || 'Computer', left ? cx0 + 2 : cx0 + total - 2, cy - 12); }
  }
  // timer
  c.fillStyle = 'rgba(8,8,14,.85)'; rr(c, W / 2 - 38, 24, 76, 50, 8); c.fill(); c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = `800 32px ${FONT}`; c.fillText(Math.ceil(S.timer / 60), W / 2, 50);
  if (S.dom && !S.freeze) { const d = CH[S.f[S.dom.o].ch]; c.font = `700 14px ${FONT}`; c.fillStyle = d.look.accent; c.fillText(d.dom.name.toUpperCase(), W / 2, 92); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(W / 2 - 80, 104, 160, 4); c.fillStyle = d.look.accent; c.fillRect(W / 2 - 80, 104, 160 * (1 - S.dom.t / S.dom.dur), 4); }
  const b = FX.banner;
  if (b) { const k = Math.min(1, b.t / 8), out = Math.min(1, (b.life - b.t) / 10); c.save(); c.globalAlpha = out; c.translate(W / 2, b.small ? 200 : 300); c.scale(1 + (1 - k) * 1.5, 1 + (1 - k) * 1.5); c.textAlign = 'center'; if (!b.small) { c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(-W, -60, W * 2, 120); } c.font = `italic 900 ${b.small ? 40 : b.txt.length > 14 ? 60 : 84}px ${FONT}`; c.lineWidth = 8; c.strokeStyle = '#0b0b12'; c.strokeText(b.txt, 0, 0); c.fillStyle = b.col || '#fff'; c.fillText(b.txt, 0, 0); if (b.sub) { c.font = `700 20px ${FONT}`; c.fillStyle = '#fff'; c.fillText(b.sub, 0, -52); } c.restore(); }
}
