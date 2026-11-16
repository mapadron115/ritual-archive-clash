'use strict';
// Explosion loads a palm, drives it into the blast, then folds with the kickback.
// Serialized move age holds the body during freezes and event-free snapshots.
Object.assign(PX_POSES, {
  blastload: {planted:true,h:[-16,-73],tilt:-.1,s:[-18,-56],hip:[-10,-28],a:[[-4,-36],[3,-43]],b:[[-33,-43],[-22,-55]],l:[[18,-14],[31,0]],r:[[-29,-15],[-37,0]],palm:true},
  blastpush: {planted:true,h:[3,-71],tilt:.12,s:[1,-54],hip:[-7,-29],a:[[25,-38],[45,-37]],b:[[-26,-43],[-16,-55]],l:[[23,-14],[31,0]],r:[[-30,-16],[-37,0]],palm:true},
  blastkickback: {planted:true,h:[-24,-70],tilt:-.2,s:[-24,-53],hip:[-12,-26],a:[[9,-35],[26,-45]],b:[[-39,-41],[-28,-53]],l:[[18,-12],[31,0]],r:[[-31,-13],[-37,0]],palm:true},
  blastrecover: {planted:true,h:[-10,-68],tilt:.08,s:[-13,-51],hip:[-10,-25],a:[[6,-35],[18,-46]],b:[[-29,-38],[-18,-50]],l:[[21,-12],[31,0]],r:[[-28,-13],[-37,0]],palm:true},
});
const desktopBlastPoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk'&&f.y>=GROUND) {
    const m=moveDef(f);
    if(m&&m.id==='blast'&&f.mt>=Math.ceil(m.su/2)) {
      if(f.mt<m.su)return 'blastload';
      const elapsed=f.mt-m.su;
      if(elapsed<3)return 'blastpush';
      if(elapsed<7)return 'blastkickback';
      if(elapsed<Math.ceil(m.re*.65))return 'blastrecover';
    }
  }
  return desktopBlastPoseBase(S,f);
};
