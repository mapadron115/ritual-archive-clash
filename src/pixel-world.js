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
// Three authored phases: compressed contact, directional expansion, separated fragments.
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
  if(t<2) {
    poly([[-7,-3],[-3,-8],[2,-4],[8,-1],[5,4],[-2,8],[-4,3]],PX_INK);
    poly([[-5,-2],[-2,-6],[2,-2],[6,0],[2,3],[-2,6],[-2,2]],light);
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
  const w=pxTextWidth(b.txt,size),y=b.small?105:150;
  return {size,textX:320-w/2,textY:y,x:b.small?320-w/2-10:0,y:y-9,w:b.small?w+20:640,h:size*7+18};
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
    const size=n.bf?3:2,w=pxTextWidth(n.txt,size)+2,h=7*size+2,dir=n.dir<0?-1:1;
    const x=Math.round(n.x/2+dir*26-w/2),y=Math.round(n.y/2-h);
    let best=null,score=Infinity;
    // Nearest free lane first. The outline is inside the reserved rectangle.
    search: for(let radius=0;radius<=32;radius++) {
      for(let dx=-radius;dx<=radius;dx++)for(const dy of radius===Math.abs(dx)?[0]:[-(radius-Math.abs(dx)),radius-Math.abs(dx)]) {
        const box={x:clamp(x+dir*dx*(w+4),4,636-w),y:clamp(y+dy*(h+4),96,302-h),w,h};
        const area=blocked.reduce((sum,b)=>sum+overlap(box,b),0);
        if(area<score){score=area;best=box;}
        if(score===0)break search;
      }
    }
    blocked.push(best);out.push({...best,n,size});
  }
  return out.reverse();
}
const PX_DUST=new Map();
function pxDust(s,e) {
  const key=e.kind+':'+e.t;
  if(!PX_DUST.has(key)) {
    const cell=new PixelSurface(192,96),t=e.t,heavy=e.kind==='thud',jump=e.kind==='jump';
    const x=96,y=80,u=Math.floor(t/3),spread=(heavy?13:jump?8:10)+u*(heavy?5:3);
    for(const dir of [-1,1])for(let n=0;n<(heavy?3:2);n++) {
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
function pxPaintFighter(s,S,f,impact) {
  const x=Math.round(f.x/2),y=Math.round(f.y/2),scale=f.big>0?1.3:1,alt=f.i===1&&S.f[0].ch===f.ch;
  if(!impact)s.ellipse(x,307,Math.max(9,23-(GROUND-f.y)/30)*scale,3,'#776c69');
  if(f.inv>0 && S.t%4<2)return;
  if(f.zone>0&&!impact)for(let n=0;n<6;n++) {const u=(S.t*2+n*23)%90,fx=x-18+n*7;s.poly([[fx-4,y-u],[fx+2,y-u-12],[fx+5,y-u+5]],'#ed5266');s.poly([[fx-2,y-u],[fx+1,y-u-8],[fx+3,y-u+3]],PX_INK);}
  const flash=impact ? impact.kind==='black' ? f.i===impact.a?'#f8edce':'#ed5266' : PX_INK : S.t-f.hurtT<4 ? PX_LIGHT : '';
  const {sprite,ox,oy}=pxFighterFrame(f.ch,pxPose(S,f),alt,flash);
  s.blit(sprite,x-(f.face<0?sprite.w-1-ox:ox)*scale,y-oy*scale,scale,f.face<0);
  if(f.inf>0){pxRing(s,x,y-44,30,47,'#8ed9e1',1,Math.floor(S.t/4));s.rect(x+24,y-51,3,8,PX_LIGHT);}
  if(f.counter>0||f.abs>0){const fx=x+f.face*21;s.poly([[fx,y-74],[fx+f.face*12,y-51],[fx,y-23],[fx-f.face*3,y-51]],'#79c9a5',PX_INK);}
  if(f.st==='stun')for(let n=0;n<3;n++){const a=S.t*.12+n*2.1;pxBurst(s,x+Math.cos(a)*14,y-97+Math.sin(a)*3,3,'#eed790');}
  if(f.nails>0)for(let n=0;n<f.nails;n++)s.line([x-5+n*6,y-43+n%2*5],[x-2+n*6,y-50+n%2*5],'#e8d7bc',2);
  if(f.chg>0){pxRing(s,x+f.face*14,y-45,9+Math.floor(f.chg/25)*3,9,'#d8ecb0',2,Math.floor(S.t/4));}
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
function pxZone(s,S,z) {
  const x=z.x/2,y=z.y/2,t=z.t;
  if(z.k==='blue')pxLingeringZone(s,z,pxAttraction);
  if(z.k==='beam')pxBeam(s,z);
  if(z.k==='pebble')pxProjectile(s,{k:'stone',x:z.x,y:z.y,r:7,vx:0,vy:0,t});
  if(z.k==='tongue')pxToad(s,z);
  if(z.k==='mark')pxLingeringZone(s,z,pxCutMark);
  if(z.k==='trap') {s.line([x,306],[x+3,293],PX_INK,3);s.line([x,306],[x+3,293],'#c1c1b0');s.rect(x,291,6,3,'#d8ad78');}
  if(z.k==='target') {pxRing(s,x,306,z.r/2,8,t%6<3?'#df985f':'#f0d19b',2);s.line([x-6,306],[x+6,306],PX_LIGHT);}
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
  if(!['red','flame','orb','pellet','gum','knife','nail'].includes(p.k))return null;
  const r=Math.max(3,(p.r||9)/2),col=pxProjectileColor(p),phase=Math.floor(Math.max(0,p.t||0)/4)%4;
  const moving=p.k==='red'||p.k==='flame'||p.k==='gum'||p.k==='orb';
  const frame=moving?phase:0,key=[p.k,r,col,!!p.spin,frame].join(':');
  if(PX_PROJECTILE_BODIES.has(key))return PX_PROJECTILE_BODIES.get(key);
  const ox=Math.ceil(Math.max(32,r*3+6)),oy=Math.ceil(Math.max(24,r*1.6+6)),sprite=new PixelSurface(ox*2+1,oy*2+1);
  const poly=(pts,c=col,outline=PX_INK)=>sprite.poly(pts.map(([a,b])=>[ox+a,oy+b]),c,outline);
  const line=(a,b,c,w=1)=>sprite.line([ox+a[0],oy+a[1]],[ox+b[0],oy+b[1]],c,w);
  const ellipse=(x,y,rx,ry,c)=>sprite.ellipse(ox+x,oy+y,rx,ry,c);
  const mix=(a,b,t)=>'#'+pxRGB(a).slice(0,3).map((v,i)=>Math.round(v*(1-t)+pxRGB(b)[i]*t).toString(16).padStart(2,'0')).join('');
  const shade=mix(col,PX_INK,.55),light=mix(col,PX_LIGHT,.65);
  if(p.k==='flame') {
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
  if(p.k==='cut') {poly([[-24,-3],[6,-10],[18,-8],[8,-2],[-4,9],[-20,11],[-8,1]]);s.line([x-15*f,y+7],[x+12*f,y-7],PX_LIGHT);}
  else if(p.k==='wave') {poly([[-20,12],[-15,-3],[-10,-19],[1,-28],[9,-28],[2,-15],[5,-5],[0,12]]);s.line([x-12*f,y-2],[x+3*f,y-23],PX_LIGHT,2);}
  else if(p.k==='stone') {poly([[-r,-2],[-r/2,-r],[r/2,-r],[r,2],[r/2,r],[-r/2,r]],'#96998f');s.line([x-r/2,y-r+1],[x+r/2,y-r+1],'#d0ccad');}
  else if(p.k==='shell') {poly([[-13,-6],[6,-6],[14,0],[6,6],[-13,6]],'#566978');s.rect(x-7,y-4,5,8,col);s.rect(x-20*f,y-2,6,4,'#d39060');}
  else {poly([[-r*2.7,0],[-r,-r*.8],[r*.7,-r*.8],[r,0],[r*.7,r*.8],[-r,r*.8]]);s.ellipse(x,y,r,r,col);s.ellipse(x-r*.2,y-r*.2,r*.55,r*.55,PX_LIGHT);if(p.spin)pxRing(s,x,y,r+4,r+4,col,2,Math.floor(p.t/3));}
}
function pxWorldSurface(S,F=FX) {
  const s=new PixelSurface(640,360);s.data.set(pxBackdrop(Math.floor(S.t/8),S.stage).data);
  pxDomain(s,S);
  const impact=F.impact&&F.impact.t<F.impact.sil?F.impact:null;
  if(impact)s.rect(0,0,640,360,impact.kind==='black'?'#111623':'#f8edce');
  for(const z of S.zones)if(z.k!=='beam')pxZone(s,S,z);
  for(const e of S.ents)pxSummon(s,e,S);
  for(const e of F.dust||[])pxDust(s,e);
  for(const p of F.puffs||[]) {const r=p.r/2*(1-p.t/p.life*.5);s.ellipse(p.x/2,p.y/2,r,r*.55,'#b9ad9c');s.ellipse(p.x/2-2,p.y/2-2,r*.7,r*.4,'#d1c2a7');}
  for(const f of S.f)pxPaintFighter(s,S,f,impact);
  for(const f of S.f)if(f.gum>0){const o=S.f[1-f.i];s.line([o.x/2,o.y/2-40],[(f.x+o.x)/4,Math.min(f.y,o.y)/2-25],'#d78bb7',2);s.line([(f.x+o.x)/4,Math.min(f.y,o.y)/2-25],[f.x/2,f.y/2-40],'#d78bb7',2);}
  for(const z of S.zones)if(z.k==='beam')pxZone(s,S,z);
  for(const p of S.proj)pxProjectile(s,p);
  for(const l of F.lines||[]) {s.line([l.x1/2,l.y1/2],[l.x2/2,l.y2/2],PX_INK,Math.max(3,l.w/2+2));s.line([l.x1/2,l.y1/2],[l.x2/2,l.y2/2],l.col,Math.max(1,l.w/2));}
  for(const r of F.rings||[])pxRing(s,r.x/2,r.y/2,r.r/2,r.r/2,r.col,1,Math.floor(r.t/3));
  for(const p of F.parts||[]) {const r=Math.max(1,p.s/2*(1-p.t/p.life));s.rect(p.x/2-r,p.y/2-r,r*2,r*2,p.col);}
  for(const e of F.stars||[])pxBurst(s,e.x/2,e.y/2,e.r/2*(1-e.t/e.life*.7),e.col,e.t);
  for(const e of F.contacts||[])pxContact(s,e);
  for(const w of F.words||[]) {const size=w.txt.length>16?1:2;pxOutlinedText(s,w.txt,w.x/2-pxTextWidth(w.txt,size)/2,w.y/2-w.t/4,'#edcf9d',size);}
  if(F.bf) {const b=F.bf,x=b.x/2,y=b.y/2;pxBurst(s,x,y,Math.max(5,65-b.t*2),'#ed5266',b.t);for(let n=0;n<6;n++){const a=n*Math.PI/3+Math.floor(b.t/3)*.2;pxBolt(s,[x,y],[x+Math.cos(a)*105,y+Math.sin(a)*75],n+Math.floor(b.t/3));}}
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
