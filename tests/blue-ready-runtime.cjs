// Reuse the actual HTML/DOM/main-loop harness initialization, without unrelated long suites.
const fs=require('node:fs'),vm=require('node:vm');
const harness=fs.readFileSync(__dirname+'/runtime.cjs','utf8');
const context=Function('require','__dirname',harness.slice(0,harness.indexOf('vm.runInContext(`'))+'\nreturn context;')(require,__dirname);
vm.runInContext(`
const normalAI=aiInput,maximumPaintBase=pxPaintFighter;
const mockConnection=()=>({open:true,events:{},sent:[],on(name,fn){this.events[name]=fn;},send(m){this.sent.push(m);}});
aiInput=()=>0;const bluePaints=[];
pxPaintFighter=function(s,S,f,impact){if(f.st==='atk'&&moveDef(f)?.id==='blue')bluePaints.push({t:f.mt,pose:pxPose(S,f)});return maximumPaintBase(s,S,f,impact);};
const blueCh=CH.findIndex(c=>c.arts.some(a=>a.id==='blue'));
for(const mode of ['ai','local','host']) {
  G.mode=mode;G.pick=[blueCh,blueCh];startFight();G.S.phase='fight';G.S.t=121;G.last=1000;G.acc=0;
  const slot=mode==='local'?1:0;G.S.f[0].x=420;G.S.f[1].x=640;G.S.f[slot].ce=100;bluePaints.length=0;
  const binding=mode==='local'?BIND.p2:BIND.solo,code=binding.A1[0];
  events.keydown({code,repeat:false,preventDefault(){}});events.keyup({code});
  for(let n=1;n<=100;n++)frame(1000+n*17);
  for(const [a,b,pose] of [[1,6,'blueready'],[6,12,'bluereach'],[12,15,'blueset'],[15,19,'bluedraw'],[19,24,'bluerecover'],[24,30,'bluesettle']])
    assert(bluePaints.some(p=>p.t>=a&&p.t<b&&p.pose===pose),mode+' Lapse Blue missed '+pose);
  assert.equal(G.S.f[slot].hp,CH[blueCh].hp);assert.equal(G.S.f[1-slot].hp,CH[blueCh].hp-85);toMenu();
}
G.mode='guest';const blueConn=mockConnection();netWire(blueConn,'guest');blueConn.events.open();G.pick=[blueCh,blueCh];startFight();
for(const owner of [0,1])for(const [mt,pose] of [[1,'blueready'],[5,'blueready'],[6,'bluereach'],[11,'bluereach'],[12,'blueset'],[14,'blueset'],[15,'bluedraw'],[18,'bluedraw'],[19,'bluerecover'],[23,'bluerecover'],[24,'bluesettle'],[29,'bluesettle']]) {
  const snapshot=newMatch(blueCh,blueCh,147);snapshot.phase='fight';startMove(snapshot.f[owner],'a0');snapshot.f[owner].mt=mt;snapshot.ev=[];
  bluePaints.length=0;blueConn.events.data({t:'s',s:snapshot,e:[]});G.acc=0;G.last=1000;frame(1017);
  assert(bluePaints.some(p=>p.t===mt&&p.pose===pose));
}
pxPaintFighter=maximumPaintBase;aiInput=normalAI;netClose();G.mode='ai';toMenu();
console.log('PASS desktop Lapse Blue reach/close/draw/recovery through AI/local/host keys and twenty-four event-free guest snapshots');
`,context);
