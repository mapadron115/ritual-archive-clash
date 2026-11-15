'use strict';
// One bounded 128-tick atmosphere loop, derived from the existing global clock.
const PX_STAGE_FRAMES=16;
const PX_STAGES = [
  {id:'courtyard',name:'Archive Courtyard',desc:'Dusk / copper roofs / drifting banners'},
  {id:'gallery',name:'Rainlit Gallery',desc:'Night / tall windows / quiet shelves'},
  {id:'observatory',name:'Dawn Observatory',desc:'Daybreak / open sky / turning brass'},
];
function pxStageId(id) {return PX_STAGES.some(stage=>stage.id===id)?id:'courtyard';}
// Original Archive Courtyard. These are native pixel layers, shared by the game and review previews.
let PX_STAGE = null;
function pxStage() {
  if(PX_STAGE) return PX_STAGE;
  const sky=new PixelSurface(640,360),cloud=new PixelSurface(160,65),far=new PixelSurface(700,360),town=new PixelSurface(700,360),arena=new PixelSurface(700,360),fore=new PixelSurface(800,360),vig=new PixelSurface(640,360);
  const bands=['#171d36','#232846','#353251','#49405f','#624a6c','#825975','#a36b7b','#be837f','#d99e87','#e5b58f','#edc79a','#edc79a'];
  bands.forEach((col,n)=>sky.rect(0,n*30,640,30,col));
  sky.ellipse(482,117,35,35,'#deb794');sky.ellipse(482,117,31,31,'#f6ddb0');
  for(const [y,x,w] of [[97,420,95],[112,471,90],[138,445,100]]) {sky.rect(x,y,w,3,bands[Math.floor(y/30)]);}
  for(let n=0;n<36;n++) {const x=(n*139+27)%640,y=(n*47+11)%110;sky.dot(x,y,n%3?'#a49aa9':'#d2c5bc');if(n%7===0){sky.dot(x+1,y,'#a49aa9');sky.dot(x,y+1,'#a49aa9');}}
  cloud.poly([[2,36],[14,36],[14,30],[30,30],[30,21],[48,21],[48,16],[69,16],[69,22],[91,22],[91,29],[115,29],[115,35],[140,35],[140,41],[154,41],[154,47],[2,47]],'#b5848e');
  cloud.rect(27,31,62,4,'#d4a098');cloud.rect(46,23,23,4,'#d4a098');cloud.rect(6,45,143,3,'#936c83');
  far.poly([[0,225],[0,203],[25,195],[52,199],[78,174],[99,182],[130,153],[157,176],[180,172],[222,202],[249,191],[285,200],[309,179],[340,196],[365,192],[402,157],[425,168],[451,153],[474,177],[501,173],[537,201],[567,187],[596,194],[633,169],[664,182],[700,170],[700,360],[0,360]],'#766786');
  far.poly([[0,228],[42,211],[85,218],[117,197],[149,213],[190,207],[227,233],[274,218],[309,226],[351,207],[397,222],[439,206],[471,221],[520,213],[561,229],[610,207],[660,218],[700,201],[700,360],[0,360]],'#695d79');
  // Distant wings of the archive: quiet silhouettes, warm windows and angular copper roofs.
  function arch(s,x,y,w,h,frame,glass) {
    s.rect(x,y+Math.floor(w/2),w,h-Math.floor(w/2),frame);s.ellipse(x+w/2,y+w/2,w/2,w/2,frame);
    s.rect(x+2,y+w/2,w-4,h-w/2-2,glass);s.ellipse(x+w/2,y+w/2,(w-4)/2,(w-4)/2,glass);
    s.rect(x+w/2,y+2,1,h-4,frame);s.rect(x+1,y+h/2,w-2,1,frame);
  }
  for(let n=0;n<9;n++) {
    const x=n*88-20,y=225-(n%3)*12;
    town.rect(x,y,83,65,'#615065');town.rect(x,y,4,65,'#463f57');
    town.poly([[x-6,y],[x+12,y-15],[x+58,y-15],[x+89,y],[x+89,y+4],[x-6,y+4]],'#4c435c');
    town.line([x+12,y-15],[x+58,y-15],'#ac7f78');
    arch(town,x+16,y+15,12,24,'#403b53','#cda18c');arch(town,x+52,y+15,12,24,'#403b53','#a0807e');
  }
  // Broad central library and two unequal side towers keep the silhouette original and asymmetrical.
  town.rect(173,159,355,124,'#8e7774');town.rect(173,159,355,9,'#b09581');
  town.poly([[159,159],[184,136],[495,136],[541,159],[541,166],[159,166]],'#354c59','#263447');
  for(let x=188;x<496;x+=15) town.line([x,138],[x-12,158],'#537278');
  town.line([184,136],[495,136],'#98a18c',2);town.rect(158,164,384,3,'#bdac8b');
  for(let row=0;row<12;row++) {
    const y=172+row*9;town.line([178,y],[522,y],'#7d696d');
    for(let x=179+(row%2)*17;x<521;x+=34) town.line([x,y],[x,y+8],'#7d696d');
  }
  for(const x of [191,247,433,489]) {
    town.rect(x-3,171,17,110,'#695b64');town.rect(x,171,8,110,'#a28a7b');town.rect(x,171,2,110,'#bba38b');
    town.rect(x-5,170,21,5,'#bba38b');town.rect(x-5,276,21,7,'#544f61');
  }
  arch(town,278,184,145,100,'#514858','#31384b');
  arch(town,287,193,127,91,'#84777a','#2b3447');
  // A recessed book gate and the archive's four-leaf compass seal, not a borrowed insignia.
  town.rect(303,218,95,66,'#334456');
  for(let x=307;x<398;x+=8) {town.rect(x,222,2,60,'#4b5b67');town.rect(x+3,222,1,60,'#263647');}
  town.rect(348,218,3,66,'#8f8a7b');town.rect(342,253,3,8,'#d3b181');town.rect(356,253,3,8,'#d3b181');
  for(const x of [212,456]) {arch(town,x,183,23,43,'#4a485a','#c4a589');town.rect(x+4,203,15,2,'#edcb9e');}
  town.poly([[350,146],[366,164],[350,182],[334,164]],'#b8a88b','#263447');
  town.poly([[350,151],[360,164],[350,177],[340,164]],'#405766');
  town.line([350,154],[350,174],'#e0c49b');town.line([343,164],[357,164],'#e0c49b');
  function tower(x,y,w,h) {
    town.rect(x,y,w,h,'#776672');town.rect(x,y,6,h,'#504b61');town.rect(x+w-4,y,4,h,'#a0887e');
    town.rect(x-3,y-7,w+6,8,'#334859');town.rect(x-3,y-7,w+6,2,'#83918a');
    for(let j=0;j<3;j++) {town.rect(x+j*(w-8)/2,y-15,8,10,'#5f5b6c');town.rect(x+j*(w-8)/2,y-15,8,2,'#a0887e');}
    arch(town,x+w/2-8,y+12,16,33,'#403e55','#c4a589');
    town.rect(x+7,y+55,w-14,3,'#9a817b');
  }
  tower(83,153,56,131);tower(553,177,68,107);
  // Front rail and broad flagstones. The fighting plane remains at exactly GROUND/2.
  arena.rect(0,281,700,6,'#323347');arena.rect(0,282,700,2,'#c6b295');
  for(let x=9;x<700;x+=49) {arena.rect(x,267,8,16,'#4e4b58');arena.rect(x+1,268,3,15,'#9d8579');arena.rect(x-2,265,12,4,'#b6a18a');}
  arena.rect(0,287,700,48,'#b69f82');arena.rect(0,287,700,4,'#ccb89a');
  for(const y of [298,314,334]) arena.rect(0,y,700,1,'#877c74');
  for(let n=-7;n<10;n++) {arena.line([350+n*52,291],[350+n*73,335],'#8d8075');arena.line([351+n*52,291],[351+n*73,335],'#c2ae8f');}
  // Sparse chips and grass at the back edge keep the ground from competing with feet.
  for(let n=0;n<30;n++) {const x=(n*127+25)%700,y=291+(n*17)%38;arena.rect(x,y,2+n%3,1,n%2?'#cbb699':'#9a8c7b');}
  arena.ellipse(350,309,112,12,'#a7957d');arena.ellipse(350,308,110,10,'#b9a485');
  arena.line([301,308],[350,301],'#8f7e70');arena.line([350,301],[399,308],'#8f7e70');arena.line([399,308],[350,315],'#8f7e70');arena.line([350,315],[301,308],'#8f7e70');
  arena.rect(0,335,700,25,'#4a4351');arena.rect(0,335,700,2,'#ead2a6');arena.rect(0,338,700,5,'#77605b');
  for(let x=0;x<700;x+=38) {arena.rect(x+3,344,30,11,'#373b4d');arena.rect(x+3,344,30,1,'#8e7365');}
  for(const x of [95,605]) {
    arena.rect(x-4,149,8,133,'#252b3d');arena.rect(x-2,150,3,129,'#82715f');arena.rect(x-17,155,47,4,'#252b3d');arena.rect(x-16,155,45,1,'#b39a73');
    arena.rect(x-8,277,17,8,'#3c3d4b');arena.rect(x-7,278,15,2,'#b7a083');
    const lx=x+(x<350?-12:13);arena.line([lx,159],[lx,173],'#252b3d');
    arena.poly([[lx-5,173],[lx+5,173],[lx+8,180],[lx+5,193],[lx-5,193],[lx-8,180]],'#d39564','#252b3d');
    arena.rect(lx-3,177,6,12,'#f5d5a0');arena.rect(lx-6,173,12,3,'#252b3d');arena.rect(lx-5,192,10,2,'#252b3d');
  }
  // Foreground cut silhouettes only touch the image corners.
  for(const side of [0,1]) for(let n=0;n<18;n++) {
    const x=side?800-n*5:n*5,y=358-(n%5)*3;
    fore.poly([[x,y+4],[x-4,y-10-n%7],[x+1,y-5],[x+4,y-18-n%11],[x+7,y+4]],'#1c2938');
  }
  PX_STAGE={sky,cloud,far,town,arena,fore,vig};return PX_STAGE;
}
const PX_LIFE = new Map();
function pxStageLife(frame) {
  frame%=PX_STAGE_FRAMES;if(PX_LIFE.has(frame))return PX_LIFE.get(frame);
  const angle=frame*Math.PI*2/PX_STAGE_FRAMES;
  const s=new PixelSurface(640,360);
  for(const [x,base,light,shade] of [[77,'#365f7f','#75c9d9','#29465f'],[547,'#824856','#df9a88','#633640']]) {
    for(let j=0;j<94;j++) {
      // The rail pins the top; a travelling fold pulls the free hem farther
      // than the shoulder. Broad light/dark bands read as cloth at play size.
      const loose=Math.min(j/61,1),wave=Math.round(Math.sin(angle-j*.065)*7*loose);
      const w=32-Math.round((1-Math.cos(angle-j*.09))*2*loose);
      // Full-length cloth ends in two pointed swallowtails. Slice the hem
      // with the same travelling fold so neither tip is a rigid attachment.
      const inset=j>76?Math.ceil((j-76)*7/17):0;
      const notch=j>81?Math.ceil((j-81)*8/12):0;
      const left=Math.round(inset*(w-1)/31),right=w-1-left;
      const spans=notch?[[left,Math.floor((15.5-notch)*(w-1)/31)],[Math.ceil((15.5+notch)*(w-1)/31),right]]:[[left,right]];
      const fold=Math.round(Math.sin(angle-j*.07)*3*loose);
      for(const [a,b]of spans)for(let u=a;u<=b;u++) {
        const col=u===a||u===b||j===93?PX_INK:u>=4+fold&&u<7+fold?light:u>=10+fold&&u<14+fold?shade:base;
        s.dot(x+wave+u,160+j,col);
      }
      if(j>=15&&j<=37) {
        const half=Math.floor(7*(1-Math.abs(j-26)/11)),cx=x+wave+20;
        s.rect(cx-half,160+j,half*2+1,1,light);
        if(j>=18&&j<=34)s.dot(cx,160+j,base);
      }
    }
  }
  PX_LIFE.set(frame,s);return s;
}
function pxMakeBG() {
  const source=pxStage(),out={foreM:160};
  for(const key of Object.keys(source)) {
    const src=source[key],cv=document.createElement('canvas');cv.width=src.w*2;cv.height=src.h*2;
    const c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(pxCanvas(src),0,0,cv.width,cv.height);out[key]=cv;
  }
  return out;
}

