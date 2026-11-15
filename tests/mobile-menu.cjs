// Actual mobile HTML routes and shared menu/network callbacks in the same
// memory DOM as mobile.cjs. This does not emulate browser layout or a phone.
const path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {context,html,root}=require('./mobile.cjs');
const writePNG=require('./png.cjs');
const routes={};
for(const m of html.matchAll(/<button\b[^>]*\bid="([^"]+)"[^>]*\bonclick="([^"]+)"/g))routes[m[1]]=m[2];
for(const id of ['cpuMode','onlineMode','watchMode','selectTab0','selectTab1','selectTab2','selectBack','start','hostRoom','joinRoom','onlineBack','resumeBtn','pauseSelect','pauseMenu','rematchBtn','overSelect','overMenu','touchPause','touchMute'])assert(routes[id],id+' lacks an actual HTML action');
context.menuRoutes=routes;
vm.runInContext(`
const tapMenu=id=>{const b=$(id);assert(!b.hidden&&!b.disabled,id+' unavailable');return function(){eval(menuRoutes[id]);}.call(b);};
toMenu();tapMenu('cpuMode');assert.equal(G.mode,'ai');assert.equal($('stage').attributes['data-screen'],'select');
const namesPresent=(text,ch)=>{for(const a of [...CH[ch].arts,CH[ch].dom])assert(text.includes(a.name),'missing '+a.name);};
// Every fighter is reachable on both roster pages. Picking does not replace
// controls or lose the other choice. Arena/moves is its own touch page.
for(const mode of ['ai','watch','host','guest']) {
  G.mode=mode;G.pick=[0,1];buildSelect();
  assert.equal(MOBILE.selectTab,mode==='guest'?1:0);
  for(let tab=0;tab<3;tab++) {
    tapMenu('selectTab'+tab);assert.equal(MOBILE.selectTab,tab);
    assert.equal($('selectionScroll').scrollTop,0);
    for(let i=0;i<3;i++){assert.equal($('selectPanel'+i).hidden,i!==tab);assert.equal($('selectTab'+i).attributes['aria-pressed'],String(i===tab));}
    if(tab<2) {
      const choices=$('col'+tab).children.slice(),locked=mode==='host'?tab===1:mode==='guest'?tab===0:false;
      for(let ch=0;ch<15;ch++) {
        assert.equal(choices[ch].disabled,locked);
        if(locked){G.pick[tab]=ch;refreshSelection();}else choices[ch].onclick();
        assert.equal(MOBILE.selectTab,tab);assert.equal(G.pick[tab],ch);
        assert($('selectTab'+tab).textContent.includes(CH[ch].name));
        assert.equal($('col'+tab).children[ch],choices[ch]);assert.equal(choices[ch].attributes['aria-pressed'],'true');
        namesPresent($('detail').innerHTML,ch);
        const list=moveList(ch);namesPresent(list,ch);assert(!list.includes('<table>'));assert(!list.includes('<kbd>'));
        for(const a of CH[ch].arts){assert(list.includes(a.desc));assert(list.includes(a.cost+' CE / '+(a.cd/60).toFixed(1)+'s'));}
        assert(list.includes(CH[ch].dom.desc));if(CH[ch].passive)assert(list.includes(CH[ch].passive));
      }
    } else {
      for(let n=0;n<3;n++) {
        const b=$('stageChoices').children[n];assert.equal(b.disabled,mode==='guest');
        if(mode==='guest'){G.stage=PX_STAGES[n].id;refreshSelection();}else b.onclick();
        assert($('selectTab2').textContent.includes(PX_STAGES[n].name));assert.equal(MOBILE.selectTab,2);
      }
    }
  }
  for(const text of ['PUNCH three times','KICK wears guard','Black Flash','6%','2.2','25 CE','eight seconds','20%','99 seconds','draw','Two Domains','online matches continue'])assert($('selBasics').innerHTML.includes(text),'rule missing '+text);
  assert.equal($('start').style.display,mode==='guest'?'none':'');
}
G.mode='ai';buildSelect();
for(const [width,code,from,to] of [[667,'ArrowDown',0,5],[844,'ArrowUp',0,10],[568,'ArrowDown',0,3],[568,'ArrowUp',0,12]]) {
  innerWidth=width;let prevented=false;$('col0').children[from].onkeydown({code,preventDefault(){prevented=true;}});
  assert(prevented);assert.equal(document.activeElement,$('col0').children[to]);
}
innerWidth=844;
// Real title, start, pause, resume, selection, results and rematch actions.
toMenu();tapMenu('watchMode');assert.equal(G.mode,'watch');tapMenu('selectBack');assert.equal($('stage').attributes['data-screen'],'title');
tapMenu('cpuMode');tapMenu('start');assert(G.running);assert.equal($('stage').attributes['data-screen'],'none');
const oldMute=AUDIO.mute;tapMenu('touchMute');assert.equal(AUDIO.mute,!oldMute);assert.equal($('touchMute').attributes['aria-pressed'],String(!oldMute));tapMenu('touchMute');assert.equal(AUDIO.mute,oldMute);
pointer('pointerdown','R');tapMenu('touchPause');assert(G.paused);assert.equal(input(),0);assert.equal(MOBILE.pointers.size,0);
assert.equal($('resumeBtn').textContent,'Resume');assert.equal($('pauseList').scrollTop,0);namesPresent($('pauseList').innerHTML,G.pick[0]);namesPresent($('pauseList').innerHTML,G.pick[1]);
const pausedTick=G.S.t;advance(2);assert.equal(G.S.t,pausedTick);tapMenu('resumeBtn');assert(!G.paused);
tapMenu('touchPause');tapMenu('pauseSelect');assert(!G.running);assert.equal($('stage').attributes['data-screen'],'select');
tapMenu('start');tapMenu('touchPause');tapMenu('pauseMenu');assert.equal($('stage').attributes['data-screen'],'title');
for(const destination of ['rematchBtn','overSelect','overMenu']) {
  tapMenu('cpuMode');tapMenu('start');G.S.phase='over';G.S.wins=[2,1];endMatch();
  for(const t of timeouts.splice(0))t.f();assert.equal($('stage').attributes['data-screen'],'over');
  assert.equal($('overBtns').style.display,'');assert(!$('rematchBtn').hidden);tapMenu(destination);
  assert.equal($('stage').attributes['data-screen'],destination==='rematchBtn'?'none':destination==='overSelect'?'select':'title');
  if(destination==='rematchBtn'){assert.equal(G.S.round,1);assert(!G.over);assert.equal(input(),0);}
  toMenu();
}
// Room-code entry: actual key listener consumes typing, accepts Enter, and
// hands the normalized room to the real join path. Fake Peer avoids internet.
const peers=[];
class MenuPeer {
  constructor(id){this.id=id;this.handlers={};this.destroyed=false;peers.push(this);}
  on(k,f){this.handlers[k]=f;}
  destroy(){this.destroyed=true;}
  connect(id){this.remote=id;return {open:true,sent:[],handlers:{},send(m){this.sent.push(m);},on(k,f){this.handlers[k]=f;}};}
}
globalThis.Peer=window.Peer=MenuPeer;
tapMenu('onlineMode');assert.equal($('stage').attributes['data-screen'],'online');
$('code').value='a';tapMenu('joinRoom');assert($('netStatus').textContent.includes('4-letter'));assert.equal(peers.length,0);
let stopped=0,prevented=0;const muteBefore=AUDIO.mute;
$('code').dispatch('keydown',{key:'m',stopPropagation(){stopped++;}});$('code').dispatch('keyup',{stopPropagation(){stopped++;}});
assert.equal(stopped,2);assert.equal(AUDIO.mute,muteBefore);
$('code').value=' amDe ';$('code').dispatch('keydown',{key:'Enter',stopPropagation(){stopped++;},preventDefault(){prevented++;}});
assert.equal(stopped,3);assert.equal(prevented,1);assert.equal(peers.length,1);
const joining=peers.at(-1);joining.handlers.open();assert.equal(joining.remote,'ritual-demo-AMDE');
const guestConn=NET.conn;guestConn.handlers.open();assert.equal(G.mode,'guest');assert.equal(MOBILE.selectTab,1);
// Incoming choices update labels without returning the guest to another tab.
tapMenu('selectTab2');guestConn.handlers.data({t:'pick',ch:7});guestConn.handlers.data({t:'stage',stage:'gallery'});
assert.equal(MOBILE.selectTab,2);assert($('selectTab0').textContent.includes(CH[7].name));assert($('selectTab2').textContent.includes('Rainlit Gallery'));
guestConn.handlers.data({t:'start',p:[7,2],stage:'gallery'});assert(G.running);
tapMenu('touchPause');assert.equal($('resumeBtn').textContent,'Close list');assert($('pauseNote').textContent.includes('continues'));
tapMenu('resumeBtn');assert(!G.paused);
G.S.phase='over';G.S.wins=[2,0];endMatch();for(const t of timeouts.splice(0))t.f();
assert.equal($('stage').attributes['data-screen'],'over');assert.equal($('overBtns').style.display,'');assert($('rematchBtn').hidden);
tapMenu('overSelect');assert(guestConn.sent.some(m=>m.t==='select'));assert.equal(MOBILE.selectTab,1);
startFight();G.S.phase='over';G.S.wins=[2,0];endMatch();for(const t of timeouts.splice(0))t.f();tapMenu('overMenu');assert(joining.destroyed);assert.equal($('stage').attributes['data-screen'],'title');
tapMenu('onlineMode');tapMenu('hostRoom');const hosting=peers.at(-1);assert(/^ritual-demo-[A-Z]{4}$/.test(hosting.id));
hosting.handlers.open();assert($('netStatus').textContent.includes('Room code: '));
tapMenu('onlineBack');assert(hosting.destroyed);assert.equal($('stage').attributes['data-screen'],'title');
console.log('PASS mobile menus: 19 actual HTML actions, 120 roster choices, 12 arena choices, all 60 full move descriptions/costs/passives, rules, pause/resume/returns, all result actions, guest exits, room-code typing/Enter, host/join callbacks and remote selection labels');
`,context);

