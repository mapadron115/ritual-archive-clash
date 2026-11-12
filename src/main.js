'use strict';
// Menus, input, the main loop, sound and online play.
const $ = id => document.getElementById(id);
const cv = $('cv'), ctx = cv.getContext('2d');
const G = { S: null, mode: 'ai', pick: [0, 1], paused: false, running: false, keys: {}, acc: 0, last: 0, netEv: [], remoteIn: 0, guestPick: -1, sendT: 0 };

const BIND = {
  solo: { L: ['KeyA'], R: ['KeyD'], U: ['KeyW'], G: ['KeyS'], P: ['KeyJ'], K: ['KeyK'], A1: ['KeyU'], A2: ['KeyI'], A3: ['KeyO'], DOM: ['KeyL'],
    lab: { move: 'A / D', U: 'W', G: 'S', P: 'J', K: 'K', A1: 'U', A2: 'I', A3: 'O', DOM: 'L' } },
  p1: { L: ['KeyA'], R: ['KeyD'], U: ['KeyW'], G: ['KeyS'], P: ['KeyF'], K: ['KeyG'], A1: ['KeyR'], A2: ['KeyT'], A3: ['KeyY'], DOM: ['KeyH'],
    lab: { move: 'A / D', U: 'W', G: 'S', P: 'F', K: 'G', A1: 'R', A2: 'T', A3: 'Y', DOM: 'H' } },
  p2: { L: ['ArrowLeft'], R: ['ArrowRight'], U: ['ArrowUp'], G: ['ArrowDown'], P: ['Comma', 'Numpad1'], K: ['Period', 'Numpad2'], A1: ['KeyI', 'Numpad4'], A2: ['KeyO', 'Numpad5'], A3: ['KeyP', 'Numpad6'], DOM: ['Slash', 'Numpad3'],
    lab: { move: '← / →', U: '↑', G: '↓', P: ',', K: '.', A1: 'I', A2: 'O', A3: 'P', DOM: '/' } },
};
function readKeys(b) { let m = 0; for (const k in BTN) for (const code of b[k]) if (G.keys[code]) m |= BTN[k]; return m; }
addEventListener('keydown', e => {
  if (e.code === 'Escape' && G.running) { togglePause(); return; }
  if (e.code === 'KeyM') { AUDIO.mute = !AUDIO.mute; return; }
  G.keys[e.code] = true; if (G.running && !e.ctrlKey && !e.metaKey && e.code !== 'F5' && e.code !== 'F12') e.preventDefault();
  initAudio();
});
addEventListener('keyup', e => { G.keys[e.code] = false; });
addEventListener('blur', () => { G.keys = {}; });

