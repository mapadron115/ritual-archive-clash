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

// Mirror match: player 2 wears a pale second outfit so the two can be told apart.
const ALT_CACHE = new Map();
function altLook(lk) { if (!ALT_CACHE.has(lk)) ALT_CACHE.set(lk, Object.assign({}, lk, { top: '#ece6f5', pants: '#6a5f7c', hair: lk.hair === '#e9f2ff' ? '#ffd0e4' : lk.hair })); return ALT_CACHE.get(lk); }
function lookOf(S, f) { const lk = CH[f.ch].look; return f.i === 1 && S.f[0].ch === S.f[1].ch ? altLook(lk) : lk; }
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
function shade(hex, k) { const n = parseInt(hex.slice(1), 16); const r = Math.min(255, Math.round(((n >> 16) & 255) * k)), g = Math.min(255, Math.round(((n >> 8) & 255) * k)), b = Math.min(255, Math.round((n & 255) * k)); return `rgb(${r},${g},${b})`; }
const INK = '#1b1424';
function limb(c, x1, y1, x2, y2, w, col) {
  c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = w + 8; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
}
function blob(c, col, path) { c.beginPath(); path(); c.closePath(); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = 4; c.lineJoin = 'round'; c.stroke(); }
function seg(x, y, a, len) { return [x + Math.sin(a) * len, y + Math.cos(a) * len]; }

// Chunky cartoon fighter: big head, stubby limbs, thick ink outline, flat colours.
function drawFighter(c, S, f, alpha) {
  const lk = f.portrait ? (f.alt ? altLook(CH[f.ch].look) : CH[f.ch].look) : lookOf(S, f); let p = targetPose(S, f);
  const pc = POSE_CACHE[f.i]; p = POSE_CACHE[f.i] = pc ? lerpPose(pc, p, 0.42) : lerpPose(p, p, 1);
  const hurt = f.st === 'hit' || f.st === 'stun' || f.st === 'ko' || f.st === 'down', angry = f.st === 'atk' || f.st === 'cast';
  c.save(); c.translate(f.x, f.y); c.globalAlpha = alpha || 1;
  c.save(); c.translate(0, GROUND - f.y); c.fillStyle = 'rgba(20,10,30,.35)'; c.beginPath(); c.ellipse(0, 3, 44 * Math.max(.4, 1 - (GROUND - f.y) / 400), 9, 0, 0, 7); c.fill(); c.restore();
  c.scale(f.face, 1);
  let rot = 0;
  if (f.st === 'down') rot = -1.45; else if (f.st === 'ko') rot = f.y >= GROUND ? -1.5 : -0.9; else if (f.st === 'hit' && f.air) rot = -0.7;
  if (f.st === 'stun') rot = Math.sin(S.t * 0.3) * 0.06;
  if (rot) { c.translate(0, -14); c.rotate(rot); }
  // squash and stretch
  const st = f.y < GROUND ? clamp(Math.abs(f.vy) * 0.008, 0, .12) : 0; c.scale(1 - st, 1 + st);
  if (f.inv > 0 && S.t % 4 < 2) c.globalAlpha *= 0.5;
  const hipY = -40 + p.dy * .7, lean = p.lean * .9;
  const nx = Math.sin(lean) * 30, ny = hipY - Math.cos(lean) * 30;
  const drawLeg = (l, col, front) => {
    const k = seg(0, hipY + 2, l[0], 19), ft = seg(k[0], k[1], l[0] + l[1], 19);
    limb(c, 0, hipY + 2, k[0], k[1], 15, col); limb(c, k[0], k[1], ft[0], ft[1], 14, col);
    blob(c, front ? '#2a2233' : '#1f1a26', () => c.ellipse(ft[0] + 7, ft[1] + 2, 15, 9, 0, 0, 7));
  };
  const drawArm = (a, col, front) => {
    const sx = nx + (front ? 3 : -3), sy = ny + 7, e = seg(sx, sy, a[0], 17), h = seg(e[0], e[1], a[0] + a[1], 17);
    limb(c, sx, sy, e[0], e[1], 13, col); limb(c, e[0], e[1], h[0], h[1], 12, col);
    blob(c, front ? lk.skin : shade(lk.skin, .82), () => c.arc(h[0], h[1], 10.5, 0, 7));
    return h;
  };
  drawArm(p.ab, shade(lk.top, .72), false);
  drawLeg(p.lb, shade(lk.pants, .78), false);
  // cape / scarf tail
  const sway = Math.sin(S.t * .1 + f.i * 2) * 5 - f.vx * 2.2;
  blob(c, lk.accent, () => { c.moveTo(nx - 6, ny + 2); c.quadraticCurveTo(nx - 30 + sway, ny + 12, nx - 34 + sway * 1.6, ny + 34); c.lineTo(nx - 20 + sway, ny + 30); c.quadraticCurveTo(nx - 14, ny + 16, nx + 2, ny + 10); });
  // body
  limb(c, 0, hipY, nx, ny, 34, lk.top);
  c.strokeStyle = shade(lk.top, 1.35); c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(nx * .3 + 7, hipY - 8); c.lineTo(nx * .8 + 8, ny + 6); c.stroke();
  c.strokeStyle = INK; c.lineWidth = 9; c.beginPath(); c.moveTo(-15, hipY + 1); c.lineTo(15, hipY + 1); c.stroke();
  c.strokeStyle = lk.accent; c.lineWidth = 5; c.beginPath(); c.moveTo(-15, hipY + 1); c.lineTo(15, hipY + 1); c.stroke();
  drawLeg(p.lf, lk.pants, true);
  // head
  const ha = lean + (p.hd || 0), hx = nx + Math.sin(ha) * 30 + 2, hy = ny - Math.cos(ha) * 30, R = 29;
  c.save(); c.translate(hx, hy); c.rotate(-(p.hd || 0) * .6);
  if (lk.style === 'long') blob(c, lk.hair, () => { c.moveTo(-18, -20); c.quadraticCurveTo(-50 + sway, 10, -40 + sway * 1.5, 62); c.quadraticCurveTo(-26 + sway, 50, -22 + sway, 66); c.quadraticCurveTo(-10, 40, -6, 10); });
  if (lk.style === 'top') blob(c, lk.hair, () => c.arc(-6, -36, 13, 0, 7));
  blob(c, lk.skin, () => c.arc(0, 0, R, 0, 7));
  c.fillStyle = shade(lk.skin, .88); c.beginPath(); c.arc(0, 0, R - 2, .5, 2.4); c.fill();
  // hair
  if (lk.style === 'buzz') { blob(c, lk.hair, () => { c.arc(0, 0, R, Math.PI * 1.02, Math.PI * 1.92); c.quadraticCurveTo(4, -14, -R + 2, -4); }); blob(c, shade(lk.hair, .9), () => { c.moveTo(6, 16); c.quadraticCurveTo(20, 34, 30, 12); c.quadraticCurveTo(18, 20, 6, 16); }); }
  else blob(c, lk.hair, () => {
    c.arc(0, 0, R + 1, Math.PI * 0.82, Math.PI * 1.9);
    if (lk.style === 'spiky') { c.lineTo(40, -30); c.lineTo(20, -22); c.lineTo(26, -50); c.lineTo(4, -32); c.lineTo(-2, -56); c.lineTo(-16, -32); c.lineTo(-34, -48); c.lineTo(-30, -22); c.lineTo(-48, -22); }
    c.quadraticCurveTo(14, -10, 2, -16); c.quadraticCurveTo(-10, -6, -22, 8);
    if (lk.style === 'bob') { c.lineTo(-26, 30); c.lineTo(-34, 22); }
  });
  if (lk.style === 'spiky') { c.strokeStyle = lk.accent; c.lineWidth = 6; c.beginPath(); c.arc(0, 0, R - 1, Math.PI * 1.08, Math.PI * 1.86); c.stroke(); }
  if (lk.style === 'buzz') { blob(c, '#3a3f45', () => c.rect(2, -24, 26, 11)); c.fillStyle = lk.accent; c.fillRect(6, -21, 8, 5); c.fillRect(17, -21, 8, 5); }
  // face
  if (f.st === 'ko' || f.st === 'down') { c.strokeStyle = INK; c.lineWidth = 3.5; for (const ex of [6, 20]) { c.beginPath(); c.moveTo(ex - 4, -4); c.lineTo(ex + 4, 4); c.moveTo(ex + 4, -4); c.lineTo(ex - 4, 4); c.stroke(); } }
  else {
    const blink = !hurt && (S.t + f.i * 37) % 170 < 5, eh = blink ? 1.5 : hurt ? 9 : 7.5;
    for (const ex of [6, 20]) { c.fillStyle = '#fff'; c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.ellipse(ex, 0, 5.5, eh, 0, 0, 7); c.fill(); c.stroke(); if (!blink) { c.fillStyle = INK; c.beginPath(); c.arc(ex + (hurt ? 0 : 1.8), hurt ? 0 : 1, hurt ? 2 : 3.2, 0, 7); c.fill(); } }
    c.strokeStyle = INK; c.lineWidth = 3.5; c.lineCap = 'round'; c.beginPath();
    if (angry) { c.moveTo(0, -13); c.lineTo(11, -8); c.moveTo(27, -13); c.lineTo(16, -8); }
    else if (hurt) { c.moveTo(0, -10); c.lineTo(11, -14); c.moveTo(27, -10); c.lineTo(16, -14); }
    else { c.moveTo(1, -12); c.lineTo(11, -12); c.moveTo(16, -12); c.lineTo(26, -12); }
    c.stroke();
  }
  c.strokeStyle = INK; c.lineWidth = 3; c.fillStyle = '#5a1a24'; c.beginPath();
  if (hurt) { c.ellipse(14, 16, 5, 6, 0, 0, 7); c.fill(); c.stroke(); }
  else if (angry) { c.moveTo(6, 14); c.lineTo(22, 14); c.lineTo(20, 20); c.lineTo(8, 20); c.closePath(); c.fillStyle = '#fff'; c.fill(); c.stroke(); }
  else if (S.phase === 'over' && S.wins[f.i] >= 2) { c.arc(14, 12, 8, .1, Math.PI - .1); c.closePath(); c.fill(); c.stroke(); }
  else { c.moveTo(8, 15); c.quadraticCurveTo(14, 18, 21, 14); c.stroke(); }
  c.restore();
  const hand = drawArm(p.af, lk.top, true);
  if ((f.st === 'atk' && !BASIC[f.move]) || f.st === 'cast') { c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(hand[0], hand[1], 0, hand[0], hand[1], 34); g.addColorStop(0, lk.accent); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(hand[0], hand[1], 34, 0, 7); c.fill(); c.globalCompositeOperation = 'source-over'; }
  if (f.st === 'atk' && BASIC[f.move]) { const m = BASIC[f.move]; if (f.mt >= m.su - 1 && f.mt < m.su + m.ac + 3) { const cy = m.pose.indexOf('kick') >= 0 ? -34 : -62, R2 = m.reach * .78; c.globalAlpha = clamp(1.2 - (f.mt - m.su + 1) / (m.ac + 4), 0, 1); c.fillStyle = '#fff'; c.strokeStyle = lk.accent; c.lineWidth = 3; c.beginPath(); c.arc(18, cy, R2, -1.0, 0.9); c.arc(2, cy, R2 * .9, 0.75, -0.85, true); c.closePath(); c.fill(); c.stroke(); c.globalAlpha = 1; } }
  c.restore();
  if (f.inf > 0) { c.save(); c.strokeStyle = INK; c.lineWidth = 7; c.globalAlpha = .5; c.beginPath(); c.ellipse(f.x, f.y - 66, 58, 86, 0, 0, 7); c.stroke(); c.globalAlpha = 1; c.strokeStyle = `rgba(140,220,255,${.7 + .25 * Math.sin(S.t * .4)})`; c.lineWidth = 4; c.setLineDash([14, 10]); c.lineDashOffset = S.t * 1.5; c.beginPath(); c.ellipse(f.x, f.y - 66, 58, 86, 0, 0, 7); c.stroke(); c.fillStyle = 'rgba(140,220,255,.12)'; c.fill(); c.restore(); }
  if (f.st === 'stun') { for (let n = 0; n < 3; n++) { const a = S.t * .15 + n * 2.1, sx = f.x + Math.cos(a) * 28, sy = f.y - 140 + Math.sin(a) * 7; c.fillStyle = '#ffe36b'; c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 4 : 9, b = k * Math.PI / 5 + a; c.lineTo(sx + Math.cos(b) * r, sy + Math.sin(b) * r); } c.closePath(); c.fill(); c.stroke(); } }
}

