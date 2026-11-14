'use strict';
// Menus, input, the main loop, sound and online play.
const $ = id => document.getElementById(id);
const cv = $('cv'), ctx = cv.getContext('2d');
const G = { S: null, mode: 'ai', pick: [0, 1], stage: 'courtyard', paused: false, running: false, keys: {}, taps: {}, acc: 0, last: 0, netEv: [], remoteIn: 0, remoteTap: 0, guestPick: -1, sendT: 0, slow: 0 };

const BIND = {
  solo: { L: ['KeyA'], R: ['KeyD'], U: ['KeyW'], G: ['KeyS'], P: ['KeyJ'], K: ['KeyK'], A1: ['KeyU'], A2: ['KeyI'], A3: ['KeyO'], DOM: ['KeyL'],
    lab: { move: 'A / D', U: 'W', G: 'S', P: 'J', K: 'K', A1: 'U', A2: 'I', A3: 'O', DOM: 'L' } },
  p1: { L: ['KeyA'], R: ['KeyD'], U: ['KeyW'], G: ['KeyS'], P: ['KeyF'], K: ['KeyG'], A1: ['KeyR'], A2: ['KeyT'], A3: ['KeyY'], DOM: ['KeyH'],
    lab: { move: 'A / D', U: 'W', G: 'S', P: 'F', K: 'G', A1: 'R', A2: 'T', A3: 'Y', DOM: 'H' } },
  p2: { L: ['ArrowLeft'], R: ['ArrowRight'], U: ['ArrowUp'], G: ['ArrowDown'], P: ['Comma', 'Numpad1'], K: ['Period', 'Numpad2'], A1: ['KeyI', 'Numpad4'], A2: ['KeyO', 'Numpad5'], A3: ['KeyP', 'Numpad6'], DOM: ['Slash', 'Numpad3'],
    lab: { move: '← / →', U: '↑', G: '↓', P: ',', K: '.', A1: 'I', A2: 'O', A3: 'P', DOM: '/' } },
};
function clearInput() { G.keys = {}; G.taps = {}; }
function readKeys(b) {
  let held = 0, pressed = 0;
  for (const k in BTN) for (const code of b[k]) {
    if (G.keys[code]) held |= BTN[k];
    if (G.taps[code]) { pressed |= BTN[k]; delete G.taps[code]; }
  }
  return held | (pressed << INPUT_SHIFT);
}
function readRemote() { const b = G.remoteIn | (G.remoteTap << INPUT_SHIFT); G.remoteTap = 0; return b; }
addEventListener('keydown', e => {
  if (e.code === 'Escape' && G.running) { if (!e.repeat) togglePause(); return; }
  if (e.code === 'KeyM') { if (!e.repeat) setMute(!AUDIO.mute); return; }
  if (!e.repeat && !G.keys[e.code] && G.running && !G.paused) G.taps[e.code] = true;
  G.keys[e.code] = true; if (G.running && !e.ctrlKey && !e.metaKey && e.code !== 'F5' && e.code !== 'F12') e.preventDefault();
  initAudio();
});
addEventListener('keyup', e => { G.keys[e.code] = false; });
addEventListener('blur', clearInput);