// ---------- sound (all synthesized)
const AUDIO = { ctx: null, mute: false };
function initAudio() { if (!AUDIO.ctx) { try { AUDIO.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } } }
function tone(f0, f1, dur, type, vol) { const a = AUDIO.ctx; if (!a || AUDIO.mute) return; const o = a.createOscillator(), g = a.createGain(), t = a.currentTime; o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur); g.gain.setValueAtTime(vol || .15, t); g.gain.exponentialRampToValueAtTime(.001, t + dur); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur); }
function noise(dur, vol, freq) { const a = AUDIO.ctx; if (!a || AUDIO.mute) return; const n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n); const s = a.createBufferSource(), g = a.createGain(), fl = a.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = freq || 2000; s.buffer = buf; g.gain.value = vol || .2; s.connect(fl); fl.connect(g); g.connect(a.destination); s.start(); }
function sfx(e) {
  switch (e.k) {
    case 'hit': noise(.09 + e.a / 900, .25 + e.a / 500, 900 + e.a * 8); tone(160, 50, .12, 'square', .1); break;
    case 'block': noise(.05, .15, 3000); tone(500, 300, .05, 'triangle', .08); break;
    case 'break': noise(.3, .3, 1500); tone(700, 100, .3, 'sawtooth', .12); break;
    case 'whoosh': noise(.07, .06, 1200); break;
    case 'clap': noise(.04, .4, 6000); tone(1200, 600, .05, 'square', .12); break;
    case 'slash': case 'rain': noise(.08, .14, 7000); tone(1800, 500, .08, 'sawtooth', .05); break;
    case 'blast': tone(300, 80, .2, 'sawtooth', .14); noise(.15, .15, 1200); break;
    case 'beam': tone(500, 60, .35, 'sawtooth', .2); noise(.3, .25, 2500); break;
    case 'nuke': tone(200, 30, .9, 'sawtooth', .3); noise(.9, .4, 1800); break;
    case 'charge': tone(80, 900, 1.15, 'sawtooth', .12); break;
    case 'boom': noise(.4, .35, 700); tone(120, 30, .4, 'sine', .3); break;
    case 'hum': tone(220, 440, .3, 'sine', .14); break;
    case 'summon': tone(140, 60, .3, 'triangle', .2); noise(.2, .1, 500); break;
    case 'zap': tone(1500, 200, .15, 'square', .12); noise(.1, .15, 8000); break;
    case 'inf': tone(900, 1300, .12, 'sine', .1); break;
    case 'jump': tone(250, 400, .08, 'sine', .05); break;
    case 'thud': case 'wall': noise(.15, .25, 400); break;
    case 'ko': tone(400, 40, .9, 'sawtooth', .2); noise(.5, .3, 900); break;
    case 'round': tone(440, 440, .15, 'triangle', .12); break;
    case 'fight': tone(660, 880, .25, 'triangle', .16); break;
    case 'domain': tone(60, 240, 1, 'sawtooth', .22); tone(90, 360, 1, 'sine', .2); break;
    case 'clash': noise(.6, .4, 3000); tone(900, 50, .7, 'square', .15); break;
    case 'nope': tone(140, 110, .08, 'square', .06); break;
  }
}