function makeBG() {
  BG = document.createElement('canvas'); BG.width = W; BG.height = H; const c = BG.getContext('2d');
  let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const bands = ['#2b2d6e', '#4b3b8f', '#8a4a9c', '#d0607f', '#f58a5f', '#ffc46b'];
  bands.forEach((b, n) => { c.fillStyle = b; c.fillRect(0, n * 95, W, 96); });
  // sun
  c.fillStyle = '#ffe9a8'; c.beginPath(); c.arc(930, 400, 150, 0, 7); c.fill(); c.fillStyle = '#fff6d6'; c.beginPath(); c.arc(930, 400, 118, 0, 7); c.fill();
  const cloud = (x, y, k, col) => { c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.arc(x, y, 26 * k, Math.PI, 0); c.arc(x + 38 * k, y - 8 * k, 34 * k, Math.PI * 1.1, 0); c.arc(x + 82 * k, y, 24 * k, Math.PI * 1.2, 0); c.lineTo(x + 108 * k, y + 14 * k); c.lineTo(x - 26 * k, y + 14 * k); c.closePath(); c.fill(); c.stroke(); };
  cloud(120, 150, 1.3, '#f6d7e8'); cloud(520, 90, 1, '#e8c3e6'); cloud(1040, 170, 1.5, '#ffe1d0'); cloud(760, 250, .8, '#ffd3c4');
  // far hills
  const hills = (base, amp, col, seed) => { c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(-10, H); for (let x = -10; x <= W + 10; x += 10) c.lineTo(x, base - Math.abs(Math.sin(x * .004 + seed)) * amp - Math.sin(x * .013 + seed * 2) * amp * .2); c.lineTo(W + 10, H); c.closePath(); c.fill(); c.stroke(); };
  hills(470, 150, '#6b4a9c', 1); hills(520, 90, '#4f3a80', 2.6);
  // rooftops
  for (let x = -30; x < W; ) { const w = 110 + r() * 110, h = 60 + r() * 80, y = GROUND - 46 - h; c.fillStyle = '#3b2c5e'; c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.rect(x, y, w, h + 20); c.fill(); c.stroke(); c.fillStyle = '#7a3550'; c.beginPath(); c.moveTo(x - 14, y); c.lineTo(x + w / 2, y - 34); c.lineTo(x + w + 14, y); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#ffd36b'; for (let k = 0; k < 2; k++) { const wx = x + 18 + k * (w - 60); c.beginPath(); c.rect(wx, y + 18, 22, 22); c.fill(); c.stroke(); } x += w + 26; }
  // arena floor
  c.fillStyle = '#c9a26b'; c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.rect(-10, GROUND - 46, W + 20, H); c.fill(); c.stroke();
  c.fillStyle = '#e3bf86'; c.fillRect(-10, GROUND - 43, W + 20, 16);
  c.strokeStyle = 'rgba(27,20,36,.35)'; c.lineWidth = 3; for (let n = -9; n <= 9; n++) { c.beginPath(); c.moveTo(640 + n * 100, GROUND - 26); c.lineTo(640 + n * 250, H); c.stroke(); }
  c.fillStyle = '#a9824f'; c.fillRect(-10, GROUND + 60, W + 20, H); c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(0, GROUND + 60); c.lineTo(W, GROUND + 60); c.stroke();
  c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(0, GROUND - 26); c.lineTo(W, GROUND - 26); c.stroke();
  // banners and lanterns
  for (const x of [130, 1150]) { c.fillStyle = '#4a2f24'; c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.rect(x - 7, GROUND - 300, 14, 256); c.fill(); c.stroke(); const col = x < 640 ? '#3aa0ff' : '#ff4b4b'; c.fillStyle = col; c.beginPath(); c.moveTo(x + 7, GROUND - 292); c.lineTo(x + 78, GROUND - 292); c.lineTo(x + 78, GROUND - 170); c.lineTo(x + 42, GROUND - 196); c.lineTo(x + 7, GROUND - 170); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x + 42, GROUND - 240, 16, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#ffb347'; c.beginPath(); c.ellipse(x - 30, GROUND - 250, 16, 22, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#fff3c0'; c.beginPath(); c.ellipse(x - 30, GROUND - 250, 7, 12, 0, 0, 7); c.fill(); }
}

function burst(x, y, n, col, sp, life) { for (let k = 0; k < n; k++) { const a = Math.random() * 7, v = sp * (.3 + Math.random()); FX.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: life || 22, t: 0, col, s: 3 + Math.random() * 5 }); } }
function puff(x, y, n) { for (let k = 0; k < n; k++) FX.puffs.push({ x: x + (Math.random() - .5) * 30, y: y - Math.random() * 8, vx: (Math.random() - .5) * 3, r: 7 + Math.random() * 8, t: 0, life: 18 + Math.random() * 8 }); }
function star(x, y, r, col, life) { FX.stars.push({ x, y, r, rot: Math.random() * 7, col, t: 0, life: life || 9 }); }
function fxEvent(S, e) {
  switch (e.k) {
    case 'hit': {
      const big = e.a > 70; star(e.x, e.y, 22 + e.a / 3, big ? '#ffe36b' : '#fff', big ? 12 : 8); burst(e.x, e.y, 5 + e.a / 10, '#fff2b0', 5 + e.a / 18);
      if (e.a >= 4) FX.nums.push({ x: e.x + (Math.random() - .5) * 30, y: e.y - 50, txt: Math.round(e.a), t: 0, life: 40, big });
      if (big) for (let n = 0; n < 10; n++) { const a = Math.random() * 7; FX.lines.push({ x1: e.x + Math.cos(a) * 60, y1: e.y + Math.sin(a) * 60, x2: e.x + Math.cos(a) * 170, y2: e.y + Math.sin(a) * 170, t: 0, life: 9, col: '#fff', w: 5 }); }
      FX.shake = Math.max(FX.shake, Math.min(16, 3 + e.a / 10)); break;
    }
    case 'block': star(e.x, e.y, 20, '#9fd0ff', 7); burst(e.x, e.y, 4, '#cfe8ff', 3); break;
    case 'break': star(e.x, e.y, 60, '#ffe36b', 14); burst(e.x, e.y, 24, '#ffe36b', 8); FX.shake = 12; FX.banner = { txt: 'GUARD BREAK', t: 0, life: 40, small: 1 }; break;
    case 'inf': FX.rings.push({ x: e.x, y: e.y, r: 40, vr: 2, t: 0, life: 14, col: '#7fd6ff' }); break;
    case 'clap': star(e.x, e.y, 34, '#ffe9a0', 8); FX.rings.push({ x: e.x, y: e.y, r: 6, vr: 9, t: 0, life: 12, col: '#ffe9a0' }); break;
    case 'swap': FX.lines.push({ x1: e.x, y1: e.y, x2: e.a, y2: e.b, t: 0, life: 12, col: '#ffe9a0', w: 7 }); puff(e.x, e.y + 40, 5); puff(e.a, e.b + 40, 5); burst(e.x, e.y, 8, '#ffd866', 4); burst(e.a, e.b, 8, '#ffd866', 4); FX.flash = .15; FX.flashCol = '#ffe9a0'; break;
    case 'slash': FX.lines.push({ x1: e.x - 50, y1: e.y - 40 - (e.a ? 20 : 0), x2: e.x + 50, y2: e.y + 40 + (e.a ? 20 : 0), t: 0, life: 9, col: '#ff5a5a', w: e.a ? 12 : 7 }); break;
    case 'rain': for (let n = 0; n < 3; n++) { const x = e.x + (Math.random() - .5) * 160, y = e.y + (Math.random() - .5) * 120, a = Math.random() * 3; FX.lines.push({ x1: x - Math.cos(a) * 70, y1: y - Math.sin(a) * 70, x2: x + Math.cos(a) * 70, y2: y + Math.sin(a) * 70, t: 0, life: 8, col: '#ff3b3b', w: 6 }); } for (let n = 0; n < 4; n++) { const x = Math.random() * W, y = 150 + Math.random() * 450; FX.lines.push({ x1: x - 60, y1: y - 40, x2: x + 60, y2: y + 40, t: 0, life: 8, col: 'rgba(255,60,60,.5)', w: 4 }); } break;
    case 'boom': star(e.x, e.y, e.a * .9, '#ffb347', 14); star(e.x, e.y, e.a * .5, '#fff3c0', 12); burst(e.x, e.y, 24, '#ffb347', 9, 30); puff(e.x, e.y + 30, 8); FX.shake = 14; FX.flash = .25; FX.flashCol = '#fff'; break;
    case 'pop': star(e.x, e.y, 16, '#fff', 6); break;
    case 'poof': puff(e.x, e.y, 8); burst(e.x, e.y, 8, '#a47bff', 4, 26); break;
    case 'summon': puff(e.x, e.y, 6); burst(e.x, e.y - 10, 12, '#a47bff', 5, 26); FX.rings.push({ x: e.x, y: e.y, r: 10, vr: 5, t: 0, life: 12, col: '#a47bff' }); break;
    case 'zap': star(e.x, e.y, 50, '#fff799', 10); burst(e.x, e.y, 12, '#fff799', 7); FX.flash = .2; FX.flashCol = '#fff799'; break;
    case 'beam': FX.shake = 10; FX.flash = .2; FX.flashCol = '#ffd9a0'; break;
    case 'nuke': FX.shake = 28; FX.flash = .8; FX.flashCol = '#fff'; break;
    case 'blast': star(e.x, e.y, 26, '#fff', 6); break;
    case 'wall': star(e.x, e.y, 46, '#fff', 10); puff(e.x, e.y + 40, 6); FX.shake = 12; break;
    case 'thud': puff(e.x, e.y, 6); FX.shake = Math.max(FX.shake, 5); break;
    case 'land': case 'jump': puff(e.x, GROUND, 3); break;
    case 'tick': burst(e.x, e.y, 3, '#c9b8ff', 2); break;
    case 'ko': FX.banner = { txt: 'K.O.', t: 0, life: 120 }; FX.flash = .6; FX.flashCol = '#fff'; FX.shake = 20; break;
    case 'round': FX.banner = { txt: 'ROUND ' + e.a, t: 0, life: 70 }; break;
    case 'fight': FX.banner = { txt: 'FIGHT!', t: 0, life: 45, col: '#ffe36b' }; break;
    case 'domain': { const d = CH[e.a].dom; FX.banner = { txt: d.name.toUpperCase(), sub: d.maximum ? 'MAXIMUM' : 'DOMAIN EXPANSION', t: 0, life: 70, col: CH[e.a].look.accent }; FX.flash = .5; FX.flashCol = CH[e.a].look.accent; break; }
    case 'clash': FX.banner = { txt: 'DOMAIN CLASH', t: 0, life: 60 }; FX.flash = .9; FX.flashCol = '#fff'; FX.shake = 24; star(e.x, e.y, 200, '#fff', 16); burst(e.x, e.y, 50, '#fff', 12, 40); break;
    case 'nope': FX.nope[e.a] = 18; break;
  }
  if (!FX.silent && typeof sfx === 'function') sfx(e);
}
function fxTick() {
  for (const p of FX.parts) { p.t++; p.x += p.vx; p.y += p.vy; p.vy += .25; p.vx *= .95; }
  FX.parts = FX.parts.filter(p => p.t < p.life); if (FX.parts.length > 400) FX.parts.splice(0, FX.parts.length - 400);
  for (const r of FX.rings) { r.t++; r.r += r.vr; } FX.rings = FX.rings.filter(r => r.t < r.life);
  for (const l of FX.lines) l.t++; FX.lines = FX.lines.filter(l => l.t < l.life);
  for (const s of FX.stars) s.t++; FX.stars = FX.stars.filter(s => s.t < s.life);
  for (const p of FX.puffs) { p.t++; p.x += p.vx; p.y -= .6; p.r += .5; } FX.puffs = FX.puffs.filter(p => p.t < p.life);
  for (const n of FX.nums) { n.t++; n.y -= 1.4 * Math.max(0, 1 - n.t / 20); } FX.nums = FX.nums.filter(n => n.t < n.life);
  FX.shake *= .85; FX.flash *= .86; if (FX.banner && ++FX.banner.t > FX.banner.life) FX.banner = null;
  if (FX.nope[0] > 0) FX.nope[0]--; if (FX.nope[1] > 0) FX.nope[1]--;
}
FX.stars = []; FX.puffs = []; FX.nums = []; FX.cam = { x: W / 2, y: H / 2, z: 1 }; FX.clock = 0; FX.silent = false;

