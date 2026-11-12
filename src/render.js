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

for (const [k, v] of Object.entries({ punch: 14, punch2: 16, hook: 18, kick: 8, slash: 12, throw: 10, cast1: 5, wind: -6, kickw: -5, slashw: -6, hit: -8, jpunch: 6 })) P[k].sx = v;   // how far the hips lunge

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
  if (f.st === 'walk') { const s = Math.sin(f.walkT * 0.22), c = Math.cos(f.walkT * 0.22); return { lean: .14, af: [.7 - s * .45, 1.4], ab: [.3 + s * .45, 1.6], lf: [s * .55, -.25 - Math.max(0, c) * .9], lb: [-s * .55, -.25 - Math.max(0, -c) * .9], dy: 2 }; }
  const b = Math.sin(t * 0.07) * .03; return { lean: .08 + b, af: [.35, 2.45 + b * 2], ab: [.75, 1.25 + b * 2], lf: [.35, -.4], lb: [-.35, -.25], dy: 4 + b * 40 };
}
// Poses are followed by a damped spring per joint, so limbs overshoot a little and settle instead of sliding.
function copyPose(a) { return { lean: a.lean || 0, hd: a.hd || 0, dy: a.dy || 0, sx: a.sx || 0, af: a.af.slice(), ab: a.ab.slice(), lf: a.lf.slice(), lb: a.lb.slice() }; }
const ZERO_POSE = { af: [0, 0], ab: [0, 0], lf: [0, 0], lb: [0, 0] };
function springPose(st, tg) {
  const p = st.p, v = st.v;
  for (const k of ['lean', 'hd', 'dy', 'sx']) { v[k] = v[k] * .25 + ((tg[k] || 0) - p[k]) * .5; p[k] += v[k]; }
  for (const k of ['af', 'ab', 'lf', 'lb']) for (let n = 0; n < 2; n++) { v[k][n] = v[k][n] * .25 + (tg[k][n] - p[k][n]) * .5; p[k][n] += v[k][n]; }
}
const COLS = new Map();
function shade(hex, k) { const key = hex + '*' + k; let v = COLS.get(key); if (v) return v; const n = parseInt(hex.slice(1), 16), q = x => Math.min(255, Math.round(x * k)); v = `rgb(${q((n >> 16) & 255)},${q((n >> 8) & 255)},${q(n & 255)})`; COLS.set(key, v); return v; }
function tint(hex, t) { const key = hex + '+' + t; let v = COLS.get(key); if (v) return v; const n = parseInt(hex.slice(1), 16), q = x => Math.round(x + (255 - x) * t); v = `rgb(${q((n >> 16) & 255)},${q((n >> 8) & 255)},${q(n & 255)})`; COLS.set(key, v); return v; }
const INK = '#1b1424';
function limb(c, x1, y1, x2, y2, w, col) {
  c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = w + 8; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
  c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
}
function blob(c, col, path, lw) { c.beginPath(); path(); c.closePath(); c.fillStyle = col; c.fill(); c.strokeStyle = INK; c.lineWidth = lw || 4; c.lineJoin = 'round'; c.stroke(); }
function seg(x, y, a, len) { return [x + Math.sin(a) * len, y + Math.cos(a) * len]; }
function glow(c, x, y, r, col, a) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); const op = c.globalCompositeOperation, al = c.globalAlpha; c.globalCompositeOperation = 'lighter'; c.globalAlpha = a == null ? .6 : a; c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.globalCompositeOperation = op; c.globalAlpha = al; }
// Jagged lightning: a dark core with a coloured edge. The same seed gives the same shape.
function bolt(c, x1, y1, x2, y2, n, jit, seed, w, cIn, cOut) {
  let s = (Math.abs(seed | 0) * 9301 + 49297) % 233280; const rn = () => ((s = (s * 9301 + 49297) % 233280) / 233280 - .5);
  c.save(); c.beginPath(); c.moveTo(x1, y1); for (let k = 1; k < n; k++) { const t = k / n; c.lineTo(x1 + (x2 - x1) * t + rn() * jit, y1 + (y2 - y1) * t + rn() * jit); } c.lineTo(x2, y2);
  c.lineJoin = 'miter'; c.miterLimit = 3; c.lineCap = 'butt'; c.strokeStyle = cOut; c.lineWidth = w + 5; c.stroke(); c.strokeStyle = cIn; c.lineWidth = w; c.stroke(); c.restore();
}

// ---------- fighters: a jointed figure with planted feet, drawn into its own sprite and then lit as one piece
const B = { th: 29, sh: 29, ank: 7, sp: 42, ua: 21, fa: 19, nk: 23 };   // bone lengths
// What each fighter wears. fit: coat | gi | jacket | hood | tank; sl: sleeves 2 long, 1 short, 0 none; w: build.
const KIT = {
  'Limitless': { fit: 'coat', sl: 2, w: .92, inner: '#e9eefc' },
  'Shrine': { fit: 'gi', sl: 1, w: 1.04, wraps: 1, band: 1, baggy: 1 },
  'Boogie Woogie': { fit: 'jacket', sl: 1, w: 1.16, inner: '#2a2f3a' },
  'Ten Shadows': { fit: 'hood', sl: 2, w: .92 },
  'Cursed Cannon': { fit: 'tank', sl: 0, w: 1.2, gloves: '#4a4f55', goggles: 1, beard: 1 },
  'Blood Manipulation': { fit: 'coat', sl: 2, w: .9, inner: '#2a1218' },
  'Cursed Speech': { fit: 'jacket', sl: 2, w: .98, inner: '#d9d2c0', phones: 1 },
  'Straw Doll': { fit: 'jacket', sl: 1, w: .92, inner: '#f1e3c8', gloves: '#8a5a34' },
  'Golden Hour': { fit: 'coat', sl: 2, w: 1.04, inner: '#3a2f1a' },
  'Full Counter': { fit: 'gi', sl: 2, w: 1.06, baggy: 1 },
  'Explosion': { fit: 'jacket', sl: 2, w: 1.04, inner: '#ff8a2a', gloves: '#ff8a2a' },
  'Bungee Gum': { fit: 'tank', sl: 0, w: .9, scarf: 1, wraps: 1 },
  'Jajanken': { fit: 'tank', sl: 0, w: .94, wraps: 1, shorts: 1 },
  'Judgement Cut': { fit: 'gi', sl: 2, w: .96, scarf: 1 },
  'Gamma Rage': { fit: 'tank', sl: 0, w: 1.22, wraps: 1 },
};
const KIT_DEF = { fit: 'jacket', sl: 2, w: 1, inner: '#e9e2d6' };
const PALS = new Map();   // per look: [near, near shade, far, far shade]
function pal(lk) { let q = PALS.get(lk); if (!q) { const m = h => [h, shade(h, .8), shade(h, .72), shade(h, .58)]; q = { top: m(lk.top), pants: m(lk.pants), skin: [lk.skin, shade(lk.skin, .86), shade(lk.skin, .8), shade(lk.skin, .68)] }; PALS.set(lk, q); } return q; }

