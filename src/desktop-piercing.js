'use strict';
// Piercing Blood gathers low, aims joined hands, and feeds its sustained beam.
// Serialized move age supplies every boundary, including event-free snapshots.
Object.assign(PX_POSES, {
  bloodgather: {planted:true,h:[-16,-68],tilt:.12,s:[-17,-51],hip:[-10,-27],a:[[5,-34],[11,-44]],b:[[-24,-35],[6,-43]],l:[[18,-13],[29,0]],r:[[-29,-14],[-37,0]]},
  bloodaim: {planted:true,h:[-10,-80],s:[-12,-62],hip:[-8,-31],a:[[9,-36],[25,-35]],b:[[-10,-40],[21,-35]],l:[[18,-16],[29,0]],r:[[-27,-17],[-37,0]]},
  bloodstream: {planted:true,h:[9,-76],tilt:.08,s:[3,-58],hip:[-6,-30],a:[[13,-36],[31,-35]],b:[[0,-41],[27,-35]],l:[[22,-15],[29,0]],r:[[-28,-16],[-37,0]]},
  bloodwithdraw: {planted:true,h:[-7,-73],tilt:.1,s:[-10,-56],hip:[-8,-29],a:[[7,-34],[16,-44]],b:[[-18,-37],[11,-43]],l:[[19,-15],[29,0]],r:[[-27,-16],[-37,0]]},
});
const desktopPiercingPoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk'&&f.y>=GROUND) {
    const m=moveDef(f);
    if(m&&m.id==='piercing'&&f.mt>=Math.ceil(m.su/2)) {
      if(f.mt<m.su)return f.mt<m.su-6?'bloodgather':'bloodaim';
      // The original fourteen-tick beam survives the generic clap's recoil.
      // Keep the feed joined through its whole lifetime, then lower the hands.
      const elapsed=f.mt-m.su;
      if(elapsed<14)return 'bloodstream';
      if(elapsed<19)return 'bloodwithdraw';
    }
  }
  return desktopPiercingPoseBase(S,f);
};