function drawStar(c, x, y, r, rot, col) { c.beginPath(); for (let k = 0; k < 16; k++) { const rr2 = k % 2 ? r * .48 : r, a = rot + k * Math.PI / 8; c.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } c.closePath(); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = 4; c.lineJoin = 'round'; c.stroke(); }
function drawCloud(c, x, y, k, col) { c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.arc(x, y, 26 * k, Math.PI, 0); c.arc(x + 38 * k, y - 8 * k, 34 * k, Math.PI * 1.1, 0); c.arc(x + 82 * k, y, 24 * k, Math.PI * 1.2, 0); c.lineTo(x + 108 * k, y + 14 * k); c.lineTo(x - 26 * k, y + 14 * k); c.closePath(); c.fill(); c.stroke(); }
function drawStone(c, x, y, t) { c.save(); c.translate(x, y); c.rotate(t * .2); blob(c, '#9a927f', () => { c.moveTo(-12, -5); c.lineTo(-3, -13); c.lineTo(11, -8); c.lineTo(13, 5); c.lineTo(2, 13); c.lineTo(-11, 9); }); c.strokeStyle = '#ffd866'; c.lineWidth = 3; c.setLineDash([5, 6]); c.beginPath(); c.arc(0, 0, 20 + Math.sin(t * .3) * 2, 0, 7); c.stroke(); c.restore(); }