// Two new original arenas. Background art only: no collision, hazard or simulation hooks.
const PX_STAGE_VARIANTS = new Map();
function pxStageVariant(id) {
  if(PX_STAGE_VARIANTS.has(id))return PX_STAGE_VARIANTS.get(id);
  const s=new PixelSurface(640,360);
  if(id==='gallery')pxGallery(s);else pxObservatory(s);
  PX_STAGE_VARIANTS.set(id,s);return s;
}
function pxGallery(s) {
  s.rect(0,0,640,360,'#21313e');
  for(let n=0;n<9;n++) {const y=21+n*31;s.line([0,y],[640,y],'#2c3d49');for(let x=(n%2)*36;x<640;x+=72)s.line([x,y],[x,y+30],'#2b3b48');}
  // Deep, arched panes looking out over rain and a distant canal.
  for(const [x,w]of [[90,132],[250,140],[418,132]]) {
    s.rect(x-6,108,w+12,173,'#121f2e');s.ellipse(x+w/2,108,w/2+6,64,'#121f2e');
    s.rect(x,108,w,167,'#344858');s.ellipse(x+w/2,108,w/2,58,'#344858');
    s.rect(x+5,111,w-10,160,'#172b41');s.ellipse(x+w/2,111,w/2-5,52,'#172b41');
    for(let n=0;n<3;n++)s.rect(x+6,177+n*25,w-12,19,['#263d50','#304959','#3e5863'][n]);
    for(let n=0;n<5;n++){const bx=x+8+n*24,h=18+n%3*9;s.rect(bx,207-h,19,h,'#243747');s.rect(bx+4,211-h,2,4,'#6e8990');}
    s.rect(x+7,247,w-14,24,'#44616c');s.rect(x+10,252,w-20,1,'#718b8c');
    for(let n=1;n<4;n++)s.rect(x+n*w/4-1,66,3,208,'#4c6069');
    s.rect(x+3,151,w-6,5,'#4c6069');s.rect(x+3,219,w-6,4,'#4c6069');
    s.rect(x-9,272,w+18,6,'#607077');s.rect(x-9,278,w+18,4,'#182735');
  }
  // Vault ribs and asymmetric shelf bays, with broad book-spine clusters.
  for(const x of [62,231,402,571]) {
    s.rect(x-6,0,12,282,'#182735');s.rect(x-3,0,5,279,'#42535d');s.rect(x-8,166,16,7,'#617078');
    s.line([x,166],[x-30,67],'#42535d',5);s.line([x,166],[x+30,67],'#42535d',5);
  }
  for(const [x,w,top]of [[0,51,95],[590,50,116]]) {
    s.rect(x,top,w,166,'#15212e');s.rect(x,top,w,5,'#6a625b');
    for(let row=0;row<4;row++) {
      const y=top+9+row*36;
      for(let n=0;n<7;n++) {const bx=x+4+n*6,h=18+(n*7+row*3)%11,col=['#635a60','#79705f','#566a69','#76616c'][n%4];s.rect(bx,y+28-h,4,h,col);s.rect(bx,y+31-h,3,1,'#b1a184');}
      s.rect(x,y+29,w,4,'#716a60');s.rect(x,y+33,w,2,'#172432');
    }
    s.rect(x+1,top,3,166,'#a08b71');s.rect(x+w-4,top,3,166,'#494d52');
  }
  // Warm reading lamps soften the cool panes without any glow/filter.
  for(const x of [65,574]) {
    s.rect(x-2,191,4,33,'#131f2b');s.rect(x-7,219,14,3,'#a18a68');
    s.poly([[x-10,191],[x-5,182],[x+5,182],[x+10,191]],'#a78b65','#14212e');s.rect(x-6,191,12,3,'#efd4a0');
  }
  s.rect(0,282,640,78,'#586571');s.rect(0,282,640,3,'#96a0a0');
  for(const y of [296,314,337])s.rect(0,y,640,1,'#3b4d5b');
  for(let n=-6;n<9;n++){s.line([320+n*59,285],[320+n*91,359],'#3b4d5b');s.line([321+n*59,285],[321+n*91,359],'#718087');}
  // Muted reflected window strips stay below the fighters' feet.
  for(const x of [127,286,452])for(let n=0;n<3;n++)s.rect(x-n*3,318+n*7,69+n*4,2,'#6e7e85');
  s.ellipse(320,306,77,9,'#65737b');s.ellipse(320,306,73,7,'#586571');
  s.poly([[300,306],[320,300],[340,306],[320,312]],'#9c927d');s.poly([[305,306],[320,302],[335,306],[320,310]],'#586571');
  s.rect(0,348,640,12,'#263644');s.rect(0,348,640,2,'#99917f');
}
function pxObservatory(s) {
  ['#403c61','#514969','#6b5875','#8b6d83','#b1838e','#ce9b98','#dfb39e','#e6c9ad'].forEach((col,n)=>s.rect(0,n*36,640,36,col));
  s.rect(0,288,640,72,'#8c8b8d');
  s.ellipse(482,139,29,29,'#efd3ab');s.ellipse(482,139,24,24,'#f6dfbb');
  s.poly([[0,251],[0,207],[41,202],[78,219],[114,187],[146,206],[187,191],[228,217],[266,201],[307,221],[352,186],[396,199],[433,175],[464,191],[513,179],[559,208],[600,195],[640,208],[640,282],[0,282]],'#887b91');
  s.poly([[0,256],[61,238],[113,247],[171,226],[234,239],[293,229],[355,245],[416,224],[479,239],[542,220],[596,237],[640,229],[640,282],[0,282]],'#a48c99');
  // A distant stepped viaduct runs toward the river, well behind the terrace.
  for(let n=0;n<14;n++){const x=n*49;s.rect(x,244,6,36,'#7a788b');s.rect(x+6,244,43,5,'#c1a2a1');s.line([x+6,249],[x+20,263],'#8c8394',3);s.line([x+43,249],[x+29,263],'#8c8394',3);}
  s.rect(0,277,640,5,'#a29c9e');
  // Offset observatory dome, service door, and copper ribs.
  s.rect(41,174,136,108,'#8c8183');s.ellipse(109,174,73,58,'#344957');s.ellipse(109,174,68,53,'#52737a');s.rect(36,174,146,9,'#334957');
  for(let n=-2;n<=2;n++)s.line([109+n*9,123],[109+n*27,173],'#88a19a',2);
  s.rect(101,116,17,7,'#344957');s.rect(103,113,13,4,'#d3b194');s.rect(51,185,116,3,'#c4aa94');
  s.rect(77,211,56,70,'#584f62');s.ellipse(105,211,28,23,'#584f62');s.rect(82,216,46,66,'#293b4c');s.ellipse(105,215,23,20,'#293b4c');
  s.rect(104,197,3,83,'#8f9996');s.rect(118,247,3,7,'#dfbf91');
  for(const x of [55,146]){s.rect(x,201,12,26,'#384d59');s.rect(x+2,204,8,20,'#c7aca0');}
  // Original brass sky instrument: intersecting offset rings and an open fork pedestal.
  s.poly([[369,281],[379,250],[399,250],[407,281]],'#6a6974','#394858');s.rect(373,274,32,7,'#b2a08b');
  s.line([383,255],[383,205],'#384958',9);s.line([383,255],[383,205],'#b69d7e',5);
  s.line([383,229],[352,207],'#384958',7);s.line([383,229],[352,207],'#b69d7e',3);
  pxObservatoryMeridian(s);
  pxStageRing(s,392,178,67,65,'#394858',6);pxStageRing(s,392,178,67,65,'#c6aa83',3);
  s.line([352,126],[432,230],'#394858',6);s.line([352,126],[432,230],'#d5b98e',3);
  s.ellipse(392,178,9,9,'#394858');s.ellipse(392,178,6,6,'#d9bf96');
  // Back rail and broad, level stone fighting platform at exactly GROUND/2.
  s.rect(0,281,640,6,'#4b5365');s.rect(0,281,640,2,'#dbc5aa');
  for(let x=14;x<640;x+=42){s.rect(x,262,5,20,'#6e7180');s.rect(x-2,261,9,3,'#c7b5a2');}
  s.rect(0,287,640,73,'#b2a48f');s.rect(0,287,640,4,'#ddc7a5');
  for(const y of [298,316,338])s.rect(0,y,640,1,'#887f7b');
  for(let n=-7;n<9;n++){s.line([320+n*48,291],[320+n*77,360],'#8e837a');s.line([321+n*48,291],[321+n*77,360],'#c4b39a');}
  s.ellipse(320,307,87,9,'#c5b39a');s.ellipse(320,307,82,7,'#b2a48f');
  s.line([293,307],[347,307],'#887f7b');s.line([320,303],[320,311],'#887f7b');
  s.rect(0,348,640,12,'#4c4c60');s.rect(0,348,640,2,'#dec5a1');
  for(const x of [29,593]){s.rect(x,190,4,91,'#394957');s.rect(x-3,187,10,5,'#c4aa83');s.rect(x-2,278,9,7,'#776f76');}
}
function pxStageRing(s,x,y,rx,ry,col,width) {
  let prev=[x+rx,y];for(let n=1;n<=64;n++){const a=n*Math.PI/32,p=[x+Math.cos(a)*rx,y+Math.sin(a)*ry];s.line(prev,p,col,width);prev=p;}
}
function pxObservatoryMeridian(s) {
  // A fixed, opposing meridian keeps an open globe when the turning hoop is
  // edge-on. It belongs to the static frame, behind the hoop, axle and hub.
  const points=[];
  for(let n=0;n<=64;n++) {
    const a=n*Math.PI/32,u=Math.cos(a)*27,v=Math.sin(a)*61;
    points.push([392+u*.766+v*.643,178-u*.643+v*.766]);
  }
  for(let n=1;n<points.length;n++)s.line(points[n-1],points[n],'#394858',6);
  for(let n=1;n<points.length;n++)s.line(points[n-1],points[n],n<=32?'#b29878':'#ddbf94',3);
}
function pxObservatoryHoop(s,frame) {
  // An unmarked hoop repeats after half a turn. Sixteen projections ease from
  // broad to edge-on and back, with no reset jump or extra clock/cache.
  const spread=Math.cos(frame*Math.PI/PX_STAGE_FRAMES)*58,points=[];
  for(let n=0;n<=64;n++) {
    const a=n*Math.PI/32,u=Math.cos(a)*spread,v=Math.sin(a)*53;
    points.push([392+u*.94-v*.342,178+u*.342+v*.94]);
  }
  for(let n=1;n<points.length;n++)s.line(points[n-1],points[n],'#394858',7);
  // Shaded upper brass and a broad lit lower rim read at native play size.
  for(let n=1;n<points.length;n++)s.line(points[n-1],points[n],n<=32?'#edd1a0':'#9e8268',4);
  // The fixed axle stays in front as the moving hoop crosses it.
  s.line([352,126],[432,230],'#394858',6);s.line([352,126],[432,230],'#d5b98e',3);
}
function pxStageMotion(s,id,frame) {
  const angle=frame*Math.PI*2/PX_STAGE_FRAMES;
  if(id==='gallery') {
    // Rain stays outside individual window panes, never across fighter silhouettes or the floor.
    for(const [x,w]of [[97,118],[257,126],[425,118]])for(let n=0;n<20;n++) {
      const rx=x+5+(n*29)%Math.floor(w-12),ry=113+(n*31+Math.floor(frame*148/PX_STAGE_FRAMES))%148;
      for(let j=0;j<7;j++) {
        const px=Math.round(rx-j/3),py=ry+j,p=(py*s.w+px)*4;
        if(py>=261)continue;
        // Keep the stone mullions and crossbars in front of the rain.
        const r=s.data[p],g=s.data[p+1],b=s.data[p+2];
        if((r===23&&g===43&&b===65)||(r===38&&g===61&&b===80)||(r===48&&g===73&&b===89)||(r===62&&g===88&&b===99)||(r===36&&g===55&&b===71)||(r===68&&g===97&&b===108))s.dot(px,py,n%3?'#526d7c':'#78909a');
      }
    }
    // A soft two-step pulse, not a one-frame flicker at the loop reset.
    for(const x of [65,574])s.rect(x-4,192,8,1,Math.cos(angle)>0?'#e1c394':'#f2d9ac');
  } else {
    // Small, reversible wind drift closes naturally at the last/first phase.
    for(let n=0;n<4;n++){const x=n*173+Math.round(Math.sin(angle)*12)-40,y=78+n%2*23;s.rect(x,y,64,3,'#aa8c99');s.rect(x+10,y-3,39,3,'#aa8c99');}
    pxObservatoryHoop(s,frame);
    s.ellipse(392,178,9,9,'#394858');s.ellipse(392,178,6,6,'#d9bf96');
    s.line([392,178],[392+Math.cos(angle)*51,178+Math.sin(angle)*18],'#e4cda2',2);
    for(const x of [33,597])for(let j=0;j<46;j++) {const wave=Math.round(Math.sin(angle+j*.12)*3*j/46);s.rect(x+wave,195+j,15,1,'#3c596b');s.rect(x+wave+2,195+j,2,1,'#a5c6c1');}
  }
}
