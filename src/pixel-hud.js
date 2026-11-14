'use strict';
const PX_PORTRAITS=new Map();
function pxPortrait(ch,alt) {
  const key=ch+':'+alt;if(PX_PORTRAITS.has(key))return PX_PORTRAITS.get(key);
  const s=new PixelSurface(36,36),kit=PX_KITS[ch];s.rect(0,0,36,36,'#263346');
  const head=PX_IDLES[ch].h;
  s.poly([[0,0],[36,0],[36,10],[0,35]],kit.top[0]);s.blit(pxSprite(ch,'idle',alt),16-PX_OX-head[0],13-PX_OY-head[1]*(kit.height||1));
  PX_PORTRAITS.set(key,s);return s;
}
function pxWrap(text,width) {
  const lines=[];let line='';
  for(let word of String(text).toUpperCase().split(/\s+/)) {
    if(line && pxTextWidth(line+' '+word)>width){lines.push(line);line='';}
    // Preserve every letter, including words wider than one line.
    while(pxTextWidth(word)>width && word.length>1) {
      let cut=word.length-1;while(cut>1&&pxTextWidth(word.slice(0,cut))>width)cut--;
      lines.push(word.slice(0,cut));word=word.slice(cut);
    }
    if(line && pxTextWidth(line+' '+word)>width){lines.push(line);line=word;}else line+=(line?' ':'')+word;
  }
  if(line)lines.push(line);
  return lines;
}
function pxPanel(s,x,y,w,h,base='#263346',edge='#68768a') {
  s.rect(x-2,y-2,w+4,h+4,PX_INK);s.rect(x,y,w,h,base);s.rect(x,y,w,1,edge);s.rect(x,y,1,h,edge);
}
function pxResultRole(labels,i) {
  if(!labels[0]&&!labels[1]||labels[0]&&labels[1])return 'P'+(i+1);
  return labels[i]?'YOU':labels.other==='Computer'?'CPU':'FOE';
}
// Persistent state-derived identification: the opening flash also belongs to
// Rewind, so an event alone must never imply that time is still stopped.
function pxTimeStopHUD(s,S) {
  if(S.phase!=='fight'||!(S.stop&&S.stop.t>0)||(S.stop.o!==0&&S.stop.o!==1))return;
  pxPanel(s,263,63,114,11,'#e5cc8f',PX_LIGHT);
  s.rect(270,65,3,7,PX_INK);s.rect(276,65,3,7,PX_INK);
  pxText(s,'P'+(S.stop.o+1)+' TIME STOP',284,65,PX_INK);
}
// Keep guard beside its fighter's other meters, above the world and control
// hints. The old foot strip crossed the bottom cards and had no label.
function pxGuardHUD(s,f,x) {
  // A break restores strength immediately, before its stun ends. Read the
  // serialized recovery state so even a guest's first snapshot explains why
  // holding guard cannot protect them yet. Block stun still allows blocking.
  const locked=f.st==='hit'||f.st==='stun'||f.st==='down';
  const low=f.guardHp<35,col=locked?'#ecd3a0':low?'#f1ad91':'#b5dce5';
  if(locked)s.rect(x-2,53,84,10,PX_INK);
  pxText(s,locked?'GUARD LOCKED':low?'GUARD LOW':'GUARD '+Math.ceil(clamp(f.guardHp,0,100))+'%',x,55,col);
  pxPanel(s,x,65,80,6,'#263346',locked?col:low?'#f1ad91':'#68768a');
  const w=Math.round(80*clamp(f.guardHp/100,0,1));
  s.rect(x,65,w,6,locked?'#746757':col);s.rect(x,65,w,2,locked?'#ab9673':PX_LIGHT);
}
// These are existing cast prerequisites, not a promise that recovery has ended
// or that a cast will hit. Never call a mutating art/recast handler from drawing.
function pxArtCardState(S,f,n) {
  const a=CH[f.ch].arts[n],o=S.f[1-f.i];
  const garden=S.dom&&S.dom.k==='garden'&&S.dom.o===f.i&&!S.freeze;
  const swap=a.id==='stone'&&free(f)&&S.proj.some(p=>p.k==='stone'&&p.o===f.i);
  const cost=garden||swap?0:a.cost;
  const status=swap?'SWAP STONE':f.cd[n]>0?'WAIT '+(Math.ceil(f.cd[n]/6)/10).toFixed(1)+'S':
    f.ce<cost?'NEED '+Math.ceil(cost-f.ce)+' CE':
    a.hp&&f.hp<=a.hp+1?'LOW HP':
    ART[a.id+'_can']&&!ART[a.id+'_can'](S,f,o)?
      ({hairpin:'NEED NAIL',resonance:'HIT FIRST',contract:'NEED GUM',slingshot:'NEED GUM',rewind:'RECORDING'}[a.id]||'NEED SETUP'):
    f.y<GROUND&&!a.air?'LAND FIRST':garden?'FREE CE':'CE READY';
  return {cost,status,ready:status==='CE READY'||status==='FREE CE'||status==='SWAP STONE'};
}
function pxHUDSurface(S,labels,F=FX) {
  const s=new PixelSurface(640,360);
  for(let i=0;i<2;i++) {
    const f=S.f[i],c=CH[f.ch],kit=PX_KITS[f.ch],ac=kit.accent,left=i===0,x=left?52:373,bw=215,lab=labels[i],alt=i===1&&S.f[0].ch===f.ch;
    pxText(s,c.name,x,6,PX_LIGHT);pxText(s,c.tech,x+bw-pxTextWidth(c.tech),15,ac);
    pxPanel(s,x,25,bw,12,'#343748','#8b7d80');
    const fill=(fraction,col,y,h,w=bw,xx=x)=>{const len=Math.round(w*clamp(fraction,0,1));s.rect(left?xx+w-len:xx,y,len,h,col);};
    fill(f.ghost/maxHp(f),'#c4756d',25,12);fill(f.hp/maxHp(f),f.hp<=maxHp(f)*DOM_HP?'#e6b26d':'#87bc94',25,12);
    fill(f.hp/maxHp(f),'#b8d4ad',25,2);s.rect(left?x+bw-bw*DOM_HP:x+bw*DOM_HP,25,1,12,PX_INK);
    const cx=left?x+bw-113:x;pxPanel(s,cx,44,113,5,'#343748','#596679');fill(f.ce/MAXCE,ac,44,5,113,cx);
    const ce='CE '+Math.floor(f.ce)+'/'+MAXCE;pxText(s,ce,left?cx-pxTextWidth(ce)-6:cx+120,43,ac);
    for(let n=0;n<2;n++){const rx=left?x+6+n*14:x+bw-6-n*14;s.poly([[rx,42],[rx+4,46],[rx,50],[rx-4,46]],S.wins[i]>n?'#edcf8d':'#4b5166',PX_INK);}
    const px=left?10:594;pxPanel(s,px,9,36,36,'#263346',ac);s.blit(pxPortrait(f.ch,alt),px,9,1,!left);s.rect(px,44,36,1,ac);
    let sy=55;
    if(c.res){pxText(s,c.res.name+' '+Math.floor(f.res)+'/'+c.res.max,x,sy,PX_LIGHT);sy+=10;}
    if(f.nails>0||f.gum>0){pxText(s,f.nails>0?'NAILS '+f.nails:'STUCK '+Math.ceil(f.gum/60)+'S',x,sy,'#eda08e');sy+=10;}
    if(f.zone>0){pxText(s,'IN THE ZONE '+Math.ceil(f.zone/60)+'S',x,sy,'#ee8a99');s.rect(x,sy+9,90,3,PX_INK);s.rect(x,sy+9,90*f.zone/BF_ZONE_TICKS,2,'#ed5266');}
    if(f.st!=='ko')pxGuardHUD(s,f,x+121);
    // Actor tags stay tied to simulation coordinates; hitboxes are untouched.
    if(f.st!=='ko') {
      const tag=lab?(labels[0]&&labels[1]?'P'+(i+1):'YOU'):(labels.other==='Computer'?'CPU':'FOE');
      const {x:tx,y:ty}=pxActorAnchor(f),tw=pxTextWidth(tag);
      s.rect(tx-tw/2-3,ty-2,tw+6,11,PX_INK);pxText(s,tag,tx-tw/2,ty,left?'#8ecddf':'#efa394');s.poly([[tx-3,ty+9],[tx+3,ty+9],[tx,ty+12]],left?'#8ecddf':'#efa394');
    }
    const cardX=left?14:331,cy=319,cardH=39;
    for(let n=0;n<4;n++) {
      const xx=cardX+n*72,dom=n===3,cw=dom?83:67,a=dom?c.dom:c.arts[n],art=dom?null:pxArtCardState(S,f,n),ready=dom?domReady(f):art.ready,used=dom&&f.domUsed;
      pxPanel(s,xx,cy,cw,cardH,dom&&ready?ac:ready?'#293a50':'#202c3d',ready?ac:'#475367');
      if(F.nope&&F.nope[i]>0&&!ready){s.rect(xx,cy,cw,1,'#e99588');s.rect(xx,cy+cardH-1,cw,1,'#e99588');}
      const ink=dom&&ready?PX_INK:ready?PX_LIGHT:'#95a0af',key=lab?lab[dom?'DOM':'A'+(n+1)]:null;
      if(key){s.rect(xx+3,cy+21,10,9,PX_INK);pxText(s,key,xx+8-pxTextWidth(key)/2,cy+22,ready?PX_LIGHT:'#95a0af');}
      pxWrap(a.name,cw-8).forEach((line,j)=>pxText(s,line,xx+4,cy+3+j*8,ink));
      const type=dom?(a.maximum?'MAXIMUM':'DOMAIN'):null;
      const footer=dom?type+(used||ready?'':' '+Math.floor(clamp(f.gauge/GAUGE_MAX,0,1)*100)+'%'):art.cost+' CE';
      pxText(s,footer,xx+(key?17:4),cy+22,dom&&ready?PX_INK:ready?ac:'#b1bccb');
      const status=dom?(used?'USED 1/1':ready?(f.hp<=maxHp(f)*DOM_HP?'HP READY':'FULL READY'):'OR 30% HP'):
        art.status;
      pxText(s,status,xx+4,cy+30,dom&&ready?PX_INK:ready?PX_LIGHT:'#c4cbd4');
      const ratio=dom?(used?0:f.gauge/GAUGE_MAX):1-f.cd[n]/a.cd;s.rect(xx+3,cy+cardH-1,cw-6,1,PX_INK);s.rect(xx+3,cy+cardH-1,(cw-6)*clamp(ratio,0,1),1,ac);
    }
    const hint=lab?'MOVE '+lab.move.replace(/ /g,'')+'  JUMP '+lab.U+'  GUARD '+lab.G+'  PUNCH '+lab.P+'  KICK '+lab.K:(labels.other||'Computer');
    pxOutlinedText(s,hint,cardX,309,'#e2d6bb');
  }
  // Keep the move-list shortcut visible after selection closes. This promises
  // only a move list: online fights keep advancing when it is opened.
  if(S.phase!=='over') {
    pxPanel(s,273,3,94,11,'#243448','#b1a08a');
    s.rect(275,4,21,9,'#ecd3a0');pxText(s,'ESC',277,5,PX_INK);
    pxText(s,'MOVE LIST',301,5,PX_LIGHT);
  }
  pxPanel(s,299,19,42,29,'#243448','#b1a08a');const timer=String(Math.ceil(S.timer/60));pxText(s,timer,320-pxTextWidth(timer,2)/2,25,'#ecd3a0',2);
  const round='ROUND '+S.round;pxText(s,round,320-pxTextWidth(round)/2,53,PX_LIGHT);
  pxTimeStopHUD(s,S);
  if(S.dom&&!S.freeze){const name=CH[S.f[S.dom.o].ch].dom.name;pxOutlinedText(s,name,320-pxTextWidth(name)/2,76,PX_KITS[S.f[S.dom.o].ch].accent);}
  const result=pxRoundResultLayout(S),b=F.banner;
  if(result){
    const p=result,col=S.winner<0?'#ecd3a0':PX_KITS[S.f[S.winner].ch].accent;
    pxPanel(s,p.x,p.y,p.w,p.h,'#172438',col);
    const center=(text,y,color=PX_LIGHT,size=1)=>pxText(s,text,320-pxTextWidth(text,size)/2,y,color,size);
    center(p.title,p.y+5,col,3);
    center(S.winner<0?'NO ROUND AWARDED':pxResultRole(labels,S.winner)+' / '+CH[S.f[S.winner].ch].name+' WINS',p.y+32,PX_LIGHT,2);
    center(pxResultRole(labels,0)+' '+S.wins[0]+' - '+S.wins[1]+' '+pxResultRole(labels,1),p.y+51,'#ecd3a0');
    center(p.final?'MATCH COMPLETE':'ROUND '+(S.round+1)+' NEXT',p.y+65,'#a7b3bf');
  }else if(b){const p=pxBannerLayout(b);
    s.rect(p.x,p.y,p.w,p.h,PX_INK);
    s.rect(p.x,p.y,p.w,2,b.col||'#ecd3a0');
    pxText(s,b.txt,p.textX,p.textY,b.col||PX_LIGHT,p.size);
    if(b.sub)pxText(s,b.sub,320-pxTextWidth(b.sub)/2,p.textY+p.size*7+4,'#a7b3bf');
  }
  return s;
}
function pxDrawHUD(c,S,labels){pxPresent(c,pxHUDSurface(S,labels));}
