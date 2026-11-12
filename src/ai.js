'use strict';
// A simple computer opponent: reads the state, returns a button mask.
const AI_MEM = [{}, {}];
const AI_RANGE = [260, 400, 80, 300, 430];

function aiInput(S, i) {
  const f = S.f[i], o = S.f[1 - i], m = AI_MEM[i], c = CH[f.ch];
  if (S.phase !== 'fight') { m.until = 0; return 0; }
  const dx = o.x - f.x, dist = Math.abs(dx), toward = dx > 0 ? BTN.R : BTN.L, away = dx > 0 ? BTN.L : BTN.R;
  const can = n => f.cd[n] <= 0 && f.ce >= c.arts[n].cost;
  const R = Math.random;
  let threat = false;
  if (o.st === 'atk') { const md = moveDef(o); threat = o.mt < md.su + 4 && (BASIC[o.move] ? dist < md.reach + 50 : true); }
  for (const p of S.proj) if (p.o !== i && Math.abs(p.x - f.x) < 220 && sgn(p.vx) === sgn(f.x - p.x)) threat = true;
  if (S.dom && S.dom.o !== i && (S.dom.k === 'shrine' || S.dom.k === 'ovation')) threat = true;
  if (S.dom && S.dom.o !== i && S.dom.k === 'nuclear') return dist < 300 ? toward | (S.t % 30 < 3 ? BTN.U : 0) : BTN.G;
  if (threat) {
    if (m.gt !== 1) { m.gt = 1; m.guard = R() < 0.6; m.jump = !m.guard && R() < 0.4; if (f.ch === 0 && can(2) && R() < 0.35) return BTN.A3; if (f.ch === 2 && can(0) && R() < 0.3) return BTN.A1; }
    if (m.guard) return BTN.G;
    if (m.jump) { m.jump = false; return BTN.U | toward; }
  } else m.gt = 0;
  if (m.until > S.t) return m.b | (m.tap && S.t % 6 < 3 ? m.tap : 0);
  const plan = (b, n, tap) => { m.b = b; m.until = S.t + n; m.tap = tap || 0; return b; };
  if (!free(f)) return 0;
  for (const e of S.ents) if (e.o !== i && e.k === 'dog' && Math.abs(e.x - f.x) < 100 && Math.random() < 0.5) return plan(0, 10, BTN.P);
  if (domReady(f) && f.y >= GROUND && R() < 0.5 && (f.ch !== 4 || dist < 650)) return BTN.DOM;
  const r = R(), pref = AI_RANGE[f.ch];
  // technique picks
  if (r < 0.45) {
    switch (f.ch) {
      case 0: if (can(0) && dist > 180 && dist < 460 && R() < 0.6) return BTN.A1; if (can(1) && dist < 380) return BTN.A2; break;
      case 1: if (can(1) && dist < 125 && (o.st === 'guard' || R() < 0.4)) return BTN.A2; if (can(2) && dist > 420 && R() < 0.4) return BTN.A3; if (can(0) && dist > 160) return BTN.A1; break;
      case 2: if (can(2) && dist < 170 && (o.st === 'guard' || R() < 0.4)) return BTN.A3; if (can(0) && dist > 260 && R() < 0.6) return BTN.A1; if (can(1) && dist > 200 && R() < 0.4) return BTN.A2; break;
      case 3: if (can(0) && R() < 0.7) return BTN.A1; if (can(2) && dist > 140 && dist < 480 && R() < 0.6) return BTN.A3; if (can(1)) return BTN.A2; break;
      case 4: if (can(1) && dist < 240) return BTN.A2; if (can(0) && dist > 200 && R() < 0.7) return BTN.A1; if (can(2)) return BTN.A3; break;
    }
  }
  if (dist < 105) {
    if (r < 0.55) return plan(0, 26, BTN.P);
    if (r < 0.8) return BTN.K;
    if (pref > 150) return plan(away | (R() < 0.3 ? BTN.U : 0), 18);
    return plan(BTN.G, 10);
  }
  if (dist > pref + 60 || (pref < 150 && dist > 100)) return plan(toward | (R() < 0.08 ? BTN.U : 0), 12);
  if (dist < pref - 100 && r < 0.6) return plan(away, 14);
  if (r < 0.3) return plan(toward, 14);
  return plan(0, 8);
}
