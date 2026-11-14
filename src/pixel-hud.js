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
function pxHUDSurface(S,labels,F=FX) {
  const s=new PixelSurface(640,360);
  for(let i=0;i<2;i++) {
    const f=S.f[i],c=CH[f.ch],kit=PX_KITS[f.ch],ac=kit.accent,left=i===0,x=left?52:373,bw=215,lab=labels[i],alt=i===1&&S.f[0].ch===f.ch;
    pxText(s,c.name,x,6,PX_LIGHT);pxText(s,c.tech,x+bw-pxTextWidth(c.tech),15,ac);
    pxPanel(s,x,25,bw,12,'#343748','#8b7d80');
    const fill=(fraction,col,y,h,w=bw,xx=x)=>{const len=Math.round(w*clamp(fraction,0,1));s.rect(left?xx+w-len:xx,y,len,h,col);};
    fill(f.ghost/maxHp(f),'#c4756d',25,12);fill(f.hp/maxHp(f),f.hp<=maxHp(f)*DOM_HP?'#e6b26d':'#87bc94',25,12);
    fill(f.hp/maxHp(f),'#b8d4ad',25,2);s.rect(left?x+bw-bw*DOM_HP:x+bw*DOM_HP,25,1,12,PX_INK);
    const cx=left?x+bw-125:x;pxPanel(s,cx,44,125,5,'#343748','#596679');fill(f.ce/MAXCE,ac,44,5,125,cx);
    const ce='CE '+Math.floor(f.ce);pxText(s,ce,left?cx-pxTextWidth(ce)-6:cx+132,43,ac);
    for(let n=0;n<2;n++){const rx=left?x+6+n*14:x+bw-6-n*14;s.poly([[rx,42],[rx+4,46],[rx,50],[rx-4,46]],S.wins[i]>n?'#edcf8d':'#4b5166',PX_INK);}
    const px=left?10:594;pxPanel(s,px,9,36,36,'#263346',ac);s.blit(pxPortrait(f.ch,alt),px,9,1,!left);s.rect(px,44,36,1,ac);
    let sy=55;
    if(c.res){pxText(s,c.res.name+' '+Math.floor(f.res)+'/'+c.res.max,x,sy,PX_LIGHT);sy+=10;}
    if(f.nails>0||f.gum>0){pxText(s,f.nails>0?'NAILS '+f.nails:'STUCK '+Math.ceil(f.gum/60)+'S',x,sy,'#eda08e');sy+=10;}
    if(f.zone>0){pxText(s,'IN THE ZONE '+Math.ceil(f.zone/60)+'S',x,sy,'#ee8a99');s.rect(x,sy+9,90,3,PX_INK);s.rect(x,sy+9,90*f.zone/BF_ZONE_TICKS,2,'#ed5266');}
    // The actor tags and guard meter stay tied to simulation coordinates; hitboxes are untouched.
    if(f.st!=='ko') {
      const tag=lab?(labels[0]&&labels[1]?'P'+(i+1):'YOU'):(labels.other==='Computer'?'CPU':'FOE');
      const tall=(-PX_IDLES[f.ch].h[1]+18)*(kit.height||1)*(f.big>0?1.3:1);
      const tx=Math.round(f.x/2),ty=Math.max(90,Math.round(f.y/2-tall-10)),tw=pxTextWidth(tag);
      s.rect(tx-tw/2-3,ty-2,tw+6,11,PX_INK);pxText(s,tag,tx-tw/2,ty,left?'#8ecddf':'#efa394');s.poly([[tx-3,ty+9],[tx+3,ty+9],[tx,ty+12]],left?'#8ecddf':'#efa394');
    }
    if(f.guardHp<99){const gx=f.x/2-15,gy=f.y/2+8;pxPanel(s,gx,gy,30,3,'#263346');s.rect(gx,gy,30*clamp(f.guardHp/100,0,1),3,f.guardHp<35?'#e99588':'#9bb8d0');}
    const cardX=left?14:331,cy=322;
    for(let n=0;n<4;n++) {
      const xx=cardX+n*72,dom=n===3,cw=dom?83:67,a=dom?c.dom:c.arts[n],ready=dom?domReady(f):f.cd[n]<=0&&f.ce>=a.cost,used=dom&&f.domUsed;
      pxPanel(s,xx,cy,cw,32,dom&&ready?ac:ready?'#293a50':'#202c3d',ready?ac:'#475367');
      if(F.nope&&F.nope[i]>0&&!ready){s.rect(xx,cy,cw,1,'#e99588');s.rect(xx,cy+31,cw,1,'#e99588');}
      const ink=dom&&ready?PX_INK:ready?PX_LIGHT:'#95a0af',key=lab?lab[dom?'DOM':'A'+(n+1)]:null;
      if(key){s.rect(xx+3,cy+21,10,9,PX_INK);pxText(s,key,xx+8-pxTextWidth(key)/2,cy+22,ready?PX_LIGHT:'#95a0af');}
      pxWrap(a.name,cw-8).forEach((line,j)=>pxText(s,line,xx+4,cy+3+j*8,ink));
      const footer=dom?(used?'USED':ready?'READY!':'GAUGE/HP'):a.cost+' CE';pxText(s,footer,xx+(key?17:4),cy+23,dom&&ready?PX_INK:ready?ac:'#95a0af');
      if(!dom&&f.cd[n]>0){const cd=(f.cd[n]/60).toFixed(1);pxText(s,cd,xx+cw-pxTextWidth(cd)-3,cy+23,PX_LIGHT);}
      const ratio=dom?(used?0:f.gauge/GAUGE_MAX):1-f.cd[n]/a.cd;s.rect(xx+3,cy+30,cw-6,1,PX_INK);s.rect(xx+3,cy+30,(cw-6)*clamp(ratio,0,1),1,ac);
    }
    const hint=lab?'MOVE '+lab.move.replace(/ /g,'')+'  JUMP '+lab.U+'  GUARD '+lab.G+'  P '+lab.P+'  K '+lab.K:(labels.other||'Computer');
    pxOutlinedText(s,hint,cardX,310,'#e2d6bb');
  }
  pxPanel(s,299,19,42,29,'#243448','#b1a08a');const timer=String(Math.ceil(S.timer/60));pxText(s,timer,320-pxTextWidth(timer,2)/2,25,'#ecd3a0',2);
  const round='ROUND '+S.round;pxText(s,round,320-pxTextWidth(round)/2,53,PX_LIGHT);
  if(S.dom&&!S.freeze){const name=CH[S.f[S.dom.o].ch].dom.name;pxOutlinedText(s,name,320-pxTextWidth(name)/2,76,PX_KITS[S.f[S.dom.o].ch].accent);}
  const b=F.banner;
  if(b){const size=Math.min(b.small?2:3,Math.max(1,Math.floor(550/Math.max(1,pxTextWidth(b.txt))))),w=pxTextWidth(b.txt,size),y=b.small?105:150;
    s.rect(b.small?320-w/2-10:0,y-9,b.small?w+20:640,size*7+18,PX_INK);
    s.rect(b.small?320-w/2-10:0,y-9,b.small?w+20:640,2,b.col||'#ecd3a0');
    pxText(s,b.txt,320-w/2,y,b.col||PX_LIGHT,size);
    if(b.sub)pxText(s,b.sub,320-pxTextWidth(b.sub)/2,y+size*7+4,'#a7b3bf');
  }
  return s;
}
function pxDrawHUD(c,S,labels){pxPresent(c,pxHUDSurface(S,labels));}
