'use strict';
// Event-driven impact effects and sounds. World and HUD rasterization live in pixel-*.js.
const FX = { parts: [], rings: [], lines: [], contacts: [], dust: [], shake: 0, flash: 0, flashCol: '#fff', banner: null, ghosts: [], nope: [0, 0] };
function groundDust(e) {
  // Physics emits land and thud together on knockdown. Keep one larger floor contact.
  const prior=FX.dust.find(p=>p.t===0 && p.kind!=='jump' && Math.abs(p.x-e.x)<16);
  if(prior && e.k!=='jump') {if(e.k==='thud'){prior.kind='thud';prior.life=24;}return;}
  FX.dust.push({x:e.x,y:GROUND,kind:e.k,t:0,life:e.k==='thud'?24:e.k==='land'?18:12});
  if(FX.dust.length>32)FX.dust.shift();
}
// Contact direction is presentation only. Older block events have no direction;
// infer their defender from the contact root, including on remote clients.
function contact(S,e,kind) {
  const target=S.f.reduce((best,f)=>Math.abs(f.x-e.x)<Math.abs(best.x-e.x)?f:best);
  const dir=e.b===-1||e.b===1?e.b:-target.face;
  FX.contacts.push({x:e.x,y:e.y,dir,kind,t:0,life:kind==='break'?18:kind==='block'?12:14,heavy:kind==='break'||e.a>70});
  if(FX.contacts.length>48)FX.contacts.shift();
}
function burst(x, y, n, col, sp, life) { for (let k = 0; k < n; k++) { const a = Math.random() * 7, v = sp * (.3 + Math.random()); FX.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, life: life || 22, t: 0, col, s: 3 + Math.random() * 5 }); } }
function puff(x, y, n) { for (let k = 0; k < n; k++) FX.puffs.push({ x: x + (Math.random() - .5) * 30, y: y - Math.random() * 8, vx: (Math.random() - .5) * 3, r: 7 + Math.random() * 8, t: 0, life: 18 + Math.random() * 8 }); }
function star(x, y, r, col, life) { FX.stars.push({ x, y, r, rot: Math.random() * 7, col, t: 0, life: life || 9 }); }
function fxEvent(S, e) {
  switch (e.k) {
    case 'hit': {
      const big = e.a > 70; contact(S,e,'hit');
      if (e.a >= 4) {
        const target=S.f.reduce((best,f)=>Math.abs(f.x-e.x)<Math.abs(best.x-e.x)?f:best);
        FX.nums.push({x:e.x,y:pxActorAnchor(target).y*2-12,target:target.i,dir:e.b<0?-1:1,txt:Math.round(e.a),t:0,life:40,big});
      }
      if (e.a >= 110) FX.impact = { t: 0, sil: 3, kind: 'white' };   // the heaviest blows get an impact frame
      FX.shake = Math.max(FX.shake, Math.min(16, 3 + e.a / 10)); break;
    }
    case 'block': contact(S,e,'block'); break;
    case 'break': contact(S,e,'break'); FX.shake = 12; FX.banner = { txt: 'GUARD BREAK', t: 0, life: 40, small: 1 }; break;
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
    case 'thud': groundDust(e); FX.shake = Math.max(FX.shake, 5); break;
    case 'land': case 'jump': groundDust(e); break;
    case 'tick': burst(e.x, e.y, 3, '#c9b8ff', 2); break;
    case 'blackflash': {
      FX.impact = { t: 0, sil: 5, kind: 'black', a: e.a }; FX.bf = { x: e.x, y: e.y, t: 0, life: 36, rot: Math.random() * 7 }; FX.shake = 26;
      FX.banner = { txt: 'BLACK FLASH', t: 0, life: 50, small: 1, col: '#ff2038' };
      burst(e.x, e.y, 26, '#ff2038', 11, 34); burst(e.x, e.y, 18, '#0a0508', 9, 30);
      const n = FX.nums[FX.nums.length - 1]; if (n) { n.bf = 1; n.big = 1; n.life = 60; }
      break;
    }
    case 'ko': FX.impact = { t: 0, sil: 4, kind: 'white' }; FX.banner = { txt: S.winner<0?'DRAW':S.timer<=0?'TIME UP':'K.O.', t: 0, life: 120 }; FX.flash = .6; FX.flashCol = '#fff'; FX.shake = 20; break;
    case 'round': FX.banner = { txt: 'ROUND ' + e.a, t: 0, life: 70, opening: 1 }; break;
    case 'fight': FX.banner = { txt: 'FIGHT!', t: 0, life: 45, col: '#ffe36b', opening: 1 }; break;
    case 'domain': { const d = CH[e.a].dom; FX.banner = { txt: d.name.toUpperCase(), sub: d.maximum ? 'MAXIMUM' : 'DOMAIN EXPANSION', t: 0, life: 70, col: CH[e.a].look.accent }; FX.flash = .5; FX.flashCol = CH[e.a].look.accent; break; }
    case 'clash': FX.banner = { txt: 'DOMAIN CLASH', t: 0, life: 60 }; FX.flash = .9; FX.flashCol = '#fff'; FX.shake = 24; star(e.x, e.y, 200, '#fff', 16); burst(e.x, e.y, 50, '#fff', 12, 40); break;
    case 'nope': FX.nope[e.a] = 18; break;
    case 'word': FX.words.push({ x: clamp(e.x, 160, W - 160), y: e.y, txt: e.a, t: 0, life: 50 }); FX.shake = Math.max(FX.shake, 6); break;
    case 'counter': star(e.x, e.y, 70, '#7dffb0', 12); FX.rings.push({ x: e.x, y: e.y, r: 20, vr: 9, t: 0, life: 12, col: '#7dffb0' }); FX.shake = 10; FX.banner = { txt: 'COUNTER!', t: 0, life: 34, small: 1, col: '#7dffb0' }; break;
    case 'stop': FX.flash = .5; FX.flashCol = '#ffe07a'; FX.rings.push({ x: e.x, y: e.y, r: 20, vr: 26, t: 0, life: 22, col: '#ffe07a' }); break;
    case 'dash': FX.lines.push({ kind: 'dash', x1: e.x, y1: e.y, x2: e.a, y2: e.b, t: 0, life: 12, col: '#6fe8ff', w: 12 }); break;
    case 'cuts': for (let n = 0; n < 6; n++) { const a = Math.random() * 3.14, r = e.a; FX.lines.push({ x1: e.x - Math.cos(a) * r, y1: e.y - Math.sin(a) * r, x2: e.x + Math.cos(a) * r, y2: e.y + Math.sin(a) * r, t: 0, life: 9, col: '#bff4ff', w: 6 }); } FX.shake = Math.max(FX.shake, 6); break;
  }
  if (!FX.silent && typeof sfx === 'function') sfx(e);
}
function fxTick() {
  for(const e of FX.dust)e.t++; FX.dust=FX.dust.filter(e=>e.t<e.life);
  for(const e of FX.contacts)e.t++; FX.contacts=FX.contacts.filter(e=>e.t<e.life);
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

function drawWorld(c,S) { pxDrawWorld(c,S); }
function drawHUD(c,S,labels) { pxDrawHUD(c,S,labels); }
