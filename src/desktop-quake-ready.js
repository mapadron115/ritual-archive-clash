'use strict';
// Gamma Quake gathers and raises its fist without changing the planted strike feet.
Object.assign(PX_POSES, {
  quakegather: {planted:true,h:[-10,-74],s:[-10,-57],hip:[-8,-29],a:[[-27,-42],[-29,-52]],b:[[15,-43],[21,-57]],l:[[21,-13],[33,0]],r:[[-28,-15],[-37,0]]},
  quakeraise: {planted:true,h:[-14,-75],tilt:-.08,s:[-13,-58],hip:[-8,-29],a:[[-38,-50],[-43,-74]],b:[[14,-43],[20,-57]],l:[[21,-13],[33,0]],r:[[-28,-15],[-37,0]]},
});
const desktopQuakeReadyPoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk'&&f.y>=GROUND) {
    const m=moveDef(f);
    if(m&&m.id==='quake'&&f.mt<m.su/2)return f.mt<m.su/4?'quakegather':'quakeraise';
  }
  return desktopQuakeReadyPoseBase(S,f);
};
