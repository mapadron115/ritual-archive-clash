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
  // Native menu navigation/scrolling must not become held combat input.
  // Online matches keep advancing while this player's move list is open.
  if (G.over || G.paused) return;
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
function show(id) {
  for (const s of document.querySelectorAll('.screen')) s.style.display = s.id === id ? 'flex' : 'none';
  $('stage').setAttribute('data-screen',id);
}
function titleMark() {
  const s=new PixelSurface(216,76);
  s.rect(0,0,4,14,'#a7c8da');s.rect(8,0,4,14,'#536577');
  pxText(s,'RITUAL ARCHIVE',20,0,'#d4dee7',2);
  pxText(s,'CLASH',4,26,'#070f1c',7);
  pxText(s,'CLASH',0,22,'#f1e5cd',7);
  s.rect(0,73,200,2,'#a7c8da');s.rect(202,73,14,2,'#d5a567');
  return s;
}
function refreshAttractLabel() {
  const pair=G.demo.f.map(f=>CH[f.ch].name).join(' vs '),stage=PX_STAGES.find(s=>s.id===G.demo.stage).name;
  if($('attractNames').textContent!==pair)$('attractNames').textContent=pair;
  if($('attractStage').textContent!==stage)$('attractStage').textContent=stage;
}
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
function menuCanvas(surface,w=surface.w,h=surface.h) {
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.setAttribute('aria-hidden','true');
  const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(pxCanvas(surface),0,0,w,h);return canvas;
}
function selectionNames() {
  if(G.mode==='local')return ['Player 1','Player 2'];
  if(G.mode==='watch')return ['Computer 1','Computer 2'];
  if(G.mode==='host')return ['You','Guest'];
  if(G.mode==='guest')return ['Host','You'];
  return ['You','Computer'];
}
function quickControls(lab,name) {
  return `<p><b>${name}</b> &nbsp; Move <kbd>${lab.move}</kbd> Jump <kbd>${lab.U}</kbd> Guard <kbd>${lab.G}</kbd> Punch <kbd>${lab.P}</kbd> Kick <kbd>${lab.K}</kbd> Arts <kbd>${lab.A1} ${lab.A2} ${lab.A3}</kbd> Domain <kbd>${lab.DOM}</kbd></p>`;
}
function refreshSelection() {
  const names=selectionNames(),lab=labels();
  for(let i=0;i<2;i++) {
    const ch=G.pick[i],c=CH[ch],alt=i===1&&G.pick[0]===ch,preview=$('preview'+i);
    preview.style.setProperty('--ac',c.look.accent);
    preview.innerHTML=`<strong>${names[i]}</strong><h3>${c.name}</h3><p>${c.tech}</p>`;
    const s=new PixelSurface(144,132);s.rect(0,0,144,132,'#1b293b');s.rect(10,120,124,2,'#68768a');
    s.blit(pxSprite(ch,'idle',alt),0,0,1,i===1);preview.appendChild(menuCanvas(s));
    const tag=document.createElement('p');tag.textContent=c.tag;preview.appendChild(tag);
    const buttons=Array.from($('col'+i).children).filter(b=>b.className.startsWith('fighter'));
    for(let n=0;n<CH.length;n++) {
      const b=buttons[n];
      b.className='fighter'+(ch===n?' on':'');b.setAttribute('aria-pressed',String(ch===n));
    }
  }
  $('detail').innerHTML=G.pick.map((ch,i)=>`<h2>${names[i]}</h2>`+moveList(ch,lab[i])).join('');
  for(let n=0;n<PX_STAGES.length;n++) {
    const b=$('stageChoices').children[n],on=G.stage===PX_STAGES[n].id;
    b.className='stageChoice'+(on?' on':'');b.setAttribute('aria-pressed',String(on));
  }
  $('selNote').textContent=G.mode==='guest'?'The host chooses the arena and starts the fight.':PX_STAGES.find(s=>s.id===G.stage).name+' / 99-second rounds';
}
function buildSelect() {
  const online = G.mode === 'host' || G.mode === 'guest', me = G.mode === 'guest' ? 1 : 0;
  const names = selectionNames();
  for (let i = 0; i < 2; i++) {
    const col = $('col' + i); col.innerHTML = `<h2>${names[i]}</h2>`;
    CH.forEach((c, n) => {
      const b = document.createElement('button'); b.className = 'fighter' + (G.pick[i] === n ? ' on' : ''); b.style.setProperty('--ac', c.look.accent);
      b.innerHTML = `<b>${c.name}</b><span>${c.tech}</span>`;
      b.setAttribute('aria-label',c.name+' / '+c.tech+' / '+c.tag);b.setAttribute('aria-pressed',String(G.pick[i]===n));
      b.appendChild(menuCanvas(pxPortrait(n,false)));
      b.disabled = online && i !== me;
      b.onclick = () => { G.pick[i] = n; if (online) netSend({ t: 'pick', ch: n }); refreshSelection(); };
      b.onkeydown = e => {
        const delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-3,ArrowDown:3}[e.code];
        if(delta===undefined&&e.code!=='Home'&&e.code!=='End')return;
        e.preventDefault();
        const target=e.code==='Home'?0:e.code==='End'?CH.length-1:(n+delta+CH.length)%CH.length;
        Array.from(col.children).filter(b=>b.className.startsWith('fighter'))[target].focus();
      };
      col.appendChild(b);
    });
  }
  const stageChoices=$('stageChoices');stageChoices.innerHTML='';
  for(const stage of PX_STAGES) {
    const b=document.createElement('button');b.className='stageChoice'+(G.stage===stage.id?' on':'');
    b.disabled=G.mode==='guest';b.setAttribute('aria-pressed',String(G.stage===stage.id));
    b.setAttribute('aria-label',stage.name+' / '+stage.desc);
    b.appendChild(menuCanvas(pxBackdrop(0,stage.id),160,90));
    const caption=document.createElement('div');caption.innerHTML='<b>'+stage.name+'</b><span>'+stage.desc+'</span>';b.appendChild(caption);
    b.onclick=()=>{G.stage=stage.id;if(G.mode==='host')netSend({t:'stage',stage:G.stage});refreshSelection();};stageChoices.appendChild(b);
  }
  $('selBasics').innerHTML = G.mode === 'local' ? '<b>Player 1</b>' + basics(BIND.p1.lab) + '<b>Player 2</b>' + basics(BIND.p2.lab) : basics(BIND.solo.lab);
  $('quickControls').innerHTML=G.mode==='local'?quickControls(BIND.p1.lab,'P1')+quickControls(BIND.p2.lab,'P2'):G.mode==='watch'?'<p>Computer exhibition / Choose both fighters and an arena. Esc opens the move lists during the match.</p>':quickControls(BIND.solo.lab,'YOU');
  $('start').style.display = G.mode === 'guest' ? 'none' : '';
  $('start').textContent=G.mode==='watch'?'Start exhibition':'Fight';
  refreshSelection();
}
function pickMode(m) { G.mode = m; show('select'); buildSelect(); }
function startFight() {
  // Unsent host effects belong to the previous fight, never its replacement.
  G.netEv = [];
  G.S = newMatch(G.pick[0], G.pick[1], (Math.random() * 1e9) | 0); FX.parts = []; FX.contacts = []; FX.dust = []; FX.banner = null; FX.impact = null; FX.bf = null;
  G.S.stage=pxStageId(G.stage);
  // Prepare both spaces before the round, so a first Domain never builds its scenery mid-fight.
  for(const f of G.S.f)pxDomainBackdrop(CH[f.ch].dom.kind);
  AI_MEM[0] = {}; AI_MEM[1] = {}; FX.rings = []; FX.shake = 0; FX.flash = 0; FX.nope = [0, 0]; FX.stars = []; FX.puffs = []; FX.nums = []; FX.lines = []; FX.words = []; FX.silent = false; G.paused = false; G.running = true; G.over = false; G.acc = 0; G.remoteIn = 0; G.remoteTap = 0; G.lastSent = -1; clearInput();
  if (G.mode === 'host') netSend({ t: 'start', p: G.pick, stage: G.S.stage });
  show('none'); initAudio();
}
function togglePause() {
  if (G.over) return;
  G.paused = !G.paused;
  clearInput();
  if (G.paused) {
    const lab = labels(),online=G.mode==='host'||G.mode==='guest';
    $('pauseTitle').textContent=online?'Move list':'Paused: move list';
    $('pauseNote').textContent=online?'Online match continues. Your fighter receives no controls while this list is open.':'Match paused. Take your time with the move list.';
    $('pauseList').innerHTML = (G.mode === 'local' ? '' : basics(BIND.solo.lab)) + moveList(G.S.f[0].ch, lab[0]) + moveList(G.S.f[1].ch, lab[1]) + (G.mode === 'local' ? '<b>Player 1</b>' + basics(BIND.p1.lab) + '<b>Player 2</b>' + basics(BIND.p2.lab) : '');
    show('pause');$('resumeBtn').focus();
  }
  else show('none');
}
function toMenu(fromNet) { G.running = false; G.paused = false; clearInput(); if (!fromNet && (G.mode === 'host' || G.mode === 'guest')) netClose(); show('title'); }
function toSelect() { G.running = false; G.paused = false; if (G.mode === 'host') netSend({ t: 'select' }); show('select'); buildSelect(); }

