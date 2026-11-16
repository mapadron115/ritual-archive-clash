'use strict';
// Install before the game scripts, including boot, without suppressing the
// browser console. Keep the first failure so repeated animation-frame errors
// cannot overwrite the useful message before a phone screenshot is taken.
(() => {
  const panel=document.getElementById('mobileError');
  const output=document.getElementById('mobileErrorText');
  let shown=false;
  function show(kind,reason,location='') {
    if(shown)return;
    shown=true;
    const message=reason&&reason.message!==undefined?String(reason.message):String(reason==null?'Unknown error':reason);
    const stack=reason&&typeof reason.stack==='string'?reason.stack.split('\n').map(s=>s.trim()).filter(Boolean):[];
    // V8 prefixes its stack with the message; WebKit starts with function@URL.
    const first=stack.find(s=>s!==message&&!/^(?:\w*Error|DOMException)(?::|$)/.test(s))||location;
    const canvas=document.getElementById('cv');
    const viewport=innerWidth+'x'+innerHeight+' / DPR '+(globalThis.devicePixelRatio||1);
    output.textContent=kind+': '+message.slice(0,1000)+(first?'\n'+first.slice(0,500):'')+
      '\n'+viewport+(canvas?' / arena '+canvas.width+'x'+canvas.height:'');
    panel.hidden=false;
  }
  addEventListener('error',event=>{
    if(event.message||event.error) {
      const location=event.filename?event.filename+':'+(event.lineno||0)+':'+(event.colno||0):'';
      show('Error',event.error||event.message,location);
    } else if(event.target&&event.target.src) {
      show('Load error','Could not load '+event.target.src);
    }
  },true);
  addEventListener('unhandledrejection',event=>show('Unhandled rejection',event.reason));
})();