// Explicit layout models for review: bitmap text is an approximation of the
// CSS monospace font. No CSS engine, native PointerEvents or phone used.
vm.runInContext(`
globalThis.menuPreview=(w,h,kind,before=false,safe={left:0,right:0,top:0,bottom:0})=>{
  const s=new PixelSurface(w,h);s.rect(0,0,w,h,'#101927');
  const x=safe.left+10,y=safe.top+10,cw=w-safe.left-safe.right-20,ch=h-safe.top-safe.bottom-20;
  const text=(t,tx,ty,max=cw,col=PX_LIGHT)=>{const lines=pxWrap(t,max);for(let i=0;i<lines.length;i++)pxText(s,lines[i],tx,ty+i*11,col);return lines.length*11;};
  const box=(t,bx,by,bw,bh=48,on=false)=>{s.rect(bx,by,bw,bh,on?'#34495f':'#263346');s.rect(bx,by,bw,2,on?'#b5dce5':'#68768a');s.rect(bx,by,2,bh,'#68768a');const lines=t.split('\\n').flatMap(v=>pxWrap(v,bw-10));for(let i=0;i<lines.length;i++)pxText(s,lines[i],bx+5,by+(bh-lines.length*11)/2+i*11,PX_LIGHT);};
  if(h>w){text('TURN YOUR PHONE SIDEWAYS',x,Math.floor(h/2),cw);return s;}
  if(kind==='select') {
    text('CHOOSE YOUR FIGHTERS',x,y);let top=y+27;
    if(!before){for(let i=0;i<3;i++)box(i<2?['YOU','COMPUTER'][i]+'\\n'+CH[i].name:'ARENA / MOVES\\nARCHIVE COURTYARD',x+i*(cw+6)/3,top,(cw-12)/3,48,i===0);top+=56;}
    const columns=before?3:5,groups=before?2:1,gw=before?(cw-12)/2:cw;
    const bottom=y+ch-56;
    for(let g=0;g<groups;g++) {
      const gx=x+g*(gw+12);let gy=top;
      if(before){text(g?'COMPUTER':'YOU',gx,gy,gw);gy+=24;}
      for(let n=0;n<15;n++) {
        const bx=gx+(n%columns)*(gw+6)/columns,by=gy+Math.floor(n/columns)*66,bw=(gw-6*(columns-1))/columns;
        if(by+60>bottom)continue;
        box(CH[n].name+'\\n'+CH[n].tech,bx,by,bw,60,n===g);
      }
    }
    box('BACK',x,y+ch-48,70);text('ARCHIVE COURTYARD / 99-SECOND ROUNDS',x+78,y+ch-30,cw-190,'#c1cbd7');box('FIGHT',x+cw-96,y+ch-48,96);
  } else if(kind==='pause') {
    text('PAUSED: MOVE LIST',x,y);text('MATCH PAUSED. TAKE YOUR TIME WITH THE MOVE LIST.',x,y+24);
    for(let i=0;i<3;i++)box(['RESUME','CHANGE FIGHTERS','MAIN MENU'][i],x+i*(cw+6)/3,y+48,(cw-12)/3);
    let top=y+108;top+=text('HOLD LEFT / RIGHT TO MOVE. JUMP TO JUMP, GUARD TO DEFEND. TAP PUNCH THREE TIMES FOR A COMBO; KICK WEARS GUARD DOWN.',x,top)+10;
    top+=text('ISOLDE VARN / LIMITLESS',x,top,cw,'#59c8ff')+6;
    for(const a of CH[0].arts){if(top+45>y+ch-12)break;text(a.name.toUpperCase()+' / '+a.cost+' CE / '+(a.cd/60).toFixed(1)+'s',x,top);top+=15;top+=text(a.desc.toUpperCase(),x,top)+12;}
  } else {
    let top=y+Math.max(0,(ch-228)/2);
    for(const t of ['MATCH COMPLETE',kind==='guest'?'FOE / KARASU DAIN WINS':'YOU / ISOLDE VARN WINS','ISOLDE VARN VS KARASU DAIN',kind==='guest'?'YOU 0 - 2 FOE / FIRST TO 2 WINS':'YOU 2 - 1 CPU / FIRST TO 2 WINS',kind==='guest'?'WAITING FOR THE HOST TO REMATCH. YOU CAN CHANGE FIGHTERS OR RETURN TO THE MAIN MENU.':'REMATCH KEEPS THESE FIGHTERS AND ARCHIVE COURTYARD.'])top+=text(t,x,top)+12;
    const items=kind==='guest'?['CHANGE FIGHTERS','MAIN MENU']:['REMATCH','CHANGE FIGHTERS','MAIN MENU'];for(let i=0;i<items.length;i++)box(items[i],x+i*(cw+6)/items.length,top,(cw-6*(items.length-1))/items.length);
  }
  pxText(s,'LAYOUT MODEL / '+(before?'V107':'V108'),x,h-safe.bottom-9,'#68768a');return s;
};
`,context);
const output=process.argv.slice(2).find(a=>a.startsWith('--out='))?.slice(6);
if(output) {
  const beforeCSS=require('node:child_process').execFileSync('git',['show','d7c4da4:mobile/mobile.css'],{cwd:root,encoding:'utf8'});
  assert(beforeCSS.includes('.matchup { display: grid; grid-template-columns: 1fr 1fr;'));
  assert(beforeCSS.includes('.col { display: grid; grid-template-columns: repeat(3, 1fr);'));
  for(const [w,h] of [[667,375],[844,390]]) {
    for(const before of [true,false])writePNG(path.join(output,'v108-'+(before?'before':'after')+'-select-'+w+'x'+h+'.png'),context.menuPreview(w,h,'select',before));
    for(const kind of ['pause','results','guest'])writePNG(path.join(output,'v108-after-'+kind+'-'+w+'x'+h+'.png'),context.menuPreview(w,h,kind));
  }
  writePNG(path.join(output,'v108-after-select-844x390-safe.png'),context.menuPreview(844,390,'select',false,{left:44,right:44,top:0,bottom:21}));
  writePNG(path.join(output,'v108-after-390x844.png'),context.menuPreview(390,844,'select'));
}
