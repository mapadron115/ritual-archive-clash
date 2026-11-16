'use strict';
// Desktop-only Nuclear Shell anticipation. This adapter is absent from mobile.
// The existing Domain age supplies the coil/brace boundary; no new move clock.
Object.assign(PX_POSES, {
  nuclearcoil: {planted:true,h:[-20,-61],tilt:.16,s:[-22,-44],hip:[-14,-22],a:[[1,-29],[8,-42]],b:[[-35,-31],[-5,-39]],l:[[15,-11],[29,0]],r:[[-33,-12],[-39,0]]},
  nuclearbrace: {planted:true,h:[-13,-85],tilt:-.12,s:[-12,-68],hip:[-7,-35],a:[[17,-48],[28,-45]],b:[[-3,-44],[19,-45]],l:[[18,-17],[29,0]],r:[[-28,-18],[-39,0]]},
});
const desktopMaximumPoseBase=pxDomainPose;
pxDomainPose=function(S,f) {
  const d=S.dom;
  if(d&&d.o===f.i&&d.k==='nuclear'&&d.t>=36&&d.t<72)
    return d.t<60?'nuclearcoil':'nuclearbrace';
  return desktopMaximumPoseBase(S,f);
};
