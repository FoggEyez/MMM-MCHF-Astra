/* global Module, SkyStars, SkyMath */
Module.register('MMM-MCHF-Astra',{
 requiresVersion:'2.38.0',
  defaults:{latitude:51.4769,longitude:0,brightness:32,constellationOpacity:12,showConstellations:true,starMagnitude:4.8,motionSpeed:6,rotation:0,fps:1},
  getScripts(){return ['vendor/ephemeris.js','vendor/sky-math.js','vendor/stars.js'].map(f=>this.file(f));},
  getStyles(){return [this.file('mischief-surfaces.css'),this.file('MMM-MCHF-Astra.css')];},
  start(){this.paused=false;this.timer=null;this.epoch=Date.now();this.reduced=window.matchMedia('(prefers-reduced-motion: reduce)');this.visibility=()=>this.schedule();document.addEventListener('visibilitychange',this.visibility);this.reduced.addEventListener('change',this.visibility);},
  getDom(){if(!this.canvas){this.canvas=document.createElement('canvas');this.canvas.className='quiet-sky';this.canvas.setAttribute('aria-hidden','true');}return this.canvas;},
  notificationReceived(name){if(name==='DOM_OBJECTS_CREATED')this.schedule();},
  suspend(){this.paused=true;clearTimeout(this.timer);},
  resume(){this.paused=false;this.schedule();},
  schedule(){clearTimeout(this.timer);if(this.paused||document.hidden||!this.canvas?.isConnected)return;this.draw();const speed=this.number('motionSpeed',0,30,6);this.timer=setTimeout(()=>this.schedule(),this.reduced.matches||speed===0?60000:1000/this.number('fps',1,6,1));},
  number(key,min,max,fallback){const n=Number(this.config[key]);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;},
  draw(){
    const c=this.canvas,w=innerWidth,h=innerHeight,scale=Math.min(1,1200/w,900/h);
    if(c.width!==Math.round(w*scale)||c.height!==Math.round(h*scale)){c.width=Math.round(w*scale);c.height=Math.round(h*scale);}
    const ctx=c.getContext('2d'),W=c.width,H=c.height;ctx.clearRect(0,0,W,H);
    const speed=this.reduced.matches?1:this.number('motionSpeed',0,30,6),date=new Date(this.epoch+(Date.now()-this.epoch)*speed),lat=this.number('latitude',-90,90,51.4769),lon=this.number('longitude',-180,180,0),radius=Math.hypot(W,H)*0.56,angle=this.number('rotation',-180,180,0)*Math.PI/180;
    const points=SkyStars.stars.map(([ra,dec,mag])=>{const [a,d]=SkyMath.precess(ra,dec,SkyMath.T(date)),p=SkyMath.horizontal(a,d,lat,lon,date);if(p.alt<=0)return null;const r=radius*Math.tan((90-p.alt)*Math.PI/360),az=p.az*Math.PI/180+angle;return {x:W/2-r*Math.sin(az),y:H/2-r*Math.cos(az),mag};});
    const brightness=this.number('brightness',0,70,32)/100;
    if(this.config.showConstellations!==false){ctx.lineWidth=0.65;ctx.strokeStyle=`rgba(151,188,166,${brightness*this.number('constellationOpacity',0,50,12)/100})`;ctx.beginPath();for(const figure of SkyStars.figures)for(const [i,j]of figure.lines){const a=points[i],b=points[j];if(a&&b&&Math.hypot(a.x-b.x,a.y-b.y)<radius*.65){ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);}}ctx.stroke();}
    const limit=this.number('starMagnitude',2,5.5,4.8);let visible=0;
    for(const p of points){if(!p||p.mag>limit||p.x<0||p.y<0||p.x>W||p.y>H)continue;visible++;const size=Math.max(.45,1.5-p.mag*.20),alpha=brightness*Math.min(1,.30+(5.5-p.mag)*.14);ctx.fillStyle=`rgba(220,229,214,${alpha})`;ctx.beginPath();ctx.arc(p.x,p.y,size,0,Math.PI*2);ctx.fill();if(p.mag<1){ctx.fillStyle=`rgba(218,204,159,${alpha*.12})`;ctx.beginPath();ctx.arc(p.x,p.y,size*3,0,Math.PI*2);ctx.fill();}}
    c.dataset.stars=String(visible);c.dataset.skyTime=date.toISOString();
  }
});