// ---------- menus
function show(id) { for (const s of document.querySelectorAll('.screen')) s.style.display = s.id === id ? 'flex' : 'none'; }
function moveList(ch, lab) {
  const c = CH[ch], k = n => lab ? `<kbd>${lab[n]}</kbd>` : '';
  let h = `<h3 style="color:${c.look.accent}">${c.name} <span>${c.tech} · ${c.tag}</span></h3><table>`;
  c.arts.forEach((a, n) => { h += `<tr><td>${k('A' + (n + 1))}</td><td><b>${a.name}</b></td><td>${a.cost} CE · ${(a.cd / 60).toFixed(1)}s</td><td>${a.desc}</td></tr>`; });
  h += `<tr><td>${k('DOM')}</td><td><b>${c.dom.name}</b></td><td>${c.dom.maximum ? 'Maximum' : 'Domain'}</td><td>${c.dom.desc}. Once a round, when the gauge is full or you are under 30% health</td></tr></table>`;
  return h;
}
function basics(lab) { return `<p class="basics">Move <kbd>${lab.move}</kbd> Jump <kbd>${lab.U}</kbd> Guard <kbd>${lab.G}</kbd> (hold; faces the foe) Punch <kbd>${lab.P}</kbd> (press 3 times for a combo) Kick <kbd>${lab.K}</kbd> (wears a guard down) · Pause <kbd>Esc</kbd> · Mute <kbd>M</kbd></p>`; }
function labels() {
  if (G.mode === 'local') return [BIND.p1.lab, BIND.p2.lab];
  if (G.mode === 'watch') { const l = [null, null]; l.other = 'Computer'; return l; }
  const l = G.mode === 'guest' ? [null, BIND.solo.lab] : [BIND.solo.lab, null]; l.other = G.mode === 'ai' ? 'Computer' : 'Online opponent'; return l;
}
function buildSelect() {
  const online = G.mode === 'host' || G.mode === 'guest', me = G.mode === 'guest' ? 1 : 0;
  const names = G.mode === 'local' ? ['Player 1', 'Player 2'] : G.mode === 'watch' ? ['Computer 1', 'Computer 2'] : online ? (me ? ['Host', 'You'] : ['You', 'Guest']) : ['You', 'Computer'];
  for (let i = 0; i < 2; i++) {
    const col = $('col' + i); col.innerHTML = `<h2>${names[i]}</h2>`;
    CH.forEach((c, n) => {
      const b = document.createElement('button'); b.className = 'fighter' + (G.pick[i] === n ? ' on' : ''); b.style.setProperty('--ac', c.look.accent);
      b.innerHTML = `<b>${c.tech}</b><span>${c.name} · ${c.tag}</span>`;
      b.disabled = online && i !== me;
      b.onmouseenter = () => { $('detail').innerHTML = moveList(n, labels()[i] || BIND.solo.lab); };
      b.onclick = () => { G.pick[i] = n; if (online) netSend({ t: 'pick', ch: n }); buildSelect(); $('detail').innerHTML = moveList(n, labels()[i] || BIND.solo.lab); };
      col.appendChild(b);
    });
  }
  const lab = labels();
  $('detail').innerHTML = moveList(G.pick[me], lab[me] || BIND.solo.lab);
  $('selBasics').innerHTML = G.mode === 'local' ? '<b>Player 1</b>' + basics(BIND.p1.lab) + '<b>Player 2</b>' + basics(BIND.p2.lab) : basics(BIND.solo.lab);
  $('start').style.display = G.mode === 'guest' ? 'none' : '';
  $('selNote').textContent = G.mode === 'guest' ? 'The host starts the fight.' : '';
}
function pickMode(m) { G.mode = m; show('select'); buildSelect(); }
function startFight() {
  G.S = newMatch(G.pick[0], G.pick[1], (Math.random() * 1e9) | 0); POSE_CACHE[0] = POSE_CACHE[1] = null; FX.parts = []; FX.banner = null;
  AI_MEM[0] = {}; AI_MEM[1] = {}; FX.stars = []; FX.puffs = []; FX.nums = []; FX.lines = []; FX.silent = false; G.paused = false; G.running = true; G.over = false; G.acc = 0; G.remoteIn = 0;
  if (G.mode === 'host') netSend({ t: 'start', p: G.pick });
  show('none'); initAudio();
}
function togglePause() {
  if (G.over) return;
  G.paused = !G.paused;
  if (G.paused) { const lab = labels(); $('pauseList').innerHTML = (G.mode === 'local' ? '' : basics(BIND.solo.lab)) + moveList(G.S.f[0].ch, lab[0]) + moveList(G.S.f[1].ch, lab[1]) + (G.mode === 'local' ? '<b>Player 1</b>' + basics(BIND.p1.lab) + '<b>Player 2</b>' + basics(BIND.p2.lab) : ''); show('pause'); }
  else show('none');
}
function toMenu(fromNet) { G.running = false; G.paused = false; if (!fromNet && (G.mode === 'host' || G.mode === 'guest')) netClose(); show('title'); }
function toSelect() { G.running = false; G.paused = false; if (G.mode === 'host') netSend({ t: 'select' }); show('select'); buildSelect(); }

// ---------- online (WebRTC through PeerJS; the host runs the fight, the guest sends buttons)
const NET = { peer: null, conn: null };
function netStatus(t) { $('netStatus').textContent = t; }
function netSend(m) { if (NET.conn && NET.conn.open) NET.conn.send(m); }
function netClose() { try { if (NET.peer) NET.peer.destroy(); } catch (e) { } NET.peer = NET.conn = null; }
function loadPeer(cb) {
  if (window.Peer) return cb();
  netStatus('Loading the network library…');
  const s = document.createElement('script'); s.src = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js'; s.onload = cb; s.onerror = () => netStatus('Could not load the network library. Is this computer online?'); document.head.appendChild(s);
}
function netWire(conn, mode) {
  NET.conn = conn;
  conn.on('open', () => { G.mode = mode; G.pick = [0, 1]; netSend({ t: 'pick', ch: G.pick[mode === 'guest' ? 1 : 0] }); show('select'); buildSelect(); });
  conn.on('data', m => {
    if (m.t === 'pick') { G.pick[mode === 'guest' ? 0 : 1] = m.ch; if (!G.running) buildSelect(); }
    else if (m.t === 'in') G.remoteIn = m.b;
    else if (m.t === 'start') { G.pick = m.p; startFight(); }
    else if (m.t === 'select') toSelect();
    else if (m.t === 's' && G.mode === 'guest') { G.S = m.s; for (const e of m.e) fxEvent(G.S, e); if (G.S.phase === 'over' && !G.over) endMatch(); if (G.S.phase !== 'over' && G.over) { G.over = false; show('none'); } }
  });
  conn.on('close', () => { if (G.mode === 'host' || G.mode === 'guest') { toMenu(true); netClose(); show('online'); netStatus('The other player disconnected.'); } });
}
function hostGame() {
  netClose();
  loadPeer(() => {
    const code = Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.random() * 24 | 0]).join('');
    NET.peer = new Peer('ritual-demo-' + code);
    NET.peer.on('open', () => netStatus('Room code: ' + code + '  — give it to your friend. Waiting for them…'));
    NET.peer.on('connection', c => netWire(c, 'host'));
    NET.peer.on('error', e => netStatus('Network error: ' + e.type));
  });
}
function joinGame() {
  const code = $('code').value.trim().toUpperCase(); if (code.length !== 4) return netStatus('Type the 4-letter room code.');
  netClose();
  loadPeer(() => {
    NET.peer = new Peer();
    NET.peer.on('open', () => { netStatus('Connecting…'); netWire(NET.peer.connect('ritual-demo-' + code, { reliable: true }), 'guest'); });
    NET.peer.on('error', e => netStatus(e.type === 'peer-unavailable' ? 'No room with that code.' : 'Network error: ' + e.type));
  });
}

