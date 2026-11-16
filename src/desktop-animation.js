'use strict';
// Desktop-only fighter poses. Existing recovery and move ticks are the
// animation clocks: hit-stop, cinematic freezes and stopped actors hold poses.
// No hit event, wall clock or presentation history is needed by guest snapshots.
Object.assign(PX_POSES, {
  hitreel: {planted:true,h:[-29,-78],tilt:-.32,s:[-23,-57],hip:[-4,-29],a:[[4,-44],[19,-28]],b:[[-37,-41],[-47,-26]],l:[[21,-15],[29,0]],r:[[-24,-15],[-31,0]]},
  hitbrace: {planted:true,h:[-4,-57],tilt:.25,s:[-12,-43],hip:[-9,-24],a:[[15,-35],[27,-47]],b:[[-28,-32],[-19,-20]],l:[[20,-12],[29,0]],r:[[-25,-13],[-31,0]]},
  hitrise: {planted:true,h:[-7,-71],tilt:.08,s:[-9,-54],hip:[-6,-31],a:[[14,-40],[23,-54]],b:[[-26,-39],[-16,-51]],l:[[18,-16],[29,0]],r:[[-24,-17],[-31,0]]},
  // Lower the joined hands with the body, then lift the seal on summon release.
  // Fixed soles and the same palette/contours keep this in the existing style.
  summoncoil: {planted:true,h:[-9,-66],tilt:.12,s:[-12,-51],hip:[-9,-26],a:[[13,-36],[9,-46]],b:[[-27,-37],[4,-46]],l:[[18,-13],[23,0]],r:[[-26,-14],[-29,0]]},
  summonseal: {planted:true,h:[-2,-84],s:[-4,-67],hip:[-4,-36],a:[[27,-58],[26,-80]],b:[[-20,-57],[20,-80]],l:[[13,-19],[23,0]],r:[[-21,-20],[-29,0]]},
});
const desktopPoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk') {
    const m=moveDef(f);
    if(m&&(m.id==='dogs'||m.id==='nue'||m.id==='toad')) {
      if(f.mt>=Math.ceil(m.su/2)&&f.mt<m.su)return 'summoncoil';
      if(f.mt>=m.su&&f.mt<m.su+Math.min(3,Math.ceil(m.re/3)))return 'summonseal';
    }
  }
  if(!f.portrait&&f.st==='hit'&&f.y>=GROUND)
    return f.stT>10?'hitreel':f.stT>5?'hitbrace':'hitrise';
  return desktopPoseBase(S,f);
};
