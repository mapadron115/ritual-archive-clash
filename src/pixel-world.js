'use strict';
// All active world drawing now happens in source pixels, before one nearest-neighbor presentation.
const PX_BACKDROPS=new Map();
// Retain a full current-stage loop plus eight menu/recent frames, at the old
// 24-surface backdrop budget rather than storing all 48 full-size rasters.
const PX_BACKDROP_CACHE_LIMIT=24;
function pxRememberBackdrop(key,s) {
  if(PX_BACKDROPS.size>=PX_BACKDROP_CACHE_LIMIT)PX_BACKDROPS.delete(PX_BACKDROPS.keys().next().value);
  PX_BACKDROPS.set(key,s);return s;
}
function pxBackdrop(frame,id='courtyard') {
  id=pxStageId(id);frame%=PX_STAGE_FRAMES;const key=id+':'+frame;
  if(PX_BACKDROPS.has(key)) {
    const cached=PX_BACKDROPS.get(key);PX_BACKDROPS.delete(key);PX_BACKDROPS.set(key,cached);return cached;
  }
  if(id!=='courtyard') {
    const s=new PixelSurface(640,360);s.data.set(pxStageVariant(id).data);pxStageMotion(s,id,frame);return pxRememberBackdrop(key,s);
  }
  const bg=pxStage(),s=new PixelSurface(640,360);
  const wind=Math.sin(frame*Math.PI*2/PX_STAGE_FRAMES);
  s.blit(bg.sky,0,0);s.blit(bg.cloud,35+Math.round(wind*5),68);s.blit(bg.cloud,344+Math.round(wind*9),102);
  s.blit(bg.far,-30,0);s.blit(bg.town,-30,0);s.blit(bg.arena,-30,0);s.blit(pxStageLife(frame),0,0);
  return pxRememberBackdrop(key,s);
}
function pxRing(s,x,y,rx,ry,col,width=1,phase=0) {
  const n=40;let prev=null;
  for(let i=0;i<=n;i++) {const a=i*Math.PI*2/n,pt=[x+Math.cos(a)*rx,y+Math.sin(a)*ry];if(prev && (i+phase)%10<8)s.line(prev,pt,col,width);prev=pt;}
}
function pxBurst(s,x,y,r,col,t=0) {
  r=Math.max(2,r);const points=[];
  for(let i=0;i<12;i++) {const a=i*Math.PI/6+(t%2)*.16,len=i%2?r*.26:r*(i%3?.75:1.1);points.push([x+Math.cos(a)*len,y+Math.sin(a)*len]);}
  s.poly(points,PX_INK);s.poly(points.map(([a,b])=>[x+(a-x)*.82,y+(b-y)*.82]),col);
  s.poly([[x-2,y-6],[x+2,y-2],[x+7,y],[x+2,y+2],[x,y+6],[x-2,y+2],[x-6,y]],PX_LIGHT);
}
function pxBolt(s,a,b,seed,col='#ed5266',width=2) {
  let prev=a;
  for(let i=1;i<=7;i++) {const t=i/7,off=i===7?0:Math.sin(seed*13+i*9)*9,pt=[a[0]+(b[0]-a[0])*t+off,a[1]+(b[1]-a[1])*t-off*.5];s.line(prev,pt,PX_INK,width+3);s.line(prev,pt,col,width);prev=pt;}
}
// A torn black/red rupture opens into irregular forks, then detaches into
// short shards. The existing 36-tick FX age is the only clock. Kept below
// both bodies so the impact silhouettes and the striking fist stay legible.
const PX_BLACK_FLASH=new Map();
function pxBlackFlash(s,b) {
  const t=Math.max(0,Math.floor(b.t));if(t>=36)return;
  if(!PX_BLACK_FLASH.has(t)) {
    const cell=new PixelSurface(256,224),x=128,y=112;
    const forks=[[[8,-5],[23,-19],[33,-16],[48,-41],[61,-38],[78,-69],[89,-66]],
      [[12,4],[33,9],[43,3],[69,19],[76,13],[110,28]],
      [[6,8],[19,28],[14,36],[34,57],[30,67],[47,85]],
      [[-8,8],[-24,23],[-36,18],[-54,40],[-68,35],[-99,58]],
      [[-9,-5],[-29,-13],[-37,-30],[-59,-25],[-73,-47],[-111,-53]]];
    const twigs=[[[33,-16],[48,-9],[59,-19]],[[43,3],[49,-12],[65,-17]],
      [[14,36],[2,49],[12,67]],[[-36,18],[-44,4],[-61,6]],[[-37,-30],[-29,-46],[-43,-63]]];
    const reach=t<5?.68+t*.065:t<14?1:1+Math.min(10,t-14)*.006;
    const point=([a,c])=>[x+a*reach,y+c*reach];
    const width=t<5?7:t<14?5:Math.max(1,4-Math.floor((t-14)/6));
    // After expansion, remove the inner path and then alternate outer bends.
    // The last six ages retain only tiny separated tips, never full spokes.
    const segments=[];
    for(const [n,path] of forks.concat(twigs).entries())for(let k=1;k<path.length;k++) {
      if(t>=14&&(k<2+Math.floor((t-14)/6)||(k+n)%2===0))continue;
      let a=point(path[k-1]),c=point(path[k]);
      if(t>=24){const keep=(36-t)/16;a=[c[0]+(a[0]-c[0])*keep,c[1]+(a[1]-c[1])*keep];}
      const taper=(n<5?1:.6)*width*.5;
      const wa=taper*(1-(k-1)/path.length*.7),wc=k===path.length-1?0:taper*(1-k/path.length*.7);
      segments.push({a,c,wa,wc});
    }
    const shard=({a,c,wa,wc},pad,col)=>{
      const dx=c[0]-a[0],dy=c[1]-a[1],len=Math.max(1,Math.hypot(dx,dy)),nx=-dy/len,ny=dx/len;
      cell.poly([[a[0]+nx*(wa+pad),a[1]+ny*(wa+pad)],[c[0]+nx*(wc+pad),c[1]+ny*(wc+pad)],
        [c[0]-nx*(wc+pad),c[1]-ny*(wc+pad)],[a[0]-nx*(wa+pad),a[1]-ny*(wa+pad)]],col);
    };
    for(const seg of segments)shard(seg,1.5,'#100f1b');
    for(const seg of segments){shard(seg,0,t<24?'#e6435b':'#a9445b');if(t<14)cell.line(seg.a,seg.c,'#ff8790');}
    if(t<14) {
      const r=t<5?1+t*.06:1.24-(t-5)*.075;
      const poly=(pts,col)=>cell.poly(pts.map(([a,c])=>[x+a*r,y+c*r]),col);
      // An off-axis split with a dark heart differs from the ivory hit star.
      poly([[-44,-14],[-15,-11],[-23,-31],[-3,-16],[12,-29],[10,-9],[43,-16],[23,0],[40,16],[12,10],[20,31],[-2,17],[-21,26],[-15,8],[-45,11],[-25,-1]],'#100f1b');
      poly([[-37,-11],[-11,-8],[-17,-23],[-2,-11],[8,-22],[6,-6],[34,-12],[17,0],[31,12],[9,6],[14,24],[-1,11],[-17,20],[-10,5],[-36,8],[-19,-1]],'#e6435b');
      poly([[-24,-5],[-5,-3],[-9,-14],[2,-5],[17,-8],[11,0],[23,7],[5,4],[8,15],[-3,7],[-17,11],[-10,2],[-27,3],[-14,-1]],'#100f1b');
      poly([[-5,-2],[0,-7],[3,-1],[10,1],[2,3],[-1,8],[-3,2],[-9,0]],'#ffe4cf');
    }
    PX_BLACK_FLASH.set(t,cell);
  }
  s.blit(PX_BLACK_FLASH.get(t),Math.round(b.x/2)-128,Math.round(b.y/2)-112);
}
// Three authored phases: bright contact, directional expansion, separated fragments.
// Geometry is mirrored around the exact contact pixel; no random frame-to-frame flicker.
const PX_CONTACTS=new Map();
function pxContact(s,e) {
  const key=e.kind+':'+e.t+':'+!!e.heavy;
  if(!PX_CONTACTS.has(key)) {
    const cell=new PixelSurface(160,160);pxContactShape(cell,{...e,x:160,y:160,dir:1});PX_CONTACTS.set(key,cell);
  }
  s.blit(PX_CONTACTS.get(key),Math.round(e.x/2)-(e.dir<0?79:80),Math.round(e.y/2)-80,1,e.dir<0);
}
function pxContactShape(s,e) {
  const x=Math.round(e.x/2),y=Math.round(e.y/2),t=e.t,block=e.kind==='block',broken=e.kind==='break';
  const col=block?'#8ed9e1':broken?'#edaa67':'#eed49b',light=block?'#dbf4ed':PX_LIGHT;
  const poly=(pts,c)=>s.poly(pts.map(([a,b])=>[x+a*e.dir,y+b]),c);
  const line=(a,b,c,w=1)=>s.line([x+a[0]*e.dir,y+a[1]],[x+b[0]*e.dir,y+b[1]],c,w);
  if(t<4) {
    // The first displayed age is 1 (events precede fxTick). Give that frame a
    // broad, outlined flash that reads over a hurt-flashing body at native size.
    // Guard absorbs into a crescent; a broken guard throws two plates apart.
    if(block) {
      const r=23+t*2;
      poly([[5,-r],[-9,-r+7],[-17,-8],[-18,6],[-10,r-5],[5,r],[0,r-11],[-6,6],[-5,-7],[0,-r+11]],PX_INK);
      poly([[3,-r+3],[-7,-r+9],[-14,-7],[-15,5],[-8,r-7],[2,r-3],[-3,r-11],[-9,6],[-8,-8],[-2,-r+10]],col);
      line([-10,-12],[-13,4],light,4);line([-13,4],[-6,16],light,4);
      poly([[-3,-5],[7,0],[-3,5],[-7,0]],light);
    } else if(broken) {
      const a=4+t*2;
      for(const side of [-1,1]) {
        poly([[side*a,-5],[side*(a+5),-27],[side*(a+17),-16],[side*(a+12),-2],[side*(a+23),12],[side*(a+8),26],[side*(a+2),11]],PX_INK);
        poly([[side*(a+3),-5],[side*(a+7),-22],[side*(a+13),-15],[side*(a+8),-1],[side*(a+18),12],[side*(a+10),21],[side*(a+5),9]],col);
        line([side*(a+6),-14],[side*(a+4),-4],light,4);line([side*(a+9),9],[side*(a+12),15],light,3);
      }
      poly([[-4,-11],[2,-5],[7,-7],[4,1],[7,8],[0,5],[-6,11],[-4,2],[-8,-3],[-2,-3]],light);
    } else {
      const r=(e.heavy?35:26)+Math.floor(t/2)*2;
      poly([[-r*.8,-r*.55],[-8,-8],[-3,-r],[6,-10],[r*.65,-r*.65],[12,-3],[r,2],[10,9],[r*.4,r*.85],[0,12],[-r*.65,r*.7],[-10,3],[-r,-2],[-12,-6]],PX_INK);
      poly([[-r*.6,-r*.4],[-6,-5],[-2,-r+5],[4,-7],[r*.5,-r*.5],[8,-1],[r-5,2],[7,6],[r*.3,r*.65],[0,8],[-r*.45,r*.5],[-7,1],[-r+6,-2],[-9,-4]],col);
      poly([[-14,-8],[-5,-4],[-2,-17],[3,-5],[13,-10],[7,0],[18,3],[5,5],[5,16],[-1,8],[-12,13],[-6,2],[-17,-1],[-6,-2]],light);
    }
    return;
  }
  if(block && t<7) {
    const r=13+(t-2)*2;
    line([5,-r],[-4,-r*.55],PX_INK,5);line([-4,-r*.55],[-7,0],PX_INK,5);
    line([-7,0],[-4,r*.55],PX_INK,5);line([-4,r*.55],[5,r],PX_INK,5);
    line([5,-r],[-4,-r*.55],col,3);line([-4,-r*.55],[-7,0],light,3);
    line([-7,0],[-4,r*.55],light,3);line([-4,r*.55],[5,r],col,3);
  } else if(!block && t<7) {
    const r=(e.heavy?29:21)+(t-2)*2;
    poly([[-12,-2],[-r*.7,-r*.7],[-2,-8],[4,-r],[9,-5],[r,0],[10,6],[9,r*.85],[-2,9],[-r*.65,r*.65],[-8,3]],PX_INK);
    poly([[-9,-1],[-r*.5,-r*.5],[-1,-5],[4,-r*.75],[7,-3],[r*.8,0],[7,4],[7,r*.6],[-1,6],[-r*.45,r*.45],[-5,2]],col);
    poly([[-7,0],[-2,-4],[4,-3],[12,0],[3,4],[-2,3]],light);
  }
  if(t>=4) {
    const u=t-4;
    const rays=block?[[-1,-1],[.4,-1],[-1,1],[.4,1]]:[[1,-.2],[.7,-.9],[.65,.85],[-.7,-.65],[-.6,.75]];
    rays.forEach(([dx,dy],n)=>{
      const r=(e.heavy?19:13)+u*(block?2:3),len=Math.max(1,(broken?10:7)-u*.7);
      const a=[dx*r,dy*r+u*u*.12],b=[dx*(r+len),dy*(r+len)+u*u*.12];
      line(a,b,PX_INK,3);line(a,b,n%2?col:light,1);
    });
  }
}
function pxOutlinedText(s,text,x,y,col,scale=1,full=false) {
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&(full||!dx||!dy))pxText(s,text,Math.round(x)+dx,Math.round(y)+dy,PX_INK,scale);
  pxText(s,text,Math.round(x),Math.round(y),col,scale);
}
function pxDamageText(s,p) {
  pxOutlinedText(s,p.n.txt,p.x+1,p.y+1,p.n.bf?'#ff7585':p.n.big?'#ffe3a4':PX_LIGHT,p.size,true);
}
function pxActorAnchor(f) {
  const tall=(-PX_IDLES[f.ch].h[1]+18)*(PX_KITS[f.ch].height||1)*(f.big>0?1.3:1);
  return {x:Math.round(f.x/2),y:Math.max(90,Math.round(f.y/2-tall-10))};
}
function pxBannerLayout(b) {
  if(!b)return null;
  const size=Math.min(b.small?2:3,Math.max(1,Math.floor(550/Math.max(1,pxTextWidth(b.txt)))));
  // Opening announcements keep their large type, but leave the first jump and
  // approach visible. The old full-width strip crossed both starting fighters.
  const w=pxTextWidth(b.txt,size),y=b.opening?76:b.small?105:150,pad=b.opening?4:9,side=b.opening?6:10,compact=b.opening||b.small;
  return {size,textX:320-w/2,textY:y,x:compact?320-w/2-side:0,y:y-pad,w:compact?w+side*2:640,h:size*7+pad*2};
}
// A result survives expired/missed FX events, including a guest's first snapshot.
// phaseT is the existing active round clock; this adds no simulation state.
function pxRoundResultLayout(S) {
  if(S.phase!=='over'&&(S.phase!=='ko'||S.phaseT<30))return null;
  return {x:138,y:88,w:364,h:80,title:S.winner<0?'DRAW':S.timer<=0?'TIME UP':'K.O.',final:S.wins[0]>=2||S.wins[1]>=2};
}
const PX_BODY_BOUNDS=new WeakMap();
function pxBodyBounds(S,f) {
  const {sprite,ox,oy}=pxFighterFrame(f.ch,pxPose(S,f),f.i===1&&S.f[0].ch===f.ch);
  if(!PX_BODY_BOUNDS.has(sprite)) {
    let l=sprite.w,r=0,t=sprite.h,b=0;
    for(let y=0;y<sprite.h;y++)for(let x=0;x<sprite.w;x++)if(sprite.data[(y*sprite.w+x)*4+3]){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
    PX_BODY_BOUNDS.set(sprite,{l,r,t,b});
  }
  const {l,r,t,b}=PX_BODY_BOUNDS.get(sprite),scale=f.big>0?1.3:1,x=Math.round(f.x/2),y=Math.round(f.y/2);
  return {x:Math.floor(x+(f.face<0?ox-r:l-ox)*scale)-2,y:Math.floor(y+(t-oy)*scale)-2,w:Math.ceil((r-l+1)*scale)+4,h:Math.ceil((b-t+1)*scale)+4};
}
// Keep damage values near their contact, but out of bodies, actor tags and banners.
// Each target's live values occupy separate rows, newest nearest the contact.
// All placement is presentation-only and repeatable from the same state/effect snapshot.
function pxDamageLayout(S,nums,F={}) {
  if(!nums.length)return [];
  const blocked=S.f.map(f=>pxBodyBounds(S,f));
  // The world can shake by five pixels while the HUD stays still.
  for(const f of S.f)if(f.st!=='ko') {const p=pxActorAnchor(f);blocked.push({x:p.x-20,y:p.y-8,w:40,h:28});}
  const result=pxRoundResultLayout(S),banner=result||pxBannerLayout(F.banner);
  if(banner)blocked.push({x:banner.x-6,y:banner.y-6,w:banner.w+12,h:banner.h+12+(!result&&F.banner.sub?10:0)});
  const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
  const out=[];
  for(const n of nums.slice().reverse()) {
    // Old effect snapshots have no target; retain their nearest-contact fallback.
    const target=n.target??S.f.reduce((best,f)=>Math.abs(f.x-n.x)<Math.abs(best.x-n.x)?f:best).i;
    const rows=out.filter(p=>p.target===target).map(p=>({x:0,y:p.y-4,w:640,h:p.h+8}));
    const size=n.bf?3:2,w=pxTextWidth(n.txt,size)+2,h=7*size+2,dir=n.dir<0?-1:1;
    const x=Math.round(n.x/2+dir*26-w/2),y=Math.round(n.y/2-h);
    let best=null,score=Infinity;
    // Nearest free lane first. The outline is inside the reserved rectangle.
    search: for(let radius=0;radius<=32;radius++) {
      for(let dx=-radius;dx<=radius;dx++)for(const dy of radius===Math.abs(dx)?[0]:[-(radius-Math.abs(dx)),radius-Math.abs(dx)]) {
        const box={x:clamp(x+dir*dx*(w+4),4,636-w),y:clamp(y+dy*(h+4),96,302-h),w,h};
        const area=blocked.concat(rows).reduce((sum,b)=>sum+overlap(box,b),0);
        if(area<score){score=area;best=box;}
        if(score===0)break search;
      }
    }
    blocked.push(best);out.push({...best,n,size,target});
  }
  return out.reverse();
}
const PX_DUST=new Map();
function pxDust(s,e) {
  const key=e.kind+':'+e.t;
  if(!PX_DUST.has(key)) {
    const cell=new PixelSurface(192,96),t=e.t,heavy=e.kind==='thud',jump=e.kind==='jump';
    const x=96,y=80,u=Math.floor(t/3),spread=(heavy?13:jump?8:10)+u*(heavy?5:3);
    if(e.kind==='land') {
      // A low pair of rolling puffs makes an ordinary landing read without
      // borrowing the much taller body-impact cloud. The existing FX age
      // carries them outward, then breaks them into small dim remnants.
      const late=t>=9,col=late?'#a99a83':'#e6d5b2';
      for(const dir of [-1,1])for(let n=0;n<2;n++) {
        const rx=Math.max(1,(n?10:12)-t*(n?.6:.65));
        const ry=Math.max(1,(n?6:7)-t*.38);
        const cx=x+dir*((n?38:18)+t*1.6),cy=y-ry-1-t*.35;
        cell.ellipse(cx,cy,rx,ry,PX_INK);
        cell.ellipse(cx,cy,Math.max(1,rx-1),Math.max(1,ry-1),'#857e73');
        if(t<14)cell.ellipse(cx-dir,cy-1,Math.max(1,rx-2),Math.max(1,ry-2),col);
      }
    } else if(heavy&&t<6) {
      // Broad overlapping billows roll outward and flatten before the existing
      // debris phase. Paint their shared outline first so internal seams do not
      // turn the cloud into a row of stones. Both bodies remain in front.
      const lobes=[[16+t,-12+t*.8,12-t*.5,12-t*.8],
        [30+t*2,-13+t,13-t*.7,13-t],
        [44+t*2,-6+t*.3,10-t*.7,6-t*.3]];
      for(const dir of [-1,1]) {
        const puff=(a,b,rx,ry,col)=>cell.ellipse(x+dir*a,y+b,rx,ry,col);
        puff(30+t*2,-3,25+t,3,PX_INK);
        for(const [a,b,rx,ry] of lobes)puff(a,b,rx,ry,PX_INK);
        puff(30+t*2,-3,24+t,2,'#857e73');
        for(const [a,b,rx,ry] of lobes)puff(a,b,rx-1,ry-1,'#a99a83');
        for(const [a,b,rx,ry] of lobes)puff(a-1,b-2,rx*.78,ry*.65,'#e6d5b2');
        // A low shared fold grounds the pale caps without pointed ridges.
        puff(29+t*2,-3,18+t,2,'#857e73');
      }
    } else for(const dir of [-1,1])for(let n=0;n<(heavy?3:2);n++) {
      const cx=x+dir*(spread+n*7),cy=y-2-Math.min(12,u*2)-n*2;
      const r=Math.max(1,(heavy?12:jump?6:9)-u-n*2),h=Math.max(1,r*.55);
      if(t<2) {cell.poly([[x+dir*3,y],[cx,y-(heavy?8:4)],[cx+dir*9,y]],'#b7a98f');continue;}
      // Angular, shrinking clusters rise and separate; their lowest pixel stays on/above the floor.
      cell.poly([[cx-r,cy],[cx-r+2,cy-h],[cx,cy-h-2],[cx+r-2,cy-h],[cx+r,cy],[cx+r-2,cy+2],[cx-r+2,cy+2]],'#857e73');
      cell.poly([[cx-r+2,cy-1],[cx-2,cy-h],[cx+3,cy-h],[cx+r-2,cy-1]],'#c8bba0');
      if(heavy&&t<15)cell.rect(cx+dir*6,Math.min(y-2,cy-5-u),2,2,'#ddd0b4');
    }
    PX_DUST.set(key,cell);
  }
  s.blit(PX_DUST.get(key),Math.round(e.x/2)-96,Math.round(e.y/2)-80);
}
// Status identity uses existing active countdowns (or the owner's Domain age).
// A small local raster keeps both facings and fractional/offscreen roots exact.
function pxStatusEffect(s,S,f,kind) {
  const remaining=kind==='infinity'?f.inf:kind==='counter'?f.counter:kind==='absolute'?f.abs:f.zone;
  if(!(remaining>0))return;
  const cell=new PixelSurface(128,128),x=64,y=120;
  const age=kind==='infinity'?108-remaining:kind==='counter'?26-remaining:kind==='zone'?BF_ZONE_TICKS-remaining:
    S.dom&&S.dom.o===f.i&&S.dom.k==='absolute'?S.dom.t:0;
  const phase=Math.floor(Math.max(0,age)/4);
  if(kind==='infinity') {
    // Eight open shell segments leave the fighter's center unobscured.
    for(let n=0;n<8;n++) {
      const a=n*Math.PI/4,pts=[];
      for(let i=0;i<=4;i++){const b=a-.27+i*.135;pts.push([x+Math.cos(b)*39,y-51+Math.sin(b)*51]);}
      for(let i=4;i>=0;i--){const b=a-.27+i*.135;pts.push([x+Math.cos(b)*36,y-51+Math.sin(b)*48]);}
      cell.poly(pts,'#3869a9',PX_INK);
      const bright=(n+phase)%8<2;
      for(let i=0;i<4;i++) {
        const b=a-.22+i*.11,c=b+.11;
        cell.line([x+Math.cos(b)*37.5,y-51+Math.sin(b)*49.5],[x+Math.cos(c)*37.5,y-51+Math.sin(c)*49.5],bright?'#dbf4ed':'#8ed9e1');
      }
    }
  } else if(kind==='counter') {
    // Paired outward vanes suggest a returned blow rather than a solid wall.
    for(let n=0;n<2;n++) {
      const fx=x+20+n*11,cy=y-50;
      cell.poly([[fx-4,cy-25],[fx+11,cy],[fx-4,cy+25],[fx-1,cy],[fx-4,cy-25]],'#39765f',PX_INK);
      cell.poly([[fx-2,cy-19],[fx+8,cy],[fx-1,cy+12],[fx+2,cy]],'#79c9a5');
      cell.line([fx-2,cy-19],[fx+8,cy],phase%2===n?'#e0f1cf':'#9bd7ae');
    }
  } else if(kind==='absolute') {
    // A round jade buckler echoes the sanctuary, distinct from the brief counter.
    const fx=x+27,cy=y-50,ready=f.st!=='hit'&&f.st!=='stun';
    if(ready) {
      cell.ellipse(fx,cy,16,27,PX_INK);cell.ellipse(fx,cy,14,25,'#39765f');
      cell.ellipse(fx-1,cy-1,12,22,'#9bd7ae');cell.ellipse(fx+1,cy+2,11,21,'#39765f');
      cell.ellipse(fx,cy,9,19,'#79c9a5');
      cell.poly([[fx,cy-12],[fx+6,cy],[fx,cy+12],[fx-6,cy]],'#39765f',PX_INK);
      cell.poly([[fx,cy-10],[fx,cy+1],[fx-4,cy]],'#e0f1cf');
      const py=cy-17+(phase%6)*6;
      cell.line([fx-10,py],[fx-7,py-2],'#e0f1cf');
    } else {
      // The timer can survive hit/stun while reflection is suspended by the rules.
      for(const dir of [-1,1])cell.poly([[fx+dir*5,cy-24],[fx+dir*14,cy-12],[fx+dir*14,cy+13],[fx+dir*5,cy+24],[fx+dir*10,cy]],'#39765f',PX_INK);
    }
  } else {
    // Broken red/black currents rise along the flanks, behind the silhouette.
    for(let n=0;n<4;n++) {
      const u=(Math.max(0,age)*2+n*23)%92,fx=x+(n%2?1:-1)*(27+n%3*4),cy=y-12-u;
      const pts=[[fx,cy+9],[fx-3,cy+2],[fx+2,cy-4],[fx-1,cy-11]];
      for(let i=1;i<pts.length;i++){cell.line(pts[i-1],pts[i],PX_INK,5);cell.line(pts[i-1],pts[i],'#9c2948',3);cell.line(pts[i-1],pts[i],'#ed5266');}
      cell.line([fx+2,cy-4],[fx-1,cy-11],'#ff9aab');
    }
  }
  s.blit(cell,Math.round(f.x/2)-(f.face<0?63:64),Math.round(f.y/2)-120,1,f.face<0);
}
// The charge value survives release/hits in simulation. Only the held Rock
// startup shows this cue; never imply an idle or interrupted fighter is charging.
function pxChargeCue(s,f) {
  if(f.st!=='atk'||!(f.chg>0))return;
  const m=moveDef(f);
  if(!m||m.id!=='rock'||f.mt>=m.su-1)return;
  const cell=new PixelSurface(96,96),x=48+14,y=90-45;
  const tier=Math.min(3,Math.floor(f.chg/25)),phase=Math.floor(f.chg/5)%4;
  // Broad value steps carry the strength change at native play size. Lamps
  // repeat the existing 25/50/75 thresholds with substantial lit faces.
  const rim=['#285346','#39765f','#79c9a5','#9bd7ae'][tier];
  const face=['#39765f','#79c9a5','#9bd7ae','#e0f1cf'][tier];
  cell.poly([[x-11,y-5],[x-5,y-11],[x+6,y-11],[x+12,y-5],[x+12,y+5],[x+5,y+11],[x-5,y+11],[x-11,y+5]],rim,PX_INK);
  cell.poly([[x-8,y-4],[x-4,y-8],[x+4,y-8],[x+9,y-4],[x+9,y+4],[x+4,y+8],[x-4,y+8],[x-8,y+4]],face);
  cell.poly([[x-6,y-3],[x-3,y-6],[x+3,y-6],[x+6,y-3],[x+6,y+3],[x+3,y+6],[x-3,y+6],[x-6,y+3]],'#39765f');
  // Clear the center to reveal the existing hand, rather than covering it.
  for(let cy=y-5;cy<=y+5;cy++)for(let cx=x-5;cx<=x+5;cx++)if(Math.abs(cx-x)+Math.abs(cy-y)<=7)cell.data.fill(0,(cy*cell.w+cx)*4,(cy*cell.w+cx)*4+4);
  cell.line([x-8,y-5],[x-4,y-9],'#e0f1cf',2);cell.line([x-3,y-9],[x+4,y-9],'#e0f1cf');
  for(let n=0;n<3;n++) {
    const py=y-11+n*10;
    cell.rect(x+15,py-4,10,9,PX_INK);cell.rect(x+16,py-3,8,7,'#285346');
    if(tier>n){cell.rect(x+17,py-2,6,5,'#9bd7ae');cell.rect(x+18,py-1,4,3,'#e0f1cf');}
  }
  // Two restrained inward motes advance with held charge, and hold in pauses.
  const gap=7-phase*2;
  for(const dir of [-1,1]) {
    cell.rect(x-4+phase*2,y+dir*(12+gap)-1,4,3,PX_INK);
    cell.rect(x-3+phase*2,y+dir*(12+gap),2,1,'#e0f1cf');
  }
  s.blit(cell,Math.round(f.x/2)-(f.face<0?47:48),Math.round(f.y/2)-90,1,f.face<0);
}
// Nuclear Shell's sustained pressure gathers toward the forward hand. Use its
// existing active Domain age, including the held cinematic tick, never FX time.
function pxMaximumCharge(s,S,f) {
  const d=S.dom;
  if(!d||d.o!==f.i||d.k!=='nuclear'||d.t<1||d.t>=72||f.st!=='cast')return;
  const cell=new PixelSurface(112,112),ox=32,oy=100,x=ox+28,y=oy-45;
  const phase=Math.min(5,Math.floor((d.t-1)/12)),tier=Math.floor(phase/2),r=16-tier*2;
  const shade='#a96341',body='#e7a267',light='#ffd69a',ivory='#fff2bd';
  // A broad hollow octagonal collar keeps the hand visible and tightens as
  // pressure builds. Its warm material matches the existing cannon beam.
  const oct=(rx,ry)=>[[x-rx,y-ry+6],[x-rx+6,y-ry],[x+rx-6,y-ry],[x+rx,y-ry+6],[x+rx,y+ry-6],[x+rx-6,y+ry],[x-rx+6,y+ry],[x-rx,y+ry-6]];
  cell.poly(oct(r,21-tier*2),shade,PX_INK);
  cell.poly(oct(r-2,19-tier*2),[body,light,ivory][tier]);
  const hole=new PixelSurface(112,112);hole.poly(oct(r-6,15-tier*2),'#ffffff');
  for(let p=0;p<cell.data.length;p+=4)if(hole.data[p+3])cell.data.fill(0,p,p+4);
  cell.line([x-r+6,y-18+tier*2],[x+r-6,y-18+tier*2],light,3);
  cell.line([x-r+3,y-12],[x-r+8,y-17],ivory,2);
  // Paired broad vanes approach the collar, leaving a clear forward center.
  const gap=28-phase*3;
  for(const dir of [-1,1]) {
    const cy=y+dir*13,fx=x+gap;
    cell.poly([[fx+4,cy-dir*7],[fx-4,cy],[fx+4,cy+dir*7],[fx+1,cy]],body,PX_INK);
    cell.line([fx+2,cy-dir*4],[fx-2,cy],ivory,2);
  }
  s.blit(cell,Math.round(f.x/2)-(f.face<0?111-ox:ox),Math.round(f.y/2)-oy,1,f.face<0);
}
// Three separate blood feeds gather around an open hand lane. Their spacing
// and broad value steps follow Convergence's own prefire age, not global time.
function pxConvergenceCharge(s,S,f) {
  const d=S.dom;
  if(!d||d.o!==f.i||d.k!=='bloodsweep'||d.t<1||d.t>=40||f.st!=='cast')return;
  const cell=new PixelSurface(128,112),ox=24,oy=100,x=ox+28,y=oy-45;
  const phase=Math.min(5,Math.floor((d.t-1)/7)),tier=Math.floor(phase/2),gap=24-phase*3;
  const dark='#790f30',body=['#d4102e','#ed5266','#ffb4bf'][tier],light='#ffb4bf';
  for(const dir of [-1,1]) {
    const points=[[-13,-8],[6,-8],[17,0],[7,5],[-7,5],[6,0],[1,-3],[-13,-3]];
    cell.poly(points.map(([a,b])=>[x+a,y+dir*(gap+b)]),dark,PX_INK);
    cell.poly([[-11,-7],[5,-7],[14,0],[6,3],[-2,3],[9,0],[2,-5],[-11,-5]].map(([a,b])=>[x+a,y+dir*(gap+b)]),body);
    cell.line([x-10,y+dir*(gap-6)],[x+4,y+dir*(gap-6)],light,2);
  }
  const fx=x+gap;
  cell.poly([[fx+18,y-8],[fx+3,y-8],[fx-5,y],[fx+3,y+8],[fx+18,y+8],[fx+8,y]],dark,PX_INK);
  cell.poly([[fx+15,y-6],[fx+4,y-6],[fx-2,y],[fx+4,y+6],[fx+15,y+6],[fx+5,y]],body);
  cell.line([fx+14,y-5],[fx+4,y-5],light,2);
  cell.line([fx+4,y-5],[fx,y],light,2);
  s.blit(cell,Math.round(f.x/2)-(f.face<0?127-ox:ox),Math.round(f.y/2)-oy,1,f.face<0);
}
// A split jade resonator prepares the word in the forward face lane. Its broad
// faces brighten and compression marks close during the existing 23-tick tell.
function pxVoiceCharge(s,S,f) {
  const d=S.dom;
  if(!d||d.o!==f.i||d.k!=='megaphone'||d.t<1||d.t>=24||f.st!=='cast')return;
  const cell=new PixelSurface(128,112),ox=24,oy=104,x=ox,y=oy-76;
  const phase=Math.min(5,Math.floor((d.t-1)/4)),tier=Math.floor(phase/2);
  const shade=['#285346','#568d72','#9bd7ae'][tier],body=['#79c9a5','#b9dfba','#e0f1cf'][tier],light='#e0f1cf';
  // Flared, separated upper/lower plates leave both face and throat visible.
  for(const dir of [-1,1]) {
    const points=[[12,4],[35,23],[46,23],[46,8],[35,8],[12,0]];
    cell.poly(points.map(([a,b])=>[x+a,y+dir*b]),shade,PX_INK);
    cell.poly([[17,4],[36,21],[44,21],[44,10],[35,10]].map(([a,b])=>[x+a,y+dir*b]),body);
    cell.line([x+18,y+dir*6],[x+36,y+dir*21],light,2);
    cell.rect(x+38,y+dir*19-2,6,5,light);
  }
  // A substantial inward chevron closes toward the open resonator, never a
  // range boundary or a projectile. It disappears on the real release tick.
  const fx=x+70-phase*4;
  cell.poly([[fx+6,y-13],[fx-5,y],[fx+6,y+13],[fx+11,y+9],[fx+3,y],[fx+11,y-9]],shade,PX_INK);
  cell.poly([[fx+6,y-10],[fx-2,y],[fx+6,y+10],[fx+8,y+8],[fx,y],[fx+8,y-8]],body);
  cell.line([fx+6,y-9],[fx-1,y],light,2);
  s.blit(cell,Math.round(f.x/2)-(f.face<0?127-ox:ox),Math.round(f.y/2)-oy,1,f.face<0);
}
function pxFighterShadow(s,f) {
  const scale=f.big>0?1.3:1;
  s.ellipse(Math.round(f.x/2),307,Math.max(9,23-(GROUND-f.y)/30)*scale,3,'#776c69');
}
// Confine the opening punches' wakes to the elbow-to-fist lane. The muted
// material stays below the fist's value; the existing active ticks are the clock.
function pxStraightPunchWake(s,f) {
  if(f.st!=='atk'||(f.move!=='p1'&&f.move!=='p2'))return;
  const move=BASIC[f.move];if(f.mt<move.su||f.mt>=move.su+move.ac)return;
  const age=f.mt-move.su,kit=PX_KITS[f.ch],h=kit.height||1,scale=f.big>0?1.3:1;
  const cross=f.move==='p2',pose=PX_POSES[cross?'punch2':'punch'],[elbow,hand]=cross?pose.b:pose.a;
  const cell=new PixelSurface(144,128),start=elbow[0]+age*.5,end=hand[0]-6;
  const fist=pxRGB(kit.skin[cross?(kit.limbDetail?1:0):2]);
  const value=Math.min(165,(fist[0]*.2126+fist[1]*.7152+fist[2]*.0722)*.85);
  const tone=factor=>'rgb('+[value*factor-5,value*factor,value*factor-2].map(Math.round).join(',')+')';
  const poly=(pts,col)=>cell.poly(pts.map(([a,b])=>[64+a,120+(elbow[1]+(a-elbow[0])*(hand[1]-elbow[1])/(hand[0]-elbow[0])+b)*h]),col);
  poly([[start,-4],[start+4,-7],[end,-4],[end,4],[start+5,10],[start,6]],PX_INK);
  poly([[start+1,-3],[start+5,-5],[end-1,-3],[end-1,3],[start+5,8],[start+1,5]],tone(.76));
  poly([[start+2,5],[start+5,7],[end-1,2],[start+6,9]],tone(1));
  s.blit(cell,Math.round(f.x/2)-(f.face<0?79:64)*scale,Math.round(f.y/2)-120*scale,scale,f.face<0);
}
// A brief boot wake connects the kick's low load to its high extension. It is
// tucked behind the body, follows the existing active clock, and adds no FX state.
function pxKickSweep(s,f) {
  if(f.st!=='atk'||f.move!=='k'||f.mt<BASIC.k.su||f.mt>=BASIC.k.su+BASIC.k.ac)return;
  const age=f.mt-BASIC.k.su,h=PX_KITS[f.ch].height||1,scale=f.big>0?1.3:1;
  const cell=new PixelSurface(144,128),x=64,y=120;
  const tail=age*6;
  const poly=(pts,col)=>cell.poly(pts.map(([a,b])=>[x+a,y+b*h]),col);
  poly([[tail-10,-7-tail*.35],[tail+8,-8-tail*.35],[34,-22],[49,-39],[57,-52],[64,-55],[65,-46],[58,-29],[43,-15],[22,-5],[tail,-2-tail*.35]],PX_INK);
  poly([[tail-5,-7-tail*.35],[tail+9,-10-tail*.35],[36,-24],[51,-41],[59,-52],[62,-52],[62,-46],[55,-31],[41,-17],[21,-7],[tail+1,-4-tail*.35]],'#a7aaa5');
  poly([[tail+4,-8-tail*.35],[24,-11],[40,-22],[54,-41],[60,-50],[59,-43],[51,-27],[37,-16],[21,-9]],'#f1e5cd');
  s.blit(cell,Math.round(f.x/2)-(f.face<0?79:64)*scale,Math.round(f.y/2)-120*scale,scale,f.face<0);
}
// A pale air-punch wake trails below the forearm. Keep the fist leading,
// and contract toward it through the existing active ticks without FX state.
function pxAirPunchWake(s,f) {
  if(f.st!=='atk'||f.move!=='jp'||f.y>=GROUND||f.mt<BASIC.jp.su||f.mt>=BASIC.jp.su+BASIC.jp.ac)return;
  const age=f.mt-BASIC.jp.su,kit=PX_KITS[f.ch],h=kit.height||1,scale=f.big>0?1.3:1;
  const cell=new PixelSurface(144,128),tail=22+Math.min(age,3);
  const shrink=age<4?1:1-(age-3)*.17;
  const fist=pxRGB(kit.skin[2]),value=Math.min(185,(fist[0]*.2126+fist[1]*.7152+fist[2]*.0722)*.92);
  const tone=factor=>'rgb('+[value*factor-5,value*factor,value*factor-2].map(Math.round).join(',')+')';
  const poly=(pts,col)=>cell.poly(pts.map(([a,b])=>[64+44+(a-44)*shrink,120+(-60+(b+60)*shrink)*h]),col);
  poly([[tail,-55],[34,-57],[44,-62],[44,-55],[36,-47],[tail,-44],[tail-2,-49]],PX_INK);
  poly([[tail+1,-54],[35,-55],[42,-59],[42,-55],[35,-49],[tail+1,-46]],tone(.84));
  poly([[tail+2,-49],[35,-51],[42,-57],[36,-49],[tail+2,-46]],tone(1));
  s.blit(cell,Math.round(f.x/2)-(f.face<0?79:64)*scale,Math.round(f.y/2)-120*scale,scale,f.face<0);
}
// A horizontal air-kick wake runs below the extended shin, leaving the boot
// leading and the face clear. Its tail contracts through the eight active ticks;
// landing, interruption and recovery clear it without retaining any FX state.
function pxAirKickSweep(s,f) {
  if(f.st!=='atk'||f.move!=='jk'||f.y>=GROUND||f.mt<BASIC.jk.su||f.mt>=BASIC.jk.su+BASIC.jk.ac)return;
  const age=f.mt-BASIC.jk.su,h=PX_KITS[f.ch].height||1,scale=f.big>0?1.3:1;
  const cell=new PixelSurface(144,128),tail=7+Math.min(age,3)*5,rise=Math.min(age,3)*1.5;
  const shrink=age<4?1:1-(age-3)*.17;
  const poly=(pts,col)=>cell.poly(pts.map(([a,b])=>[64+57+(a-57)*shrink,120+(-41+(b+41)*shrink)*h]),col);
  poly([[tail,-31-rise],[tail+7,-27-rise],[43,-30],[57,-43],[57,-35],[49,-24],[33,-17],[tail,-20-rise]],PX_INK);
  poly([[tail+2,-29-rise],[tail+8,-25-rise],[44,-28],[55,-39],[54,-34],[48,-26],[33,-19],[tail+2,-22-rise]],'#a7aaa5');
  poly([[tail+5,-24-rise],[34,-22],[47,-29],[54,-36],[49,-28],[34,-20],[tail+5,-22-rise]],age<4?'#f1e5cd':'#bcc0b5');
  s.blit(cell,Math.round(f.x/2)-(f.face<0?79:64)*scale,Math.round(f.y/2)-120*scale,scale,f.face<0);
}
// The chain's lifting finish leaves a rising fist wake, distinct from the low
// boot sweep. Its four active ticks are the sole clock, including during freezes.
function pxHookSweep(s,f) {
  if(f.st!=='atk'||f.move!=='p3'||f.mt<BASIC.p3.su||f.mt>=BASIC.p3.su+BASIC.p3.ac)return;
  const age=f.mt-BASIC.p3.su,h=PX_KITS[f.ch].height||1,scale=f.big>0?1.3:1;
  const cell=new PixelSurface(144,128),x=64,y=120,tail=age*7;
  const poly=(pts,col)=>cell.poly(pts.map(([a,b])=>[x+a,y+b*h]),col);
  poly([[11+tail*.6,-28-tail],[30,-37],[46,-53],[54,-74],[49,-91],[39,-102],[31,-101],[39,-84],[39,-70],[31,-54],[18,-42],[7+tail*.6,-36-tail]],PX_INK);
  poly([[13+tail*.6,-31-tail],[30,-40],[43,-55],[50,-74],[46,-89],[39,-98],[35,-99],[42,-84],[42,-70],[34,-52],[20,-40],[10+tail*.6,-35-tail]],'#a7aaa5');
  poly([[19+tail*.4,-37-tail],[32,-45],[44,-61],[47,-75],[43,-89],[38,-96],[44,-83],[44,-69],[36,-51],[23,-40]],'#f1e5cd');
  s.blit(cell,Math.round(f.x/2)-(f.face<0?79:64)*scale,Math.round(f.y/2)-120*scale,scale,f.face<0);
}
// Stun belongs to the folded/rising head, not a fixed height above the feet.
// Its existing recovery clock holds the orbit through impact/time-stop pauses.
// Paint before both bodies so the crown cannot erase either fighter's face.
function pxStunCrown(s,S,f) {
  if(f.st!=='stun'||f.inv>0&&S.t%4<2)return;
  const head=PX_POSES[pxPose(S,f)].h,h=PX_KITS[f.ch].height||1,scale=f.big>0?1.3:1;
  const x=Math.round(f.x/2)+head[0]*f.face*scale,y=Math.round(f.y/2)+(head[1]*h-25)*scale;
  for(let n=0;n<3;n++) {
    const a=-f.stT*.12+n*Math.PI*2/3,cx=Math.round(x+Math.cos(a)*24*scale),cy=Math.round(y+Math.sin(a)*5*scale);
    const points=Array.from({length:10},(_,i)=>{const t=-Math.PI/2+i*Math.PI/5,r=(i%2?3:7)*scale;return [cx+Math.cos(t)*r,cy+Math.sin(t)*r];});
    s.poly(points,'#edc16e',PX_INK);
    s.poly([[cx,cy-4*scale],[cx+2*scale,cy],[cx,cy+2*scale],[cx-3*scale,cy]],'#fff0ba');
  }
}
function pxPaintFighter(s,S,f,impact) {
  const x=Math.round(f.x/2),y=Math.round(f.y/2),scale=f.big>0?1.3:1,alt=f.i===1&&S.f[0].ch===f.ch;
  if(f.inv>0 && S.t%4<2)return;
  if(f.zone>0&&!impact)pxStatusEffect(s,S,f,'zone');
  const flash=impact ? impact.kind==='black' ? f.i===impact.a?'#f8edce':'#ed5266' : PX_INK : S.t-f.hurtT<4 ? PX_LIGHT : '';
  const {sprite,ox,oy}=pxFighterFrame(f.ch,pxPose(S,f),alt,flash);
  s.blit(sprite,x-(f.face<0?sprite.w-1-ox:ox)*scale,y-oy*scale,scale,f.face<0);
  if(f.inf>0)pxStatusEffect(s,S,f,'infinity');
  if(f.abs>0)pxStatusEffect(s,S,f,'absolute');
  else if(f.counter>0)pxStatusEffect(s,S,f,'counter');
  if(f.nails>0)for(let n=0;n<f.nails;n++)s.line([x-5+n*6,y-43+n%2*5],[x-2+n*6,y-50+n%2*5],'#e8d7bc',2);
  pxChargeCue(s,f);
  pxMaximumCharge(s,S,f);
  pxConvergenceCharge(s,S,f);
  pxVoiceCharge(s,S,f);
}
// Beam families use only the serialized zone's active age/material. Clip columns
// before painting, including the wide Maximum cones; no animation state/cache.
function pxBeam(s,z) {
  const x=Math.round(z.x/2),y=Math.round(z.y/2),face=z.face<0?-1:1;
  const age=Math.max(0,z.t||0),hw=Math.max(1,z.w/2*(1-age/z.dur)),cone=z.cone||0;
  const blood=z.col==='#d4102e',air=z.col==='#ff8a2a',phase=Math.floor(age/2)%4;
  const start=Math.max(0,face>0?-x:x-s.w+1),end=Math.min(660,face>0?s.w-1-x:x);
  for(let u=start;u<=end;u++) {
    const sx=x+face*u,h=Math.max(1,Math.floor(hw+u*cone));
    const span=(a,b,col)=>s.rect(sx,Math.max(0,y+a),1,Math.min(s.h-1,y+b)-Math.max(0,y+a)+1,col);
    if(blood) {
      // Three separated ribbons gather at the palm, then braid down the lane.
      const braid=[0,1,0,-1][(Math.floor(u/12)+phase)%4];
      for(const lane of [-1,0,1]) {
        const cy=Math.round(lane*h*.68*Math.min(1,u/18)+braid*Math.min(2,h/6));
        const r=Math.max(1,Math.round(h*(lane===0?.19:.23)));
        span(cy-r,cy-r,PX_INK);span(cy+r,cy+r,PX_INK);
        if(r>1) {span(cy-r+1,cy-r+1,'#ffb4bf');span(cy-r+2,cy,'#d4102e');span(cy+1,cy+r-1,'#790f30');}
        else span(cy,cy,'#d4102e');
      }
    } else if(air) {
      // A fine squeezed core with sparse, travelling paired pressure fins.
      const core=Math.max(1,Math.floor(h*.38)),fin=(u-phase*7+112)%28<5;
      const r=fin?h:core;
      span(-r,r,PX_INK);span(-r+1,r-1,'#ff8a2a');
      if(r>2)span(1,r-1,'#a64624');
      if(u%28<20)span(0,0,'#fff0ca');
    } else {
      // Heavy cannon: a shaded barrel of pressure and moving compression ribs.
      const rib=(u-(Math.floor(age/2)%8)*6+96)%48,edge=rib<5?0:Math.min(2,Math.floor(h/4)),r=h-edge;
      // Paint disjoint bands once rather than repeatedly filling a large cone.
      const core=Math.max(0,Math.floor(r*.12)),base=z.col||'#e7a267';
      span(-r,-r,PX_INK);span(r,r,PX_INK);span(-core,core,rib<5?'#ffd599':PX_LIGHT);
      if(rib<2&&r>4) {span(-r+1,-core-1,'#995335');span(core+1,r-1,'#995335');}
      else {
        const top=r>3?-Math.ceil(r*.5):-r,bottom=r>2?Math.ceil(r*.38):r;
        span(-r+1,top,'#ffd599');span(top+1,-core-1,base);
        span(core+1,bottom-1,base);span(bottom,r-1,'#995335');
      }
    }
  }
}
// Lingering effects use their existing active age, including the exact simulation
// detonation ages. No event history, global clock, cache or new match fields.
function pxLingeringZone(s,z,paint) {
  // Rasterize at one integer origin before clipping. Floating polygon/line math
  // must not change a boundary pixel when a snapshot moves across a screen edge.
  const cell=new PixelSurface(168,168);paint(cell,{...z,x:168,y:168});
  s.blit(cell,Math.round(z.x/2)-84,Math.round(z.y/2)-84);
}
function pxAttraction(s,z) {
  const x=Math.round(z.x/2),y=Math.round(z.y/2),t=Math.max(0,z.t||0);
  if(t<48) {
    // Three inward-moving hooked streams disappear behind a faceted dark well.
    for(let n=0;n<3;n++) {
      const r=80-(t*2+n*22)%66,points=[];
      for(let i=0;i<8;i++) {
        const a=n*Math.PI*2/3+i*.18,rr=Math.max(8,r-i*2);
        points.push([x+Math.cos(a)*rr,y+Math.sin(a)*rr*.8]);
      }
      for(const [col,width]of [[PX_INK,4],['#3869a9',3],['#87c9e7',1]])
        for(let i=1;i<points.length;i++)s.line(points[i-1],points[i],col,width);
    }
    const r=17-Math.max(0,t-40),oct=[[0,-1],[.7,-.7],[1,0],[.7,.7],[0,1],[-.7,.7],[-1,0],[-.7,-.7]];
    s.poly(oct.map(([a,b])=>[x+a*r,y+b*r]),'#214477',PX_INK);
    s.poly([[x-r+2,y],[x-r*.6,y-r*.6],[x,y-r+2],[x+r*.6,y-r*.6],[x,y-2]],'#87c9e7');
    s.poly([[x-r+2,y],[x,y-2],[x+r-2,y],[x,y+r-2]],'#3869a9');
    s.poly([[x,y-r*.5],[x+r*.35,y],[x,y+r*.5],[x-r*.35,y]],PX_INK);
  } else {
    // The pull is spent at tick 48: open the core and disperse six shaded shards.
    const age=t-48,r=18+age*2,len=Math.max(3,9-Math.floor(age/2));
    for(let n=0;n<6;n++) {
      const a=n*Math.PI/3,c=Math.cos(a),d=Math.sin(a),cx=x+c*r,cy=y+d*r*.8;
      const point=(u,v)=>[cx+c*u-d*v,cy+d*u*.8+c*v];
      s.poly([point(-len,0),point(0,-3),point(len,0),point(0,3)],'#3869a9',PX_INK);
      s.line(point(-len+2,0),point(len-2,0),'#87c9e7');
    }
  }
}
function pxCutMark(s,z) {
  const x=Math.round(z.x/2),y=Math.round(z.y/2),t=Math.max(0,z.t||0);
  if(t<z.delay) {
    // Four contracting corners frame the place being cut, leaving its body clear.
    const r=Math.round(z.r/2*(1.4-.4*t/z.delay)),corner=Math.round(r*.72);
    for(const a of [-1,1])for(const b of [-1,1]) {
      const points=[[x+a*(corner-10),y+b*corner],[x+a*corner,y+b*corner],[x+a*corner,y+b*(corner-10)]];
      for(const [col,width]of [[PX_INK,4],['#9acfd5',2]])for(let i=1;i<points.length;i++)s.line(points[i-1],points[i],col,width);
      s.line([x+a*(corner-4),y+b*(corner+2)],[x+a*(corner+2),y+b*(corner-4)],'#477d8d');
    }
  } else {
    // Crossed cut planes replace the generic star. They shrink through the tail.
    const age=t-z.delay,r=Math.max(7,Math.round(z.r/2*(1-age/(z.dur-z.delay))));
    for(const face of [-1,1]) {
      const p=(u,v)=>[x+u,y+face*u*.66+v];
      s.poly([p(-r,0),p(-r*.2,-3),p(r,0),p(r*.2,3)],'#477d8d',PX_INK);
      s.line(p(-r+3,0),p(r-3,0),'#c7e9de');
    }
    if(age<8)for(const a of [-1,1])for(const b of [-1,1]) {
      const u=12+age*2;s.line([x+a*u,y+b*(u-5)],[x+a*(u+4),y+b*u],PX_INK,3);
      s.line([x+a*u,y+b*(u-5)],[x+a*(u+4),y+b*u],'#9acfd5');
    }
  }
}
function pxLandingWarning(s,z) {
  if(z.t>=z.dur)return;
  // Lock the outer width. Only the inner fuse closes; the destination never tracks
  // the defender after the simulation creates this zone. Age is snapshot-owned.
  const r=Math.round(z.r/2),ox=r+4,oy=38,cell=new PixelSurface(ox*2+1,51);
  const age=Math.max(0,z.t||0),u=clamp(age/z.dur,0,1),phase=Math.min(5,Math.floor(u*6));
  const shade='#945c43',col='#df985f',light='#f0d19b';
  const line=(a,b,c,w=1)=>cell.line([ox+a[0],oy+a[1]],[ox+b[0],oy+b[1]],c,w);
  // Broad gold rails and tall end posts survive a native-size full-scene view.
  // Keep the same boundary positions and floor lane; add filled value.
  for(const side of [-1,1]) {
    const pts=[[side*10,-8],[side*(r-15),-6],[side*r,0],[side*(r-15),6],[side*10,7]];
    for(const [c,w]of [[PX_INK,6],[col,4]])for(let n=1;n<pts.length;n++)line(pts[n-1],pts[n],c,w);
    line([side*12,-8],[side*(r-15),-6],shade,2);
    line([side*(r-14),-5],[side*(r-3),-1],light,2);
    line([side*12,7],[side*(r-13),6],light,2);
    line([side*r,-17],[side*r,6],PX_INK,7);line([side*r,-16],[side*r,5],col,5);
    line([side*r,-15],[side*r,-5],light,3);
    // Paired inward teeth close in six legible steps, separate from the boundary.
    const a=15+(5-phase)*8;
    const teeth=[[side*(a+8),-17],[side*a,-10],[side*(a+8),-3]];
    for(const [c,w]of [[PX_INK,6],[light,4]])for(let n=1;n<teeth.length;n++)line(teeth[n-1],teeth[n],c,w);
  }
  // A descending tip marks the landing center without covering the upper body.
  const h=-34+phase*4;
  cell.poly([[ox-7,oy+h],[ox,oy+h+6],[ox+7,oy+h],[ox,oy+h+12]],col,PX_INK);
  line([-4,h+2],[0,h+6],light,2);line([-4,0],[4,0],PX_INK,6);line([-3,0],[3,0],light,4);
  // Reflect the finished left half so polygon scan rounding cannot bias the cue.
  for(let y=0;y<cell.h;y++)for(let x=0;x<ox;x++) {
    const p=(y*cell.w+x)*4,q=(y*cell.w+2*ox-x)*4;
    for(let c=0;c<4;c++)cell.data[q+c]=cell.data[p+c];
  }
  s.blit(cell,Math.round(z.x/2)-ox,Math.round(z.y/2)-oy);
}
function pxZone(s,S,z) {
  const x=z.x/2,y=z.y/2,t=z.t;
  if(z.k==='blue')pxLingeringZone(s,z,pxAttraction);
  if(z.k==='beam')pxBeam(s,z);
  if(z.k==='pebble')pxProjectile(s,{k:'stone',x:z.x,y:z.y,r:7,vx:0,vy:0,t});
  if(z.k==='tongue')pxToad(s,z);
  if(z.k==='mark')pxLingeringZone(s,z,pxCutMark);
  if(z.k==='trap') {s.line([x,306],[x+3,293],PX_INK,3);s.line([x,306],[x+3,293],'#c1c1b0');s.rect(x,291,6,3,'#d8ad78');}
  if(z.k==='target')pxLandingWarning(s,z);
}
// Web's three automatic volleys use their serialized Domain clock, including
// during pauses. The open center is a tell, never an escape/collision boundary.
function pxWebVolley(s,S) {
  const d=S.dom;
  if(!d||d.k!=='web'||S.phase!=='fight'||d.t<1||d.t>=70)return;
  const f=S.f[d.o],o=S.f[1-d.o];
  if(f.st==='ko'||o.st==='ko')return;
  const hits=[14,38,62],last=hits.filter(t=>t<=d.t).pop();
  const snap=last!==undefined&&d.t-last<6;
  const next=hits.find(t=>t>d.t);
  if(!snap&&next===undefined)return;
  const index=hits.indexOf(snap?last:next),face=index%2?-1:1;
  const start=index===0?1:hits[index-1]+6;
  const phase=snap?Math.floor((d.t-last)/2):Math.min(2,Math.floor((d.t-start)/(next-start)*3));
  const cell=new PixelSurface(256,128),ox=128,oy=64;
  const shade=['#72435f','#a35d83','#cd8dac'][snap?2:phase];
  const body=['#bc78a0','#e8a3c9','#ffe1ed'][snap?2:phase],light='#ffe1ed';
  // Separated taut pairs frame the body. Broad ribbons read against a full scene.
  for(const lane of [-1,0,1])for(const side of [-1,1]) {
    const tip=snap?13+phase*9:40-phase*9;
    const a=[ox+side*119,oy+lane*43],b=[ox+side*tip,oy+lane*(snap?15:24)];
    const mid=[ox+side*(snap?72:86-phase*8),oy+lane*(snap?35:28)+(snap?side*(phase-1)*5:side*(2-phase)*5)];
    cell.poly([[a[0],a[1]-3],mid,[b[0],b[1]-2],[b[0],b[1]+2],[mid[0],mid[1]+6],[a[0],a[1]+3]],shade,PX_INK);
    cell.line(a,mid,body,3);cell.line(mid,b,body,3);
    cell.line([a[0],a[1]-1],[mid[0],mid[1]-1],light);
    if(snap)cell.poly([[b[0]+side*5,b[1]-5],[b[0]-side*4,b[1]],[b[0]+side*5,b[1]+5]],body,PX_INK);
  }
  s.blit(cell,Math.round(o.x/2)-(face<0?255-ox:ox),Math.round((o.y-70)/2)-oy,1,face<0);
}
// The rite's nails arrive on its existing hits; the large hammer prepares the
// final blow above the face lane. These are ritual images, not collision shapes.
function pxEffigyRite(s,S) {
  const d=S.dom;
  if(!d||d.k!=='effigy'||S.phase!=='fight'||d.t<1||d.t>=66)return;
  const f=S.f[d.o],o=S.f[1-d.o];
  if(f.st==='ko'||o.st==='ko')return;
  const cell=new PixelSurface(224,224),ox=112,oy=178,t=d.t;
  const point=(x,y)=>[ox+x,oy+y];
  const poly=(pts,c)=>cell.poly(pts.map(([x,y])=>point(x,y)),c,PX_INK);
  const line=(a,b,c,w=1)=>cell.line(point(...a),point(...b),c,w);
  const starts=[1,14,28],hits=[10,24,38],spots=[[-58,-26],[58,-26],[0,-92]];
  for(let n=0;n<3;n++) {
    if(t<starts[n])continue;
    const seated=t>=hits[n],phase=seated?2:Math.min(2,Math.floor((t-starts[n])/(hits[n]-starts[n])*3));
    const x=spots[n][0],y=spots[n][1]-(seated?0:(2-phase)*8);
    const shade=['#7a5944','#9f764c','#b58a58'][phase],body=['#cf9f68','#e6b77a','#ffe1a1'][phase];
    // A wide square head and bevelled shank keep the nail identifiable at 1x.
    poly([[x-4,y-8],[x+4,y-8],[x+4,y+11],[x,y+19],[x-4,y+11]],shade);
    line([x-1,y-6],[x-1,y+10],body,3);
    poly([[x-11,y-13],[x+11,y-13],[x+11,y-5],[x-11,y-5]],body);
    line([x-8,y-11],[x+8,y-11],'#ffeac0',2);
    line([x-8,y-6],[x+8,y-6],shade,2);
    const impact=t-hits[n];
    if(impact>=0&&impact<4)for(const side of [-1,1]) {
      line([x+side*14,y-14],[x+side*(21+impact*2),y-19],PX_INK,4);
      line([x+side*14,y-14],[x+side*(21+impact*2),y-19],'#ffeac0',2);
    }
  }
  if(t>=42) {
    const strike=t>=60,phase=strike?2:Math.min(2,Math.floor((t-42)/6));
    const x=strike?0:30-phase*10,y=strike?-116-Math.floor((t-60)/2)*5:-153+phase*7;
    const shade=['#725044','#a2724e','#c59160'][phase],body=['#cf9f68','#e6b77a','#ffe1a1'][phase];
    // Long diagonal grip and broad bevelled head; the drop meets the top nail.
    line([x+12,y],[x+62,y+24],PX_INK,10);line([x+12,y],[x+62,y+24],shade,7);
    line([x+17,y-1],[x+59,y+19],body,2);
    poly([[x-27,y-13],[x+24,y-13],[x+29,y-8],[x+29,y+8],[x+23,y+13],[x-27,y+13],[x-31,y+8],[x-31,y-8]],shade);
    poly([[x-25,y-10],[x+21,y-10],[x+24,y-6],[x+24,y+5],[x-25,y+5]],body);
    line([x-23,y-8],[x+20,y-8],'#ffeac0',3);
    line([x-18,y+7],[x+18,y+7],shade,3);
    if(strike)for(const side of [-1,1]) {
      const spread=20+(t-60)*5;
      line([side*15,-102],[side*spread,-94],PX_INK,5);
      line([side*15,-102],[side*spread,-94],'#ffeac0',3);
    }
  }
  const flip=d.o===1;
  s.blit(cell,Math.round(o.x/2)-(flip?cell.w-1-ox:ox),Math.round((o.y-70)/2)-oy,1,flip);
}
// Shrine's flank planes mark its existing sixteen-tick rhythm. The open center
// is a readability lane, not a safe area or an attack's collision boundary.
function pxShrineRhythm(s,S) {
  const d=S.dom;
  if(!d||d.k!=='shrine'||S.phase!=='fight'||d.t<1||d.t>=192)return;
  const f=S.f[d.o],o=S.f[1-d.o];
  if(f.st==='ko'||o.st==='ko')return;
  const beat=Math.floor(d.t/16),age=d.t%16,snap=beat>0&&age<4;
  const phase=snap?Math.floor(age/2):Math.min(2,Math.floor((age-(beat?4:1))/(beat?4:5)));
  const cell=new PixelSurface(224,144),ox=112,oy=100;
  const shade=['#854353','#b56b7a','#d5a0a4'][snap?2:phase];
  const body=['#ce7188','#efa8b8','#ffe0dc'][snap?2:phase],light='#fff1df';
  const poly=(pts,c)=>cell.poly(pts.map(([x,y])=>[ox+x,oy+y]),c,PX_INK);
  const line=(a,b,c,w=1)=>cell.line([ox+a[0],oy+a[1]],[ox+b[0],oy+b[1]],c,w);
  // Broad, bevelled incisions alternate their slope each volley. They approach
  // from the flanks, staying outside the actor tag, face and body at every phase.
  for(const side of [-1,1]) {
    const tip=snap?34+phase*8:50-phase*8,tail=snap?96+phase*5:108-phase*3;
    const slope=beat%2?-1:1;
    const at=(x,y)=>[side*x,-25+y*slope];
    poly([at(tip,-12),at(tail,-42),at(tail-8,-24),at(tip+6,0)],shade);
    poly([at(tip+3,-11),at(tail-3,-39),at(tail-12,-27),at(tip+8,-4)],body);
    line(at(tip+7,-11),at(tail-8,-35),light,2);
    poly([at(tip,20),at(tail-8,44),at(tail-15,28),at(tip+8,10)],shade);
    poly([at(tip+4,19),at(tail-12,40),at(tail-18,29),at(tip+10,14)],body);
    line(at(tip+8,19),at(tail-17,36),light,2);
    if(snap)for(const y of [-30,25]) {
      const x=tip+10;
      poly([at(x,y-5),at(x+13,y-2),at(x+18,y+5),at(x+4,y+2)],body);
    }
  }
  const flip=d.o===1;
  s.blit(cell,Math.round(o.x/2)-(flip?cell.w-1-ox:ox),Math.round((o.y-70)/2)-oy,1,flip);
}
// Seven existing eight-tick cuts: broad split folds prepare, then spring apart.
// The clear center preserves the fighter; these images are not safe-area bounds.
function pxJceRhythm(s,S) {
  const d=S.dom;
  if(!d||d.k!=='jce'||S.phase!=='fight'||d.t<1||d.t>=60)return;
  const f=S.f[d.o],o=S.f[1-d.o];
  if(f.st==='ko'||o.st==='ko')return;
  const beat=Math.floor(d.t/8),age=d.t%8,snap=beat>0&&age<4;
  const phase=snap?Math.floor(age/2):beat?Math.min(2,Math.max(0,age-5)):Math.min(2,Math.floor((age-1)/2));
  const cell=new PixelSurface(224,144),ox=112,oy=100;
  const shade=['#426e79','#6ba1ab','#a0cbd0'][snap?2:phase];
  const body=['#88bac5','#b7e4e8','#e4fffa'][snap?2:phase],light='#f4fff5';
  const poly=(pts,c)=>cell.poly(pts.map(([x,y])=>[ox+x,oy+y]),c,PX_INK);
  const line=(a,b,c,w=1)=>cell.line([ox+a[0],oy+a[1]],[ox+b[0],oy+b[1]],c,w);
  // Four angular folded plates close in broad value steps. The alternating
  // stagger changes on contact; recoil opens the cut without covering the face.
  for(const side of [-1,1])for(const vertical of [-1,1]) {
    const tip=snap?34+phase*13:52-phase*9,tail=snap?103+phase*5:108-phase*3;
    const stagger=side*(beat%2?1:-1)*3;
    const at=(x,y)=>[side*x,-25+vertical*(y+25+(snap?phase*7:0))+stagger];
    poly([at(tip,-43),at(tip+18,-65),at(tail,-65),at(tail,-49),at(tip+25,-49),at(tip+9,-32)],shade);
    poly([at(tip+4,-43),at(tip+20,-62),at(tail-3,-62),at(tail-3,-53),at(tip+23,-53),at(tip+9,-37)],body);
    line(at(tip+12,-48),at(tip+22,-60),light,2);
    line(at(tip+22,-60),at(tail-6,-60),light,2);
    if(snap)poly([at(tip+4,-27),at(tip+22,-35),at(tip+29,-31),at(tip+11,-23)],body);
  }
  const flip=d.o===1;
  s.blit(cell,Math.round(o.x/2)-(flip?cell.w-1-ox:ox),Math.round((o.y-70)/2)-oy,1,flip);
}
// Ovation's existing swaps alternate right/left, irrespective of the actor slot.
// Broad imbued stones count toward the next clap; they are not collision shapes.
function pxOvationRhythm(s,S) {
  const d=S.dom;
  if(!d||d.k!=='ovation'||S.phase!=='fight'||d.t<1||d.t>=75)return;
  const f=S.f[d.o],o=S.f[1-d.o];
  if(f.st==='ko'||o.st==='ko')return;
  const beat=Math.floor((d.t-1)/14),age=(d.t-1)%14,snap=age<4;
  const phase=snap?Math.floor(age/2):Math.min(2,Math.floor((age-4)/4));
  const side=(beat+(snap?0:1))%2?-1:1;
  const cell=new PixelSurface(224,144),ox=112,oy=100;
  const poly=(pts,c)=>cell.poly(pts.map(([x,y])=>[ox+x,oy+y]),c,PX_INK);
  const line=(a,b,c,w=1)=>cell.line([ox+a[0],oy+a[1]],[ox+b[0],oy+b[1]],c,w);
  // The inactive stone stays dim. The next swap's side closes and grows pale.
  for(const lane of [-1,1]) {
    const lit=lane===1,p=lit?(snap?2:phase):0;
    const shade=['#725936','#a88248','#c6a46b'][p],body=['#cca368','#e1bd75','#ffe8a5'][p];
    const x=lane*(lit?(snap?62+phase*9:76-phase*8):83),y=-29;
    poly([[x-15,y-15],[x+8,y-18],[x+20,y-7],[x+16,y+13],[x-8,y+18],[x-20,y+5]],shade);
    poly([[x-12,y-12],[x+7,y-14],[x+15,y-5],[x+11,y+6],[x-8,y+10],[x-15,y+2]],body);
    line([x-10,y-10],[x+6,y-12],lit?'#fff2ce':'#dfbd82',3);
    line([x-6,y+13],[x+12,y+8],shade,3);
    if(lit) {
      // Paired inward brackets close like palms, then open away from the clap.
      const spread=snap?23+phase*7:33-phase*6;
      for(const v of [-1,1]) {
        const a=[x-lane*17,y+v*spread],b=[x-lane*28,y+v*(spread-7)],c=[x-lane*20,y+v*(spread-13)];
        line(a,b,PX_INK,7);line(b,c,PX_INK,7);
        line(a,b,body,4);line(b,c,body,4);
      }
    }
  }
  // Mirror the finished cell about the defender's exact root, not its bounds.
  const flip=side<0;
  s.blit(cell,Math.round(o.x/2)-(flip?cell.w-1-ox:ox),Math.round((o.y-70)/2)-oy,1,flip);
}
// Finite authored cells, mirrored after rasterization. Active clocks and velocity
// come from the existing snapshot; rendering never adds animation state to it.
const PX_SUMMONS=new Map();
function pxSummonFrame(e,S) {
  const phase=Math.floor((e.t||0)/5)%4,target=S&&S.f[1-e.o];
  const mode=e.k==='dog' ? e.bite>0 ? (e.bite>5?'bite':'release') : target&&Math.abs(target.x-e.x)<=46?'wait':'run' : e.done?'glide':'flap';
  const tilt=e.k==='nue'?Math.round(clamp(Math.atan2(e.vy||0,Math.abs(e.vx||0)),-.8,.8)/.4):0;
  const key=[e.k,!!e.v,mode,mode==='run'||mode==='flap'?phase:0,tilt].join(':');
  if(PX_SUMMONS.has(key))return PX_SUMMONS.get(key);
  const sprite=new PixelSurface(144,112),ox=72,oy=e.k==='dog'?96:56;
  const angle=tilt*.4,co=Math.cos(angle),si=Math.sin(angle);
  const at=([a,b])=>[ox+a*co-b*si,oy+a*si+b*co];
  const poly=(pts,col,outline=PX_INK)=>sprite.poly(pts.map(at),col,outline);
  const line=(a,b,col,w=1)=>sprite.line(at(a),at(b),col,w);
  const dot=(a,b,col)=>sprite.dot(...at([a,b]),col);
  if(e.k==='dog') {
    const color=e.v?'#625774':'#c9c5cf',shade=e.v?'#393449':'#827d98',light=e.v?'#9484a6':'#efdfd7';
    const run=mode==='run',bite=mode==='bite',release=mode==='release',bob=run?[0,2,4,-3][phase]:bite?1:0;
    // Gather each leg under its own shoulder/haunch. Separated, outlined toes
    // remain visible during both tucked bounds instead of merging at the belly.
    const legs=[[[[-14,-13],[-20,-8],[-27,-2]],[[13,-13],[21,-8],[28,-2]]],[[[-14,-11],[-16,-6],[-19,-2]],[[13,-11],[17,-6],[13,-2]]],[[[-14,-10],[-23,-7],[-15,-3]],[[13,-10],[7,-6],[21,-3]]],[[[-14,-16],[-22,-10],[-9,-6]],[[13,-16],[16,-10],[25,-8]]]];
    const feet=run?legs[phase]:[[[-14,-12],[-21,-7],[-23,-1]],[[14,-12],[19,-7],[bite?29:23,-1]]];
    const limb=(pts,far)=>{
      for(let n=1;n<pts.length;n++) {
        const end=n===2?[pts[n][0],pts[n][1]-2]:pts[n];
        line(pts[n-1],end,PX_INK,6);line(pts[n-1],end,far?shade:color,4);
        if(!far)line([pts[n-1][0]-1,pts[n-1][1]-1],[end[0]-1,end[1]-1],light);
      }
      const [a,b]=pts[2];poly([[a-4,b-3],[a+2,b-3],[a+5,b-1],[a+5,b],[a-4,b]],far?shade:color);
      if(!far){line([a-2,b-2],[a+1,b-2],light);dot(a+2,b-1,shade);}
    };
    feet.forEach(pts=>limb(pts.map(([a,b])=>[a-4,b-3]),true));
    poly([[-14,-18+bob],[-30,-30+bob],[-28,-35+bob],[-21,-27+bob],[-10,-23+bob]],shade);
    poly([[-20,-16+bob],[-19,-23+bob],[-7,-28+bob],[12,-26+bob],[20,-17+bob],[13,-10+bob],[-12,-10+bob]],color);
    poly([[-17,-16+bob],[-2,-18+bob],[14,-17+bob],[11,-11+bob],[-11,-11+bob]],shade,false);
    poly([[-15,-22+bob],[-6,-26+bob],[8,-25+bob],[13,-21+bob],[0,-20+bob]],light,false);
    line([-17,-20+bob],[-16,-15+bob],shade);line([12,-22+bob],[15,-18+bob],shade);
    feet.forEach(pts=>limb(pts,false));
    const hx=bite?5:release?2:0,hy=bob;
    poly([[10+hx,-24+hy],[12+hx,-36+hy],[18+hx,-30+hy],[22+hx,-33+hy],[25+hx,-23+hy],[33+hx,-20+hy],[31+hx,-15+hy],[14+hx,-15+hy]],color);
    poly([[13+hx,-24+hy],[16+hx,-21+hy],[28+hx,-20+hy],[30+hx,-17+hy],[15+hx,-16+hy]],shade,false);
    poly([[15+hx,-29+hy],[17+hx,-33+hy],[21+hx,-27+hy],[28+hx,-22+hy],[23+hx,-22+hy]],light,false);
    dot(23+hx,-26+hy,'#c8a2e1');dot(24+hx,-26+hy,PX_INK);
    line([31+hx,-20+hy],[34+hx,-20+hy],PX_INK,3);
    poly([[18+hx,-16+hy],[32+hx,-16+hy],[bite?33+hx:30+hx,(bite?-7:-12)+hy],[20+hx,(bite?-8:-12)+hy]],shade);
    if(bite) {line([25+hx,-15+hy],[27+hx,-12+hy],PX_LIGHT,2);line([30+hx,-15+hy],[29+hx,-12+hy],PX_LIGHT);}
  } else if(e.k==='nue') {
    const wings=[[[0,0],[-17,-21],[-39,-37],[-32,-38],[-23,-31],[-18,-36],[-9,-26],[5,-8]],[[0,0],[-18,-12],[-46,-14],[-41,-8],[-36,-10],[-29,-3],[-20,-7],[-7,7]],[[0,-2],[-12,11],[-25,38],[-18,34],[-14,26],[-9,30],[-7,16],[7,2]],[[0,0],[-6,-17],[-23,-27],[-25,-21],[-16,-12],[-16,2],[-4,8]]];
    const wing=mode==='glide'?[[0,0],[-20,-8],[-42,-4],[-31,2],[-20,1],[-8,9]]:wings[phase];
    const shade='#77523e',color='#c18b50',light='#f0cd8c';
    poly(wing.map(([a,b])=>[a-4,b-4]),shade);
    poly([[-9,-3],[-29,-2],[-35,8],[-20,9],[-8,5]],shade);
    poly([[-12,-7],[7,-10],[20,-4],[15,6],[-4,8]],color);
    poly([[-9,1],[3,3],[15,0],[13,5],[-4,7]],shade,false);
    line([-8,-6],[5,-8],light,2);
    poly(wing,shade);
    // Three broad feather tiers retain a navy silhouette and dark trailing tips.
    const center=wing.reduce((p,q)=>[p[0]+q[0]/wing.length,p[1]+q[1]/wing.length],[0,0]);
    const inset=(p,k)=>[center[0]+(p[0]-center[0])*k,center[1]+(p[1]-center[1])*k];
    poly(wing.map(p=>inset(p,.79)),color,false);
    const lead=[wing[0],wing[1],wing[2]].map(p=>inset(p,.66));
    line(lead[0],lead[1],light,2);line(lead[1],lead[2],light,2);
    for(let n=3;n<wing.length-1;n+=2)line(inset(wing[n],.58),inset(wing[n],.9),shade);
    poly([[12,-10],[20,-14],[28,-10],[26,-2],[16,2]],'#e8d6b5');
    poly([[15,-3],[24,-4],[26,-8],[25,-2],[17,1]],'#af9276',false);
    line([18,-11],[22,-12],PX_LIGHT,2);
    poly([[26,-7],[35,-3],[26,0]],color);line([27,-5],[30,-4],light);line([20,-10],[25,-10],PX_INK,2);
    line([4,7],[8,13],PX_INK,4);line([4,7],[8,12],color,2);line([8,13],[14,12],PX_INK,3);line([9,12],[13,12],light);
  }
  const frame={sprite,ox,oy};PX_SUMMONS.set(key,frame);return frame;
}
function pxSummon(s,e,S) {
  if(e.k!=='dog'&&e.k!=='nue')return;
  const {sprite,ox,oy}=pxSummonFrame(e,S),flip=e.face<0;
  s.blit(sprite,Math.round(e.x/2)-(flip?sprite.w-1-ox:ox),Math.round(e.y/2)-oy,1,flip);
}
function pxToad(s,z) {
  const x=Math.round(z.x/2),y=Math.round(z.y/2),f=z.face<0?-1:1,u=clamp(z.t/z.dur,0,1);
  const phase=u<.2?0:u<.65?1:2,key='toad:'+phase;
  if(!PX_SUMMONS.has(key)) {
    const cell=new PixelSurface(96,64),ox=48,oy=60,stretch=[0,4,-2][phase];
    const poly=(pts,col,outline=PX_INK)=>cell.poly(pts.map(([a,b])=>[ox+a,oy+b]),col,outline);
    for(const side of [-1,1]) {
      poly([[side*10,-13],[side*23,-15],[side*29,-6],[side*23,-1],[side*12,-2]],'#4e477c');
      poly([[side*24,-6],[side*28,-5],[side*30,-2],[side*23,-3]],'#8279a8',false);
      poly([[side*24,-3],[side*30,-3],[side*33,-1],[side*23,-1]],'#8279a8');
      cell.line([ox+side*25,oy-2],[ox+side*29,oy-2],'#bdb2d4');
    }
    poly([[-19,-5],[-18,-17-stretch],[-9,-24-stretch],[10,-24-stretch],[21,-15],[23,-5],[12,-2],[-11,-2]],'#8279a8');
    poly([[-17,-9],[-5,-7],[16,-9],[20,-6],[11,-3],[-10,-3]],'#4e477c',false);
    poly([[-13,-19-stretch],[7,-22-stretch],[14,-17],[5,-13],[-12,-12]],'#bdb2d4',false);
    for(const a of [-10,8]) {cell.rect(ox+a-4,oy-27-stretch,9,9,PX_INK);cell.rect(ox+a-3,oy-26-stretch,7,7,PX_LIGHT);cell.rect(ox+a+1,oy-24-stretch,2,4,PX_INK);}
    cell.line([ox+8,oy-14],[ox+22,oy-14],PX_INK,phase===1?7:3);
    for(const [a,b]of [[-10,-5],[11,17]]) {
      cell.line([ox+a,oy-12],[ox+b,oy-2],PX_INK,5);cell.line([ox+a,oy-12],[ox+b,oy-2],'#8279a8',3);
      cell.line([ox+a-1,oy-11],[ox+b-1,oy-3],'#bdb2d4');
    }
    PX_SUMMONS.set(key,{sprite:cell,ox,oy});
  }
  const k=Math.sin(u*Math.PI),reach=z.hitFoe?Math.max(k,.25):k,mouth=[x+f*18,y-14];
  const tip=[mouth[0]+(z.tx/2-mouth[0])*reach,mouth[1]-16*reach];
  s.line(mouth,tip,PX_INK,8);s.line(mouth,tip,'#c67e9c',5);
  s.line(mouth,[tip[0],tip[1]-1],'#e7a4bc');
  const {sprite,ox,oy}=PX_SUMMONS.get(key);s.blit(sprite,x-(f<0?sprite.w-1-ox:ox),y-oy,1,f<0);
}
function pxProjectileColor(p) {return p.col||({cut:'#e79b9b',red:'#df798b',flame:'#eaaa65',shell:'#c5bd8c',pellet:'#edd095',gum:'#dc8fb8',nail:'#d7cfc0',knife:'#f0d997',stone:'#9e9d91',wave:'#bca782'})[p.k]||'#c2d8d1';}
function pxProjectileTrail(s,p) {
  const speed=Math.hypot(p.vx||0,p.vy||0),age=Math.max(0,p.t||0);
  if(speed<.5 || age<1 || p.life<=0)return;
  // Current velocity gives a short directional wake, not a second collision silhouette.
  // Age limits its birth length; lifetime thins it before expiry. No history on simulation objects.
  const dx=(p.vx||0)/speed,dy=(p.vy||0)/speed,nx=-dy,ny=dx,x=p.x/2,y=p.y/2;
  const blade=['cut','knife','nail'].includes(p.k),solid=p.k==='stone',smoke=p.k==='shell',beads=p.k==='gum';
  const length=Math.min(blade?34:solid?25:52,speed*Math.min(age,6)/2)*Math.min(1,(p.life===undefined?8:p.life)/6);
  const width=blade?2:solid?2:smoke?4:Math.min(7,(p.r||10)/3),col=pxProjectileColor(p);
  const pt=(d,off=0)=>[x-dx*d+nx*off,y-dy*d+ny*off],phase=Math.floor(age/3)%3;
  if(solid || smoke || beads) {
    for(let n=1;n<=4;n++) {
      const d=length*(n+phase*.18)/4;if(d>length)continue;
      const [cx,cy]=pt(d,(n%2?1:-1)*(solid?2:1)),r=Math.max(1,width*(1-n/5));
      s.poly([[cx-r,cy],[cx,cy-r],[cx+r,cy],[cx,cy+r]],smoke?'#767c7b':solid?'#847c70':'#9a698e');
      if(n<3)s.dot(cx,cy,smoke?'#c0bba8':col);
    }
  } else {
    s.poly([pt(2,-width),pt(length*.62,-width*.4),pt(length),pt(length*.62,width*.4),pt(2,width)],'#555565');
    s.line(pt(2),pt(length*.64),col,blade?1:2);
    for(let n=0;n<2;n++) {
      const d=length*(.7+n*.18),off=(n?1:-1)*(3+phase);
      s.line(pt(d,off),pt(Math.min(length,d+4),off),n?col:'#92929a');
    }
  }
}
// Original body families, separate from the existing velocity-aligned wakes.
// Rasterize facing right, then mirror the completed cell about its center pixel.
// Only projectile age selects a phase; freezes and transported snapshots hold it.
const PX_PROJECTILE_BODIES=new Map();
function pxProjectileBody(p) {
  if(!['red','flame','orb','pellet','gum','knife','nail','cut','wave','stone','shell'].includes(p.k))return null;
  const r=Math.max(3,(p.r||9)/2),col=pxProjectileColor(p),phase=Math.floor(Math.max(0,p.t||0)/4)%4;
  const moving=p.k==='red'||p.k==='flame'||p.k==='gum'||p.k==='orb';
  const frame=moving?phase:0,key=[p.k,r,col,!!p.spin,!!p.ground,frame].join(':');
  if(PX_PROJECTILE_BODIES.has(key))return PX_PROJECTILE_BODIES.get(key);
  const ox=Math.ceil(Math.max(32,r*3+6)),oy=Math.ceil(Math.max(24,r*1.6+6)),sprite=new PixelSurface(ox*2+1,oy*2+1);
  const poly=(pts,c=col,outline=PX_INK)=>sprite.poly(pts.map(([a,b])=>[ox+a,oy+b]),c,outline);
  const line=(a,b,c,w=1)=>sprite.line([ox+a[0],oy+a[1]],[ox+b[0],oy+b[1]],c,w);
  const ellipse=(x,y,rx,ry,c)=>sprite.ellipse(ox+x,oy+y,rx,ry,c);
  const mix=(a,b,t)=>'#'+pxRGB(a).slice(0,3).map((v,i)=>Math.round(v*(1-t)+pxRGB(b)[i]*t).toString(16).padStart(2,'0')).join('');
  const shade=mix(col,PX_INK,.55),light=mix(col,PX_LIGHT,.65);
  if(p.k==='cut') {
    // A broad bevelled slash: a rose back, shadowed lower fold and pale edge.
    poly([[-24,-3],[6,-10],[18,-8],[8,-2],[-4,9],[-20,11],[-8,1]],col);
    poly([[-19,8],[-6,0],[14,-7],[7,-1],[-5,8]],shade,false);
    poly([[-20,-2],[5,-8],[13,-8],[-7,0],[-17,6],[-11,0]],light,false);
    line([-16,7],[10,-6],PX_LIGHT,2);
  } else if(p.k==='wave'&&p.ground) {
    // Low folded earth crests keep their feet above the existing floor line.
    poly([[-23,11],[-19,2],[-13,3],[-7,-14],[-1,-18],[3,-8],[10,-21],[15,-20],[12,-7],[18,3],[18,11]],col);
    poly([[-20,9],[-12,5],[-5,-9],[-2,-12],[1,-3],[10,-13],[8,-3],[14,5],[15,10]],shade,false);
    poly([[-17,2],[-13,3],[-7,-14],[-2,-16],[-8,1],[-13,7],[-20,9]],light,false);
    poly([[3,-6],[10,-20],[13,-19],[9,-6],[12,1],[8,3]],light,false);
    line([-15,9],[13,9],col,2);
  } else if(p.k==='wave') {
    // An upright pressure sail, hollow behind its broad shaded leading edge.
    poly([[-20,12],[-15,-3],[-10,-19],[1,-28],[9,-28],[2,-15],[5,-5],[0,12]],col);
    poly([[-17,10],[-11,-5],[-6,-18],[2,-25],[5,-26],[-1,-14],[1,-4],[-3,10]],shade,false);
    poly([[-11,-17],[1,-27],[7,-27],[0,-14],[3,-5],[-1,8],[-4,9],[0,-5],[-4,-14]],light,false);
    line([-8,-17],[2,-26],PX_LIGHT,2);
  } else if(p.k==='stone') {
    // Shared by the thrown stone and its resting imbued pebble.
    poly([[-r,-2],[-r/2,-r],[r/2,-r],[r,2],[r/2,r],[-r/2,r]],'#96998f');
    poly([[-r+1,0],[-r*.3,-r*.3],[r-1,2],[r*.4,r-1],[-r*.4,r-1]],'#5b645f',false);
    poly([[-r+1,-2],[-r*.4,-r+1],[r*.4,-r+1],[r*.2,-r*.3],[-r*.3,-1]],'#d0ccad',false);
  } else if(p.k==='shell') {
    // Steel nose, broad brass collar and separate copper exhaust throat.
    poly([[-13,-6],[6,-6],[14,0],[6,6],[-13,6]],'#566978');
    poly([[-11,1],[10,0],[5,5],[-11,5]],'#334451',false);
    poly([[-10,-5],[5,-5],[10,-1],[-9,-1]],'#a3b7bf',false);
    poly([[-8,-6],[-3,-6],[-3,6],[-8,6]],col);
    line([-7,-4],[-4,-4],light,2);line([-7,3],[-4,3],shade,2);
    poly([[-20,-3],[-14,-4],[-14,4],[-20,3]],'#a96745');
    line([-19,-1],[-15,-1],'#edbc7e',2);
  } else if(p.k==='flame') {
    // Three curling tongues feed a compact hot front; no round ball with a tail.
    const flick=[0,2,-1,1][phase],u=r/11;
    const flame=pts=>pts.map(([a,b])=>[a*u,b*u]);
    poly(flame([[-29,-8-flick],[-17,-5],[-21,-13],[-7,-8],[1,-10],[9,-6],[11,0],[8,7],[0,10],[-11,7],[-24,11+flick],[-19,3],[-30,2],[-19,-1]]),shade);
    poly(flame([[-22,-7-flick],[-9,-3],[-14,-9],[-4,-6],[3,-7],[8,-3],[9,2],[4,7],[-4,7],[-17,8+flick],[-12,2],[-23,1],[-9,-1]]),col,false);
    poly(flame([[-11,-2],[-3,-4],[4,-4],[7,0],[3,4],[-3,5],[-7,2],[-15,3]]),light,false);
    poly(flame([[-2,-2],[3,-2],[5,0],[2,2],[-2,2]]),PX_LIGHT,false);
  } else if(p.k==='red') {
    // A pressure lens: thick broken outer bands and a shaded, compressed core.
    const q=[0,1,0,-1][phase];
    ellipse(0,0,r,r*.78,PX_INK);ellipse(0,0,r-1,r*.78-1,shade);
    ellipse(-1,-1,r*.67,r*.55,col);ellipse(-3,-3,r*.35,r*.28,light);
    for(const dir of [-1,1]) {
      const pts=[[-r*.7,dir*(r*.8+q)],[-r*.1,dir*(r+2+q)],[r*.7,dir*(r*.8+q)],[r+2,dir*r*.3]];
      for(let i=1;i<pts.length;i++){line(pts[i-1],pts[i],PX_INK,4);line(pts[i-1],pts[i],col,2);}
    }
    line([-r*.4,0],[r*.45,0],PX_LIGHT,2);
  } else if(p.k==='orb'&&p.spin) {
    // Six hooked, shaded vanes rotate around a hollow hub, retaining the red hue.
    const a=phase*Math.PI/12,turn=([x,y],angle)=>[Math.cos(angle)*x-Math.sin(angle)*y,Math.sin(angle)*x+Math.cos(angle)*y];
    for(let n=0;n<6;n++) {
      const angle=a+n*Math.PI/3;
      poly([[r*.3,-r*.1],[r*.72,-r*.58],[r*1.18,-r*.35],[r*.92,r*.2],[r*.6,0]].map(pt=>turn(pt,angle)),n%2?shade:col);
      line(turn([r*.58,-r*.2],angle),turn([r*.88,-r*.35],angle),light);
    }
    ellipse(0,0,r*.48,r*.48,PX_INK);ellipse(0,0,r*.3,r*.3,col);ellipse(0,0,r*.14,r*.14,PX_INK);
  } else if(p.k==='orb') {
    // Broad folded planes with a leading point; an open fan, not a second wheel.
    const q=[0,1,0,-1][phase];
    poly([[-r*1.45,-r*.9-q],[-r*.2,-r*.65],[r,0],[-r*.2,r*.65],[-r*1.45,r*.9+q],[-r*.9,0]],col);
    poly([[-r*1.2,-r*.72],[-r*.2,-r*.5],[r*.7,0],[-r*.8,-r*.1]],light,false);
    poly([[-r*.8,r*.1],[r*.7,0],[-r*.2,r*.5],[-r*1.2,r*.72]],shade,false);
    line([-r*.85,0],[r*.6,0],PX_LIGHT);
  } else if(p.k==='gum') {
    // A sticky knot with an elastic rear loop; its beads remain in the wake.
    const q=[0,1,0,-1][phase];
    ellipse(-r*1.2,0,r*.85,r*.58+q,PX_INK);ellipse(-r*1.2,0,r*.6,r*.32+q,shade);
    ellipse(-r*1.2,0,r*.36,Math.max(1,r*.16+q),PX_INK);
    poly([[-r*.8,-r*.42],[-r*.15,-r*.8],[r*.65,-r*.65],[r,0],[r*.5,r*.65],[-r*.2,r*.72],[-r*.8,r*.32]],col);
    poly([[-r*.55,r*.15],[r*.7,0],[r*.4,r*.5],[-r*.15,r*.55]],shade,false);
    line([-r*.3,-r*.4],[r*.35,-r*.35],light,2);
  } else if(p.k==='pellet') {
    // Small solid shot: bevelled brass facets, with no comet-sized rear body.
    poly([[-r,-r*.4],[-r*.4,-r*.8],[r*.5,-r*.65],[r,0],[r*.5,r*.65],[-r*.4,r*.8],[-r,r*.4]],col);
    poly([[-r*.65,r*.15],[r*.7,0],[r*.35,r*.5],[-r*.3,r*.6]],shade,false);
    line([-r*.5,-r*.35],[r*.25,-r*.4],light);
  } else if(p.k==='knife') {
    poly([[-5,-3],[4,-4],[14,0],[3,3],[-5,2]],col);
    poly([[-3,-2],[4,-3],[10,0],[-3,0]],light,false);
    line([-12,0],[-6,0],PX_INK,4);line([-11,0],[-6,0],shade,2);
    line([-5,-4],[-5,4],PX_INK,3);line([-5,-3],[-5,3],col);
  } else {
    // Nail: flat square head and a long plain steel shank, without a knife guard.
    poly([[-9,-1],[10,-1],[14,0],[10,1],[-9,1]],shade);
    line([-8,-1],[8,-1],light);
    poly([[-12,-4],[-9,-4],[-9,4],[-12,4]],col);line([-11,-3],[-11,2],light);
  }
  const cell={sprite,ox,oy};
  // Snapshot colors/radii are normally finite; keep unexpected inputs bounded too.
  if(PX_PROJECTILE_BODIES.size>=256)PX_PROJECTILE_BODIES.delete(PX_PROJECTILE_BODIES.keys().next().value);
  PX_PROJECTILE_BODIES.set(key,cell);return cell;
}
function pxProjectile(s,p) {
  pxProjectileTrail(s,p);
  const x=p.x/2,y=p.y/2,f=p.vx<0?-1:1,r=Math.max(3,(p.r||9)/2),col=pxProjectileColor(p);
  const body=pxProjectileBody(p);
  if(body){s.blit(body.sprite,Math.round(x)-body.ox,Math.round(y)-body.oy,1,f<0);return;}
  const poly=(pts,c=col)=>s.poly(pts.map(([a,b])=>[x+a*f,y+b]),c,PX_INK);
  poly([[-r*2.7,0],[-r,-r*.8],[r*.7,-r*.8],[r,0],[r*.7,r*.8],[-r,r*.8]]);s.ellipse(x,y,r,r,col);s.ellipse(x-r*.2,y-r*.2,r*.55,r*.55,PX_LIGHT);if(p.spin)pxRing(s,x,y,r+4,r+4,col,2,Math.floor(p.t/3));
}
// Attached gum follows the two current roots, not an event or global clock.
// Draw behind the sprites so a strand cannot cut across a face or action pose.
function pxGumTether(s,S) {
  for(const f of S.f)if(f.gum>0) {
    const o=S.f[1-f.i],distance=Math.abs(f.x-o.x)/2;
    const inset=Math.min(16,Math.floor(distance/4)),pull=o.sling>0;
    const a=[Math.round(o.x/2),Math.round(o.y/2)-40];
    const b=[Math.round(f.x/2),Math.round(f.y/2)-40];
    // A slack bow straightens during the existing Slingshot. This describes
    // elastic material, not a range boundary or a new tension mechanic.
    const sag=pull?2:Math.max(5,Math.round(29-distance*.055));
    const at=t=>[Math.round(a[0]+(b[0]-a[0])*t),Math.round(a[1]+(b[1]-a[1])*t+4*t*(1-t)*sag)];
    const points=Array.from({length:9},(_,n)=>at(n/8));
    for(const [width,col,dy] of [[8,PX_INK,0],[6,'#87466f',0],[4,pull?'#ffd4e9':'#dc8fb8',-1],[1,'#fff0ed',-2]])
      for(let n=1;n<points.length;n++)s.line([points[n-1][0],points[n-1][1]+dy],[points[n][0],points[n][1]+dy],col,width);
    // Broad folded ends share the projectile's rose material and navy edge.
    for(const [x,y] of [at(inset/Math.max(1,distance)),at(1-inset/Math.max(1,distance))]) {
      s.poly([[x-7,y-4],[x-2,y-8],[x+5,y-6],[x+7,y+2],[x+2,y+7],[x-5,y+5]],'#87466f',PX_INK);
      s.poly([[x-5,y-3],[x-1,y-6],[x+3,y-4],[x+5,y+1],[x+1,y+5],[x-3,y+3]],'#dc8fb8');
      s.line([x-3,y-3],[x+1,y-4],'#fff0ed',2);
      s.line([x-1,y+2],[x+3,y],'#87466f',2);
    }
  }
}
// Rapid Slash leaves a pointed wake, not a solid bar through the fighters.
// The existing event endpoints and FX age drive its direction and contraction.
function pxRapidTrail(s,l) {
  if(l.t>=l.life)return;
  const age=clamp(l.t/l.life,0,1),len=Math.abs(l.x2-l.x1)/2;
  if(len<1)return;
  // Raster once in a local right-facing cell, then reflect exact pixels.
  const cell=new PixelSurface(Math.ceil(len)+5,48),point=(along,across)=>[2+along,24+across];
  const ribbon=(start,end,offset,width)=>{
    if(end<=start)return;
    const poly=(inset,col)=>cell.poly([point(start,offset),point(end-(end-start)*.18,offset-width+inset),
      point(end,offset),point(end-(end-start)*.25,offset+width-inset)],col);
    poly(0,PX_INK);poly(1,'#75b4c8');
    if(width>2)poly(2,'#d9eee1');
  };
  ribbon(len*age,len,0,Math.max(1.5,5*(1-age*.8)));
  if(l.t<8)for(const side of [-1,1])ribbon(len*(age+.08),len-9,side*(8-age*3),Math.max(1.3,2.8*(1-age)));
  const mirror=l.x2<l.x1;
  s.blit(cell,Math.round(l.x1/2)-(mirror?cell.w-3:2),Math.round(l.y1/2)-24,1,mirror);
}
// The slash opens ahead of the hand, then its tail catches up with the tip.
// Reflect a local raster so left and right share the exact same pixel contour.
const PX_SLASH_CUES=new Map();
function pxSlashCue(s,l) {
  const t=Math.max(0,Math.floor(l.t));if(t>=l.life)return;
  const key=!!l.heavy+':'+t;
  if(!PX_SLASH_CUES.has(key)) {
    const cell=new PixelSurface(128,128),rx=l.heavy?47:40,ry=l.heavy?38:30;
    const start=[-1.4,-1.4,-1.25,-1.05,-.7,-.3,.1,.5,.95][t];
    const end=[.15,.6,.95,1.3,1.35,1.4,1.45,1.45,1.45][t];
    const width=(l.heavy?7:4.5)*(t<4?1:1-(t-3)*.12),steps=18;
    const band=(gain,pad,shift,col)=>{
      const points=[];
      for(const side of [1,-1])for(let n=0;n<=steps;n++) {
        const u=(side>0?n:steps-n)/steps,a=start+(end-start)*u;
        const w=(.4+Math.sin(u*Math.PI)*width)*gain+pad;
        points.push([46+Math.cos(a)*(rx+shift+side*w),60+Math.sin(a)*(ry+shift+side*w)]);
      }
      cell.poly(points,col);
    };
    band(1,1,0,PX_INK);band(1,0,0,t<6?'#9c2948':'#87435a');
    band(.66,0,1,t<6?'#ed7480':'#bf7b82');
    if(t<6)band(.23,0,2,'#ffd3c2');
    PX_SLASH_CUES.set(key,cell);
  }
  const mirror=l.dir<0;
  s.blit(PX_SLASH_CUES.get(key),Math.round((l.x1+l.x2)/4)-(mirror?63:64),Math.round((l.y1+l.y2)/4)-64,1,mirror);
}
// Transfers leave opposing gold wakes rather than a cable across the bodies.
// Both paths shorten toward their endpoints on the existing twelve-tick clock.
function pxSwapCue(s,l) {
  if(l.t>=l.life)return;
  let a=[l.x1/2,l.y1/2],b=[l.x2/2,l.y2/2];
  if(a[0]>b[0]||(a[0]===b[0]&&a[1]>b[1]))[a,b]=[b,a];
  const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len<1)return;
  const age=clamp(l.t/l.life,0,1),ox=40,oy=40+Math.ceil(Math.max(0,-dy));
  const cell=new PixelSurface(Math.ceil(dx)+81,Math.ceil(Math.abs(dy))+81);
  const bend=Math.min(25,len*.16),start=.04+age*.83,end=.96,steps=24;
  for(const side of [-1,1]) {
    const band=(gain,pad,col)=>{
      const points=[];
      for(const edge of [1,-1])for(let n=0;n<=steps;n++) {
        const v=(edge>0?n:steps-n)/steps,u=start+(end-start)*v,t=side>0?u:1-u;
        const width=(.25+Math.sin(v*Math.PI)*4*(1-age*.65))*gain+pad;
        const across=side*Math.sin(t*Math.PI)*bend+edge*width;
        points.push([ox+dx*t-dy/len*across,oy+dy*t+dx/len*across]);
      }
      cell.poly(points,col);
    };
    band(1,1,PX_INK);band(1,0,l.t<8?'#b88746':'#927344');
    band(.65,0,l.t<8?'#f1ce81':'#bda06b');
    if(l.t<8)band(.22,0,'#fff0c2');
  }
  s.blit(cell,Math.round(a[0])-ox,Math.round(a[1])-oy);
}
function pxWorldSurface(S,F=FX) {
  const s=new PixelSurface(640,360);s.data.set(pxBackdrop(Math.floor(S.t/8),S.stage).data);
  pxDomain(s,S);
  const impact=F.impact&&F.impact.t<F.impact.sil?F.impact:null;
  if(impact)s.rect(0,0,640,360,impact.kind==='black'?'#111623':'#f8edce');
  // Ground silhouettes belong below both bodies and floor effects. Painting a
  // shadow with each actor erased the first actor's boots at close range.
  if(!impact)for(const f of S.f)pxFighterShadow(s,f);
  for(const z of S.zones)if(z.k!=='beam')pxZone(s,S,z);
  for(const e of S.ents)pxSummon(s,e,S);
  for(const e of F.dust||[])pxDust(s,e);
  for(const p of F.puffs||[]) {const r=p.r/2*(1-p.t/p.life*.5);s.ellipse(p.x/2,p.y/2,r,r*.55,'#b9ad9c');s.ellipse(p.x/2-2,p.y/2-2,r*.7,r*.4,'#d1c2a7');}
  pxWebVolley(s,S);
  pxEffigyRite(s,S);
  pxShrineRhythm(s,S);
  pxJceRhythm(s,S);
  pxOvationRhythm(s,S);
  pxGumTether(s,S);
  if(!impact)for(const f of S.f)if(!(f.inv>0&&S.t%4<2)){pxStraightPunchWake(s,f);pxKickSweep(s,f);pxAirPunchWake(s,f);pxAirKickSweep(s,f);pxHookSweep(s,f);}
  if(F.bf)pxBlackFlash(s,F.bf);
  if(!impact)for(const f of S.f)pxStunCrown(s,S,f);
  for(const l of F.lines||[])if(l.kind==='dash')pxRapidTrail(s,l);
  for(const l of F.lines||[])if(l.kind==='slash')pxSlashCue(s,l);
  for(const l of F.lines||[])if(l.kind==='swap')pxSwapCue(s,l);
  // Keep the struck fighter's reaction readable inside even the widest cone.
  // Contacts still paint above both bodies; beam material/geometry is unchanged.
  for(const z of S.zones)if(z.k==='beam')pxZone(s,S,z);
  for(const f of S.f)pxPaintFighter(s,S,f,impact);
  for(const p of S.proj)pxProjectile(s,p);
  for(const l of F.lines||[])if(!['dash','slash','swap'].includes(l.kind)) {s.line([l.x1/2,l.y1/2],[l.x2/2,l.y2/2],PX_INK,Math.max(3,l.w/2+2));s.line([l.x1/2,l.y1/2],[l.x2/2,l.y2/2],l.col,Math.max(1,l.w/2));}
  for(const r of F.rings||[])pxRing(s,r.x/2,r.y/2,r.r/2,r.r/2,r.col,1,Math.floor(r.t/3));
  for(const p of F.parts||[]) {const r=Math.max(1,p.s/2*(1-p.t/p.life));s.rect(p.x/2-r,p.y/2-r,r*2,r*2,p.col);}
  for(const e of F.stars||[])pxBurst(s,e.x/2,e.y/2,e.r/2*(1-e.t/e.life*.7),e.col,e.t);
  for(const e of F.contacts||[])pxContact(s,e);
  for(const w of F.words||[]) {const size=w.txt.length>16?1:2;pxOutlinedText(s,w.txt,w.x/2-pxTextWidth(w.txt,size)/2,w.y/2-w.t/4,'#edcf9d',size);}
  if(S.stop&&S.stop.t>0) {s.rect(0,0,640,2,'#e5cc8f');s.rect(0,358,640,2,'#e5cc8f');s.rect(0,0,2,360,'#e5cc8f');s.rect(638,0,2,360,'#e5cc8f');}
  if(F.flash>.2&&!impact)for(let y=0;y<360;y+=4)for(let x=(y%8?0:2);x<640;x+=8)s.dot(x,y,F.flashCol||PX_LIGHT);
  for(const p of pxDamageLayout(S,F.nums||[],F))pxDamageText(s,p);
  return s;
}
let PX_SCREEN=null,PX_SCREEN_IMAGE=null;
function pxPresent(c,s) {
  if(!PX_SCREEN){PX_SCREEN=document.createElement('canvas');PX_SCREEN.width=640;PX_SCREEN.height=360;PX_SCREEN_IMAGE=PX_SCREEN.getContext('2d').createImageData(640,360);}
  PX_SCREEN_IMAGE.data.set(s.data);PX_SCREEN.getContext('2d').putImageData(PX_SCREEN_IMAGE,0,0);
  c.save();c.imageSmoothingEnabled=false;c.drawImage(PX_SCREEN,0,0,W,H);c.restore();
}
function pxDrawWorld(c,S) {
  FX.clock++;FX.cam.x=W/2;FX.cam.y=H/2;FX.cam.z=1;
  const s=pxWorldSurface(S),shake=Math.min(5,Math.round(FX.shake/3));
  if(shake>0) {const shift=new PixelSurface(640,360);shift.rect(0,0,640,360,PX_INK);shift.blit(s,Math.round(Math.sin(FX.clock*13)*shake),Math.round(Math.cos(FX.clock*7)*shake));pxPresent(c,shift);}
  else pxPresent(c,s);
}
