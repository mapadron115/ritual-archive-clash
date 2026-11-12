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
  const lk = CH[f.ch].look; let p = targetPose(S, f);
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