function capPath(c, x1, y1, r1, x2, y2, r2) { const a = Math.atan2(y2 - y1, x2 - x1); c.beginPath(); c.arc(x1, y1, r1, a + 1.5708, a - 1.5708); c.arc(x2, y2, r2, a - 1.5708, a + 1.5708); c.closePath(); }
function stripe(c, x1, y1, x2, y2, r, col) {   // the shaded underside of a limb
  let nx = -(y2 - y1), ny = x2 - x1; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
  if (Math.abs(ny) < .3 ? nx > 0 : ny < 0) { nx = -nx; ny = -ny; }
  c.strokeStyle = col; c.lineWidth = r * .72; c.lineCap = 'round'; c.beginPath(); c.moveTo(x1 + nx * r * .42, y1 + ny * r * .42); c.lineTo(x2 + nx * r * .42, y2 + ny * r * .42); c.stroke();
}
// Two tapered segments with one outline around both, so the joint has no ink line through it.
function limb2(c, a, b, d, r0, r1, r2, colA, colB, shA, shB) {
  c.lineJoin = 'round'; c.strokeStyle = INK; c.lineWidth = 5.2;
  capPath(c, a[0], a[1], r0, b[0], b[1], r1); c.stroke(); capPath(c, b[0], b[1], r1 * .97, d[0], d[1], r2); c.stroke();
  capPath(c, a[0], a[1], r0, b[0], b[1], r1); c.fillStyle = colA; c.fill(); stripe(c, a[0], a[1], b[0], b[1], r1, shA);
  capPath(c, b[0], b[1], r1 * .97, d[0], d[1], r2); c.fillStyle = colB; c.fill(); stripe(c, b[0], b[1], d[0], d[1], r2, shB);
}
function drawHand(c, x, y, a, open, col) {
  c.save(); c.translate(x, y); c.rotate(a); c.lineCap = 'round'; c.lineJoin = 'round';
  if (open) {
    const fingers = () => { c.beginPath(); for (let n = 0; n < 4; n++) { const b = -.5 + n * .33, y0 = -3.3 + n * 2.2; c.moveTo(4, y0); c.lineTo(4 + Math.cos(b) * 8.5, y0 + Math.sin(b) * 8.5); } c.moveTo(0, -4); c.lineTo(3.5, -9.5); };
    c.strokeStyle = INK; c.lineWidth = 5.4; fingers(); c.stroke(); c.beginPath(); c.ellipse(2, 0, 5.6, 5.4, 0, 0, 7); c.stroke();
    c.fillStyle = col; c.fill(); c.strokeStyle = col; c.lineWidth = 2.8; fingers(); c.stroke();
  } else {
    c.beginPath(); c.ellipse(2.5, 0, 6.8, 6.2, 0, 0, 7); c.strokeStyle = INK; c.lineWidth = 5.2; c.stroke(); c.fillStyle = col; c.fill();
    c.lineWidth = 1.4; c.beginPath(); c.moveTo(5.6, -2.6); c.lineTo(8.4, -2.2); c.moveTo(5.8, .9); c.lineTo(8.7, 1.1); c.moveTo(-1, 3.4); c.quadraticCurveTo(3, 5.2, 6, 3.4); c.stroke();
  }
  c.restore();
}
function drawFoot(c, x, y, r, col) {
  c.save(); c.translate(x, y); c.rotate(r);
  c.beginPath(); c.moveTo(-6.5, -3.5); c.lineTo(-7.5, 4); c.quadraticCurveTo(-7.5, 6.5, -4, 6.5); c.lineTo(13, 6.5); c.quadraticCurveTo(17.5, 6, 16, 2.5); c.quadraticCurveTo(12, -2, 5.5, -3.8); c.closePath();
  c.strokeStyle = INK; c.lineWidth = 5.2; c.lineJoin = 'round'; c.stroke(); c.fillStyle = col; c.fill();
  c.strokeStyle = '#e9e2d6'; c.lineWidth = 2; c.lineCap = 'butt'; c.beginPath(); c.moveTo(-6, 5.4); c.lineTo(15, 5.4); c.stroke();
  c.restore();
}
function skeleton(p, kit, planted) {
  const w = kit.w, hx = p.sx || 0;
  const fk = l => { const k = seg(0, 0, l[0], B.th), a = seg(k[0], k[1], l[0] + l[1], B.sh); return { k, a, on: 0 }; };
  const lf = fk(p.lf), lb = fk(p.lb); let hh = 56;
  if (planted) {   // the lowest foot sets the height of the hips; feet near the ground are placed on it
    const mxE = Math.max(lf.a[1], lb.a[1]); hh = clamp(mxE - (p.dy || 0) * .8, 24, 57);
    for (const L of [lf, lb]) if (L.a[1] > mxE - 6 || L.a[1] > hh) {
      const mx = B.th + B.sh - .6; let tx = L.a[0] - hx * .7; if (tx * tx + hh * hh > mx * mx) tx = sgn(tx) * Math.sqrt(Math.max(0, mx * mx - hh * hh));
      const d = Math.hypot(tx, hh), a = Math.acos(clamp((B.th * B.th + d * d - B.sh * B.sh) / (2 * B.th * d), -1, 1));
      L.k = seg(0, 0, Math.atan2(tx, hh) + a, B.th); L.a = [tx, hh]; L.on = 1;
    }
  }
  const hipY = -(hh + B.ank), cs = Math.cos(p.lean), sn = Math.sin(p.lean), T = (x, y) => [hx + x * cs - y * sn, hipY + x * sn + y * cs];
  const arm = (s, a) => { const e = seg(s[0], s[1], a[0], B.ua), h = seg(e[0], e[1], a[0] + a[1], B.fa); return { s, e, h }; };
  const N = T(0, -B.sp), ha = p.lean * .6 + (p.hd || 0);
  return { hx, hipY, T, N, lf, lb, af: arm(T(-5 * w, -B.sp + 7), p.af), ab: arm(T(8 * w, -B.sp + 6.5), p.ab), hd: [N[0] + Math.sin(ha) * B.nk + 2, N[1] - Math.cos(ha) * B.nk] };
}
function hairBack(c, lk, sw) {
  const h = shade(lk.hair, .8), s = lk.style;
  if (s === 'long') blob(c, h, () => { c.moveTo(-8, -17); c.bezierCurveTo(-27, -10, -25 + sw * .3, 18, -22 + sw, 46); c.quadraticCurveTo(-15 + sw, 52, -9 + sw * .8, 43); c.bezierCurveTo(-5 + sw * .4, 28, -1, 12, -1, -6); }, 3);
  else if (s === 'bob') blob(c, h, () => { c.moveTo(-10, -16); c.bezierCurveTo(-23, -8, -22 + sw * .15, 14, -15 + sw * .25, 20); c.quadraticCurveTo(-8 + sw * .2, 23, -3, 16); c.lineTo(-2, -8); }, 3);
  else if (s === 'spiky') blob(c, h, () => { c.moveTo(-6, -18); c.lineTo(-25, -21); c.lineTo(-17, -10); c.lineTo(-28 + sw * .2, -3); c.lineTo(-17, 1); c.lineTo(-23 + sw * .2, 11); c.lineTo(-11, 8); c.lineTo(-4, -2); }, 3);
  else if (s === 'top') { blob(c, h, () => c.arc(-10 + sw * .1, -23, 8.5, 0, 7), 3); c.strokeStyle = lk.accent; c.lineWidth = 3; c.beginPath(); c.moveTo(-9, -15); c.lineTo(-3, -19); c.stroke(); }
}
function hairFront(c, lk) {
  const h = lk.hair, s = lk.style;
  if (s === 'buzz' || s === 'top') blob(c, h, () => { c.moveTo(-16.5, 1); c.bezierCurveTo(-18.5, -24, 17, -25, 16.5, -7); c.lineTo(11, -10); c.quadraticCurveTo(4, -14, -4, -9.5); c.lineTo(-6.5, -2); c.lineTo(-9.5, 4); c.lineTo(-15, 5); }, 3);
  else if (s === 'spiky') blob(c, h, () => { c.moveTo(-16, 3); c.lineTo(-21, -8); c.lineTo(-15.5, -10); c.lineTo(-20, -23); c.lineTo(-10, -19); c.lineTo(-8, -31); c.lineTo(-1, -21); c.lineTo(6, -30); c.lineTo(8.5, -19); c.lineTo(18.5, -23); c.lineTo(16, -8); c.lineTo(12, -3.5); c.lineTo(8, -10); c.lineTo(3.5, -4); c.lineTo(-1.5, -10); c.lineTo(-6, -3); c.lineTo(-9, 5); }, 3);
  else { const lg = s === 'long'; blob(c, h, () => { c.moveTo(-17, 1); c.bezierCurveTo(-19.5, -26, 18, -26.5, 17.5, -5); c.lineTo(14.5, -1.5); c.lineTo(11.5, -8.5); c.lineTo(8, -2); c.lineTo(4, -9.5); c.lineTo(0, -2.5); c.quadraticCurveTo(-4, -8, -6.5, -4); c.lineTo(-5.5, lg ? 17 : 10); c.quadraticCurveTo(-9, lg ? 22 : 14, -12.5, lg ? 15 : 9); }, 3); }
  c.strokeStyle = tint(h, .3); c.lineCap = 'round'; c.lineWidth = 2.4; c.beginPath(); c.arc(-1, -3, 15, -2.25, -1.15); c.stroke(); c.lineWidth = 1.5; c.beginPath(); c.arc(-1, -3, 11.5, -2.0, -1.5); c.stroke();
}
function drawHead(c, S, f, lk, kit, Q, g) {   // in the head's own frame: centre of the skull at 0,0, facing +x
  const hurt = g.hurt, dead = f.st === 'ko' || f.st === 'down', skin = lk.skin;
  const head = () => { c.beginPath(); c.moveTo(-15.5, -2); c.bezierCurveTo(-16.5, -23, 16, -23, 16.5, -3); c.bezierCurveTo(17, 6, 12.5, 15.5, 5.5, 18); c.bezierCurveTo(-2, 19.5, -11, 13, -13.5, 6); c.closePath(); };
  head(); c.fillStyle = skin; c.fill(); c.save(); c.clip(); c.fillStyle = Q.skin[1]; c.beginPath(); c.ellipse(-13, 9, 13, 22, .35, 0, 7); c.fill(); c.fillStyle = 'rgba(255,110,110,.22)'; c.beginPath(); c.ellipse(3.5, 7, 4, 2.4, 0, 0, 7); c.fill(); c.restore();
  head(); c.strokeStyle = INK; c.lineWidth = 3; c.lineJoin = 'round'; c.stroke();
  blob(c, Q.skin[1], () => c.ellipse(-7.5, 2.5, 3.4, 5, .2, 0, 7), 2);
  if (kit.beard) blob(c, shade(lk.hair, .9), () => { c.moveTo(-9, 7); c.quadraticCurveTo(-4, 19, 6, 19.5); c.quadraticCurveTo(13, 18, 15.5, 8); c.quadraticCurveTo(11, 13.5, 6, 14); c.quadraticCurveTo(-2, 14, -9, 7); }, 2.2);
  c.lineCap = 'round';
  if (dead) { c.strokeStyle = INK; c.lineWidth = 2.4; for (const ex of [4.6, 12.2]) { c.beginPath(); c.moveTo(ex - 2.8, -3.8); c.lineTo(ex + 2.8, 1.8); c.moveTo(ex + 2.8, -3.8); c.lineTo(ex - 2.8, 1.8); c.stroke(); } }
  else {
    const blink = !hurt && (S.t + f.i * 37) % 170 < 5, iris = f.zone > 0 ? '#ff2038' : shade(lk.accent, .78);
    const eye = (ex, rx) => {
      const ry = hurt ? 4.9 : g.angry ? 3.7 : 4.3;
      if (blink) { c.strokeStyle = INK; c.lineWidth = 2.2; c.beginPath(); c.moveTo(ex - rx, -.5); c.quadraticCurveTo(ex, 1.2, ex + rx, -.5); c.stroke(); return; }
      c.beginPath(); c.ellipse(ex, -1, rx, ry, 0, 0, 7); c.fillStyle = '#fff'; c.fill(); c.strokeStyle = INK; c.lineWidth = 1.4; c.stroke();
      c.save(); c.clip(); const ix = ex + g.gx * rx * .5, iy = -.6 + g.gy * ry * .4, ir = hurt ? 1.7 : ry * .66; c.fillStyle = iris; c.beginPath(); c.arc(ix, iy, ir, 0, 7); c.fill(); c.fillStyle = INK; c.beginPath(); c.arc(ix, iy, ir * .5, 0, 7); c.fill(); c.restore();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(ix - .9, iy - 1.3, .85, 0, 7); c.fill();
      c.strokeStyle = INK; c.lineWidth = 2.3; c.beginPath(); c.ellipse(ex, -1, rx, ry, 0, Math.PI * 1.06, Math.PI * 1.94); c.stroke();
    };
    eye(12.3, 2.7); eye(4.6, 3.5);
    c.strokeStyle = shade(lk.hair, .7) === 'rgb(0,0,0)' ? INK : INK; c.lineWidth = 2.4; c.beginPath();
    if (g.angry) { c.moveTo(.6, -8.6); c.lineTo(8, -5.6); c.moveTo(16, -8.6); c.lineTo(10.4, -5.6); }
    else if (hurt) { c.moveTo(.8, -6.6); c.lineTo(7.8, -9.6); c.moveTo(10.4, -9.6); c.lineTo(15.8, -7); }
    else { c.moveTo(.8, -8.2); c.quadraticCurveTo(4.5, -9.4, 8, -8); c.moveTo(10.4, -8); c.quadraticCurveTo(13, -9.2, 15.8, -8); }
    c.stroke();
  }
  c.strokeStyle = Q.skin[3]; c.lineWidth = 1.5; c.beginPath(); c.moveTo(9.4, 2.2); c.lineTo(11.6, 5.6); c.lineTo(9.4, 6.2); c.stroke();
  c.strokeStyle = INK; c.lineWidth = 1.8; c.fillStyle = '#5a1a24'; c.beginPath();
  if (hurt) { c.ellipse(8.6, 11.6, 2.5, 3.3, 0, 0, 7); c.fill(); c.stroke(); }
  else if (g.angry) { c.moveTo(5, 9.6); c.lineTo(12.6, 9.2); c.lineTo(12, 13); c.lineTo(5.8, 13.4); c.closePath(); c.fillStyle = '#fff'; c.fill(); c.stroke(); c.lineWidth = 1; c.beginPath(); c.moveTo(5.4, 11.4); c.lineTo(12.3, 11.1); c.stroke(); }
  else if (g.win) { c.arc(8.6, 9.6, 4.4, .1, Math.PI - .1); c.closePath(); c.fill(); c.stroke(); }
  else { c.moveTo(5.4, 10.8); c.quadraticCurveTo(8.6, 12.6, 12.2, 10.4); c.stroke(); }
  hairFront(c, lk);
  if (kit.band) { c.lineCap = 'butt'; c.strokeStyle = INK; c.lineWidth = 6.5; c.beginPath(); c.moveTo(-17, -6); c.quadraticCurveTo(0, -14, 17, -8); c.stroke(); c.strokeStyle = lk.accent; c.lineWidth = 3.6; c.stroke(); }
  if (kit.goggles) { c.lineCap = 'butt'; c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(-16.5, -10); c.quadraticCurveTo(0, -17, 16.5, -11); c.stroke(); c.strokeStyle = '#3a3f45'; c.lineWidth = 3.2; c.stroke(); blob(c, '#3a3f45', () => c.rect(1, -18, 7.5, 7), 2.2); blob(c, '#3a3f45', () => c.rect(9.6, -18, 6.6, 7), 2.2); c.fillStyle = lk.accent; c.fillRect(2.6, -16.4, 4.3, 3.8); c.fillRect(11, -16.4, 3.8, 3.8); }
}
function drawBody(c, S, f, lk, kit, st, J) {
  const p = st.p, w = kit.w, sw = st.sw, Q = pal(lk), T = J.T, hip = J.hipY, hx = J.hx;
  const hurt = f.st === 'hit' || f.st === 'stun' || f.st === 'ko' || f.st === 'down', angry = f.st === 'atk' || f.st === 'cast';
  const open = f.st === 'cast' || (f.st === 'atk' && !BASIC[f.move]) || hurt;
  const foe = f.i < 2 ? S.f[1 - f.i] : null; let gx = 1, gy = 0;
  if (foe) { const dx = (foe.x - f.x) * f.face, dy = foe.y - f.y, d = Math.hypot(dx, dy) + 1; gx = dx / d; gy = dy / d; }
  const hr = p.lean * .35 + (p.hd || 0) * .7 + gy * .22 * (gx >= 0 ? 1 : -1);
  const headXf = fn => { c.save(); c.translate(J.hd[0], J.hd[1]); c.rotate(hr); fn(); c.restore(); };
  const armSet = kit.sl === 2 ? [Q.top, Q.top] : kit.sl === 1 ? [Q.top, Q.skin] : [Q.skin, Q.skin], wa = w > 1.1 ? 1.22 : w < .95 ? .92 : 1;
  const arm = (A, isFar) => {
    const ci = isFar ? 2 : 0; limb2(c, A.s, A.e, A.h, 7.4 * wa, 6 * wa, 4.9 * wa, armSet[0][ci], armSet[1][ci], armSet[0][ci + 1], armSet[1][ci + 1]);
    const dx = A.h[0] - A.e[0], dy = A.h[1] - A.e[1], fa = Math.atan2(dy, dx);
    if (kit.wraps) { c.lineCap = 'butt'; c.strokeStyle = isFar ? '#b9b0a6' : '#efe6d6'; c.lineWidth = 9.2 * wa; c.beginPath(); c.moveTo(A.e[0] + dx * .4, A.e[1] + dy * .4); c.lineTo(A.h[0], A.h[1]); c.stroke(); c.strokeStyle = 'rgba(27,20,36,.4)'; c.lineWidth = 1.2; for (const t of [.55, .75]) { const mx = A.e[0] + dx * t, my = A.e[1] + dy * t; c.beginPath(); c.moveTo(mx - Math.sin(fa) * 4 * wa - Math.cos(fa) * 1.5, my + Math.cos(fa) * 4 * wa - Math.sin(fa) * 1.5); c.lineTo(mx + Math.sin(fa) * 4 * wa + Math.cos(fa) * 1.5, my - Math.cos(fa) * 4 * wa + Math.sin(fa) * 1.5); c.stroke(); } }
    drawHand(c, A.h[0] + Math.cos(fa) * 3, A.h[1] + Math.sin(fa) * 3, fa, open, kit.gloves ? (isFar ? shade(kit.gloves, .75) : kit.gloves) : Q.skin[ci]);
  };
  const leg = (L, isFar) => {
    const ci = isFar ? 2 : 0, ox = hx + (isFar ? 3 : -2), oy = hip + (isFar ? 0 : 1), k = [L.k[0] + ox, L.k[1] + oy], a = [L.a[0] + ox, L.a[1] + oy], bg = kit.baggy ? 1.7 : 0, low = kit.shorts ? Q.skin : Q.pants;
    limb2(c, [ox, oy], k, a, 9.6 * (w > 1.1 ? 1.12 : 1), 7.6 + bg, 5.8 + bg * .8, Q.pants[ci], low[ci], Q.pants[ci + 1], low[ci + 1]);
    drawFoot(c, a[0], a[1], L.on ? 0 : -Math.atan2(a[0] - k[0], a[1] - k[1]) * .85, isFar ? '#1f1a26' : '#2c2436');
  };
  // behind the body: back hair, scarf tail, coat tails
  headXf(() => hairBack(c, lk, sw));
  if (kit.scarf) { const a = T(-5, -43), fl = Math.sin(S.t * .2 + f.i) * 4; blob(c, shade(lk.accent, .85), () => { c.moveTo(a[0], a[1] - 4); c.quadraticCurveTo(a[0] - 20 + sw * .5, a[1] - 5, a[0] - 44 + sw * 1.5, a[1] + 6 + fl); c.lineTo(a[0] - 40 + sw * 1.4, a[1] + 18 - fl); c.quadraticCurveTo(a[0] - 18 + sw * .5, a[1] + 8, a[0] + 2, a[1] + 6); }, 3); }
  if (kit.fit === 'coat') { c.save(); c.translate(hx, hip); c.rotate(p.lean * .5); blob(c, Q.top[1], () => { c.moveTo(-10 * w, -8); c.quadraticCurveTo(-17 * w + sw * .4, 14, -15 * w + sw, 40); c.lineTo(-3 + sw * .8, 44); c.quadraticCurveTo(4 + sw * .3, 24, 10 * w, 14); c.lineTo(10 * w, -6); }, 3); c.strokeStyle = lk.accent; c.lineWidth = 2.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(-14 * w + sw, 37.5); c.lineTo(-3.5 + sw * .8, 41); c.stroke(); c.restore(); }
  arm(J.ab, true); leg(J.lb, true); leg(J.lf, false);
  // torso: one shape from hips to shoulders, shaded on the back, then the outfit inside its outline
  c.save(); c.translate(hx, hip); c.rotate(p.lean);
  if (kit.fit === 'gi') blob(c, Q.top[1], () => { c.moveTo(-10.5 * w, -4); c.quadraticCurveTo(-13 * w + sw * .2, 8, -11 * w + sw * .35, 17); c.lineTo(3 + sw * .3, 14); c.lineTo(12 * w + sw * .3, 16); c.quadraticCurveTo(12 * w, 4, 11 * w, -4); }, 3);
  const torso = () => { c.beginPath(); c.moveTo(-10 * w, 3); c.bezierCurveTo(-11 * w, -8, -7 * w, -14, -8 * w, -20); c.bezierCurveTo(-10 * w, -28, -14 * w, -31, -13 * w, -38); c.quadraticCurveTo(-11 * w, -44, -4, -44.5); c.lineTo(6, -44.5); c.quadraticCurveTo(13 * w, -44, 14 * w, -37); c.bezierCurveTo(15 * w, -30, 12 * w, -24, 9.5 * w, -18); c.bezierCurveTo(8 * w, -12, 11 * w, -6, 11 * w, 3); c.quadraticCurveTo(0, 10, -10 * w, 3); c.closePath(); };
  torso(); c.fillStyle = lk.top; c.fill(); c.save(); c.clip(); c.lineCap = 'butt'; c.lineJoin = 'round';
  c.fillStyle = Q.top[1]; c.beginPath(); c.moveTo(-30, -50); c.lineTo(-4 * w, -50); c.bezierCurveTo(-9 * w, -30, -3 * w, -12, 3 * w, 12); c.lineTo(-30, 12); c.fill();
  if (kit.fit === 'coat' || kit.fit === 'jacket') {
    c.fillStyle = kit.inner; c.beginPath(); c.moveTo(3, -46); c.lineTo(9, -46); c.lineTo(8.5 * w, -20); c.lineTo(9.5 * w, 8); c.lineTo(3 * w, 8); c.lineTo(4 * w, -20); c.fill();
    c.strokeStyle = INK; c.lineWidth = 1.8; c.beginPath(); c.moveTo(3, -46); c.lineTo(4 * w, -20); c.lineTo(3 * w, 8); c.moveTo(9, -46); c.lineTo(8.5 * w, -20); c.stroke();
    c.fillStyle = tint(lk.top, .2); c.beginPath(); c.moveTo(3, -46); c.lineTo(-3, -40); c.lineTo(3.6 * w, -30); c.closePath(); c.fill(); c.stroke();
  } else if (kit.fit === 'gi') {
    c.fillStyle = lk.skin; c.beginPath(); c.moveTo(0, -46); c.lineTo(8, -46); c.lineTo(5.5 * w, -35); c.fill();
    for (const ln of [[-4, -46, 8.5 * w, -20], [8, -46, 5.5 * w, -34]]) { c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(ln[0], ln[1]); c.lineTo(ln[2], ln[3]); c.stroke(); c.strokeStyle = tint(lk.top, .45); c.lineWidth = 3.2; c.stroke(); }
  } else if (kit.fit === 'hood') {
    c.strokeStyle = Q.top[3]; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -6); c.lineTo(2 * w, -15); c.lineTo(9 * w, -15); c.lineTo(10.5 * w, -6); c.stroke();
    c.strokeStyle = tint(lk.top, .5); c.lineWidth = 1.6; c.beginPath(); c.moveTo(4, -43); c.lineTo(3.4, -32); c.moveTo(8, -43); c.lineTo(8.6, -33); c.stroke();
  } else if (kit.fit === 'tank') {
    c.fillStyle = lk.skin; c.beginPath(); c.ellipse(3, -46.5, 8 * w, 8, 0, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = 1.6; c.stroke();
    c.beginPath(); c.ellipse(-12.5 * w, -38, 5, 8, .15, 0, 7); c.fill(); c.stroke();
    c.strokeStyle = Q.top[3]; c.lineWidth = 1.6; c.beginPath(); c.moveTo(2 * w, -27); c.quadraticCurveTo(8 * w, -24, 12 * w, -28); c.stroke();
  }
  const beltC = kit.fit === 'gi' ? lk.accent : '#2a2233'; c.fillStyle = INK; c.fillRect(-30, -7, 60, 8.4); c.fillStyle = beltC; c.fillRect(-30, -5.4, 60, 5.2);
  if (kit.fit !== 'gi') { c.fillStyle = lk.accent; c.fillRect(4.5 * w - 3, -6, 6, 6.4); }
  c.restore(); torso(); c.strokeStyle = INK; c.lineWidth = 3; c.lineJoin = 'round'; c.stroke();
  if (kit.fit === 'gi') for (const d of [0, 1]) { blob(c, d ? lk.accent : shade(lk.accent, .8), () => { c.moveTo(6 * w + d * 3, -3); c.lineTo(4 * w + d * 6 + sw * .3, 13 + d * 3); c.lineTo(8 * w + d * 6 + sw * .3, 14 + d * 3); c.lineTo(9 * w + d * 3, -3); }, 2.2); }
  if (kit.fit === 'hood') blob(c, Q.top[1], () => c.ellipse(-8 * w, -42, 9.5, 6.5, -.35, 0, 7), 3);
  c.restore();
  // neck and head
  { const n0 = T(1, -43), n1 = [J.hd[0] - 1.5, J.hd[1] + 9]; capPath(c, n0[0], n0[1], 5.6 * (w > 1.1 ? 1.2 : 1), n1[0], n1[1], 5); c.strokeStyle = INK; c.lineWidth = 5; c.stroke(); c.fillStyle = Q.skin[1]; c.fill(); }
  if (kit.scarf) { const a = T(1, -45); blob(c, lk.accent, () => c.ellipse(a[0], a[1], 10.5 * w, 5.6, p.lean + .1, 0, 7), 3); }
  if (kit.phones) { const a = T(1, -45); c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(a[0] - 8, a[1] - 1); c.quadraticCurveTo(a[0], a[1] + 6, a[0] + 9, a[1] - 1); c.stroke(); c.strokeStyle = '#3a3640'; c.lineWidth = 3; c.stroke(); blob(c, lk.accent, () => c.ellipse(a[0] - 8, a[1] - 2, 3.4, 4.6, 0, 0, 7), 2.2); }
  headXf(() => drawHead(c, S, f, lk, kit, Q, { gx, gy, hurt, angry, win: S.phase === 'over' && S.wins[f.i] >= 2 }));
  arm(J.af, false);
  return { hand: J.af.h, foot: [J.lf.a[0] + hx - 2, J.lf.a[1] + hip + 1] };
}
// One sprite canvas per fighter slot (two fighters, two HUD portraits), at twice the size so the camera zoom stays sharp.
const SPR = { w: 520, h: 390, ox: 260, oy: 320, ss: 1.5, cv: [] }, FS = 1.15;   // FS: how large the figure is drawn
function sprite(i) {
  if (!SPR.cv[i]) {
    const mk = () => { const k = document.createElement('canvas'); k.width = SPR.w * SPR.ss; k.height = SPR.h * SPR.ss; return k; }, a = mk(), b = mk(), ax = a.getContext('2d');
    const g = ax.createLinearGradient(0, (SPR.oy - 170) * SPR.ss, 0, SPR.oy * SPR.ss); g.addColorStop(0, 'rgba(34,14,66,0)'); g.addColorStop(1, 'rgba(34,14,66,.34)');
    SPR.cv[i] = { cv: a, c: ax, rim: b, r: b.getContext('2d'), grad: g };
  }
  return SPR.cv[i];
}
function drawFighter(c, S, f, alpha) {
  const ch = CH[f.ch], lk = f.portrait ? (f.alt ? altLook(ch.look) : ch.look) : lookOf(S, f), kit = KIT[ch.tech] || KIT_DEF, tg = targetPose(S, f);
  let st = POSE_CACHE[f.i]; if (!st) st = POSE_CACHE[f.i] = { p: copyPose(tg), v: copyPose(ZERO_POSE), sw: 0, swv: 0, sq: 0, sqv: 0, air: false };
  if (f.portrait && st.blit && (FX.clock + f.i) % (FX.lite ? 6 : 3)) { const q = st.blit; c.drawImage(SPR.cv[f.i].cv, q[0], q[1], q[2], q[3], f.x + q[4], f.y + q[5], q[6], q[7]); return; }
  springPose(st, tg);
  const air = f.y < GROUND, vxl = (f.vx || 0) * f.face;
  st.swv = st.swv * .8 + (clamp(-vxl * 2.4, -24, 24) + Math.sin(S.t * .08 + f.i * 2) * 2.5 - st.sw) * .14; st.sw += st.swv;   // hair and cloth trail behind
  if (st.air && !air) st.sqv = -.07; st.air = air; st.sqv = st.sqv * .72 - st.sq * .3; st.sq += st.sqv;   // squash on landing
  let rot = 0;
  if (f.st === 'down') rot = -1.45; else if (f.st === 'ko') rot = f.y >= GROUND ? -1.5 : -0.9; else if (f.st === 'hit' && f.air) rot = -0.7;
  if (f.st === 'stun') rot = Math.sin(S.t * 0.3) * 0.06;
  const big = (f.big > 0 ? 1.3 : 1) * FS, stretch = air ? clamp(Math.abs(f.vy) * .007, 0, .1) : 0, flat = Math.abs(rot) > .3;
  const J = skeleton(st.p, kit, !air && !flat), bx = f.portrait ? f.x - f.face * (J.hd[0] + 2) * big : f.x, by = f.portrait ? f.y - J.hd[1] * big : f.y;
  const xf = k => { k.scale(f.face, 1); k.scale(big, big); if (rot) { if (flat) k.translate(0, -22); k.rotate(rot); } k.scale(1 - stretch - st.sq * .7, 1 + stretch + st.sq); };
  const imp = !f.portrait && FX.impact && FX.impact.t < FX.impact.sil ? FX.impact : null, zone = f.zone > 0 && !f.portrait;
  c.save(); c.globalAlpha = alpha || 1;
  if (!f.portrait) {
    const k = Math.max(.4, 1 - (GROUND - f.y) / 400); c.fillStyle = 'rgba(20,10,30,.28)'; c.beginPath(); c.ellipse(f.x, GROUND + 4, 46 * k * big, 9, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(20,10,30,.3)'; c.beginPath(); c.ellipse(f.x, GROUND + 4, 30 * k * big, 5.5, 0, 0, 7); c.fill();
    if (zone && !imp) {   // the Zone: black-red flames and stray lightning behind the fighter
      glow(c, f.x, f.y - 76, 130, '#ff1030', .3 + .1 * Math.sin(S.t * .3));
      for (let n = 0; n < 7; n++) { const u = ((S.t * 2.6 + n * 41) % 150) / 150, x = f.x - 36 + n * 12 + Math.sin(S.t * .15 + n * 1.7) * 6, y = f.y - 10 - u * 150, r = 9 * (1 - u) + 3; c.globalAlpha = (alpha || 1) * (1 - u) * .9; c.beginPath(); c.moveTo(x, y - r * 2.2); c.quadraticCurveTo(x + r, y - r * .2, x, y + r); c.quadraticCurveTo(x - r, y - r * .2, x, y - r * 2.2); c.fillStyle = '#0a0508'; c.fill(); c.strokeStyle = '#ff2038'; c.lineWidth = 2.5; c.stroke(); }
      c.globalAlpha = alpha || 1;
      if ((S.t + f.i * 5) % 7 < 3) { const sd = Math.floor(S.t / 3) + f.i * 13, a = (sd * 2.4) % 6.28; bolt(c, f.x + Math.cos(a) * 20, f.y - 76 + Math.sin(a) * 50, f.x + Math.cos(a) * 62, f.y - 76 + Math.sin(a) * 96, 4, 22, sd, 2.5, '#0a0508', '#ff2038'); }
    }
  }
  // Only the part of the sprite the figure can reach is cleared, lit and copied: upright figures need about a third of it.
  const sp = sprite(f.i), o = sp.c, ss = SPR.ss, wide = flat || rot || f.big > 0 || air;
  const bb = f.portrait ? [(SPR.ox - 120) * ss, (SPR.oy - 225) * ss, 240 * ss, 165 * ss] : wide ? [0, 0, sp.cv.width, sp.cv.height] : [(SPR.ox - 170) * ss, (SPR.oy - 215) * ss, 340 * ss, 235 * ss], X0 = bb[0], Y0 = bb[1], BW = bb[2], BH = bb[3], old = sp.bb || [0, 0, sp.cv.width, sp.cv.height];
  o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'source-over'; o.globalAlpha = 1; o.clearRect(old[0], old[1], old[2], old[3]); sp.bb = bb;
  o.save(); o.beginPath(); o.rect(X0, Y0, BW, BH); o.clip();
  o.setTransform(ss, 0, 0, ss, SPR.ox * ss, SPR.oy * ss); o.save(); xf(o);
  const out = drawBody(o, S, f, lk, kit, st, J); o.restore();
  // light the whole figure at once: darker toward the feet, a white flash when struck, a rim of light on the side facing the sun
  o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'source-atop';
  if (imp) { o.fillStyle = imp.kind === 'black' ? (f.i === imp.a ? '#ffffff' : '#ff2038') : '#140d1c'; o.fillRect(X0, Y0, BW, BH); }
  else {
    o.fillStyle = sp.grad; o.fillRect(X0, Y0, BW, BH);
    if (S.t - f.hurtT < 4) { o.globalAlpha = .7; o.fillStyle = '#fff'; o.fillRect(X0, Y0, BW, BH); o.globalAlpha = 1; }
    if (!FX.lite) { const r = sp.r; r.setTransform(1, 0, 0, 1, 0, 0); r.save(); r.beginPath(); r.rect(X0, Y0, BW, BH); r.clip();
    r.globalCompositeOperation = 'copy'; r.drawImage(sp.cv, X0, Y0, BW, BH, X0, Y0, BW, BH); r.globalCompositeOperation = 'destination-out'; r.drawImage(sp.cv, X0, Y0, BW, BH, X0 - 4.8 * ss, Y0 + 3.4 * ss, BW, BH); r.globalCompositeOperation = 'destination-in'; r.drawImage(sp.cv, X0, Y0, BW, BH, X0 - 2.3 * ss, Y0 + 1.7 * ss, BW, BH);
    r.globalCompositeOperation = 'source-in'; r.fillStyle = zone || FX.bf ? '#ff3348' : (!f.portrait && S.dom && !S.freeze ? CH[S.f[S.dom.o].ch].look.accent : '#ffe9b0'); r.fillRect(X0, Y0, BW, BH); r.restore();
    o.globalAlpha = zone || FX.bf ? .8 : .5; o.drawImage(sp.rim, X0, Y0, BW, BH, X0, Y0, BW, BH); o.globalAlpha = 1; }
  }
  o.globalCompositeOperation = 'source-over'; o.restore();
  const dx0 = bx - SPR.ox + X0 / ss, dy0 = by - SPR.oy + Y0 / ss, dw = BW / ss, dh = BH / ss;
  if (f.inv > 0 && S.t % 4 < 2) c.globalAlpha *= 0.5;
  if (!f.portrait && Math.abs(f.vx) > 10 && !imp) { const a0 = c.globalAlpha; for (const n of [2, 1]) { c.globalAlpha = a0 * .16 * (3 - n); c.drawImage(sp.cv, X0, Y0, BW, BH, dx0 - f.vx * n * 1.6, dy0, dw, dh); } c.globalAlpha = a0; }   // speed trail
  if (zone && !imp) { c.shadowColor = '#ff1030'; c.shadowBlur = 16 + 6 * Math.sin(S.t * .3); }
  c.drawImage(sp.cv, X0, Y0, BW, BH, dx0, dy0, dw, dh); st.blit = [X0, Y0, BW, BH, dx0 - f.x, dy0 - f.y, dw, dh];
  c.restore();
  // on top, in the body's own space: the glow of a technique in the hand, the sweep of a punch or kick
  c.save(); c.translate(bx, by); xf(c);
  if (!imp && !f.portrait && ((f.st === 'atk' && !BASIC[f.move]) || f.st === 'cast')) glow(c, out.hand[0], out.hand[1], 40, lk.accent, .85);
  if (f.st === 'atk' && BASIC[f.move]) { const m = BASIC[f.move]; if (f.mt >= m.su - 1 && f.mt < m.su + m.ac + 3) { const cy = m.pose.indexOf('kick') >= 0 ? out.foot[1] : out.hand[1], R2 = m.reach * .78; c.globalAlpha = clamp(1.2 - (f.mt - m.su + 1) / (m.ac + 4), 0, 1); c.globalAlpha *= .9; c.fillStyle = '#fff'; c.strokeStyle = lk.accent; c.lineWidth = 2; c.beginPath(); c.arc(16, cy, R2, -.75, 0.65); c.arc(7, cy, R2 * .97, 0.6, -.7, true); c.closePath(); c.fill(); c.stroke(); c.globalAlpha = 1; } }
  c.restore();
  const top = 148 * big;
  if (f.inf > 0) { c.save(); c.strokeStyle = INK; c.lineWidth = 7; c.globalAlpha = .5; c.beginPath(); c.ellipse(f.x, f.y - 82, 60, 104, 0, 0, 7); c.stroke(); c.globalAlpha = 1; c.strokeStyle = `rgba(140,220,255,${.7 + .25 * Math.sin(S.t * .4)})`; c.lineWidth = 4; c.setLineDash([14, 10]); c.lineDashOffset = S.t * 1.5; c.beginPath(); c.ellipse(f.x, f.y - 82, 60, 104, 0, 0, 7); c.stroke(); c.fillStyle = 'rgba(140,220,255,.12)'; c.fill(); c.restore(); }
  if (f.portrait) return;
  if (f.counter > 0 || f.abs > 0) { c.save(); glow(c, f.x + f.face * 40, f.y - 74, 90, '#7dffb0', .3); c.strokeStyle = INK; c.lineWidth = 8; c.beginPath(); c.arc(f.x + f.face * 22, f.y - 74, 74, -1.2, 1.2, f.face < 0); c.stroke(); c.strokeStyle = '#7dffb0'; c.lineWidth = 4; c.stroke(); c.restore(); }
  if (f.buff > 0 || f.big > 0) { c.save(); c.strokeStyle = lk.accent; c.lineWidth = 3; c.lineCap = 'round'; for (let n = 0; n < 4; n++) { const x = f.x - 40 + n * 27 + Math.sin(S.t * .2 + n) * 4, y = f.y - ((S.t * 3 + n * 37) % 140); c.globalAlpha = .8; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 18); c.stroke(); } c.restore(); }
  if (f.nails > 0) for (let n = 0; n < f.nails; n++) { const x = f.x - 12 + n * 12, y = f.y - 92 + (n % 2) * 14; c.strokeStyle = INK; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x - f.face * 14, y - 16); c.stroke(); c.strokeStyle = '#c9ccd4'; c.lineWidth = 3; c.stroke(); blob(c, '#ffa64d', () => c.arc(x - f.face * 14, y - 16, 4.5, 0, 7)); }
  if (f.st === 'atk' && f.chg > 0) { const lv = Math.min(3, Math.floor(f.chg / 25)), x = f.x - f.face * 26, y = f.y - 84, col = ['#fff', '#7fffd0', '#ffe36b', '#ff8a2a'][lv]; glow(c, x, y, 50 + lv * 16, col, .6); drawStar(c, x, y, 14 + lv * 9 + Math.sin(S.t * .6) * 3, S.t * .2, col); }
  if (S.stop && S.stop.o !== f.i && S.stop.t > 0) { c.save(); c.translate(f.x, f.y - top - 34); blob(c, '#ffe07a', () => c.arc(0, 0, 15, 0, 7)); c.strokeStyle = INK; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -9); c.moveTo(0, 0); c.lineTo(6, 3); c.stroke(); c.restore(); }
  if (f.st === 'stun') { for (let n = 0; n < 3; n++) { const a = S.t * .15 + n * 2.1, sx = f.x + f.face * 10 + Math.cos(a) * 26, sy = f.y - top - 12 + Math.sin(a) * 7; c.fillStyle = '#ffe36b'; c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 4 : 9, b = k * Math.PI / 5 + a; c.lineTo(sx + Math.cos(b) * r, sy + Math.sin(b) * r); } c.closePath(); c.fill(); c.stroke(); } }
}