function endMatch() {
  G.over = true; const w = G.S.wins[0] >= 2 ? 0 : 1;
  $('overTitle').textContent = CH[G.S.f[w].ch].name + ' wins'; $('overTitle').style.color = CH[G.S.f[w].ch].look.accent;
  $('overBtns').style.display = G.mode === 'guest' ? 'none' : '';
  setTimeout(() => { if (G.over && G.running) show('over'); }, 1400);
}

// ---------- loop
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(100, now - G.last); G.last = now;
  if (!G.running || !G.S) {   // a computer match plays behind the menus
    if (!G.demo || G.demo.phase === 'over') { const a = Math.random() * 5 | 0; G.demo = newMatch(a, (a + 1 + (Math.random() * 4 | 0)) % 5, (Math.random() * 1e9) | 0); AI_MEM[0] = {}; AI_MEM[1] = {}; POSE_CACHE[0] = POSE_CACHE[1] = null; }
    FX.silent = true; G.acc += dt; let n = 0;
    while (G.acc >= 1000 / TPS && n++ < 3) { G.acc -= 1000 / TPS; step(G.demo, [aiInput(G.demo, 0), aiInput(G.demo, 1)]); for (const e of G.demo.ev) fxEvent(G.demo, e); G.demo.ev.length = 0; fxTick(); }
    if (n > 3) G.acc = 0;
    FX.banner = null; drawWorld(ctx, G.demo); FX.silent = false;
    return;
  }
  const S = G.S;
  if (G.mode === 'guest') {
    const b = readKeys(BIND.solo); if (b !== G.lastSent || ++G.sendT > 6) { netSend({ t: 'in', b }); G.lastSent = b; G.sendT = 0; }
    fxTick();
  } else if (!G.paused || G.mode === 'host') {
    G.acc += dt; let n = 0;
    while (G.acc >= 1000 / TPS && n++ < 5) {
      G.acc -= 1000 / TPS;
      const inp = G.mode === 'local' ? [readKeys(BIND.p1), readKeys(BIND.p2)] : G.mode === 'watch' ? [aiInput(S, 0), aiInput(S, 1)] : G.mode === 'host' ? [G.paused ? 0 : readKeys(BIND.solo), G.remoteIn] : [readKeys(BIND.solo), aiInput(S, 1)];
      step(S, inp);
      for (const e of S.ev) { fxEvent(S, e); if (G.mode === 'host') G.netEv.push(e); }
      S.ev.length = 0; fxTick();
      if (G.mode === 'host' && S.t % 2 === 0) { netSend({ t: 's', s: S, e: G.netEv }); G.netEv = []; }
      if (S.phase === 'over' && !G.over) endMatch();
    }
    if (n > 5) G.acc = 0;
  }
  drawWorld(ctx, G.S); drawHUD(ctx, G.S, labels());
}
function rematch() { startFight(); }
show('title'); requestAnimationFrame(frame);
