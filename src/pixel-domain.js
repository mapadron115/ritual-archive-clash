'use strict';
// Original Domain scenery. Broad shaded volumes share the stages' integer raster,
// navy contours and three-tone materials. The fighting floor stays on its stage.
const PX_DOMAIN_PALETTES={
  void:['#142239','#0c172a','#263b51','#466276'],
  shrine:['#4e2536','#291d30','#623b48','#916457'],
  garden:['#25223e','#151c2d','#35364c','#555a68'],
  ovation:['#34302d','#201f2b','#51473d','#847357'],
  nuclear:['#4f3a33','#282630','#675048','#96755a'],
  bloodsweep:['#4c2c43','#281f32','#663e52','#986577'],
  megaphone:['#2c403a','#19272e','#40594f','#718675'],
  effigy:['#443641','#251f30','#604b4b','#8b7162'],
  theworld:['#4a422f','#272731','#675d43','#9c8c60'],
  absolute:['#22463f','#142a30','#386052','#6c9480'],
  howitzer:['#4c3631','#28252c','#675044','#9a7857'],
  web:['#432c4a','#241e33','#5c405d','#8a6680'],
  allout:['#28413d','#18292f','#3c5b4c','#71917a'],
  jce:['#233f4b','#152833','#385969','#6c8991'],
  worldbreaker:['#3a402e','#22282b','#525c3e','#84906a'],
};
const PX_DOMAIN_BACKDROPS=new Map();
function pxDomainBackdrop(kind) {
  if(!Object.hasOwn(PX_DOMAIN_PALETTES,kind))kind='void';
  if(PX_DOMAIN_BACKDROPS.has(kind))return PX_DOMAIN_BACKDROPS.get(kind);
  const [bg,dark,mid,light]=PX_DOMAIN_PALETTES[kind],s=new PixelSurface(640,283);
  s.rect(0,0,640,283,bg);
  const poly=(pts,c=mid,edge=PX_INK)=>s.poly(pts,c,edge);
  const block=(x,y,w,h)=>{
    poly([[x,y],[x+w-6,y],[x+w,y+6],[x+w,y+h],[x,y+h]],mid);
    poly([[x+w-7,y+5],[x+w,y+6],[x+w,y+h],[x+w-7,y+h]],dark);
    poly([[x,y],[x+6,y-5],[x+w,y-5],[x+w,y+5],[x+w-7,y+5],[x+w-12,y]],light);
    s.rect(x+3,y+5,2,Math.max(1,h-7),light);
  };
  // Thick ellipses with three nested tones, never hairline rings on a flat fill.
  const halo=(x,y,rx,ry)=>{
    s.ellipse(x,y,rx+2,ry+2,PX_INK);s.ellipse(x,y,rx,ry,dark);
    s.ellipse(x-2,y-2,rx-4,ry-4,light);s.ellipse(x,y+1,rx-10,ry-10,mid);
    s.ellipse(x,y,rx-17,ry-17,dark);s.ellipse(x,y,rx-22,ry-22,bg);
  };
  // Recessed horizon and large, stepped distant masses establish depth first.
  s.rect(0,188,640,92,dark);
  for(let n=0;n<12;n++) {
    const x=n*59-20,h=24+(n*29)%60;
    poly([[x,201],[x,201-h],[x+12,201-h],[x+18,193-h],[x+38,193-h],[x+48,201-h],[x+48,201]],dark,null);
  }
  if(kind==='void') {
    // An eclipse held in a broken celestial archive, with suspended stone shelves.
    halo(320,113,96,90);
    s.ellipse(320,113,37,35,dark);s.ellipse(315,108,25,24,mid);s.ellipse(312,104,10,9,light);
    for(const [x,y,w]of [[24,78,105],[493,58,127],[60,167,91],[480,187,105],[174,232,94],[355,245,115]])block(x,y,w,13);
    for(const [x,y]of [[54,30],[174,117],[452,100],[585,218]]) {s.rect(x,y,5,5,light);s.rect(x-3,y+1,3,2,mid);}
  } else if(kind==='shrine') {
    // Original stepped record-vault, with offset roofs and recessed tablets.
    for(let n=0;n<7;n++) {const x=104+n*66;block(x,93,24,187);s.rect(x+7,118,9,119,dark);s.rect(x+8,122,3,108,mid);}
    block(83,83,475,16);block(133,58,375,17);block(200,33,240,16);
    poly([[145,268],[169,246],[474,246],[499,268]],mid);
    s.rect(166,261,310,6,light);s.rect(145,269,354,11,dark);
    for(let n=0;n<4;n++)block(200+n*64,117,41,82);
  } else if(kind==='garden') {
    // Knotted shadow roots frame terraced pools; broad branch faces catch the light.
    for(const side of [-1,1]) {
      const x=side<0?65:575;
      poly([[x-50,280],[x-17,186],[x-29,110],[x-61,58],[x-42,50],[x+4,107],[x+17,167],[x+53,280]],mid);
      poly([[x-48,276],[x-10,185],[x-21,112],[x-50,62],[x-40,59],[x-4,113],[x+5,189]],light,null);
      poly([[x-12,149],[x+45,103],[x+63,48],[x+75,56],[x+62,121],[x+4,177]],dark);
      poly([[x-16,206],[x-68,175],[x-83,134],[x-71,135],[x-52,163],[x-11,180]],dark);
    }
    for(let n=0;n<4;n++) {const x=156+n*89,y=237+n%2*16;s.ellipse(x,y,64,13,PX_INK);s.ellipse(x,y-2,60,10,mid);s.ellipse(x,y,47,6,dark);s.rect(x-31,y-6,35,2,light);}
    for(let n=0;n<6;n++)block(160+n*60,150+n%2*15,15,28);
  } else if(kind==='ovation') {
    // A copper performance hall: pleated wings, tiered empty seats and overhead lamps.
    for(let n=0;n<4;n++) {
      const y=167+n*25;s.rect(58,y,524,18,mid);s.rect(58,y+3,524,3,light);
      for(let x=66;x<570;x+=33){s.rect(x,y+7,24,10,dark);s.rect(x+3,y+8,18,2,bg);}
    }
    for(const x of [0,528])for(let n=0;n<5;n++) {const a=x+n*24;poly([[a,0],[a+26,0],[a+22,239-n*6],[a+10,254-n*6],[a,235-n*6]],n%2?mid:dark);s.rect(a+4,8,4,179,light);}
    block(96,26,448,17);
    for(const x of [173,320,467]) {poly([[x-14,47],[x+14,47],[x+22,64],[x-22,64]],mid);s.rect(x-12,61,24,4,light);}
  } else if(kind==='nuclear') {
    // A heavy furnace vault with recessed turbine, segmented armor and stacked vents.
    halo(320,126,109,104);
    for(let n=0;n<10;n++) {const a=n*Math.PI/5,x=320+Math.cos(a)*70,y=126+Math.sin(a)*65;poly([[x-11,y-14],[x+15,y-8],[x+9,y+16],[x-9,y+8]],mid);}
    for(const x of [18,496]) {block(x,28,126,253);for(let n=0;n<5;n++){s.rect(x+17,55+n*38,88,21,dark);s.rect(x+17,55+n*38,88,4,light);}}
    block(160,248,320,31);
  } else if(kind==='bloodsweep') {
    // Tiered crimson channels pour between thick reservoir walls.
    for(let n=0;n<5;n++) {const x=38+n*128,y=49+n%2*37;block(x,y,64,230-y);s.rect(x+17,y+9,25,176-y,dark);s.rect(x+21,y+12,10,170-y,light);}
    for(let n=0;n<3;n++){const y=125+n*56;poly([[0,y],[640,y-28],[640,y-12],[0,y+16]],dark);poly([[0,y+1],[640,y-27],[640,y-20],[0,y+8]],mid);}
    s.rect(0,258,640,22,mid);for(let n=0;n<10;n++)s.rect(n*68+7,266,39,3,light);
  } else if(kind==='megaphone') {
    // Acoustic chamber: large flared resonators and stepped sound baffles.
    for(const side of [-1,1])for(let n=0;n<3;n++) {
      const x=side<0?20+n*57:620-n*57,h=145-n*30,w=19;
      poly([[x-w,279],[x-w,145-h/2],[x-w*1.8,101-h/2],[x+w*1.8,101-h/2],[x+w,145-h/2],[x+w,279]],mid);
      s.rect(x-w+4,143-h/2,6,128+h/2,light);s.rect(x+6,141-h/2,12,138+h/2,dark);
      s.ellipse(x,104-h/2,w*1.8,8,PX_INK);s.ellipse(x,103-h/2,w*1.4,5,dark);
    }
    for(let n=0;n<5;n++) {const y=28+n*33;poly([[215-n*13,y],[425+n*13,y],[418+n*13,y+13],[222-n*13,y+13]],mid);s.rect(224-n*13,y+1,192+n*26,3,light);}
  } else if(kind==='effigy') {
    // Suspended wooden seal tablets in an enormous joiner's frame.
    block(18,38,34,242);block(588,38,34,242);block(8,26,624,23);
    for(let n=0;n<7;n++) {
      const x=75+n*82,y=78+n%3*22;s.rect(x,50,3,y-50,dark);s.rect(x,51,1,y-51,light);
      poly([[x-22,y],[x+18,y-4],[x+27,y+32],[x+15,y+76],[x-20,y+70],[x-29,y+29]],mid);
      poly([[x-22,y],[x-14,y+4],[x-14,y+65],[x-20,y+70],[x-29,y+29]],dark);
      s.rect(x-6,y+8,4,50,light);s.rect(x+6,y+18,8,4,dark);s.rect(x-17,y+31,7,4,dark);
      s.rect(x-4,y-3,8,4,PX_INK);s.rect(x-3,y-4,6,3,light);
    }
    for(let n=0;n<6;n++)block(30+n*107,255-n%2*12,78,25+n%2*12);
  } else if(kind==='theworld') {
    // A massive stopped escapement in a recessed brass clock hall.
    halo(320,137,120,114);
    for(let n=0;n<12;n++) {const a=n*Math.PI/6,x=320+Math.sin(a)*96,y=137-Math.cos(a)*91;s.rect(x-4,y-4,9,9,dark);s.rect(x-3,y-4,7,3,light);}
    s.line([320,137],[320,66],PX_INK,11);s.line([320,137],[320,66],light,6);
    s.line([320,137],[368,162],PX_INK,11);s.line([320,137],[368,162],mid,6);s.ellipse(320,137,10,10,PX_INK);s.ellipse(318,135,7,7,light);
    for(const x of [33,125,487,579]) {block(x,64,28,216);for(let n=0;n<4;n++)block(x-8,91+n*45,43,9);}
  } else if(kind==='absolute') {
    // Round jade bucklers in a recessed sanctuary, distinct from allout's crags.
    // Thick rims, convex faces and raised bosses read as shields at native size.
    for(const [x,y,r]of [[38,139,43],[145,119,56],[602,139,43],[495,119,56],[320,115,91]]) {
      block(x-12,y+r-3,24,280-y-r);
      s.ellipse(x,y,r+2,r+2,PX_INK);s.ellipse(x,y,r,r,dark);
      s.ellipse(x-2,y-3,r-3,r-4,light);s.ellipse(x+1,y+2,r-9,r-9,mid);
      s.ellipse(x,y,r-17,r-17,PX_INK);s.ellipse(x,y,r-19,r-19,dark);
      s.ellipse(x-3,y-5,r-22,r-24,mid);
      const b=Math.round(r/4);
      poly([[x,y-b],[x+b,y],[x,y+b],[x-b,y]],dark);
      poly([[x,y-b],[x,y],[x-b,y]],light);
      poly([[x,y],[x+b,y],[x,y+b]],mid);
      for(const side of [-1,1])s.rect(x+side*(r-12)-2,y-2,5,5,PX_INK);
    }
    block(220,258,200,22);
  } else if(kind==='howitzer') {
    // A copper vortex behind banked launch vanes and damaged stone buttresses.
    halo(320,124,112,102);
    for(let n=0;n<7;n++) {
      const a=n*Math.PI*2/7,x=320+Math.cos(a)*62,y=124+Math.sin(a)*55;
      poly([[x-22,y-22],[x+8,y-29],[x+30,y+16],[x+8,y+9]],mid);
      s.line([x-20,y-21],[x+8,y-28],light,3);
    }
    for(const side of [-1,1])for(let n=0;n<3;n++) {const x=side<0?n*61:640-n*61;poly([[x-43,280],[x-23,164+n*17],[x+16,184+n*17],[x+38,280]],mid);poly([[x-43,280],[x-23,164+n*17],[x-16,182+n*17],[x-27,280]],light);}
  } else if(kind==='web') {
    // Tensioned bands weave through a deep lattice; ribbons have shaded width.
    for(let n=0;n<7;n++) {const x=n*109-35;poly([[x,0],[x+16,0],[x+140,280],[x+121,280]],dark);poly([[x+5,0],[x+10,0],[x+131,280],[x+126,280]],mid,null);}
    for(let n=0;n<6;n++) {const x=n*135-15;poly([[x,0],[x+13,0],[x-120,280],[x-138,280]],mid);poly([[x+1,0],[x+5,0],[x-130,280],[x-135,280]],light,null);}
    for(const x of [12,600]){block(x,19,28,261);for(let n=0;n<5;n++)block(x-4,42+n*48,36,9);}
  } else if(kind==='allout') {
    // A compressed emerald cavern; large angular crags lean toward an empty center.
    for(const side of [-1,1])for(let n=0;n<4;n++) {
      const x=side<0?15+n*64:625-n*64,y=41+n*34;
      poly([[x-42,280],[x-30,y+38],[x-4,y],[x+27,y+19],[x+39,280]],mid);
      poly([[x-30,y+38],[x-4,y],[x+6,y+17],[x-10,240],[x-31,276]],light);
      poly([[x+6,y+17],[x+27,y+19],[x+39,280],[x+5,263]],dark);
    }
    block(241,259,158,21);
  } else if(kind==='jce') {
    // A blue split-stone hall; broad slanting slabs carry bright beveled cut faces.
    for(let n=0;n<8;n++) {
      const x=n*101-40;
      poly([[x,280],[x+28,70],[x+86,29],[x+70,183],[x+100,280]],mid);
      poly([[x+28,70],[x+86,29],[x+78,47],[x+39,83],[x+13,280],[x,280]],light);
      poly([[x+78,47],[x+70,183],[x+100,280],[x+76,280],[x+54,181]],dark);
      poly([[x+15,173],[x+75,126],[x+73,140],[x+13,187]],bg);
    }
  } else if(kind==='worldbreaker') {
    // Monumental cracked green stone, with a raised central geological crown.
    for(let n=0;n<7;n++) {const x=15+n*96,y=67+(n%3)*27;block(x,y,47,213-y);poly([[x+24,y],[x+17,y+36],[x+29,y+57],[x+17,y+88],[x+28,y+78],[x+35,y+57],[x+25,y+35]],dark,null);}
    for(const [x,y,w,h]of [[110,209,116,71],[226,233,190,47],[416,214,116,66]])block(x,y,w,h);
    poly([[261,199],[278,150],[305,163],[322,121],[348,154],[369,146],[389,199]],mid);
    poly([[278,150],[288,170],[305,163],[322,121],[327,145],[308,182],[276,188]],light);
  }
  // Dark lower ledge anchors the space without painting over the fighting floor.
  s.rect(0,280,640,3,PX_INK);PX_DOMAIN_BACKDROPS.set(kind,s);return s;
}
function pxDomain(s,S) {
  const d=S.dom;if(!d)return;
  s.blit(pxDomainBackdrop(d.k),0,0);
  const palette=PX_DOMAIN_PALETTES[d.k]||PX_DOMAIN_PALETTES.void,t=Math.floor(d.t/8)%8;
  // Sparse hard-edged motes: one finite active-Domain clock, held through impact pauses.
  for(let n=0;n<12;n++) {
    const x=(n*137+23)%632,y=22+(n*41+t*(n%2?2:-2)+224)%224;
    s.rect(x,y,2+n%2,2,n%3?palette[2]:palette[3]);
  }
  if(d.k==='ovation') {
    const x=Math.round(S.f[1-d.o].x/2);
    s.poly([[x-10,65],[x+10,65],[x+92,280],[x-92,280]],palette[2]);
    s.poly([[x-5,66],[x+5,66],[x+51,280],[x-51,280]],palette[3]);
  }
}