// ---------- the stage: painted once into layers, then drawn at different depths so the far ones move less than the near ones
function layerCanvas(w, h) { const k = document.createElement('canvas'); k.width = w; k.height = h; return k; }
const SUN = [905, 395];
function makeBG() {
  let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647, M = 60;   // M: spare margin left and right of every layer
  BG = {};
  { // sky, fixed to the screen
    const k = BG.sky = layerCanvas(W, H), c = k.getContext('2d'), g = c.createLinearGradient(0, 0, 0, 590);
    [[0, '#17163f'], [.22, '#33297a'], [.42, '#6d3a93'], [.6, '#bd4d82'], [.76, '#f2795c'], [.9, '#ffbc66'], [1, '#ffe2a2']].forEach(q => g.addColorStop(q[0], q[1])); c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let n = 0; n < 70; n++) { const x = r() * W, y = r() * 230; c.globalAlpha = (1 - y / 230) * (.3 + r() * .6); c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, .6 + r() * 1.2, 0, 7); c.fill(); } c.globalAlpha = 1;
    glow(c, SUN[0], SUN[1], 520, 'rgba(255,196,120,1)', .5); glow(c, SUN[0], SUN[1], 260, 'rgba(255,236,170,1)', .65);
    c.fillStyle = '#fff3cf'; c.beginPath(); c.arc(SUN[0], SUN[1], 96, 0, 7); c.fill(); c.fillStyle = '#fffbe9'; c.beginPath(); c.arc(SUN[0], SUN[1], 80, 0, 7); c.fill();
    c.filter = 'blur(5px)';
    for (let n = 0; n < 9; n++) { const x = r() * W, y = 150 + r() * 300, lit = y > 300; c.fillStyle = lit ? 'rgba(255,170,140,.42)' : 'rgba(150,110,200,.32)'; c.beginPath(); c.ellipse(x, y, 130 + r() * 190, 7 + r() * 9, 0, 0, 7); c.fill(); if (lit) { c.fillStyle = 'rgba(255,226,170,.4)'; c.beginPath(); c.ellipse(x + 20, y + 5, 110 + r() * 100, 3.5, 0, 0, 7); c.fill(); } }
    c.filter = 'none';
  }
  { // one puffy cloud, drawn several times as it drifts
    const k = BG.cloud = layerCanvas(320, 130), c = k.getContext('2d'), g = c.createLinearGradient(0, 20, 0, 120); g.addColorStop(0, '#fbe3f1'); g.addColorStop(.6, '#f3b6c4'); g.addColorStop(1, '#f59a7e');
    c.fillStyle = g; c.beginPath(); for (const q of [[70, 84, 34], [112, 62, 44], [165, 54, 50], [214, 70, 40], [252, 88, 28], [150, 90, 46]]) { c.moveTo(q[0] + q[2], q[1]); c.arc(q[0], q[1], q[2], 0, 7); } c.fill();
    c.globalCompositeOperation = 'destination-out'; c.fillRect(0, 104, 320, 30); c.globalCompositeOperation = 'source-atop'; c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(150, 40, 90, 22, 0, 0, 7); c.fill();
  }
  const ridge = (c, base, amp, seed, top, bot, edge) => {
    const y = x => base - amp * (.55 * Math.abs(Math.sin(x * .0038 + seed)) + .3 * Math.abs(Math.sin(x * .0091 + seed * 1.7)) + .15 * Math.sin(x * .021 + seed * 3));
    const g = c.createLinearGradient(0, base - amp, 0, base + 60); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g;
    c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W + M * 2; x += 8) c.lineTo(x, y(x)); c.lineTo(W + M * 2, H); c.closePath(); c.fill();
    c.strokeStyle = edge; c.lineWidth = 2.5; c.beginPath(); for (let x = 0; x <= W + M * 2; x += 8) c.lineTo(x, y(x) + 1); c.stroke();
  };
  { // far mountains: pale, no outlines, sinking into haze
    const k = BG.far = layerCanvas(W + M * 2, H), c = k.getContext('2d');
    ridge(c, 500, 190, 1, '#7d5aa8', '#d27c9a', 'rgba(255,190,170,.55)'); ridge(c, 540, 120, 2.6, '#5d4391', '#b9638f', 'rgba(255,170,150,.4)');
    const g = c.createLinearGradient(0, 440, 0, 580); g.addColorStop(0, 'rgba(255,160,130,0)'); g.addColorStop(1, 'rgba(255,170,130,.5)'); c.fillStyle = g; c.fillRect(0, 440, W + M * 2, 200);
  }
  { // the town: dark roofs against the sunset, lit windows
    const k = BG.town = layerCanvas(W + M * 2, H), c = k.getContext('2d'), base = GROUND - 44, line = '#201737';
    const roof = (x, y, w, rh) => { c.beginPath(); c.moveTo(x - 20, y - 2); c.quadraticCurveTo(x - 6, y - 1, x + w * .22, y - rh * .55); c.quadraticCurveTo(x + w / 2, y - rh * 1.15, x + w * .78, y - rh * .55); c.quadraticCurveTo(x + w + 6, y - 1, x + w + 20, y - 2); c.lineTo(x + w + 12, y + 7); c.lineTo(x - 12, y + 7); c.closePath(); c.fillStyle = '#5a2a52'; c.fill(); c.strokeStyle = line; c.lineWidth = 2.5; c.stroke(); c.strokeStyle = 'rgba(255,150,110,.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + w / 2, y - rh * .86); c.quadraticCurveTo(x + w * .78, y - rh * .6, x + w + 16, y - 3); c.stroke(); };
    const wall = (x, y, w, h) => { const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#2f2356'); g.addColorStop(1, '#45306a'); c.fillStyle = g; c.fillRect(x, y, w, h); c.strokeStyle = line; c.lineWidth = 2.5; c.strokeRect(x, y, w, h); c.fillStyle = 'rgba(255,160,120,.35)'; c.fillRect(x + w - 4, y, 3, h); };
    const win = (x, y) => { glow(c, x + 9, y + 10, 34, 'rgba(255,190,90,1)', .5); c.fillStyle = '#ffd98a'; c.fillRect(x, y, 18, 20); c.strokeStyle = line; c.lineWidth = 2; c.strokeRect(x, y, 18, 20); c.beginPath(); c.moveTo(x + 9, y); c.lineTo(x + 9, y + 20); c.stroke(); };
    for (let x = -30; x < W + M * 2; ) { const w = 104 + r() * 96, h = 50 + r() * 74, y = base - h; wall(x, y, w, h + 30); roof(x, y, w, 30 + r() * 14); for (let q = 0; q < 2; q++) if (r() > .25) win(x + 16 + q * (w - 52), y + 16); x += w + 30 + r() * 30; }
    for (const px of [330, 1010]) { let y = base - 96, w = 136; wall(px - w / 2, y, w, 130); for (let t = 0; t < 3; t++) { roof(px - w / 2, y, w, 26); win(px - 9, y + 14); w -= 30; y -= 58; if (t < 2) wall(px - w / 2, y, w, 60); } c.strokeStyle = line; c.lineWidth = 4; c.beginPath(); c.moveTo(px, y + 34); c.lineTo(px, y + 4); c.stroke(); }
    const g = c.createLinearGradient(0, base - 150, 0, base + 10); g.addColorStop(0, 'rgba(255,150,120,0)'); g.addColorStop(1, 'rgba(255,160,120,.42)'); c.fillStyle = g; c.fillRect(0, base - 150, W + M * 2, 170);
  }
  { // the arena itself, the same depth as the fighters
    const k = BG.arena = layerCanvas(W + M * 2, H), c = k.getContext('2d'), X = W + M * 2, back = GROUND - 46, front = GROUND + 60;
    let g = c.createLinearGradient(0, back - 26, 0, back); g.addColorStop(0, '#a8806e'); g.addColorStop(1, '#6f4f4c'); c.fillStyle = g; c.fillRect(0, back - 22, X, 24); c.strokeStyle = INK; c.lineWidth = 3.5; c.strokeRect(-5, back - 22, X + 10, 24); c.fillStyle = 'rgba(255,226,170,.6)'; c.fillRect(0, back - 20, X, 3);
    for (let x = 24; x < X; x += 132) { c.fillStyle = '#8d6558'; c.fillRect(x, back - 40, 18, 42); c.strokeRect(x, back - 40, 18, 42); c.fillStyle = '#b98f78'; c.fillRect(x - 4, back - 46, 26, 8); c.strokeRect(x - 4, back - 46, 26, 8); c.fillStyle = 'rgba(255,226,170,.55)'; c.fillRect(x + 13, back - 38, 3, 38); }
    g = c.createLinearGradient(0, back, 0, front); g.addColorStop(0, '#f0d09a'); g.addColorStop(1, '#c69660'); c.fillStyle = g; c.fillRect(0, back, X, front - back);
    c.strokeStyle = 'rgba(60,34,30,.24)'; c.lineWidth = 2; for (let n = -14; n <= 14; n++) { c.beginPath(); c.moveTo(M + 640 + n * 92, back); c.lineTo(M + 640 + n * 150, front); c.stroke(); }
    c.strokeStyle = 'rgba(60,34,30,.14)'; for (const y of [back + 20, back + 48, back + 80]) { c.beginPath(); c.moveTo(0, y); c.lineTo(X, y); c.stroke(); }
    c.save(); c.translate(M + SUN[0], back + 40); c.scale(1, .2); glow(c, 0, 0, 460, 'rgba(255,226,160,1)', .5); c.restore();
    c.save(); c.translate(M + 640, GROUND + 4); c.scale(1, .16); c.strokeStyle = 'rgba(122,60,60,.5)'; c.lineWidth = 10; c.beginPath(); c.arc(0, 0, 330, 0, 7); c.stroke(); c.lineWidth = 5; c.beginPath(); c.arc(0, 0, 300, 0, 7); c.stroke(); c.restore();
    c.strokeStyle = INK; c.lineWidth = 3.5; c.beginPath(); c.moveTo(0, back); c.lineTo(X, back); c.stroke();
    g = c.createLinearGradient(0, front, 0, H); g.addColorStop(0, '#96683f'); g.addColorStop(1, '#3d2820'); c.fillStyle = g; c.fillRect(0, front, X, H - front);
    c.fillStyle = 'rgba(40,22,24,.28)'; for (let x = 10; x < X; x += 88) c.fillRect(x, front + 12, 60, 30);
    c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(0, front + 2); c.lineTo(X, front + 2); c.stroke(); c.strokeStyle = '#fff0c8'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, front - 2); c.lineTo(X, front - 2); c.stroke();
    for (const x0 of [130, 1150]) { const x = x0 + M, d = x0 < 640 ? 1 : -1; g = c.createLinearGradient(x - 7, 0, x + 7, 0); g.addColorStop(0, '#3a2219'); g.addColorStop(.7, '#6a422c'); g.addColorStop(1, '#8a5b3a'); c.fillStyle = g; c.strokeStyle = INK; c.lineWidth = 3.5; c.beginPath(); c.rect(x - 7, GROUND - 316, 14, 274); c.fill(); c.stroke(); c.beginPath(); c.rect(d > 0 ? x - 34 : x - 88, GROUND - 302, 122, 9); c.fill(); c.stroke(); blob(c, '#8d6558', () => c.rect(x - 16, GROUND - 52, 32, 14), 3.5); blob(c, '#ffd36b', () => c.arc(x, GROUND - 320, 8, 0, 7), 3.5);
      const lx = x - d * 26, ly = GROUND - 262; c.strokeStyle = INK; c.lineWidth = 2.5; c.beginPath(); c.moveTo(lx, GROUND - 294); c.lineTo(lx, ly - 22); c.stroke(); blob(c, '#ff9d3d', () => c.ellipse(lx, ly, 15, 21, 0, 0, 7), 3.5); c.fillStyle = '#fff1bd'; c.beginPath(); c.ellipse(lx, ly + 2, 7, 12, 0, 0, 7); c.fill(); c.fillStyle = INK; c.fillRect(lx - 8, ly - 24, 16, 5); c.fillRect(lx - 8, ly + 19, 16, 5); }
  }
  { // things close to the camera, dark and out of focus
    const F = BG.foreM = 160, k = BG.fore = layerCanvas(W + F * 2, H), c = k.getContext('2d'); c.filter = 'blur(4px)'; c.fillStyle = '#170f2c'; c.strokeStyle = '#170f2c'; c.lineCap = 'round';
    for (const side of [0, 1]) { const X = x => side ? W + F * 2 - x : x;
      for (let n = 0; n < 26; n++) { const x = r() * 250, h = 40 + r() * 110 * (1 - x / 300), l = (r() - .3) * 50; c.lineWidth = 5 + r() * 6; c.beginPath(); c.moveTo(X(x), H + 10); c.quadraticCurveTo(X(x + l * .2), H - h * .6, X(x + l), H - h); c.stroke(); }
      c.lineWidth = 12; c.beginPath(); c.moveTo(X(-10), 6); c.quadraticCurveTo(X(120), 30, X(250), 4); c.stroke();
      for (let n = 0; n < 22; n++) { const x = r() * 270, y = 6 + r() * 70 * (1 - x / 330), a = r() * 3; c.beginPath(); c.ellipse(X(x), y + 14, 17, 7, side ? -a : a, 0, 7); c.fill(); } }
    c.filter = 'none';
  }
  { const k = BG.vig = layerCanvas(W, H), c = k.getContext('2d'), g = c.createRadialGradient(W / 2, H / 2 + 20, 330, W / 2, H / 2 + 20, 820); g.addColorStop(0, 'rgba(18,8,40,0)'); g.addColorStop(1, 'rgba(18,8,40,.55)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
}
// Cloth and lamplight on the arena, drawn fresh each frame so they move.
function drawArenaLife(c, t) {
  for (const x of [130, 1150]) {
    const d = x < 640 ? 1 : -1, col = x < 640 ? '#3aa0ff' : '#ff4b4b', top = GROUND - 293, len = 126, xa = x + d * 12, xb = x + d * 82, xm = (xa + xb) / 2, off = y => Math.sin(t * .045 + y * .034 + x) * 8 * (y / len) + Math.sin(t * .021 + x) * 3 * (y / len);
    const path = () => { c.beginPath(); for (let k = 0; k <= 6; k++) { const y = len * k / 6; c.lineTo(xa + off(y), top + y); } c.lineTo(xm + off(len - 30), top + len - 30); for (let k = 6; k >= 0; k--) { const y = len * k / 6; c.lineTo(xb + off(y), top + y); } c.closePath(); };
    path(); c.fillStyle = col; c.fill(); c.save(); c.clip(); c.fillStyle = 'rgba(20,10,50,.22)'; for (let q = 0; q < 2; q++) { c.beginPath(); for (let k = 0; k <= 6; k++) { const y = len * k / 6; c.lineTo(xa + d * (16 + q * 30) + off(y) * 1.5, top + y); } for (let k = 6; k >= 0; k--) { const y = len * k / 6; c.lineTo(xa + d * (28 + q * 30) + off(y) * 1.2, top + y); } c.fill(); } c.restore();
    path(); c.strokeStyle = INK; c.lineWidth = 3.5; c.lineJoin = 'round'; c.stroke(); blob(c, '#fff', () => c.arc(xm + off(48), top + 48, 15, 0, 7), 3);
    glow(c, x - d * 26, GROUND - 262, 84 + Math.sin(t * .13 + x) * 6, 'rgba(255,170,70,1)', .5);
  }
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
      if (e.a >= 110) FX.impact = { t: 0, sil: 3, kind: 'white' };   // the heaviest blows get an impact frame
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
    case 'blackflash': {
      FX.impact = { t: 0, sil: 5, kind: 'black', a: e.a }; FX.bf = { x: e.x, y: e.y, t: 0, life: 36, rot: Math.random() * 7 }; FX.shake = 26;
      FX.banner = { txt: 'BLACK FLASH', t: 0, life: 50, small: 1, col: '#ff2038' };
      burst(e.x, e.y, 26, '#ff2038', 11, 34); burst(e.x, e.y, 18, '#0a0508', 9, 30);
      const n = FX.nums[FX.nums.length - 1]; if (n) { n.bf = 1; n.big = 1; n.life = 60; }
      break;
    }
    case 'ko': FX.impact = { t: 0, sil: 4, kind: 'white' }; FX.banner = { txt: 'K.O.', t: 0, life: 120 }; FX.flash = .6; FX.flashCol = '#fff'; FX.shake = 20; break;
    case 'round': FX.banner = { txt: 'ROUND ' + e.a, t: 0, life: 70 }; break;
    case 'fight': FX.banner = { txt: 'FIGHT!', t: 0, life: 45, col: '#ffe36b' }; break;
    case 'domain': { const d = CH[e.a].dom; FX.banner = { txt: d.name.toUpperCase(), sub: d.maximum ? 'MAXIMUM' : 'DOMAIN EXPANSION', t: 0, life: 70, col: CH[e.a].look.accent }; FX.flash = .5; FX.flashCol = CH[e.a].look.accent; break; }
    case 'clash': FX.banner = { txt: 'DOMAIN CLASH', t: 0, life: 60 }; FX.flash = .9; FX.flashCol = '#fff'; FX.shake = 24; star(e.x, e.y, 200, '#fff', 16); burst(e.x, e.y, 50, '#fff', 12, 40); break;
    case 'nope': FX.nope[e.a] = 18; break;
    case 'word': FX.words.push({ x: clamp(e.x, 160, W - 160), y: e.y, txt: e.a, t: 0, life: 50 }); FX.shake = Math.max(FX.shake, 6); break;
    case 'counter': star(e.x, e.y, 70, '#7dffb0', 12); FX.rings.push({ x: e.x, y: e.y, r: 20, vr: 9, t: 0, life: 12, col: '#7dffb0' }); FX.shake = 10; FX.banner = { txt: 'COUNTER!', t: 0, life: 34, small: 1, col: '#7dffb0' }; break;
    case 'stop': FX.flash = .5; FX.flashCol = '#ffe07a'; FX.rings.push({ x: e.x, y: e.y, r: 20, vr: 26, t: 0, life: 22, col: '#ffe07a' }); break;
    case 'dash': FX.lines.push({ x1: e.x, y1: e.y, x2: e.a, y2: e.b, t: 0, life: 12, col: '#6fe8ff', w: 12 }); break;
    case 'cuts': for (let n = 0; n < 6; n++) { const a = Math.random() * 3.14, r = e.a; FX.lines.push({ x1: e.x - Math.cos(a) * r, y1: e.y - Math.sin(a) * r, x2: e.x + Math.cos(a) * r, y2: e.y + Math.sin(a) * r, t: 0, life: 9, col: '#bff4ff', w: 6 }); } FX.shake = Math.max(FX.shake, 6); break;
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
  for (const w of FX.words) w.t++; FX.words = FX.words.filter(w => w.t < w.life);
  for (const n of FX.nums) { n.t++; n.y -= 1.4 * Math.max(0, 1 - n.t / 20); } FX.nums = FX.nums.filter(n => n.t < n.life);
  FX.shake *= .85; FX.flash *= .86; if (FX.banner && ++FX.banner.t > FX.banner.life) FX.banner = null;
  if (FX.nope[0] > 0) FX.nope[0]--; if (FX.nope[1] > 0) FX.nope[1]--;
  if (FX.impact && ++FX.impact.t > 8) FX.impact = null;
  if (FX.bf && ++FX.bf.t >= FX.bf.life) FX.bf = null;
}
FX.stars = []; FX.puffs = []; FX.nums = []; FX.words = []; FX.cam = { x: W / 2, y: H / 2, z: 1 }; FX.clock = 0; FX.silent = false; FX.lite = false; FX.impact = null; FX.bf = null;

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
  else if (d.k !== 'absolute' && d.k !== 'worldbreaker' && d.k !== 'theworld') { const ac = CH[S.f[d.o].ch].look.accent; c.globalAlpha = a * .75; c.fillStyle = '#1b1424'; c.fillRect(0, 0, W, H); c.globalAlpha = a * .35; c.fillStyle = ac; for (let n = 0; n < 12; n++) { const b = n * Math.PI / 6 + t * .01; c.beginPath(); c.moveTo(640, 330); c.lineTo(640 + Math.cos(b) * 1500, 330 + Math.sin(b) * 1500); c.lineTo(640 + Math.cos(b + .12) * 1500, 330 + Math.sin(b + .12) * 1500); c.fill(); } }
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
  // depth p: 0 is fixed to the screen, 1 moves with the fighters, more than 1 is nearer than them
  const layer = p => { const zp = 1 + (m.z - 1) * p; c.save(); c.translate(W / 2 + sx * p, H / 2 + sy * p); c.scale(zp, zp); c.translate(-(W / 2 + (m.x - W / 2) * p), -(H / 2 + (m.y - H / 2) * p)); };
  const T = FX.clock, calm = !(S.dom && !S.freeze);
  c.drawImage(BG.sky, 0, 0);
  if (!FX.lite) { layer(.1); for (let n = 0; n < 4; n++) { const k = .55 + (n % 3) * .22; c.globalAlpha = .9; c.drawImage(BG.cloud, ((n * 430 + T * (.1 + n * .04)) % (W + 500)) - 380, 120 + n * 62, 320 * k, 130 * k); } c.globalAlpha = 1; c.restore(); }
  layer(.2); c.drawImage(BG.far, -60, 0); c.restore();
  layer(.5); c.drawImage(BG.town, -60, 0); c.restore();
  layer(1); c.drawImage(BG.arena, -60, 0); drawArenaLife(c, T); c.restore();
  if (calm && !FX.lite) {   // shafts of evening light, and dust drifting in them
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let n = 0; n < 6; n++) { const a = 2.02 + n * .2 + Math.sin(T * .004 + n * 1.9) * .035, hw = .03 + (n % 3) * .012; c.globalAlpha = .05 + .025 * Math.sin(T * .01 + n * 2.3); c.fillStyle = '#ffd9a0'; c.beginPath(); c.moveTo(SUN[0], SUN[1]); c.lineTo(SUN[0] + Math.cos(a - hw) * 1300, SUN[1] + Math.sin(a - hw) * 1300); c.lineTo(SUN[0] + Math.cos(a + hw) * 1300, SUN[1] + Math.sin(a + hw) * 1300); c.fill(); }
    c.fillStyle = '#ffe9b8'; for (let n = 0; n < 22; n++) { const x = (n * 173 + T * (.15 + n % 4 * .07)) % W, y = 230 + ((n * 97 + Math.sin(T * .01 + n) * 30) % 380); c.globalAlpha = .25 + .2 * Math.sin(T * .03 + n * 1.3); c.beginPath(); c.arc(x, y, 1.2 + n % 3 * .7, 0, 7); c.fill(); }
    c.restore();
  }
  c.save(); c.translate(W / 2 + sx, H / 2 + sy); c.scale(m.z, m.z); c.translate(-m.x, -m.y);
  for (let n = 0; n < 16; n++) { const x = (n * 97 + T * (.7 + n % 3 * .25)) % (W + 40) - 20, y = (n * 61 + T * (.8 + n % 4 * .2)) % (GROUND + 30); c.save(); c.translate(x, y); c.rotate(T * .03 + n); c.fillStyle = n % 2 ? '#ffc2d6' : '#ffe0ea'; c.beginPath(); c.ellipse(0, 0, 7, 3.5, 0, 0, 7); c.fill(); c.fillStyle = 'rgba(190,70,120,.35)'; c.beginPath(); c.ellipse(-1.5, 1, 4.5, 1.6, 0, 0, 7); c.fill(); c.restore(); }
  drawDomainBack(c, S);
  for (const z of S.zones) {
    if (z.k === 'blue') { const g = z.t < 48 ? 1 : 1 + (z.t - 48) / 4; c.save(); c.strokeStyle = 'rgba(120,190,255,.8)'; c.lineWidth = 4; for (let n = 0; n < 3; n++) { const r = 170 - ((z.t * 5 + n * 57) % 170); c.beginPath(); c.arc(z.x, z.y, r, z.t * .1 + n, z.t * .1 + n + 4.4); c.stroke(); } c.globalAlpha = z.t < 48 ? 1 : Math.max(0, 1 - (z.t - 48) / 12); blob(c, '#2f8fff', () => c.arc(z.x, z.y, 46 * g + Math.sin(z.t * .4) * 3, 0, 7)); blob(c, '#bfe4ff', () => c.arc(z.x - 8, z.y - 8, 20 * g, 0, 7)); c.restore(); }
    if (z.k === 'tongue') { const k2 = Math.sin(Math.min(1, z.t / z.dur) * Math.PI); c.strokeStyle = INK; c.lineWidth = 17; c.lineCap = 'round'; const ex = z.x + (z.tx - z.x) * (z.hitFoe ? Math.max(k2, .25) : k2); c.beginPath(); c.moveTo(z.x + z.face * 20, GROUND - 30); c.lineTo(ex, GROUND - 60); c.stroke(); c.strokeStyle = '#ff7aa8'; c.lineWidth = 10; c.stroke(); blob(c, '#5b46a8', () => c.ellipse(z.x, GROUND - 26, 40, 28, 0, 0, 7)); blob(c, '#8f7ae0', () => c.ellipse(z.x - z.face * 4, GROUND - 16, 24, 12, 0, 0, 7)); for (const ey of [-1, 1]) { blob(c, '#fff', () => c.arc(z.x + z.face * (8 + ey * 12), GROUND - 52, 10, 0, 7)); c.fillStyle = INK; c.beginPath(); c.arc(z.x + z.face * (10 + ey * 12), GROUND - 52, 4, 0, 7); c.fill(); } }
    if (z.k === 'pebble') drawStone(c, z.x, z.y, z.t);
    if (z.k === 'mark') { if (z.t < z.delay) { c.save(); c.strokeStyle = INK; c.lineWidth = 7; c.setLineDash([12, 9]); c.lineDashOffset = -z.t * 3; c.beginPath(); c.arc(z.x, z.y, z.r * (1.4 - .4 * z.t / z.delay), 0, 7); c.stroke(); c.strokeStyle = '#6fe8ff'; c.lineWidth = 3; c.stroke(); c.restore(); } else { c.fillStyle = 'rgba(20,40,60,.55)'; c.beginPath(); c.arc(z.x, z.y, z.r, 0, 7); c.fill(); } }
    if (z.k === 'trap') { c.strokeStyle = INK; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(z.x, GROUND - 2); c.lineTo(z.x + 6, GROUND - 26); c.stroke(); c.strokeStyle = '#c9ccd4'; c.lineWidth = 3; c.stroke(); blob(c, '#ffa64d', () => c.arc(z.x + 6, GROUND - 26, 5 + Math.sin(z.t * .3) * 1.5, 0, 7)); }
    if (z.k === 'target') { c.save(); c.strokeStyle = INK; c.lineWidth = 8; c.beginPath(); c.ellipse(z.x, GROUND, z.r, 16, 0, 0, 7); c.stroke(); c.strokeStyle = z.t % 6 < 3 ? '#ff8a2a' : '#ffe36b'; c.lineWidth = 4; c.stroke(); c.restore(); }
  }
  for (const e of S.ents) {
    c.save(); c.translate(e.x, e.y); c.scale(e.face, 1);
    if (e.k === 'dog') { const run = Math.sin(e.t * .6) * 9, b = e.bite > 0 ? 8 : 0, col = e.v ? '#3a3050' : '#f4f1fb'; c.strokeStyle = INK; c.lineWidth = 13; c.lineCap = 'round'; c.beginPath(); c.moveTo(-18, -24); c.lineTo(-22 - run, -2); c.moveTo(14, -24); c.lineTo(18 + run, -2); c.stroke(); c.strokeStyle = col; c.lineWidth = 6; c.stroke(); blob(c, col, () => { c.moveTo(-28, -34); c.quadraticCurveTo(-50, -52, -42, -66); c.quadraticCurveTo(-36, -50, -22, -40); }); blob(c, col, () => c.ellipse(0, -32, 32, 16, 0, 0, 7)); blob(c, col, () => { c.moveTo(20, -52); c.lineTo(24, -72); c.lineTo(36, -54); }); blob(c, col, () => c.ellipse(32 + b, -42, 17, 14, -.2, 0, 7)); blob(c, '#fff', () => c.arc(36 + b, -46, 5.5, 0, 7)); c.fillStyle = '#a47bff'; c.beginPath(); c.arc(37 + b, -46, 2.8, 0, 7); c.fill(); c.fillStyle = INK; c.beginPath(); c.arc(48 + b, -40, 3.5, 0, 7); c.fill(); if (b) { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(40, -34); c.lineTo(44, -26); c.lineTo(48, -34); c.fill(); } }
    else if (e.k === 'nue') { const fl = Math.sin(e.t * .5) * 24; blob(c, '#f0a93a', () => { c.moveTo(0, -4); c.lineTo(-58, -34 - fl); c.lineTo(-40, -6); c.lineTo(-24, 4); }); blob(c, '#d88a1f', () => { c.moveTo(0, 4); c.lineTo(-46, 28 + fl); c.lineTo(-16, 10); }); blob(c, '#f0a93a', () => c.ellipse(0, 0, 30, 16, 0, 0, 7)); blob(c, '#fbf6ea', () => c.arc(24, -3, 14, 0, 7)); blob(c, '#fff', () => c.arc(28, -6, 5, 0, 7)); c.fillStyle = INK; c.beginPath(); c.arc(29, -6, 2.5, 0, 7); c.fill(); blob(c, '#ffb347', () => { c.moveTo(36, 0); c.lineTo(48, 4); c.lineTo(36, 8); }); c.strokeStyle = INK; c.lineWidth = 7; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-10, 12); c.lineTo(-4 + fl * .3, 30); c.lineTo(8, 24); c.lineTo(12, 44); c.stroke(); c.strokeStyle = '#fff799'; c.lineWidth = 3; c.stroke(); }
    c.restore();
  }
  for (const p of FX.puffs) { c.globalAlpha = 1 - p.t / p.life; c.fillStyle = '#f3e9da'; c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); c.stroke(); } c.globalAlpha = 1;
  // impact frame: for a few frames the world drops away and only the two figures and the blow are left
  const imp = FX.impact && FX.impact.t < FX.impact.sil ? FX.impact : null;
  if (imp) { c.globalAlpha = imp.kind === 'black' ? 1 : .88; c.fillStyle = imp.kind === 'black' ? '#07040a' : '#fbf6ee'; c.fillRect(-300, -300, W + 600, H + 600); c.globalAlpha = 1; }
  else if (FX.bf) { const k2 = 1 - FX.bf.t / FX.bf.life; c.globalAlpha = .78 * k2; c.fillStyle = '#07040a'; c.fillRect(-300, -300, W + 600, H + 600); c.globalAlpha = 1; glow(c, FX.bf.x, FX.bf.y, 460, '#ff1030', .55 * k2); }
  const order = S.f[0].st === 'atk' ? [1, 0] : [0, 1];
  for (const i of order) drawFighter(c, S, S.f[i]);
  for (const f of S.f) if (f.gum > 0 && f.st !== 'ko') { const o = S.f[1 - f.i], mx = (f.x + o.x) / 2, sag = 30 + Math.sin(S.t * .2) * 8; c.strokeStyle = INK; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(o.x + o.face * 30, o.y - 70); c.quadraticCurveTo(mx, Math.min(o.y, f.y) - 70 + sag, f.x, f.y - 70); c.stroke(); c.strokeStyle = '#ff7ac8'; c.lineWidth = 4; c.stroke(); }
  for (const z of S.zones) if (z.k === 'beam') {
    const k2 = 1 - z.t / z.dur, len = 1500; c.save(); c.translate(z.x, z.y); c.scale(z.face, 1);
    const far = z.w * k2 + (z.cone ? len * z.cone * (.4 + k2 * .6) : 0), shape = s => { c.beginPath(); c.moveTo(0, -z.w * k2 * s); c.lineTo(len, -far * s); c.lineTo(len, far * s); c.lineTo(0, z.w * k2 * s); c.closePath(); };
    c.globalCompositeOperation = 'lighter'; c.fillStyle = z.col || '#ff9a2e'; c.globalAlpha = Math.min(1, k2 * 2) * .2; shape(2.6); c.fill(); c.globalAlpha = Math.min(1, k2 * 2) * .3; shape(1.7); c.fill(); c.globalCompositeOperation = 'source-over'; glow(c, 0, 0, z.w * 4 * k2 + 60, z.col || '#ffb347', .7 * Math.min(1, k2 * 2));
    c.globalAlpha = Math.min(1, k2 * 2); shape(1); c.fillStyle = z.col || '#ff9a2e'; c.fill(); c.strokeStyle = INK; c.lineWidth = 5; c.stroke(); shape(.62); c.fillStyle = z.col ? '#fff' : '#ffd36b'; c.globalAlpha *= z.col ? .5 : 1; c.fill(); c.globalAlpha = Math.min(1, k2 * 2); shape(.3); c.fillStyle = '#fff'; c.fill();
    blob(c, '#fff', () => c.arc(0, 0, z.w * 1.3 * k2 + 4, 0, 7)); c.restore();
  }
  for (const p of S.proj) {
    glow(c, p.x, p.y, (p.r || 10) * 3 + 34, p.col || ({ cut: '#ff5a6a', red: '#ff3a4a', flame: '#ff8a2a', shell: '#ffb347', pellet: '#ffc04d', gum: '#ff7ac8', nail: '#ffa64d', knife: '#ffe07a', stone: '#ffd866' })[p.k] || '#ffffff', .6);
    c.save(); c.translate(p.x, p.y); const a = Math.atan2(p.vy, p.vx);
    if (p.k === 'cut') { c.rotate(a); c.beginPath(); c.arc(-30, 0, 48, -.95, .95); c.arc(-46, 0, 50, .7, -.7, true); c.closePath(); c.fillStyle = '#fff'; c.fill(); c.strokeStyle = '#d4202f'; c.lineWidth = 4; c.lineJoin = 'round'; c.stroke(); }
    else if (p.k === 'red' || p.k === 'flame' || p.k === 'shell') { const col = p.k === 'red' ? '#ff3a4a' : p.k === 'flame' ? '#ff8a2a' : '#ffb347'; c.rotate(a); const w = Math.sin(p.t * .8) * 3; blob(c, col, () => { c.moveTo(0, -p.r); c.lineTo(-p.r * 3.4, w); c.lineTo(0, p.r); }); if (p.k === 'shell') { blob(c, '#4a4f55', () => { c.moveTo(-16, -11); c.lineTo(8, -11); c.quadraticCurveTo(26, 0, 8, 11); c.lineTo(-16, 11); }); c.fillStyle = '#ffb347'; c.fillRect(-8, -9, 6, 18); } else { blob(c, col, () => c.arc(0, 0, p.r + 3, 0, 7)); blob(c, p.k === 'red' ? '#ffc2c8' : '#ffe9a0', () => c.arc(3, -3, p.r * .5, 0, 7)); } }
    else if (p.k === 'pellet') { c.rotate(a); blob(c, '#ff9a2e', () => { c.moveTo(0, -7); c.lineTo(-30, 0); c.lineTo(0, 7); }); blob(c, '#ffe36b', () => c.arc(0, 0, 10, 0, 7)); }
    else if (p.k === 'orb') { if (p.spin) { c.rotate(p.t * .5); blob(c, p.col, () => { for (let n = 0; n < 12; n++) { const r = n % 2 ? p.r * .6 : p.r + 6, b = n * Math.PI / 6; c.lineTo(Math.cos(b) * r, Math.sin(b) * r); } }); blob(c, '#fff', () => c.arc(0, 0, p.r * .3, 0, 7)); } else { c.rotate(a); blob(c, p.col, () => { c.moveTo(0, -p.r); c.lineTo(-p.r * 3, Math.sin(p.t * .8) * 3); c.lineTo(0, p.r); }); blob(c, p.col, () => c.arc(0, 0, p.r + 3, 0, 7)); blob(c, '#fff', () => c.arc(3, -3, p.r * .45, 0, 7)); } }
    else if (p.k === 'nail' || p.k === 'knife') { c.rotate(a); blob(c, p.k === 'nail' ? '#c9ccd4' : '#f4f6ff', () => { c.moveTo(16, 0); c.lineTo(-10, -4.5); c.lineTo(-10, 4.5); }); blob(c, p.k === 'nail' ? '#ffa64d' : '#ffe07a', () => c.rect(-18, -6, 9, 12)); }
    else if (p.k === 'gum') { c.rotate(a); blob(c, '#ff7ac8', () => c.ellipse(0, 0, 16, 10, 0, 0, 7)); blob(c, '#ffd0ec', () => c.arc(4, -3, 4, 0, 7)); }
    else if (p.k === 'wave') { c.scale(sgn(p.vx), 1); const h = p.ground ? 46 : 70; c.beginPath(); c.arc(-30, p.ground ? 26 : 0, h, -1.2, p.ground ? 0 : 1.2); c.arc(-52, p.ground ? 26 : 0, h, p.ground ? 0 : 1.0, -1.0, true); c.closePath(); c.fillStyle = p.col; c.fill(); c.strokeStyle = INK; c.lineWidth = 4; c.lineJoin = 'round'; c.stroke(); }
    else if (p.k === 'stone') { c.restore(); drawStone(c, p.x, p.y, p.t); continue; }
    c.restore();
  }
  // effects
  c.lineCap = 'round';
  for (const l of FX.lines) { const k2 = 1 - l.t / l.life; c.globalAlpha = k2; c.strokeStyle = INK; c.lineWidth = l.w * k2 + 5; c.beginPath(); c.moveTo(l.x1, l.y1); c.lineTo(l.x2, l.y2); c.stroke(); c.strokeStyle = l.col; c.lineWidth = l.w * k2 + 1; c.stroke(); }
  for (const r of FX.rings) { c.globalAlpha = 1 - r.t / r.life; c.strokeStyle = INK; c.lineWidth = 8; c.beginPath(); c.arc(r.x, r.y, r.r, 0, 7); c.stroke(); c.strokeStyle = r.col; c.lineWidth = 4; c.stroke(); }
  c.globalAlpha = 1;
  for (const s of FX.stars) { const k2 = s.t / s.life; if (!imp) glow(c, s.x, s.y, s.r * 2.2, s.col, .5 * (1 - k2)); drawStar(c, s.x, s.y, s.r * (.5 + Math.sin(Math.min(1, k2 * 2) * Math.PI / 2) * .5) * (k2 > .7 ? 1 - (k2 - .7) * 2 : 1), s.rot, s.col); }
  for (const p of FX.parts) { const k2 = 1 - p.t / p.life; c.fillStyle = p.col; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(p.x, p.y, p.s * k2 + 1, 0, 7); c.fill(); c.stroke(); }
  c.textAlign = 'center'; c.textBaseline = 'middle';
  for (const n of FX.nums) { const pop = Math.min(1, n.t / 5); c.globalAlpha = Math.min(1, (n.life - n.t) / 10); c.font = `900 ${(n.bf ? 58 : n.big ? 40 : 26) * (.6 + pop * .4)}px ${DISPLAY}`; c.lineWidth = n.bf ? 10 : 7; c.lineJoin = 'round'; c.strokeStyle = n.bf ? '#ff2038' : INK; c.strokeText(n.txt, n.x, n.y); c.fillStyle = n.bf ? '#0a0508' : n.big ? '#ffe36b' : '#fff'; c.fillText(n.txt, n.x, n.y); }
  for (const w of FX.words) { const pop = Math.min(1, w.t / 5), k2 = Math.min(1, (w.life - w.t) / 8); c.save(); c.globalAlpha = k2; c.translate(w.x, w.y - w.t * .5); c.rotate(-.06); c.scale(.5 + pop * .5, .5 + pop * .5); c.font = `italic 900 34px ${DISPLAY}`; const tw = c.measureText(w.txt).width + 36; c.fillStyle = INK; rr(c, -tw / 2 - 5, -31, tw + 10, 62, 22); c.fill(); c.fillStyle = '#fff'; rr(c, -tw / 2, -26, tw, 52, 18); c.fill(); c.fillStyle = INK; c.fillText(w.txt, 0, 2); c.restore(); }
  c.globalAlpha = 1;
  if (S.dom && S.dom.k === 'nuclear' && S.dom.t < 72 && !S.freeze) { const f = S.f[S.dom.o], k2 = S.dom.t / 72, x = f.x + f.face * 50, y = f.y - 74; c.strokeStyle = '#ffb347'; c.lineWidth = 4; for (let n = 0; n < 3; n++) { c.beginPath(); c.arc(x, y, (1 - ((S.dom.t * 3 + n * 30) % 90) / 90) * 130, 0, 7); c.stroke(); } drawStar(c, x, y, 16 + k2 * 40, S.t * .2, '#ffe36b'); blob(c, '#fff', () => c.arc(x, y, 6 + k2 * 16, 0, 7)); }
  if (FX.bf) {   // Black Flash: a black burst with a red edge, and black lightning thrown out of it
    const b = FX.bf, k2 = b.t / b.life, r = b.t < 5 ? 44 + b.t * 24 : 140 * Math.max(0, 1 - (b.t - 5) / 18);
    glow(c, b.x, b.y, 280, '#ff1030', .75 * (1 - k2));
    if (b.t < 20) for (let n = 0; n < 8; n++) { const a = n * .8 + (b.t >> 1) * 1.3, len = 170 + ((n * 67 + (b.t >> 1) * 40) % 260); bolt(c, b.x, b.y, b.x + Math.cos(a) * len, b.y + Math.sin(a) * len * .8, 7, 52, n * 31 + (b.t >> 1) * 7, 6 * (1 - b.t / 20) + 2, '#0a0508', '#ff2038'); }
    if (r > 3) { const st2 = (rad, rot, fill, edge, lw) => { c.beginPath(); for (let k = 0; k < 24; k++) { const rr2 = k % 2 ? rad * .34 : rad * (k % 4 ? .78 : 1), a = rot + k * Math.PI / 12; c.lineTo(b.x + Math.cos(a) * rr2, b.y + Math.sin(a) * rr2); } c.closePath(); c.lineJoin = 'miter'; c.strokeStyle = edge; c.lineWidth = lw; c.stroke(); c.fillStyle = fill; c.fill(); }; st2(r, b.rot + b.t * .05, '#0a0508', '#ff2038', 9); st2(r * .42, -b.rot - b.t * .08, '#ff2038', '#0a0508', 4); st2(r * .16, b.rot, '#fff', '#ff2038', 2); c.lineJoin = 'round'; }
  }
  c.restore();
  if (!FX.lite) { layer(1.3); c.drawImage(BG.fore, -BG.foreM, 0); c.restore(); }
  c.drawImage(BG.vig, 0, 0);
  if (S.stop && S.stop.t > 0) { c.fillStyle = 'rgba(255,214,110,.2)'; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(255,224,122,.9)'; c.lineWidth = 10; c.strokeRect(5, 5, W - 10, H - 10); }
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
    if (ch.res) { c.font = `900 13px ${DISPLAY}`; c.textAlign = left ? 'right' : 'left'; inkText(c, ch.res.name + ' ' + Math.floor(f.res) + '/' + ch.res.max, left ? x0 + bw : x0, y0 + 72, '#fff', 4); }
    if (f.nails > 0 || f.gum > 0) { c.font = `900 13px ${DISPLAY}`; c.textAlign = left ? 'left' : 'right'; inkText(c, f.nails > 0 ? 'NAILS ' + f.nails : 'STUCK ' + Math.ceil(f.gum / 60) + 's', left ? x0 : x0 + bw, y0 + 72, '#ff9a9a', 4); }
    for (let n = 0; n < 2; n++) drawStar(c, left ? x0 + 14 + n * 30 : x0 + bw - 14 - n * 30, y0 + 49, 11, -.3, S.wins[i] > n ? '#ffd866' : '#3d3148');
    c.font = `900 21px ${DISPLAY}`; c.textAlign = left ? 'left' : 'right'; inkText(c, ch.name.toUpperCase(), left ? x0 : x0 + bw, y0 - 19, '#fff', 6);
    c.font = `900 13px ${DISPLAY}`; c.textAlign = left ? 'right' : 'left'; inkText(c, ch.tech.toUpperCase(), left ? x0 + bw : x0, y0 - 18, ch.look.accent, 4);
    // portrait
    c.save(); c.fillStyle = shade(ch.look.accent, .55); c.beginPath(); c.arc(px, py, 40, 0, 7); c.fill(); c.clip();
    const hurt = f.st === 'hit' || f.st === 'stun' || f.st === 'ko' || f.st === 'down';
    c.translate(px, py + 3); c.scale(1.3, 1.3); c.translate(0, -GROUND);   // drawFighter puts a portrait's head at this point
    drawFighter(c, S, { i: 2 + i, ch: f.ch, x: 0, y: GROUND, vx: 0, vy: 0, face: left ? 1 : -1, st: hurt ? 'stun' : (f.st === 'atk' || f.st === 'cast' ? 'cast' : 'idle'), inv: 0, inf: 0, walkT: 0, move: null, portrait: 1, alt: lookOf(S, f) !== ch.look });
    c.restore(); c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.arc(px, py, 40, 0, 7); c.stroke(); c.strokeStyle = f.zone > 0 ? '#ff2038' : low ? '#ff9a2e' : ch.look.accent; c.lineWidth = 2.5; c.beginPath(); c.arc(px, py, 35.5, 0, 7); c.stroke();
    if (f.zone > 0) { c.save(); c.globalAlpha = .75 + .25 * Math.sin(S.t * .35); c.font = `italic 900 16px ${DISPLAY}`; c.textAlign = left ? 'left' : 'right'; inkText(c, 'IN THE ZONE  ' + Math.ceil(f.zone / 60) + 's', left ? x0 : x0 + bw, y0 + 94, '#ff3348', 5); c.restore(); c.fillStyle = INK; rr(c, left ? x0 : x0 + bw - 150, y0 + 105, 150, 9, 4); c.fill(); c.fillStyle = '#ff2038'; const zw = 146 * f.zone / BF_ZONE_TICKS; c.fillRect(left ? x0 + 2 : x0 + bw - 2 - zw, y0 + 107, zw, 5); }
    { const g = camPt(f.x, f.y - (f.big > 0 ? 246 : 196)), tag = labels[i] ? (labels[0] && labels[1] ? 'P' + (i + 1) : 'YOU') : (labels.other === 'Computer' ? 'CPU' : 'FOE'), tc = left ? '#59c8ff' : '#ff6a6a'; if (f.st !== 'ko') { c.font = `900 13px ${DISPLAY}`; c.textAlign = 'center'; const tw = c.measureText(tag).width + 14; c.fillStyle = INK; rr(c, g[0] - tw / 2 - 3, g[1] - 13, tw + 6, 26, 9); c.fill(); c.beginPath(); c.moveTo(g[0] - 7, g[1] + 12); c.lineTo(g[0], g[1] + 21); c.lineTo(g[0] + 7, g[1] + 12); c.fill(); c.fillStyle = tc; rr(c, g[0] - tw / 2, g[1] - 10, tw, 20, 6); c.fill(); c.fillStyle = INK; c.fillText(tag, g[0], g[1] + 1); } }
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
