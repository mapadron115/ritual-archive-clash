'use strict';
// Guided Shell is cradled, lofted and followed by an extended guiding hand.
// Only existing move age selects the body; shell flight and combat stay unchanged.
Object.assign(PX_POSES, {
  guidedcradle: {planted:true,h:[-17,-66],tilt:.1,s:[-19,-50],hip:[-11,-27],a:[[-1,-29],[6,-38]],b:[[-32,-35],[-9,-39]],l:[[19,-13],[32,0]],r:[[-30,-14],[-38,0]]},
  guidedlift: {planted:true,h:[-11,-77],s:[-13,-60],hip:[-8,-31],a:[[7,-42],[14,-56]],b:[[-21,-44],[2,-49]],l:[[20,-16],[32,0]],r:[[-28,-16],[-38,0]]},
  guidedlaunch: {planted:true,h:[6,-77],tilt:.08,s:[1,-60],hip:[-5,-31],a:[[16,-43],[31,-49]],b:[[-21,-41],[-9,-46]],l:[[22,-16],[32,0]],r:[[-27,-17],[-38,0]]},
  guidedsteer: {planted:true,h:[2,-76],s:[-2,-59],hip:[-6,-30],a:[[16,-45],[33,-53]],b:[[-24,-40],[-12,-48]],l:[[21,-15],[32,0]],r:[[-28,-16],[-38,0]]},
  guidedrecover: {planted:true,h:[-8,-73],s:[-10,-56],hip:[-8,-29],a:[[9,-40],[22,-45]],b:[[-25,-41],[-10,-50]],l:[[20,-15],[32,0]],r:[[-29,-15],[-38,0]]},
});
const desktopGuidedPoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk'&&f.y>=GROUND) {
    const m=moveDef(f);
    if(m&&m.id==='guided'&&f.mt>=Math.ceil(m.su/2)) {
      if(f.mt<m.su)return f.mt<m.su-4?'guidedcradle':'guidedlift';
      const elapsed=f.mt-m.su;
      if(elapsed<3)return 'guidedlaunch';
      if(elapsed<10)return 'guidedsteer';
      if(elapsed<Math.ceil(m.re*.75))return 'guidedrecover';
    }
  }
  return desktopGuidedPoseBase(S,f);
};
