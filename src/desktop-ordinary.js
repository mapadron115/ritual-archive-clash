'use strict';
// Desktop pose refinements, kept separate from the phone's reviewed bodies.
// Serialized move age holds these bodies during freezes and guest snapshots.
Object.assign(PX_POSES, {
  quakeopen: {...PX_POSES.quakecoil,a:[[-43,-58],[-46,-98]]},
  thunderopen: {planted:true,h:[-15,-73],tilt:-.12,s:[-17,-55],hip:[-10,-27],a:[[17,-47],[39,-58]],b:[[-39,-46],[-48,-59]],l:[[20,-13],[32,0]],r:[[-29,-15],[-38,0]]},
  thunderclose: {planted:true,h:[10,-70],tilt:.12,s:[5,-53],hip:[-5,-28],a:[[27,-40],[35,-41]],b:[[19,-48],[35,-41]],l:[[23,-14],[32,0]],r:[[-29,-16],[-38,0]]},
  thunderpull: {planted:true,h:[5,-72],tilt:.08,s:[0,-55],hip:[-7,-29],a:[[28,-39],[38,-44]],b:[[-24,-41],[-13,-51]],l:[[21,-15],[32,0]],r:[[-28,-16],[-38,0]]},
});
const desktopOrdinaryPoseBase=pxPose;
pxPose=function(S,f) {
  if(!f.portrait&&f.st==='atk'&&f.y>=GROUND) {
    const m=moveDef(f);
    if(m&&m.id==='quake'&&f.mt>=10&&f.mt<m.su)return 'quakeopen';
    // Hold the palms wide before the shockwave, close them on release,
    // then separate them. Costs, projectiles and recovery stay in simulation.
    if(m&&m.id==='thunderclap'&&f.mt>=Math.ceil(m.su/2)) {
      if(f.mt<m.su)return 'thunderopen';
      const elapsed=f.mt-m.su;
      if(elapsed<Math.min(3,Math.ceil(m.re/3)))return 'thunderclose';
      if(elapsed<Math.ceil(m.re*.65))return 'thunderpull';
    }
  }
  return desktopOrdinaryPoseBase(S,f);
};
