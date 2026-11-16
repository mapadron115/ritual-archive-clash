'use strict';
// Desktop-only Maximum anticipation. This adapter is absent from mobile.
// The existing Domain age supplies the coil/brace boundary; no new move clock.
Object.assign(PX_POSES, {
  nuclearcoil: {planted:true,h:[-20,-61],tilt:.16,s:[-22,-44],hip:[-14,-22],a:[[1,-29],[8,-42]],b:[[-35,-31],[-5,-39]],l:[[15,-11],[29,0]],r:[[-33,-12],[-39,0]]},
  nuclearbrace: {planted:true,h:[-13,-85],tilt:-.12,s:[-12,-68],hip:[-7,-35],a:[[17,-48],[28,-45]],b:[[-3,-44],[19,-45]],l:[[18,-17],[29,0]],r:[[-28,-18],[-39,0]]},
  alloutcoil: {planted:true,h:[-22,-56],tilt:.2,s:[-23,-40],hip:[-13,-21],a:[[-32,-28],[-37,-40]],b:[[-2,-33],[12,-44]],l:[[17,-10],[31,0]],r:[[-30,-11],[-39,0]]},
  alloutdrive: {planted:true,h:[26,-64],tilt:.3,s:[13,-49],hip:[-7,-25],a:[[-12,-31],[-24,-37]],b:[[29,-39],[37,-51]],l:[[29,-12],[40,0]],r:[[-33,-13],[-46,0]]},
  voiceinhale: {planted:true,h:[-20,-88],tilt:-.3,s:[-19,-69],hip:[-7,-34],a:[[3,-53],[-6,-69]],b:[[-34,-48],[-39,-28]],l:[[16,-17],[28,0]],r:[[-28,-18],[-36,0]]},
  voicebrace: {planted:true,h:[0,-72],tilt:.08,s:[-5,-57],hip:[-9,-28],a:[[19,-43],[10,-64]],b:[[-25,-41],[-31,-26]],l:[[22,-14],[28,0]],r:[[-28,-15],[-36,0]]},
});
const desktopMaximumPoseBase=pxDomainPose;
pxDomainPose=function(S,f) {
  const d=S.dom;
  if(d&&d.o===f.i&&d.k==='nuclear'&&d.t>=36&&d.t<72)
    return d.t<60?'nuclearcoil':'nuclearbrace';
  // Tick 24 starts the existing rush. A completed hit must take the base punch
  // immediately; the pose never implies contact while the fighter is travelling.
  if(d&&d.o===f.i&&d.k==='allout'&&!d.done&&d.t>=12&&d.t<40)
    return d.t<24?'alloutcoil':'alloutdrive';
  // Draw breath, then plant for the word; mouth/voice release stays at tick 24.
  if(d&&d.o===f.i&&d.k==='megaphone'&&d.t>=12&&d.t<24)
    return d.t<20?'voiceinhale':'voicebrace';
  return desktopMaximumPoseBase(S,f);
};