function drawDomainBack(c, S) {
  const d = S.dom; if (!d) return; const a = Math.min(1, (S.freeze ? 60 - S.freeze : 60) / 30) * Math.min(1, (d.dur - d.t) / 15 + .2), t = S.t;
  c.save(); c.globalAlpha = a * .9;
  if (d.k === 'void') { c.fillStyle = '#0a0a24'; c.fillRect(0, 0, W, H); c.globalAlpha = a; for (let n = 0; n < 60; n++) { const x = (n * 197 + t * (1 + n % 3)) % W, y = (n * 113) % H; drawStar(c, x, y, 5 + n % 4 * 2, n, n % 7 ? '#e6f3ff' : '#59c8ff'); } c.fillStyle = '#e6f3ff'; c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.arc(640, 290, 160 + Math.sin(t * .05) * 6, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#05050f'; c.beginPath(); c.arc(640, 290, 128, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#59c8ff'; c.beginPath(); c.arc(640, 290, 40 + Math.sin(t * .1) * 6, 0, 7); c.fill(); c.stroke(); }
  else if (d.k === 'shrine') { c.fillStyle = '#5a0d16'; c.fillRect(0, 0, W, H); c.fillStyle = '#7d1420'; c.fillRect(0, 300, W, 200); c.globalAlpha = a; c.fillStyle = '#1d0a10'; c.strokeStyle = INK; c.lineWidth = 5; for (let n = 0; n < 7; n++) { const x = 250 + n * 130; c.beginPath(); c.moveTo(x, GROUND - 40); c.quadraticCurveTo(x + (n - 3) * 20, 250, 640 + (n - 3) * 50, 170); c.lineTo(640 + (n - 3) * 50 + 16, 170); c.quadraticCurveTo(x + (n - 3) * 20 + 30, 260, x + 30, GROUND - 40); c.closePath(); c.fill(); c.stroke(); } c.beginPath(); c.rect(470, 138, 340, 30); c.fill(); c.stroke(); c.beginPath(); c.rect(515, 96, 250, 24); c.fill(); c.stroke(); c.fillStyle = '#3b0810'; c.beginPath(); c.rect(-10, GROUND - 26, W + 20, H); c.fill(); c.stroke(); }
  else if (d.k === 'garden') { c.fillStyle = '#150f2e'; c.fillRect(0, 0, W, H); c.globalAlpha = a; c.fillStyle = '#0a0718'; c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.rect(-10, GROUND - 26, W + 20, H); c.fill(); c.stroke(); for (let n = 0; n < 6; n++) { const r = (t * 2 + n * 150) % 900; c.strokeStyle = `rgba(164,123,255,${.6 - r / 1600})`; c.lineWidth = 5; c.beginPath(); c.ellipse(640, GROUND + 30, r, r * .1, 0, 0, 7); c.stroke(); } for (let n = 0; n < 9; n++) { const x = 80 + n * 140, h = 60 + Math.sin(t * .05 + n) * 30; c.fillStyle = '#0a0718'; c.strokeStyle = '#a47bff'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 20, GROUND - 26); c.quadraticCurveTo(x + Math.sin(t * .04 + n) * 20, GROUND - 26 - h * 2, x + 20, GROUND - 26); c.fill(); c.stroke(); } }
  else if (d.k === 'ovation') { c.fillStyle = '#1a1206'; c.fillRect(0, 0, W, H); c.globalAlpha = a * .7; const o = S.f[1 - d.o]; c.fillStyle = '#ffe9a0'; c.beginPath(); c.moveTo(o.x - 40, 0); c.lineTo(o.x + 40, 0); c.lineTo(o.x + 230, GROUND + 20); c.lineTo(o.x - 230, GROUND + 20); c.fill(); }
  else if (d.k === 'nuclear') { c.globalAlpha = a * Math.min(.8, d.t / 70); c.fillStyle = '#3a1a05'; c.fillRect(0, 0, W, H); }
  c.restore();
}

function camTarget(S) {
  const a = S.f[0], b = S.f[1]; let mx = (a.x + b.x) / 2, z = clamp(860 / (Math.abs(a.x - b.x) + 300), 1, 1.38);
  if (Math.min(a.y, b.y) < GROUND - 130) z = Math.min(z, 1.12);
  for (const p of S.proj) if (p.x < Math.min(a.x, b.x) - 60 || p.x > Math.max(a.x, b.x) + 60) z = 1;
  if (S.ents.length || S.zones.length || (S.dom && !S.freeze)) z = Math.min(z, 1.1);
  if (S.freeze > 0 && S.dom) { mx = S.f[S.dom.o].x; z = 1.5; }
  if (S.phase === 'ko' && S.phaseT < 80) { const l = S.f[0].st === 'ko' ? a : b; mx = l.x; z = 1.4; }
  return { x: clamp(mx, W / (2 * z), W - W / (2 * z)), y: clamp(GROUND - 0.3 * H / z, H / (2 * z), H - H / (2 * z)), z };
}
function camPt(x, y) { const m = FX.cam; return [(x - m.x) * m.z + W / 2, (y - m.y) * m.z + H / 2]; }

function drawWorld(c, S) {
  if (!BG) makeBG();
  FX.clock++;
  const tg = camTarget(S), m = FX.cam, k = S.freeze > 0 ? .12 : .06; m.x += (tg.x - m.x) * k; m.y += (tg.y - m.y) * k; m.z += (tg.z - m.z) * k;
  const sx = (Math.random() - .5) * FX.shake, sy = (Math.random() - .5) * FX.shake;
  c.save(); c.translate(W / 2 + sx, H / 2 + sy); c.scale(m.z, m.z); c.translate(-m.x, -m.y);
  c.drawImage(BG, 0, 0);
  // living sky: drifting clouds and petals
  for (let n = 0; n < 3; n++) drawCloud(c, ((n * 520 + FX.clock * (.12 + n * .05)) % (W + 400)) - 200, 210 + n * 55, .7 + n * .2, n === 1 ? '#ffe1d0' : '#f3d3ea');
  for (let n = 0; n < 16; n++) { const x = (n * 97 + FX.clock * (.7 + n % 3 * .25)) % (W + 40) - 20, y = (n * 61 + FX.clock * (.8 + n % 4 * .2)) % (GROUND + 30); c.save(); c.translate(x, y); c.rotate(FX.clock * .03 + n); c.fillStyle = n % 2 ? '#ffc2d6' : '#ffe0ea'; c.strokeStyle = INK; c.lineWidth = 1.5; c.beginPath(); c.ellipse(0, 0, 7, 3.5, 0, 0, 7); c.fill(); c.stroke(); c.restore(); }
  drawDomainBack(c, S);
  for (const z of S.zones) {
    if (z.k === 'blue') { const g = z.t < 48 ? 1 : 1 + (z.t - 48) / 4; c.save(); c.strokeStyle = 'rgba(120,190,255,.8)'; c.lineWidth = 4; for (let n = 0; n < 3; n++) { const r = 170 - ((z.t * 5 + n * 57) % 170); c.beginPath(); c.arc(z.x, z.y, r, z.t * .1 + n, z.t * .1 + n + 4.4); c.stroke(); } c.globalAlpha = z.t < 48 ? 1 : Math.max(0, 1 - (z.t - 48) / 12); blob(c, '#2f8fff', () => c.arc(z.x, z.y, 46 * g + Math.sin(z.t * .4) * 3, 0, 7)); blob(c, '#bfe4ff', () => c.arc(z.x - 8, z.y - 8, 20 * g, 0, 7)); c.restore(); }
    if (z.k === 'tongue') { const k2 = Math.sin(Math.min(1, z.t / z.dur) * Math.PI); c.strokeStyle = INK; c.lineWidth = 17; c.lineCap = 'round'; const ex = z.x + (z.tx - z.x) * (z.hitFoe ? Math.max(k2, .25) : k2); c.beginPath(); c.moveTo(z.x + z.face * 20, GROUND - 30); c.lineTo(ex, GROUND - 60); c.stroke(); c.strokeStyle = '#ff7aa8'; c.lineWidth = 10; c.stroke(); blob(c, '#5b46a8', () => c.ellipse(z.x, GROUND - 26, 40, 28, 0, 0, 7)); blob(c, '#8f7ae0', () => c.ellipse(z.x - z.face * 4, GROUND - 16, 24, 12, 0, 0, 7)); for (const ey of [-1, 1]) { blob(c, '#fff', () => c.arc(z.x + z.face * (8 + ey * 12), GROUND - 52, 10, 0, 7)); c.fillStyle = INK; c.beginPath(); c.arc(z.x + z.face * (10 + ey * 12), GROUND - 52, 4, 0, 7); c.fill(); } }
    if (z.k === 'pebble') drawStone(c, z.x, z.y, z.t);
  }
  for (const e of S.ents) {
    c.save(); c.translate(e.x, e.y); c.scale(e.face, 1);
    if (e.k === 'dog') { const run = Math.sin(e.t * .6) * 9, b = e.bite > 0 ? 8 : 0, col = e.v ? '#3a3050' : '#f4f1fb'; c.strokeStyle = INK; c.lineWidth = 13; c.lineCap = 'round'; c.beginPath(); c.moveTo(-18, -24); c.lineTo(-22 - run, -2); c.moveTo(14, -24); c.lineTo(18 + run, -2); c.stroke(); c.strokeStyle = col; c.lineWidth = 6; c.stroke(); blob(c, col, () => { c.moveTo(-28, -34); c.quadraticCurveTo(-50, -52, -42, -66); c.quadraticCurveTo(-36, -50, -22, -40); }); blob(c, col, () => c.ellipse(0, -32, 32, 16, 0, 0, 7)); blob(c, col, () => { c.moveTo(20, -52); c.lineTo(24, -72); c.lineTo(36, -54); }); blob(c, col, () => c.ellipse(32 + b, -42, 17, 14, -.2, 0, 7)); blob(c, '#fff', () => c.arc(36 + b, -46, 5.5, 0, 7)); c.fillStyle = '#a47bff'; c.beginPath(); c.arc(37 + b, -46, 2.8, 0, 7); c.fill(); c.fillStyle = INK; c.beginPath(); c.arc(48 + b, -40, 3.5, 0, 7); c.fill(); if (b) { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(40, -34); c.lineTo(44, -26); c.lineTo(48, -34); c.fill(); } }
    else if (e.k === 'nue') { const fl = Math.sin(e.t * .5) * 24; blob(c, '#f0a93a', () => { c.moveTo(0, -4); c.lineTo(-58, -34 - fl); c.lineTo(-40, -6); c.lineTo(-24, 4); }); blob(c, '#d88a1f', () => { c.moveTo(0, 4); c.lineTo(-46, 28 + fl); c.lineTo(-16, 10); }); blob(c, '#f0a93a', () => c.ellipse(0, 0, 30, 16, 0, 0, 7)); blob(c, '#fbf6ea', () => c.arc(24, -3, 14, 0, 7)); blob(c, '#fff', () => c.arc(28, -6, 5, 0, 7)); c.fillStyle = INK; c.beginPath(); c.arc(29, -6, 2.5, 0, 7); c.fill(); blob(c, '#ffb347', () => { c.moveTo(36, 0); c.lineTo(48, 4); c.lineTo(36, 8); }); c.strokeStyle = INK; c.lineWidth = 7; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-10, 12); c.lineTo(-4 + fl * .3, 30); c.lineTo(8, 24); c.lineTo(12, 44); c.stroke(); c.strokeStyle = '#fff799'; c.lineWidth = 3; c.stroke(); }
    c.restore();
  }
  for (const p of FX.puffs) { c.globalAlpha = 1 - p.t / p.life; c.fillStyle = '#f3e9da'; c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); c.stroke(); } c.globalAlpha = 1;
  const order = S.f[0].st === 'atk' ? [1, 0] : [0, 1];
  for (const i of order) drawFighter(c, S, S.f[i]);
  for (const z of S.zones) if (z.k === 'beam') {
    const k2 = 1 - z.t / z.dur, len = 1500; c.save(); c.translate(z.x, z.y); c.scale(z.face, 1);
    const far = z.w * k2 + (z.cone ? len * z.cone * (.4 + k2 * .6) : 0), shape = s => { c.beginPath(); c.moveTo(0, -z.w * k2 * s); c.lineTo(len, -far * s); c.lineTo(len, far * s); c.lineTo(0, z.w * k2 * s); c.closePath(); };
    c.globalAlpha = Math.min(1, k2 * 2); shape(1); c.fillStyle = '#ff9a2e'; c.fill(); c.strokeStyle = INK; c.lineWidth = 5; c.stroke(); shape(.62); c.fillStyle = '#ffd36b'; c.fill(); shape(.3); c.fillStyle = '#fff'; c.fill();
    blob(c, '#fff', () => c.arc(0, 0, z.w * 1.3 * k2 + 4, 0, 7)); c.restore();
  }
  for (const p of S.proj) {
    c.save(); c.translate(p.x, p.y); const a = Math.atan2(p.vy, p.vx);
    if (p.k === 'cut') { c.rotate(a); c.beginPath(); c.arc(-30, 0, 48, -.95, .95); c.arc(-46, 0, 50, .7, -.7, true); c.closePath(); c.fillStyle = '#fff'; c.fill(); c.strokeStyle = '#d4202f'; c.lineWidth = 4; c.lineJoin = 'round'; c.stroke(); }
    else if (p.k === 'red' || p.k === 'flame' || p.k === 'shell') { const col = p.k === 'red' ? '#ff3a4a' : p.k === 'flame' ? '#ff8a2a' : '#ffb347'; c.rotate(a); const w = Math.sin(p.t * .8) * 3; blob(c, col, () => { c.moveTo(0, -p.r); c.lineTo(-p.r * 3.4, w); c.lineTo(0, p.r); }); if (p.k === 'shell') { blob(c, '#4a4f55', () => { c.moveTo(-16, -11); c.lineTo(8, -11); c.quadraticCurveTo(26, 0, 8, 11); c.lineTo(-16, 11); }); c.fillStyle = '#ffb347'; c.fillRect(-8, -9, 6, 18); } else { blob(c, col, () => c.arc(0, 0, p.r + 3, 0, 7)); blob(c, p.k === 'red' ? '#ffc2c8' : '#ffe9a0', () => c.arc(3, -3, p.r * .5, 0, 7)); } }
    else if (p.k === 'pellet') { c.rotate(a); blob(c, '#ff9a2e', () => { c.moveTo(0, -7); c.lineTo(-30, 0); c.lineTo(0, 7); }); blob(c, '#ffe36b', () => c.arc(0, 0, 10, 0, 7)); }
    else if (p.k === 'stone') { c.restore(); drawStone(c, p.x, p.y, p.t); continue; }
    c.restore();
  }
  // effects
  c.lineCap = 'round';
  for (const l of FX.lines) { const k2 = 1 - l.t / l.life; c.globalAlpha = k2; c.strokeStyle = INK; c.lineWidth = l.w * k2 + 5; c.beginPath(); c.moveTo(l.x1, l.y1); c.lineTo(l.x2, l.y2); c.stroke(); c.strokeStyle = l.col; c.lineWidth = l.w * k2 + 1; c.stroke(); }
  for (const r of FX.rings) { c.globalAlpha = 1 - r.t / r.life; c.strokeStyle = INK; c.lineWidth = 8; c.beginPath(); c.arc(r.x, r.y, r.r, 0, 7); c.stroke(); c.strokeStyle = r.col; c.lineWidth = 4; c.stroke(); }
  c.globalAlpha = 1;
  for (const s of FX.stars) { const k2 = s.t / s.life; drawStar(c, s.x, s.y, s.r * (.5 + Math.sin(Math.min(1, k2 * 2) * Math.PI / 2) * .5) * (k2 > .7 ? 1 - (k2 - .7) * 2 : 1), s.rot, s.col); }
  for (const p of FX.parts) { const k2 = 1 - p.t / p.life; c.fillStyle = p.col; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(p.x, p.y, p.s * k2 + 1, 0, 7); c.fill(); c.stroke(); }
  c.textAlign = 'center'; c.textBaseline = 'middle';
  for (const n of FX.nums) { const pop = Math.min(1, n.t / 5); c.globalAlpha = Math.min(1, (n.life - n.t) / 10); c.font = `900 ${(n.big ? 40 : 26) * (.6 + pop * .4)}px ${DISPLAY}`; c.lineWidth = 7; c.lineJoin = 'round'; c.strokeStyle = INK; c.strokeText(n.txt, n.x, n.y); c.fillStyle = n.big ? '#ffe36b' : '#fff'; c.fillText(n.txt, n.x, n.y); }
  c.globalAlpha = 1;
  if (S.dom && S.dom.k === 'nuclear' && S.dom.t < 72 && !S.freeze) { const f = S.f[S.dom.o], k2 = S.dom.t / 72, x = f.x + f.face * 50, y = f.y - 74; c.strokeStyle = '#ffb347'; c.lineWidth = 4; for (let n = 0; n < 3; n++) { c.beginPath(); c.arc(x, y, (1 - ((S.dom.t * 3 + n * 30) % 90) / 90) * 130, 0, 7); c.stroke(); } drawStar(c, x, y, 16 + k2 * 40, S.t * .2, '#ffe36b'); blob(c, '#fff', () => c.arc(x, y, 6 + k2 * 16, 0, 7)); }
  c.restore();
  if (FX.flash > .02) { c.globalAlpha = FX.flash; c.fillStyle = FX.flashCol; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
}

