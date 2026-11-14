'use strict';
// All active world drawing now happens in source pixels, before one nearest-neighbor presentation.
const PX_BACKDROPS=new Map();
function pxBackdrop(frame,id='courtyard') {
  id=pxStageId(id);frame%=8;const key=id+':'+frame;if(PX_BACKDROPS.has(key))return PX_BACKDROPS.get(key);
  if(id!=='courtyard') {
    const s=new PixelSurface(640,360);s.data.set(pxStageVariant(id).data);pxStageMotion(s,id,frame);PX_BACKDROPS.set(key,s);return s;
  }
  const bg=pxStage(),s=new PixelSurface(640,360);
  s.blit(bg.sky,0,0);s.blit(bg.cloud,35+frame,68);s.blit(bg.cloud,344+frame*2,102);
  s.blit(bg.far,-30,0);s.blit(bg.town,-30,0);s.blit(bg.arena,-30,0);s.blit(pxStageLife(frame),0,0);
  PX_BACKDROPS.set(key,s);return s;
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
function pxOutlinedText(s,text,x,y,col,scale=1) {
  for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]])pxText(s,text,Math.round(x)+dx,Math.round(y)+dy,PX_INK,scale);
  pxText(s,text,Math.round(x),Math.round(y),col,scale);
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
function pxDomain(s,S) {
  const d=S.dom;if(!d)return;
  const ac=PX_KITS[S.f[d.o].ch].accent,t=Math.floor(S.t/4);
  const colors={void:'#142239',shrine:'#4e2536',garden:'#25223e',ovation:'#34302d',nuclear:'#4f3a33',bloodsweep:'#4c2c43',megaphone:'#2c403a',effigy:'#443641',theworld:'#4a422f',absolute:'#22463f',howitzer:'#4c3631',web:'#432c4a',allout:'#28413d',jce:'#233f4b',worldbreaker:'#3a402e'};
  s.rect(0,0,640,283,colors[d.k]||'#252b3c');
  if(d.k==='void') {
    for(let n=0;n<24;n++)s.rect((n*97+t*2)%640,(n*41)%274,1+n%2,1,ac);
    s.ellipse(320,136,71,71,'#c9dcd6');s.ellipse(320,136,66,66,'#142239');
    pxRing(s,320,136,45,45,ac,2,t);s.ellipse(320,136,10+t%3,10+t%3,ac);
  } else if(d.k==='shrine') {
    for(let n=0;n<7;n++){const x=150+n*55;s.poly([[x,280],[x+11,96],[x+20,88],[x+29,280]],'#271e30');s.line([x+11,100],[x+20,100],ac);}
    s.rect(155,88,335,10,'#271e30');s.rect(183,71,280,8,'#271e30');
  } else if(d.k==='garden') {
    for(let n=0;n<9;n++){const x=32+n*76,h=40+(n*17+t)%38;s.poly([[x-9,283],[x-4,283-h],[x+6,283-h-12],[x+12,283]],'#141c30');s.line([x-4,283-h],[x+6,283-h-12],ac);}
    for(let n=0;n<4;n++)pxRing(s,320,282,40+(t*3+n*60)%250,4+n*3,ac);
  } else if(d.k==='ovation') {
    const x=S.f[1-d.o].x/2;s.poly([[x-12,0],[x+12,0],[x+100,283],[x-100,283]],'#c5aa6e');
  } else {
    for(let n=0;n<10;n++) {
      const a=n*Math.PI/5+t*.025,ox=320+Math.cos(a)*300,oy=145+Math.sin(a)*120;
      s.line([320,145],[ox,oy],ac,n%2?1:2);
    }
    pxRing(s,320,145,60,60,ac,2,t);
    if(d.k==='theworld') {s.line([320,145],[320,103],PX_LIGHT,3);s.line([320,145],[351,163],PX_LIGHT,3);}
  }
  s.rect(0,280,640,3,PX_INK);
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
function pxZone(s,S,z) {
  const x=z.x/2,y=z.y/2,t=z.t;
  if(z.k==='blue') {for(let n=0;n<3;n++){const r=(80-(t*3+n*25)%80);pxRing(s,x,y,r,r*.8,'#7fb7da',1,n*3);}s.ellipse(x,y,17,17,'#3869a9');s.ellipse(x-3,y-3,10,10,'#87c9e7');s.ellipse(x-4,y-4,4,4,PX_LIGHT);}
  if(z.k==='beam') {const f=z.face,len=660,hw=Math.max(1,z.w/2*(1-t/z.dur)),far=hw+(z.cone?len*z.cone:0);s.poly([[x,y-hw],[x+f*len,y-far],[x+f*len,y+far],[x,y+hw]],z.col||'#e7a267',PX_INK);s.line([x,y],[x+f*len,y],PX_LIGHT,Math.max(1,hw*.5));}
  if(z.k==='pebble')pxProjectile(s,{k:'stone',x:z.x,y:z.y,r:7,vx:0,vy:0,t});
  if(z.k==='tongue') {const k=Math.sin(Math.min(1,t/z.dur)*Math.PI),ex=x+(z.tx/2-x)*(z.hitFoe?Math.max(k,.25):k);s.line([x,291],[ex,276],PX_INK,8);s.line([x,291],[ex,276],'#c67e9c',5);s.ellipse(x,293,19,11,'#4e477c');s.ellipse(x+3,290,13,7,'#8279a8');s.rect(x-10,280,6,6,PX_LIGHT);s.rect(x+6,280,6,6,PX_LIGHT);s.rect(x-7,282,2,3,PX_INK);s.rect(x+9,282,2,3,PX_INK);}
  if(z.k==='mark') {const r=z.r/2*(1.4-.4*t/z.delay);if(t<z.delay){pxRing(s,x,y,r,r,'#9acfd5',1,Math.floor(t/3));s.line([x-5,y],[x+5,y],'#9acfd5');s.line([x,y-5],[x,y+5],'#9acfd5');}else pxBurst(s,x,y,z.r/2,'#c7e9de',t);}
  if(z.k==='trap') {s.line([x,306],[x+3,293],PX_INK,3);s.line([x,306],[x+3,293],'#c1c1b0');s.rect(x,291,6,3,'#d8ad78');}
  if(z.k==='target') {pxRing(s,x,306,z.r/2,8,t%6<3?'#df985f':'#f0d19b',2);s.line([x-6,306],[x+6,306],PX_LIGHT);}
}
function pxSummon(s,e) {
  const x=e.x/2,y=e.y/2,f=e.face||1,t=Math.floor(e.t/5),color=e.v?'#4b425f':'#c9c5cf';
  const poly=(pts,col)=>s.poly(pts.map(([a,b])=>[x+a*f,y+b]),col,PX_INK);
  if(e.k==='dog') {
    const run=t%2?3:-3;for(const [a,b]of[[-9,run],[10,-run]]){s.line([x+a*f,y-11],[x+(a+b)*f,y-1],PX_INK,5);s.line([x+a*f,y-11],[x+(a+b)*f,y-1],color,3);}
    poly([[-17,-14],[-18,-21],[-7,-26],[10,-25],[19,-16],[12,-10],[-10,-9]],color);
    poly([[-13,-20],[-25,-31],[-21,-34],[-16,-26]],color);
    poly([[10,-24],[12,-35],[18,-29],[22,-32],[25,-22],[31,-19],[29,-15],[13,-15]],color);
    s.rect(x+21*f,y-26,2,2,'#c8a2e1');s.rect(x+29*f,y-20,3,3,PX_INK);
    if(e.bite>0)s.line([x+26*f,y-15],[x+32*f,y-11],PX_LIGHT,2);
  } else if(e.k==='nue') {
    const flap=[-13,-6,6,-6][t%4];poly([[-2,-3],[-25,-18+flap],[-36,-14+flap],[-23,1],[-10,7]],'#b18354');
    poly([[0,1],[-20,19-flap],[-29,17-flap],[-12,4]],'#dfad65');poly([[-11,-7],[8,-9],[19,-4],[15,5],[-4,7]],'#b18354');
    poly([[12,-10],[20,-13],[27,-9],[25,-2],[15,2]],'#e8d6b5');poly([[25,-6],[34,-3],[25,0]],'#cf975b');s.rect(x+22*f,y-9,2,2,PX_INK);
  }
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
function pxProjectile(s,p) {
  pxProjectileTrail(s,p);
  const x=p.x/2,y=p.y/2,f=p.vx<0?-1:1,r=Math.max(3,(p.r||9)/2),col=pxProjectileColor(p);
  const poly=(pts,c=col)=>s.poly(pts.map(([a,b])=>[x+a*f,y+b]),c,PX_INK);
  if(p.k==='cut') {poly([[-24,-3],[6,-10],[18,-8],[8,-2],[-4,9],[-20,11],[-8,1]]);s.line([x-15*f,y+7],[x+12*f,y-7],PX_LIGHT);}
  else if(p.k==='knife'||p.k==='nail') {poly([[-10,-2],[8,-2],[14,0],[8,2],[-10,2]]);s.line([x-9*f,y-4],[x-9*f,y+4],col,2);}
  else if(p.k==='wave') {poly([[-20,12],[-15,-3],[-10,-19],[1,-28],[9,-28],[2,-15],[5,-5],[0,12]]);s.line([x-12*f,y-2],[x+3*f,y-23],PX_LIGHT,2);}
  else if(p.k==='stone') {poly([[-r,-2],[-r/2,-r],[r/2,-r],[r,2],[r/2,r],[-r/2,r]],'#96998f');s.line([x-r/2,y-r+1],[x+r/2,y-r+1],'#d0ccad');}
  else if(p.k==='shell') {poly([[-13,-6],[6,-6],[14,0],[6,6],[-13,6]],'#566978');s.rect(x-7,y-4,5,8,col);s.rect(x-20*f,y-2,6,4,'#d39060');}
  else {poly([[-r*2.7,0],[-r,-r*.8],[r*.7,-r*.8],[r,0],[r*.7,r*.8],[-r,r*.8]]);s.ellipse(x,y,r,r,col);s.ellipse(x-r*.2,y-r*.2,r*.55,r*.55,PX_LIGHT);if(p.spin)pxRing(s,x,y,r+4,r+4,col,2,Math.floor(p.t/3));}
}
function pxWorldSurface(S,F=FX) {
  const s=new PixelSurface(640,360);s.data.set(pxBackdrop(Math.floor(S.t/8)%8,S.stage).data);
  pxDomain(s,S);
  const impact=F.impact&&F.impact.t<F.impact.sil?F.impact:null;
  if(impact)s.rect(0,0,640,360,impact.kind==='black'?'#111623':'#f8edce');
  for(const z of S.zones)if(z.k!=='beam')pxZone(s,S,z);
  for(const e of S.ents)pxSummon(s,e);
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
  for(const n of F.nums||[]) {const size=n.bf?3:n.big?2:1;pxOutlinedText(s,n.txt,n.x/2-pxTextWidth(n.txt,size)/2,n.y/2,n.bf?'#ed5266':n.big?'#eed49b':PX_LIGHT,size);}
  for(const w of F.words||[]) {const size=w.txt.length>16?1:2;pxOutlinedText(s,w.txt,w.x/2-pxTextWidth(w.txt,size)/2,w.y/2-w.t/4,'#edcf9d',size);}
  if(F.bf) {const b=F.bf,x=b.x/2,y=b.y/2;pxBurst(s,x,y,Math.max(5,65-b.t*2),'#ed5266',b.t);for(let n=0;n<6;n++){const a=n*Math.PI/3+Math.floor(b.t/3)*.2;pxBolt(s,[x,y],[x+Math.cos(a)*105,y+Math.sin(a)*75],n+Math.floor(b.t/3));}}
  if(S.stop&&S.stop.t>0) {s.rect(0,0,640,2,'#e5cc8f');s.rect(0,358,640,2,'#e5cc8f');s.rect(0,0,2,360,'#e5cc8f');s.rect(638,0,2,360,'#e5cc8f');}
  if(F.flash>.2&&!impact)for(let y=0;y<360;y+=4)for(let x=(y%8?0:2);x<640;x+=8)s.dot(x,y,F.flashCol||PX_LIGHT);
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
