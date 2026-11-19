// Reuse the actual HTML/DOM/main-loop harness initialization, without unrelated long suites.
const fs=require('node:fs'),vm=require('node:vm');
const harness=fs.readFileSync(__dirname+'/runtime.cjs','utf8');
const context=Function('require','__dirname',harness.slice(0,harness.indexOf('vm.runInContext(`'))+'\nreturn context;')(require,__dirname);
vm.runInContext(`
const normalAI=aiInput,thunderPaintBase=pxPaintFighter;
const mockConnection=()=>({open:true,events:{},sent:[],on(name,fn){this.events[name]=fn;},send(m){this.sent.push(m);}});
// Thunder Clap keeps wide footing from preparation through guard recovery.
aiInput=()=>0;const thunderPaints=[];
pxPaintFighter=function(s,S,f,impact){if(f.st==='atk'&&moveDef(f)?.id==='thunderclap')thunderPaints.push({t:f.mt,pose:pxPose(S,f)});return thunderPaintBase(s,S,f,impact);};
const thunderCh=CH.findIndex(c=>c.arts.some(a=>a.id==='thunderclap'));
for(const mode of ['ai','local','host']) {
 G.mode=mode;G.pick=[thunderCh,thunderCh];startFight();G.S.phase='fight';G.S.t=121;G.last=1000;G.acc=0;
 const slot=mode==='local'?1:0;G.S.f[0].x=420;G.S.f[1].x=640;G.S.f[slot].ce=100;thunderPaints.length=0;
 const binding=mode==='local'?BIND.p2:BIND.solo,code=binding.A1[0];
 events.keydown({code,repeat:false,preventDefault(){}});events.keyup({code});
 for(let n=1;n<=34;n++)frame(1000+n*17);
 for(const [a,b,pose] of [[1,6,'thunderready'],[6,12,'thunderopen'],[12,15,'thunderclose'],[15,23,'thunderpull'],[23,28,'thundersettle']])
  assert(thunderPaints.some(p=>p.t>=a&&p.t<b&&p.pose===pose),mode+' Thunder Clap missed '+pose);
 assert.equal(G.S.f[slot].hp,CH[thunderCh].hp);toMenu();
}
G.mode='guest';const thunderConn=mockConnection();netWire(thunderConn,'guest');thunderConn.events.open();G.pick=[thunderCh,thunderCh];startFight();
for(const owner of [0,1])for(const [mt,pose] of [[2,'thunderready'],[5,'thunderready'],[6,'thunderopen'],[11,'thunderopen'],[12,'thunderclose'],[14,'thunderclose'],[15,'thunderpull'],[22,'thunderpull'],[23,'thundersettle'],[27,'thundersettle']]) {
 const snapshot=newMatch(thunderCh,thunderCh,161);snapshot.phase='fight';startMove(snapshot.f[owner],'a0');snapshot.f[owner].mt=mt;snapshot.ev=[];
 thunderPaints.length=0;thunderConn.events.data({t:'s',s:snapshot,e:[]});G.acc=0;G.last=1000;frame(1017);
 assert(thunderPaints.some(p=>p.t===mt&&p.pose===pose));
}
pxPaintFighter=thunderPaintBase;aiInput=normalAI;netClose();G.mode='ai';toMenu();

console.log('PASS Thunder Clap through actual AI/local/host keyboard frames and 20 event-free guest snapshots');
`,context);
