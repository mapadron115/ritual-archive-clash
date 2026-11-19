// Reuse the actual HTML/DOM/main-loop harness initialization, without unrelated long suites.
const fs=require('node:fs'),vm=require('node:vm');
const harness=fs.readFileSync(__dirname+'/runtime.cjs','utf8');
const context=Function('require','__dirname',harness.slice(0,harness.indexOf('vm.runInContext(`'))+'\nreturn context;')(require,__dirname);
vm.runInContext(`
const normalAI=aiInput,quakePaintBase=pxPaintFighter;
const mockConnection=()=>({open:true,events:{},sent:[],on(name,fn){this.events[name]=fn;},send(m){this.sent.push(m);}});
// Gamma Quake keeps wide footing from preparation through guard recovery.
aiInput=()=>0;const quakePaints=[];
pxPaintFighter=function(s,S,f,impact){if(f.st==='atk'&&moveDef(f)?.id==='quake')quakePaints.push({t:f.mt,pose:pxPose(S,f)});return quakePaintBase(s,S,f,impact);};
const quakeCh=CH.findIndex(c=>c.arts.some(a=>a.id==='quake'));
for(const mode of ['ai','local','host']) {
 G.mode=mode;G.pick=[quakeCh,quakeCh];startFight();G.S.phase='fight';G.S.t=121;G.last=1000;G.acc=0;
 const slot=mode==='local'?1:0;G.S.f[0].x=420;G.S.f[1].x=640;G.S.f[slot].ce=100;quakePaints.length=0;
 const binding=mode==='local'?BIND.p2:BIND.solo,code=binding.A3[0];
 events.keydown({code,repeat:false,preventDefault(){}});events.keyup({code});
 for(let n=1;n<=50;n++)frame(1000+n*17);
 for(const [a,b,pose] of [[1,5,'quakegather'],[5,10,'quakeraise'],[10,20,'quakeopen'],[20,23,'quakeimpact'],[23,35,'quakepull'],[35,42,'quakerise']])
  assert(quakePaints.some(p=>p.t>=a&&p.t<b&&p.pose===pose),mode+' Gamma Quake missed '+pose);
 assert.equal(G.S.f[slot].hp,CH[quakeCh].hp);toMenu();
}
G.mode='guest';const quakeConn=mockConnection();netWire(quakeConn,'guest');quakeConn.events.open();G.pick=[quakeCh,quakeCh];startFight();
for(const owner of [0,1])for(const [mt,pose] of [[1,'quakegather'],[4,'quakegather'],[5,'quakeraise'],[9,'quakeraise'],[10,'quakeopen'],[19,'quakeopen'],[20,'quakeimpact'],[22,'quakeimpact'],[23,'quakepull'],[34,'quakepull'],[35,'quakerise'],[41,'quakerise']]) {
 const snapshot=newMatch(quakeCh,quakeCh,161);snapshot.phase='fight';startMove(snapshot.f[owner],'a2');snapshot.f[owner].mt=mt;snapshot.ev=[];
 quakePaints.length=0;quakeConn.events.data({t:'s',s:snapshot,e:[]});G.acc=0;G.last=1000;frame(1017);
 assert(quakePaints.some(p=>p.t===mt&&p.pose===pose));
}
pxPaintFighter=quakePaintBase;aiInput=normalAI;netClose();G.mode='ai';toMenu();

console.log('PASS Gamma Quake through actual AI/local/host keyboard frames and 24 event-free guest snapshots');
`,context);
