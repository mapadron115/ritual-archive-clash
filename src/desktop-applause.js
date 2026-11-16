'use strict';
// The swap is a clap; its delayed melee contact is a separate lunging punch.
// Serialized move age holds through hit-stop and event-free guest snapshots.
Object.assign(PX_POSES, {
  applauserush: {planted:true,h:[22,-66],tilt:.24,s:[10,-51],hip:[-8,-27],a:[[-12,-35],[-24,-43]],b:[[27,-42],[32,-56]],l:[[27,-13],[37,0]],r:[[-31,-14],[-43,0]]},
  applausestrike: {planted:true,h:[19,-68],tilt:.2,s:[13,-53],hip:[-4,-28],a:[[32,-49],[49,-49]],b:[[-15,-39],[-7,-50]],l:[[27,-14],[37,0]],r:[[-30,-15],[-43,0]]},
  applausefollow: {planted:true,h:[23,-64],tilt:.26,s:[16,-49],hip:[-2,-26],a:[[36,-43],[45,-39]],b:[[-12,-36],[-6,-46]],l:[[28,-13],[37,0]],r:[[-29,-14],[-43,0]]},
  applausepull: {planted:true,h:[8,-68],tilt:.1,s:[3,-52],hip:[-5,-28],a:[[24,-39],[19,-51]],b:[[-24,-39],[-13,-48]],l:[[24,-14],[37,0]],r:[[-30,-15],[-43,0]]},
  applausesettle: {planted:true,h:[0,-75],s:[-4,-59],hip:[-6,-31],a:[[15,-44],[24,-57]],b:[[-25,-42],[-15,-53]],l:[[23,-16],[37,0]],r:[[-30,-17],[-43,0]]},
});
const desktopApplausePoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk'&&f.y>=GROUND) {
    const m=moveDef(f);
    if(m&&m.id==='applause'&&f.mt>=m.su+3) {
      const contact=m.melee.at;
      if(f.mt<contact)return 'applauserush';
      if(f.mt<contact+3)return 'applausestrike';
      if(f.mt<contact+8)return 'applausefollow';
      if(f.mt<contact+12)return 'applausepull';
      return 'applausesettle';
    }
  }
  return desktopApplausePoseBase(S,f);
};