// ---------- sound (all synthesized)
const AUDIO = { ctx: null, mute: false, master: null, bus: null, noise: null, voices: 0, recent: {} };
function initAudio() {
  try {
    if (!AUDIO.ctx) {
      const a = new (window.AudioContext || window.webkitAudioContext)();
      const master=a.createGain(),bus=a.createDynamicsCompressor();
      master.gain.value=AUDIO.mute?0:.65;
      bus.threshold.value=-12;bus.knee.value=12;bus.ratio.value=6;bus.attack.value=.003;bus.release.value=.12;
      bus.connect(master);master.connect(a.destination);
      AUDIO.ctx=a;AUDIO.master=master;AUDIO.bus=bus;
    }
    if(AUDIO.ctx.state==='suspended') {const p=AUDIO.ctx.resume();if(p&&p.catch)p.catch(()=>{});}
  } catch (e) { /* Sound remains optional on browsers without Web Audio. */ }
}
function setMute(mute) {
  AUDIO.mute=mute;
  if(AUDIO.master) {const p=AUDIO.master.gain,t=AUDIO.ctx.currentTime;p.cancelScheduledValues(t);p.setTargetAtTime(mute?0:.65,t,.008);}
}
function soundVoice(source,dur,vol,filter) {
  const a=AUDIO.ctx;if(!a||AUDIO.mute||AUDIO.voices>=48)return false;
  const g=a.createGain(),t=a.currentTime;vol=clamp(vol,0,.55);dur=clamp(dur,.012,1.2);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.002);
  g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  if(filter){source.connect(filter);filter.connect(g);}else source.connect(g);
  g.connect(AUDIO.bus);AUDIO.voices++;
  source.onended=()=>{source.disconnect();if(filter)filter.disconnect();g.disconnect();AUDIO.voices--;};
  source.start(t);source.stop(t+dur+.005);return true;
}
function tone(f0, f1, dur, type, vol) {
  const a=AUDIO.ctx;if(!a||AUDIO.mute||AUDIO.voices>=48)return;
  const o=a.createOscillator(),t=a.currentTime;o.type=type||'sine';
  o.frequency.setValueAtTime(Math.max(20,f0),t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  soundVoice(o,dur,vol??.15);
}
function noise(dur, vol, freq) {
  const a=AUDIO.ctx;if(!a||AUDIO.mute||AUDIO.voices>=48)return;
  if(!AUDIO.noise) {
    AUDIO.noise=a.createBuffer(1,Math.ceil(a.sampleRate*1.25),a.sampleRate);
    const data=AUDIO.noise.getChannelData(0);for(let n=0;n<data.length;n++)data[n]=Math.random()*2-1;
  }
  const s=a.createBufferSource(),fl=a.createBiquadFilter();s.buffer=AUDIO.noise;
  fl.type='lowpass';fl.frequency.value=freq||2000;fl.Q.value=.65;soundVoice(s,dur,vol??.2,fl);
}
function sfx(e) {
  if(!AUDIO.ctx||AUDIO.mute)return;
  const now=AUDIO.ctx.currentTime,gap=({hit:.018,block:.025,rain:.045,slash:.025,whoosh:.025})[e.k]||0;
  if(gap && now-(AUDIO.recent[e.k]??-Infinity)<gap)return;
  AUDIO.recent[e.k]=now;
  switch (e.k) {
    case 'hit': {const w=clamp((e.a-25)/85,0,1);noise(.028+w*.025,.18+w*.08,2400+w*900);tone(155-w*45,48-w*17,.085+w*.095,'sine',.19+w*.12);tone(330,95,.035+w*.025,'triangle',.055);break;}
    case 'blackflash': noise(.09,.3,7000);noise(.36,.24,540);tone(105,28,.46,'sine',.38);tone(1900,120,.09,'sawtooth',.10);tone(62,32,.42,'triangle',.12);break;
    case 'block': noise(.024,.13,4600);tone(1050,780,.065,'triangle',.12);tone(1575,1170,.035,'sine',.055);break;
    case 'break': noise(.16,.24,3600);tone(740,120,.19,'triangle',.18);tone(130,38,.22,'sine',.23);break;
    case 'whoosh': noise(.065,.055,1600);break;
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
    case 'land': noise(.035,.045,650);tone(82,48,.045,'sine',.04);break;
    case 'thud': noise(.085,.16,700);tone(100,36,.14,'sine',.20);break;
    case 'wall': noise(.12,.19,1100);tone(125,32,.19,'sine',.24);break;
    case 'ko': tone(400, 40, .9, 'sawtooth', .2); noise(.5, .3, 900); break;
    case 'round': tone(440, 440, .15, 'triangle', .12); break;
    case 'fight': tone(660, 880, .25, 'triangle', .16); break;
    case 'domain': tone(60, 240, 1, 'sawtooth', .22); tone(90, 360, 1, 'sine', .2); break;
    case 'clash': noise(.6, .4, 3000); tone(900, 50, .7, 'square', .15); break;
    case 'nope': tone(140, 110, .08, 'square', .06); break;
    case 'word': tone(180, 90, .35, 'sawtooth', .2); tone(360, 200, .3, 'square', .08); break;
    case 'counter': tone(900, 1800, .15, 'triangle', .18); noise(.1, .2, 6000); break;
    case 'stop': tone(1200, 80, .5, 'sine', .2); break;
    case 'dash': case 'cuts': noise(.08, .16, 7000); tone(2000, 600, .08, 'sawtooth', .05); break;
  }
}

// ---------- menus
function show(id) { for (const s of document.querySelectorAll('.screen')) s.style.display = s.id === id ? 'flex' : 'none'; }
function moveList(ch, lab) {
  const c = CH[ch], k = n => lab ? `<kbd>${lab[n]}</kbd>` : '';
  let h = `<h3 style="color:${c.look.accent}">${c.tech} <span>${c.name} · ${c.tag}${c.ip ? ' · from ' + c.ip : ''}</span></h3>${c.passive ? '<p>' + c.passive + '.</p>' : ''}<table>`;
  c.arts.forEach((a, n) => { h += `<tr><td>${k('A' + (n + 1))}</td><td><b>${a.name}</b></td><td>${a.cost} CE · ${(a.cd / 60).toFixed(1)}s</td><td>${a.desc}</td></tr>`; });
  h += `<tr><td>${k('DOM')}</td><td><b>${c.dom.name}</b></td><td>${c.dom.maximum ? 'Maximum' : 'Domain'}</td><td>${c.dom.desc}. Once a round, when the gauge is full or you are under 30% health</td></tr></table>`;
  return h;
}
function basics(lab) { return `<p class="basics">Move <kbd>${lab.move}</kbd> Jump <kbd>${lab.U}</kbd> Guard <kbd>${lab.G}</kbd> (hold; faces the foe) Punch <kbd>${lab.P}</kbd> (press 3 times for a combo) Kick <kbd>${lab.K}</kbd> (wears a guard down) · Pause <kbd>Esc</kbd> · Mute <kbd>M</kbd><br><b style="color:#ff3348">Black Flash</b>: any punch or kick that lands has a small chance (6%) to strike for 2.2 times the damage, launch the foe and give 25 CE. It puts you in the Zone for 8 seconds, where the chance is 20%.</p>`; }
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
      b.innerHTML = `<b>${c.tech}</b><span>${c.name}</span>`;
      b.disabled = online && i !== me;
      b.onmouseenter = () => { $('detail').innerHTML = moveList(n, labels()[i] || BIND.solo.lab); };
      b.onclick = () => { G.pick[i] = n; if (online) netSend({ t: 'pick', ch: n }); buildSelect(); $('detail').innerHTML = moveList(n, labels()[i] || BIND.solo.lab); };
      col.appendChild(b);
    });
  }
  const lab = labels();
  const stageChoices=$('stageChoices');stageChoices.innerHTML='';
  for(const stage of PX_STAGES) {
    const b=document.createElement('button');b.className='stageChoice'+(G.stage===stage.id?' on':'');
    b.disabled=G.mode==='guest';b.setAttribute('aria-pressed',String(G.stage===stage.id));
    const thumb=document.createElement('canvas');thumb.width=160;thumb.height=90;thumb.setAttribute('aria-hidden','true');
    thumb.getContext('2d').imageSmoothingEnabled=false;thumb.getContext('2d').drawImage(pxCanvas(pxBackdrop(0,stage.id)),0,0,160,90);
    b.innerHTML='<b>'+stage.name+'</b><span>'+stage.desc+'</span>';b.appendChild(thumb);
    b.onclick=()=>{G.stage=stage.id;if(G.mode==='host')netSend({t:'stage',stage:G.stage});buildSelect();};stageChoices.appendChild(b);
  }
  $('detail').innerHTML = moveList(G.pick[me], lab[me] || BIND.solo.lab);
  $('selBasics').innerHTML = G.mode === 'local' ? '<b>Player 1</b>' + basics(BIND.p1.lab) + '<b>Player 2</b>' + basics(BIND.p2.lab) : basics(BIND.solo.lab);
  $('start').style.display = G.mode === 'guest' ? 'none' : '';
  $('selNote').textContent = G.mode === 'guest' ? 'The host selects the stage and starts the fight.' : '';
}
function pickMode(m) { G.mode = m; show('select'); buildSelect(); }
function startFight() {
  G.S = newMatch(G.pick[0], G.pick[1], (Math.random() * 1e9) | 0); FX.parts = []; FX.contacts = []; FX.banner = null; FX.impact = null; FX.bf = null;
  G.S.stage=pxStageId(G.stage);
  AI_MEM[0] = {}; AI_MEM[1] = {}; FX.rings = []; FX.shake = 0; FX.flash = 0; FX.nope = [0, 0]; FX.stars = []; FX.puffs = []; FX.nums = []; FX.lines = []; FX.words = []; FX.silent = false; G.paused = false; G.running = true; G.over = false; G.acc = 0; G.remoteIn = 0; G.remoteTap = 0; G.lastSent = -1; clearInput();
  if (G.mode === 'host') netSend({ t: 'start', p: G.pick, stage: G.S.stage });
  show('none'); initAudio();
}
function togglePause() {
  if (G.over) return;
  G.paused = !G.paused;
  clearInput();
  if (G.paused) { const lab = labels(); $('pauseList').innerHTML = (G.mode === 'local' ? '' : basics(BIND.solo.lab)) + moveList(G.S.f[0].ch, lab[0]) + moveList(G.S.f[1].ch, lab[1]) + (G.mode === 'local' ? '<b>Player 1</b>' + basics(BIND.p1.lab) + '<b>Player 2</b>' + basics(BIND.p2.lab) : ''); show('pause'); }
  else show('none');
}
function toMenu(fromNet) { G.running = false; G.paused = false; clearInput(); if (!fromNet && (G.mode === 'host' || G.mode === 'guest')) netClose(); show('title'); }
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
  conn.on('open', () => { G.mode = mode; G.pick = [0, 1]; netSend({ t: 'pick', ch: G.pick[mode === 'guest' ? 1 : 0] }); if(mode==='host')netSend({t:'stage',stage:G.stage});show('select'); buildSelect(); });
  conn.on('data', m => {
    if (m.t === 'pick') { G.pick[mode === 'guest' ? 0 : 1] = m.ch; if (!G.running) buildSelect(); }
    else if (m.t === 'in') { G.remoteIn = m.b & INPUT_MASK; G.remoteTap |= m.b >>> INPUT_SHIFT; }
    else if (m.t === 'stage' && mode==='guest') { G.stage=pxStageId(m.stage);if(!G.running)buildSelect(); }
    else if (m.t === 'start' && mode==='guest') { G.pick = m.p; G.stage=pxStageId(m.stage);startFight(); }
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
  // If this computer cannot keep up (about 45 frames a second or fewer for three seconds), drop the costliest lighting for the rest of the visit.
  if (!FX.lite && document.visibilityState === 'visible') { if (dt > 22 && dt < 70) { if (++G.slow > 180) FX.lite = true; } else if (dt <= 18) G.slow = Math.max(0, (G.slow || 0) - 2); }
  if (!G.running || !G.S) {   // a computer match plays behind the menus
    if (!G.demo || G.demo.phase === 'over') { const a = Math.random() * CH.length | 0; G.demo = newMatch(a, (a + 1 + (Math.random() * (CH.length - 1) | 0)) % CH.length, (Math.random() * 1e9) | 0); AI_MEM[0] = {}; AI_MEM[1] = {}; }
    G.demo.stage=G.stage;FX.silent = true; G.acc += dt; let n = 0;
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
      const inp = G.mode === 'local' ? [readKeys(BIND.p1), readKeys(BIND.p2)] : G.mode === 'watch' ? [aiInput(S, 0), aiInput(S, 1)] : G.mode === 'host' ? [G.paused ? 0 : readKeys(BIND.solo), readRemote()] : [readKeys(BIND.solo), aiInput(S, 1)];
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