function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
const FONT = '"Segoe UI", system-ui, sans-serif';
const DISPLAY = '"Arial Black", "Segoe UI Black", Impact, "Segoe UI", sans-serif';
function inkText(c, txt, x, y, col, lw) { c.lineJoin = 'round'; c.lineWidth = lw || 5; c.strokeStyle = INK; c.strokeText(txt, x, y); c.fillStyle = col; c.fillText(txt, x, y); }

// labels[i] = { P, K, G, A1, A2, A3, DOM, move } key names for that player, or null (computer / remote)
function drawHUD(c, S, labels) {
  c.textBaseline = 'middle';
  for (let i = 0; i < 2; i++) {
    const f = S.f[i], ch = CH[f.ch], mh = ch.hp, left = i === 0, bw = 430, x0 = left ? 104 : W - 104 - bw, y0 = 40, px = left ? 56 : W - 56, py = 60;
    const bar = (x, y, w, h) => { c.fillStyle = INK; rr(c, x - 5, y - 5, w + 10, h + 10, 9); c.fill(); c.fillStyle = '#3d3148'; rr(c, x, y, w, h, 5); c.fill(); };
    const fillBar = (frac, col, y, h, w0, xa) => { const w = w0 * clamp(frac, 0, 1); if (w < 1) return; c.fillStyle = col; rr(c, left ? xa + w0 - w : xa, y, w, h, 4); c.fill(); };
    // health
    bar(x0, y0, bw, 28);
    fillBar(f.ghost / mh, '#ff5a4b', y0, 28, bw, x0);
    const low = f.hp <= mh * DOM_HP; fillBar(f.hp / mh, low ? '#ff9a2e' : '#5fe07a', y0, 28, bw, x0);
    c.fillStyle = 'rgba(255,255,255,.3)'; const hw = bw * clamp(f.hp / mh, 0, 1); c.fillRect(left ? x0 + bw - hw + 3 : x0 + 3, y0 + 3, Math.max(0, hw - 6), 7);
    c.fillStyle = INK; const mx = left ? x0 + bw - bw * DOM_HP : x0 + bw * DOM_HP; c.fillRect(mx - 1.5, y0, 3, 28);
    // cursed energy
    const cw = bw * .6, cx = left ? x0 + bw - cw : x0; bar(cx, y0 + 42, cw, 12);
    fillBar(f.ce / MAXCE, ch.look.accent, y0 + 42, 12, cw, cx);
    c.font = `900 14px ${DISPLAY}`; c.textAlign = left ? 'right' : 'left'; inkText(c, 'CE ' + Math.floor(f.ce), left ? cx - 12 : cx + cw + 12, y0 + 49, ch.look.accent, 4);
    for (let n = 0; n < 2; n++) drawStar(c, left ? x0 + 14 + n * 30 : x0 + bw - 14 - n * 30, y0 + 49, 11, -.3, S.wins[i] > n ? '#ffd866' : '#3d3148');
    c.font = `900 21px ${DISPLAY}`; c.textAlign = left ? 'left' : 'right'; inkText(c, ch.name.toUpperCase(), left ? x0 : x0 + bw, y0 - 19, '#fff', 6);
    c.font = `900 13px ${DISPLAY}`; c.textAlign = left ? 'right' : 'left'; inkText(c, ch.tech.toUpperCase(), left ? x0 + bw : x0, y0 - 18, ch.look.accent, 4);
    // portrait
    c.save(); c.fillStyle = shade(ch.look.accent, .55); c.beginPath(); c.arc(px, py, 40, 0, 7); c.fill(); c.clip();
    const hurt = f.st === 'hit' || f.st === 'stun' || f.st === 'ko' || f.st === 'down';
    c.translate(px - (left ? 8 : -8), py + 122); c.scale(1.2, 1.2); c.translate(0, -GROUND);
    drawFighter(c, S, { i: 2 + i, ch: f.ch, x: 0, y: GROUND, vx: 0, vy: 0, face: left ? 1 : -1, st: hurt ? 'stun' : (f.st === 'atk' || f.st === 'cast' ? 'cast' : 'idle'), inv: 0, inf: 0, walkT: 0, move: null, portrait: 1, alt: lookOf(S, f) !== ch.look });
    c.restore(); c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.arc(px, py, 40, 0, 7); c.stroke(); c.strokeStyle = low ? '#ff9a2e' : ch.look.accent; c.lineWidth = 2.5; c.beginPath(); c.arc(px, py, 35.5, 0, 7); c.stroke();
    { const g = camPt(f.x, f.y - 168 * 1), tag = labels[i] ? (labels[0] && labels[1] ? 'P' + (i + 1) : 'YOU') : (labels.other === 'Computer' ? 'CPU' : 'FOE'), tc = left ? '#59c8ff' : '#ff6a6a'; if (f.st !== 'ko') { c.font = `900 13px ${DISPLAY}`; c.textAlign = 'center'; const tw = c.measureText(tag).width + 14; c.fillStyle = INK; rr(c, g[0] - tw / 2 - 3, g[1] - 13, tw + 6, 26, 9); c.fill(); c.beginPath(); c.moveTo(g[0] - 7, g[1] + 12); c.lineTo(g[0], g[1] + 21); c.lineTo(g[0] + 7, g[1] + 12); c.fill(); c.fillStyle = tc; rr(c, g[0] - tw / 2, g[1] - 10, tw, 20, 6); c.fill(); c.fillStyle = INK; c.fillText(tag, g[0], g[1] + 1); } }
    // guard meter under the fighter when it matters
    if (f.guardHp < 99) { const g = camPt(f.x, f.y + 14); c.fillStyle = INK; rr(c, g[0] - 31, g[1] - 3, 62, 12, 5); c.fill(); c.fillStyle = f.guardHp < 35 ? '#ff5a5a' : '#9fd0ff'; rr(c, g[0] - 28, g[1], 56 * f.guardHp / 100, 6, 3); c.fill(); }
    // ability cards
    const lab = labels[i], cwid = 142, gap = 8, total = cwid * 4 + gap * 3, cx0 = left ? 26 : W - 26 - total, cy = H - 84;
    for (let n = 0; n < 4; n++) {
      const x = cx0 + n * (cwid + gap), isDom = n === 3, a = isDom ? ch.dom : ch.arts[n];
      const ready = isDom ? domReady(f) : (f.cd[n] <= 0 && f.ce >= a.cost), used = isDom && f.domUsed, lift = ready && isDom ? Math.sin(S.t * .2) * 3 - 3 : 0, y = cy + lift;
      c.fillStyle = INK; rr(c, x - 4, y - 4, cwid + 8, 72, 12); c.fill();
      c.fillStyle = ready ? (isDom ? ch.look.accent : '#2c2238') : '#221b2b'; rr(c, x, y, cwid, 64, 8); c.fill();
      if (ready && !isDom) { c.strokeStyle = ch.look.accent; c.lineWidth = 3; rr(c, x + 1.5, y + 1.5, cwid - 3, 61, 7); c.stroke(); }
      if (!isDom && FX.nope[i] > 0 && !ready) { c.strokeStyle = '#ff5a5a'; c.lineWidth = 3; rr(c, x + 1.5, y + 1.5, cwid - 3, 61, 7); c.stroke(); }
      c.globalAlpha = ready ? 1 : .5; const dark = ready && isDom;
      if (lab) { const key = lab[isDom ? 'DOM' : 'A' + (n + 1)]; c.fillStyle = INK; rr(c, x + 6, y + 6, 32, 30, 7); c.fill(); c.fillStyle = ready ? '#fff' : '#9a93a6'; rr(c, x + 8, y + 8, 28, 24, 5); c.fill(); c.fillStyle = INK; c.font = `900 ${key.length > 1 ? 11 : 16}px ${DISPLAY}`; c.textAlign = 'center'; c.fillText(key, x + 22, y + 21); }
      c.textAlign = 'left'; c.fillStyle = dark ? INK : '#fff'; c.font = `800 ${a.name.length > 16 ? 10.5 : a.name.length > 12 ? 12 : 13.5}px ${FONT}`; c.fillText(a.name, x + (lab ? 44 : 10), y + 21);
      c.font = `700 12px ${FONT}`;
      if (isDom) { c.fillStyle = dark ? INK : '#cfc6da'; c.font = `${ready ? 900 : 700} ${ready ? 15 : 12}px ${ready ? DISPLAY : FONT}`; c.fillText(used ? 'Used this round' : ready ? 'READY!' : 'Gauge or 30% HP', x + 10, y + 46); if (!used && !ready) { c.globalAlpha = 1; c.fillStyle = INK; c.fillRect(x + 8, y + 54, cwid - 16, 6); c.fillStyle = ch.look.accent; c.fillRect(x + 9, y + 55, (cwid - 18) * f.gauge / GAUGE_MAX, 4); } }
      else { c.fillStyle = f.ce >= a.cost ? ch.look.accent : '#ff7a7a'; c.fillText(a.cost + ' CE', x + 10, y + 46); if (f.cd[n] > 0) { c.fillStyle = '#fff'; c.textAlign = 'right'; c.fillText((f.cd[n] / 60).toFixed(1) + 's', x + cwid - 10, y + 46); c.globalAlpha = 1; c.fillStyle = INK; c.fillRect(x + 8, y + 54, cwid - 16, 6); c.fillStyle = '#fff'; c.fillRect(x + 9, y + 55, (cwid - 18) * (1 - f.cd[n] / a.cd), 4); } }
      c.globalAlpha = 1;
    }
    c.font = `800 12.5px ${FONT}`; c.textAlign = left ? 'left' : 'right';
    inkText(c, lab ? `Move ${lab.move}   Jump ${lab.U}   Guard ${lab.G}   Punch ${lab.P} (x3)   Kick ${lab.K}` : (labels.other || 'Computer'), left ? cx0 + 2 : cx0 + total - 2, cy - 16, '#fff', 4);
  }
  // timer
  c.fillStyle = INK; rr(c, W / 2 - 44, 18, 88, 62, 14); c.fill(); c.fillStyle = '#ffe36b'; rr(c, W / 2 - 39, 23, 78, 52, 10); c.fill(); c.fillStyle = INK; c.textAlign = 'center'; c.font = `900 34px ${DISPLAY}`; c.fillText(Math.ceil(S.timer / 60), W / 2, 51);
  if (S.dom && !S.freeze) { const d = CH[S.f[S.dom.o].ch]; c.font = `900 15px ${DISPLAY}`; inkText(c, d.dom.name.toUpperCase(), W / 2, 100, d.look.accent, 5); c.fillStyle = INK; rr(c, W / 2 - 84, 112, 168, 12, 5); c.fill(); c.fillStyle = d.look.accent; c.fillRect(W / 2 - 80, 115, 160 * (1 - S.dom.t / S.dom.dur), 6); }
  const b = FX.banner;
  if (b) { const k = Math.min(1, b.t / 8), out = Math.min(1, (b.life - b.t) / 10); c.save(); c.globalAlpha = out; c.translate(W / 2, b.small ? 210 : 300); c.rotate(-.04); c.scale(1 + (1 - k) * 1.5, 1 + (1 - k) * 1.5); c.textAlign = 'center'; if (!b.small) { c.fillStyle = INK; c.fillRect(-W, -66, W * 2, 132); c.fillStyle = b.col || '#ff4b4b'; c.fillRect(-W, -58, W * 2, 6); c.fillRect(-W, 52, W * 2, 6); } c.font = `italic 900 ${b.small ? 44 : b.txt.length > 14 ? 60 : 88}px ${DISPLAY}`; inkText(c, b.txt, 0, 4, b.col || '#fff', b.small ? 10 : 14); if (b.sub) { c.font = `900 20px ${DISPLAY}`; inkText(c, b.sub, 0, -84, '#fff', 6); } c.restore(); }
}
