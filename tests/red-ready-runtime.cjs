// Reuse the actual HTML/DOM/main-loop harness initialization, without unrelated long suites.
const fs=require('node:fs'),vm=require('node:vm');
const harness=fs.readFileSync(__dirname+'/runtime.cjs','utf8');
const context=Function('require','__dirname',harness.slice(0,harness.indexOf('vm.runInContext(`'))+'\nreturn context;')(require,__dirname);
vm.runInContext(`
const normalAI=aiInput,maximumPaintBase=pxPaintFighter;
const mockConnection=()=>({open:true,events:{},sent:[],on(name,fn){this.events[name]=fn;},send(m){this.sent.push(m);}});
aiInput=()=>0;const redPaints=[];
pxPaintFighter=function(s,S,f,impact){if(f.st==='atk'&&moveDef(f)?.id==='red')redPaints.push({t:f.mt,pose:pxPose(S,f)});return maximumPaintBase(s,S,f,impact);};
const redCh=CH.findIndex(c=>c.arts.some(a=>a.id==='red'));
for(const mode of ['ai','local','host']) {
  G.mode=mode;G.pick=[redCh,redCh];startFight();G.S.phase='fight';G.S.t=121;G.last=1000;G.acc=0;
  const slot=mode==='local'?1:0;G.S.f[0].x=420;G.S.f[1].x=640;G.S.f[slot].ce=100;redPaints.length=0;
  const binding=mode==='local'?BIND.p2:BIND.solo,code=binding.A2[0];
  events.keydown({code,repeat:false,preventDefault(){}});events.keyup({code});
  for(let n=1;n<=100;n++)frame(1000+n*17);
  for(const [a,b,pose] of [[1,6,'redready'],[6,12,'redcoil'],[12,15,'reddrive'],[15,19,'redrecoil'],[19,25,'redrecover'],[25,32,'redsettle']])
    assert(redPaints.some(p=>p.t>=a&&p.t<b&&p.pose===pose),mode+' Reversal Red missed '+pose);
  assert.equal(G.S.f[slot].hp,CH[redCh].hp);assert.equal(G.S.f[1-slot].hp,CH[redCh].hp-100);toMenu();
}
G.mode='guest';const redConn=mockConnection();netWire(redConn,'guest');redConn.events.open();G.pick=[redCh,redCh];startFight();
for(const owner of [0,1])for(const [mt,pose] of [[1,'redready'],[5,'redready'],[6,'redcoil'],[11,'redcoil'],[12,'reddrive'],[14,'reddrive'],[15,'redrecoil'],[18,'redrecoil'],[19,'redrecover'],[24,'redrecover'],[25,'redsettle'],[31,'redsettle']]) {
  const snapshot=newMatch(redCh,redCh,145);snapshot.phase='fight';startMove(snapshot.f[owner],'a1');snapshot.f[owner].mt=mt;snapshot.ev=[];
  redPaints.length=0;redConn.events.data({t:'s',s:snapshot,e:[]});G.acc=0;G.last=1000;frame(1017);
  assert(redPaints.some(p=>p.t===mt&&p.pose===pose));
}
pxPaintFighter=maximumPaintBase;aiInput=normalAI;netClose();G.mode='ai';toMenu();
console.log('PASS desktop Reversal Red coil/drive/recoil/recovery through AI/local/host keys and twenty-four event-free guest snapshots');


`,context);
