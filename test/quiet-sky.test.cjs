const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const SkyMath=require('../vendor/sky-math.js'),SkyStars=require('../vendor/stars.js');
test('quiet sky renders real above-horizon catalog stars and bounds invalid controls',()=>{
 let definition;vm.runInNewContext(fs.readFileSync(require.resolve('../MMM-MischiefQuietSky.js'),'utf8'),{Module:{register(n,d){definition=d;}},SkyMath,SkyStars,innerWidth:1680,innerHeight:1050});
 let arcs=0;const ctx={clearRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},fill(){},arc(x,y,r){assert.ok(Number.isFinite(x)&&Number.isFinite(y)&&r>0);arcs++;}};
 const instance={...definition,config:{...definition.defaults},epoch:Date.UTC(2026,10,9,8),reduced:{matches:false},canvas:{width:0,height:0,dataset:{},getContext(){return ctx;}}};
 instance.draw();assert.ok(Number(instance.canvas.dataset.stars)>100);assert.ok(arcs>100);assert.equal(instance.canvas.width,1200);
 instance.config.brightness=Infinity;assert.equal(instance.number('brightness',0,70,32),32);instance.config.motionSpeed=100;assert.equal(instance.number('motionSpeed',0,30,6),30);
});