// ---------- online (WebRTC through PeerJS; the host runs the fight, the guest sends buttons)
const NET = { peer: null, conn: null, session: 0 };
function netStatus(t) { $('netStatus').textContent = t; }
function netSend(m) { if (NET.conn && NET.conn.open) NET.conn.send(m); }
function netClose() {
  // Invalidate callbacks before destroy(), which can itself emit close events.
  const peer=NET.peer;NET.session++;NET.peer=NET.conn=null;
  try { if (peer) peer.destroy(); } catch (e) { }
}
function loadPeer(cb) {
  const session=NET.session,active=()=>NET.session===session;
  if (window.Peer) return cb();
  netStatus('Loading the network library…');
  const s = document.createElement('script'); s.src = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js'; s.onload = () => { if(active())cb(); }; s.onerror = () => { if(active())netStatus('Could not load the network library. Is this computer online?'); }; document.head.appendChild(s);
}
function netWire(conn, mode) {
  NET.conn = conn;
  const session=NET.session,active=()=>NET.session===session&&NET.conn===conn;
  conn.on('open', () => { if(!active())return;G.mode = mode; G.pick = [0, 1]; netSend({ t: 'pick', ch: G.pick[mode === 'guest' ? 1 : 0] }); if(mode==='host')netSend({t:'stage',stage:G.stage});show('select'); buildSelect(); });
  conn.on('data', m => {
    if(!active())return;
    // Keep the local player's focused roster/arena button attached while the
    // other player chooses. The connection already built these controls.
    if (m.t === 'pick') { G.pick[mode === 'guest' ? 0 : 1] = m.ch; if (!G.running) refreshSelection(); }
    else if (m.t === 'in') { G.remoteIn = m.b & INPUT_MASK; G.remoteTap |= m.b >>> INPUT_SHIFT; }
    else if (m.t === 'stage' && mode==='guest') { G.stage=pxStageId(m.stage);if(!G.running)refreshSelection(); }
    else if (m.t === 'start' && mode==='guest') { G.pick = m.p; G.stage=pxStageId(m.stage);startFight(); }
    else if (m.t === 'select') toSelect();
    else if (m.t === 's' && G.mode === 'guest') { G.S = m.s; for (const e of m.e) fxEvent(G.S, e); if (G.S.phase === 'over' && !G.over) endMatch(); if (G.S.phase !== 'over' && G.over) { G.over = false; show('none'); } }
  });
  conn.on('close', () => { if (active() && (G.mode === 'host' || G.mode === 'guest')) { toMenu(true); netClose(); show('online'); netStatus('The other player disconnected.'); } });
}
function hostGame() {
  netClose();
  loadPeer(() => {
    const code = Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.random() * 24 | 0]).join('');
    const peer=NET.peer=new Peer('ritual-demo-' + code),session=NET.session;
    const active=()=>NET.session===session&&NET.peer===peer;
    peer.on('open', () => { if(active())netStatus('Room code: ' + code + '  — give it to your friend. Waiting for them…'); });
    peer.on('connection', c => { if(active())netWire(c, 'host'); });
    peer.on('error', e => { if(active())netStatus('Network error: ' + e.type); });
  });
}
function joinGame() {
  const code = $('code').value.trim().toUpperCase(); if (code.length !== 4) return netStatus('Type the 4-letter room code.');
  netClose();
  loadPeer(() => {
    const peer=NET.peer=new Peer(),session=NET.session;
    const active=()=>NET.session===session&&NET.peer===peer;
    peer.on('open', () => { if(!active())return;netStatus('Connecting…'); netWire(peer.connect('ritual-demo-' + code, { reliable: true }), 'guest'); });
    peer.on('error', e => { if(active())netStatus(e.type === 'peer-unavailable' ? 'No room with that code.' : 'Network error: ' + e.type); });
  });
}

function endMatch() {
  G.over = true; clearInput(); const match=G.S,w=match.wins[0]>=2?0:1,lab=labels(),token=G.resultToken=(G.resultToken||0)+1;
  $('overTitle').textContent = pxResultRole(lab,w)+' / '+CH[match.f[w].ch].name+' wins'; $('overTitle').style.color = CH[match.f[w].ch].look.accent;
  $('overScore').textContent=pxResultRole(lab,0)+' '+match.wins[0]+' - '+match.wins[1]+' '+pxResultRole(lab,1)+' / First to 2 wins';
  $('overFighters').textContent=CH[match.f[0].ch].name+' vs '+CH[match.f[1].ch].name;
  $('overNote').textContent=G.mode==='guest'?'Waiting for the host to choose a rematch or change fighters.':'Rematch keeps these fighters and '+PX_STAGES.find(s=>s.id===pxStageId(match.stage)).name+'.';
  $('overBtns').style.display = G.mode === 'guest' ? 'none' : '';
  setTimeout(() => { if (G.resultToken===token && G.over && G.running && G.S.phase==='over') {show('over');$(G.mode==='guest'?'overTitle':'rematchBtn').focus();} }, 1400);
}

// ---------- loop
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(100, now - G.last); G.last = now;
  // If this computer cannot keep up (about 45 frames a second or fewer for three seconds), drop the costliest lighting for the rest of the visit.
  if (!FX.lite && document.visibilityState === 'visible') { if (dt > 22 && dt < 70) { if (++G.slow > 180) FX.lite = true; } else if (dt <= 18) G.slow = Math.max(0, (G.slow || 0) - 2); }
  if (!G.running || !G.S) {   // a computer match plays behind the menus
    if (!G.demo || G.demo.phase === 'over') { const a = Math.random() * CH.length | 0; G.demo = newMatch(a, (a + 1 + (Math.random() * (CH.length - 1) | 0)) % CH.length, (Math.random() * 1e9) | 0); AI_MEM[0] = {}; AI_MEM[1] = {}; }
    G.demo.stage=G.stage;refreshAttractLabel();FX.silent = true; G.acc += dt; let n = 0;
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
// ---------- boot
$('titleLogo').appendChild(menuCanvas(titleMark()));
show('title'); requestAnimationFrame(frame);
