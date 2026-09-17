(function(root){
  'use strict';
  const P=root.Pinball,TAU=Math.PI*2;
  class Renderer {
    constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.effects=[];this.trail=[];this.reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');this.cache=document.createElement('canvas');this.cache.width=1200;this.cache.height=2200;const c=this.cache.getContext('2d');c.scale(2,2);this.paintTable(c);this.resize();}
    resize(){const r=this.canvas.getBoundingClientRect(),scale=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.max(600,Math.round(r.width*scale));this.canvas.height=Math.round(this.canvas.width*11/6);}
    circle(c,x,y,r,fill,stroke,width=1){c.beginPath();c.arc(x,y,r,0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
    text(c,text,x,y,size=12,color='#c3ad80',font='Georgia',align='center'){c.fillStyle=color;c.font=`${size}px ${font}`;c.textAlign=align;c.fillText(text,x,y);}
    line(c,points,color,width=1){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.stroke();}
    shell(c,inset){c.beginPath();c.moveTo(20+inset,1040);c.lineTo(20+inset,197);c.bezierCurveTo(20+inset,4,580-inset,4,580-inset,197);c.lineTo(580-inset,1040);c.quadraticCurveTo(580-inset,1081-inset,546,1081-inset);c.lineTo(54,1081-inset);c.quadraticCurveTo(20+inset,1081-inset,20+inset,1040);c.closePath();}
    screw(c,x,y){this.circle(c,x,y,5,'#ae9563','#352a1b',1.5);this.line(c,[[x-2,y+2],[x+2,y-2]],'#514333',1.2);}
    star(c,x,y,r,color){c.fillStyle=color;c.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,s=i%2?r*.23:r;c.lineTo(x+Math.cos(a)*s,y+Math.sin(a)*s);}c.closePath();c.fill();}
    paintTable(c){
      const bg=c.createLinearGradient(0,0,600,0);bg.addColorStop(0,'#382b22');bg.addColorStop(.12,'#735539');bg.addColorStop(.3,'#372a21');bg.addColorStop(.8,'#543d2b');bg.addColorStop(1,'#201e1a');this.shell(c,-12);c.fillStyle=bg;c.fill();c.strokeStyle='#c7a56b';c.lineWidth=2;c.stroke();
      this.shell(c,0);c.fillStyle='#89754f';c.fill();this.shell(c,5);c.fillStyle='#121e26';c.fill();
      c.save();this.shell(c,10);c.clip();const felt=c.createRadialGradient(300,360,30,300,510,690);felt.addColorStop(0,'#24434a');felt.addColorStop(.55,'#142c35');felt.addColorStop(1,'#0a1b28');c.fillStyle=felt;c.fillRect(0,0,600,1100);
      // Deterministic flecks and fine engraved celestial coordinates.
      let seed=91;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
      for(let i=0;i<650;i++){const x=random()*600,y=random()*1100,r=random()*1.2;c.globalAlpha=.15+random()*.3;this.circle(c,x,y,r,'#d9d7ab');}c.globalAlpha=1;
      for(let r=90;r<460;r+=60)this.circle(c,294,551,r,null,'#91aca015',1);
      for(let a=0;a<TAU;a+=Math.PI/12)this.line(c,[[294+Math.cos(a)*55,551+Math.sin(a)*55],[294+Math.cos(a)*460,551+Math.sin(a)*460]],'#91aca012');
      this.line(c,[[100,340],[147,389],[111,470],[173,514],[145,586],[208,639]],'#bfc8ad44',1);
      this.line(c,[[398,480],[445,556],[414,616],[455,673]],'#bfc8ad44',1);
      [[100,340],[147,389],[111,470],[173,514],[145,586],[208,639],[398,480],[445,556],[414,616],[455,673]].forEach(p=>this.star(c,...p,4,'#b4c4b2'));
      c.save();c.translate(294,569);c.rotate(-.32);c.scale(1,.38);this.circle(c,0,0,167,null,'#d3b77a66',2);this.circle(c,0,0,159,null,'#d3b77a22',1);c.restore();
      this.circle(c,294,569,76,null,'#bca36a66',1);this.circle(c,294,569,70,null,'#bca36a33',1);
      for(let i=0;i<60;i++){const a=i*TAU/60;this.line(c,[[294+Math.cos(a)*77,569+Math.sin(a)*77],[294+Math.cos(a)*(i%5===0?86:81),569+Math.sin(a)*(i%5===0?86:81)]],'#bca36a66');}
      this.star(c,294,569,54,'#ccb27930');this.star(c,294,569,33,'#d0b27180');this.circle(c,294,569,10,'#24414b','#dbc18c',2);
      this.text(c,'S T A R B O U N D',294,680,26,'#d8c491');this.text(c,'P A R L O R',294,708,14,'#b9a77c');
      this.line(c,[[220,725],[368,725]],'#b69b6455');this.text(c,'THE WAY HOME IS WRITTEN IN THE STARS',294,743,7,'#88a5a8','sans-serif');
      this.text(c,'CELESTIAL NAVIGATION',296,78,8,'#ccb684','sans-serif');
      // Orbit markers.
      for(let y=520;y<710;y+=34){this.line(c,[[113,y+8],[120,y],[127,y+8]],'#90c9bc77',2);this.line(c,[[461,y],[468,y+8],[475,y]],'#90c9bc55',2);}
      c.save();c.translate(76,625);c.rotate(-Math.PI/2);this.text(c,'D E E P   O R B I T',0,0,9,'#8ab8b7','sans-serif');c.restore();
      c.save();c.translate(496,615);c.rotate(Math.PI/2);this.text(c,'M E T E O R   A L L E Y',0,0,9,'#c1a67a','sans-serif');c.restore();
      // Launcher well and spring track.
      const lane=c.createLinearGradient(530,0,573,0);lane.addColorStop(0,'#060e17');lane.addColorStop(.5,'#26333a');lane.addColorStop(1,'#0a141d');c.fillStyle=lane;c.fillRect(532,275,40,800);
      for(let y=365;y<905;y+=48){this.line(c,[[544,y+8],[550,y],[556,y+8]],'#b5985c55',1.3);}
      c.save();c.translate(550,630);c.rotate(-Math.PI/2);this.text(c,'L A U N C H   S E Q U E N C E',0,0,9,'#d4b674','sans-serif');c.restore();
      // Brass-topped rubber rails, with a shadow and highlight for depth.
      P.rails.filter(r=>r.kind==='rail').forEach(r=>{const a=[r.a.x,r.a.y],b=[r.b.x,r.b.y];this.line(c,[[a[0]+3,a[1]+7],[b[0]+3,b[1]+7]],'#0008',15);this.line(c,[a,b],'#0b1216',15);this.line(c,[a,b],'#9b8a62',9);this.line(c,[[a[0]-1,a[1]-2],[b[0]-1,b[1]-2]],'#ecdbad',2);});
      for(const s of P.slings){c.beginPath();s.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle='#173c44';c.shadowColor='#000';c.shadowBlur=10;c.shadowOffsetY=5;c.fill();c.shadowBlur=0;c.shadowOffsetY=0;c.strokeStyle='#bea575';c.lineWidth=5;c.stroke();const x=s[0][0]<300?143:442;this.star(c,x,829,12,'#88c9c5');}
      P.targets.forEach((t,i)=>{this.circle(c,t.x+2,t.y+5,15,'#050c12');this.circle(c,t.x,t.y,13,'#72552f','#e1bd76',2);this.star(c,t.x,t.y,7,'#edd59a');});
      P.bumpers.forEach((b,i)=>{
        this.circle(c,b.x+4,b.y+10,b.r+12,'#050e16');this.circle(c,b.x,b.y,b.r+13,'#15343c','#9ea790',2);this.circle(c,b.x,b.y,b.r+7,null,'#a4c4b277',1);
        for(let a=0;a<TAU;a+=Math.PI/6)this.circle(c,b.x+Math.cos(a)*(b.r+10),b.y+Math.sin(a)*(b.r+10),2,'#dcc58b');
        const g=c.createRadialGradient(b.x-10,b.y-13,3,b.x,b.y,b.r);g.addColorStop(0,i===1?'#ebd49d':'#9cd8d0');g.addColorStop(.6,b.hue);g.addColorStop(1,'#263e48');this.circle(c,b.x,b.y,b.r,g,'#cfbb87',3);
        c.save();c.translate(b.x,b.y);c.rotate(-.4);c.scale(1,.3);this.circle(c,0,0,b.r+8,null,'#f4dd9e',3);c.restore();
        this.circle(c,b.x-9,b.y-11,6,'#ffffff38');this.text(c,['TERRA','AURUM','VESPER'][i],b.x,b.y+b.r+30,8,'#b3c9c0','sans-serif');
      });
      P.beacons.forEach((b,i)=>{this.circle(c,b.x,b.y,24,'#14232b','#a99260',1);this.text(c,['I','II','III'][i],b.x,b.y+42,10,'#d6bb80');});
      const o=P.observatory;this.circle(c,o.x,o.y,31,'#091821','#b3a073',2);this.circle(c,o.x,o.y,24,'#254751','#94bdb4');this.star(c,o.x,o.y,16,'#cdb778');this.text(c,'OBSERVATORY',o.x,o.y+47,8,'#b3c9c0','sans-serif');
      // Illuminated inserts leading back to the center.
      for(let i=0;i<4;i++){const y=788+i*25;this.line(c,[[280,y+7],[294,y],[308,y+7]],'#c4a46366',3);}
      this.text(c,'RETURN HOME',294,889,9,'#d7bf85','sans-serif');
      this.text(c,'LEFT FLIPPER',136,978,7,'#9ab2b0','sans-serif');this.text(c,'RIGHT FLIPPER',449,978,7,'#9ab2b0','sans-serif');
      const apron=c.createLinearGradient(0,990,0,1100);apron.addColorStop(0,'#25333a');apron.addColorStop(1,'#101b22');c.fillStyle=apron;c.fillRect(36,1013,486,90);this.line(c,[[38,1013],[521,1013]],'#c6ae7b',2);
      this.text(c,'✦',282,1038,17,'#cfb67c');this.text(c,'C E L E S T I A L   A M U S E M E N T   C O.',282,1057,8,'#bca77f','sans-serif');this.text(c,'HANDCRAFTED FOR THE WANDERER',282,1073,6,'#708d92','sans-serif');
      c.restore();[[30,210],[30,550],[30,1005],[580,550],[580,1005],[128,64],[469,74]].forEach(p=>this.screw(c,...p));
    }
    effect(event){if(event.type==='hit'||event.type==='score'||event.type==='meteorDrop'||event.type==='shield'){this.effects.push({...event,life:1});if(this.effects.length>70)this.effects.shift();}if(event.type==='launch')this.trail=[];}
    draw(game,dt,paused){
      const c=this.ctx;c.setTransform(this.canvas.width/600,0,0,this.canvas.height/1100,0,0);c.clearRect(0,0,600,1100);c.drawImage(this.cache,0,0,600,1100);
      const t=game.time;
      P.targets.forEach((target,i)=>{if(game.targetLights[i]){c.shadowColor='#b8f4f0';c.shadowBlur=12;this.circle(c,target.x,target.y,14,'#9ce5dc','#efffd5',2);c.shadowBlur=0;this.star(c,target.x,target.y,7,'#21474b');}});
      if(game.hyperspeed){
        c.save();this.shell(c,10);c.clip();
        if(!this.reducedMotion.matches){for(let i=0;i<26;i++){const angle=i*2.3999,r=70+(t*600+i*43)%520;this.line(c,[[294+Math.cos(angle)*r,520+Math.sin(angle)*r],[294+Math.cos(angle)*(r+36),520+Math.sin(angle)*(r+36)]],'#8feaff35',1.4);}}
        const glow=c.createLinearGradient(0,948,0,1005);glow.addColorStop(0,'#75e5ef00');glow.addColorStop(1,'#75e5ef55');c.fillStyle=glow;c.fillRect(50,948,474,52);
        this.line(c,[[50,996],[521,996]],'#b1ffff',4);this.text(c,`DRAIN SHIELD · ${Math.ceil(game.hyperUntil-game.time)}s`,294,982,10,'#c0ffff','sans-serif');c.restore();
      }
      P.beacons.forEach((b,i)=>{const lit=game.lit[i];c.shadowBlur=lit?22:0;c.shadowColor='#ffcb64';this.circle(c,b.x,b.y,14,lit?'#f5cf77':'#756344','#e1c38c',2);c.shadowBlur=0;this.star(c,b.x,b.y,8,lit?'#fff6c9':'#b99d60');});
      if(game.lit.every(Boolean)){c.shadowBlur=30;c.shadowColor='#f6d589';this.circle(c,296,205,25,null,'#ffe0a0',3+Math.sin(t*5));c.shadowBlur=0;this.text(c,`${10000*game.multiplier} JACKPOT`,296,262,11,'#ffe0a0','sans-serif');}
      this.text(c,`${game.multiplier}×`,294,819,16,'#e8cc8f','sans-serif');
      for(const f of game.flippers){const tip={x:f.x+Math.cos(f.angle)*91,y:f.y+Math.sin(f.angle)*91};this.line(c,[[f.x+4,f.y+8],[tip.x+4,tip.y+8]],'#0009',28);this.line(c,[[f.x,f.y],[tip.x,tip.y]],'#151d21',27);this.line(c,[[f.x,f.y],[tip.x,tip.y]],'#c0ac7e',23);this.line(c,[[f.x,f.y-3],[tip.x,tip.y-3]],'#f2e0ad',13);this.line(c,[[f.x+2,f.y-4],[tip.x-2,tip.y-4]],'#ac7850',3);this.screw(c,f.x,f.y);}
      const compress=game.charge*31;this.line(c,[[550,1001+compress],[550,1060]],'#728487',3);
      const spring=[];for(let i=0;i<17;i++)spring.push([550+(i%2?8:-8),1002+compress+i*(53-compress)/16]);this.line(c,spring,'#d1cbb2',2);this.line(c,[[536,997+compress],[564,997+compress]],'#d9b87b',7);
      if(game.state==='loaded'){c.fillStyle='#d6b675';c.fillRect(584,1010-game.charge*230,3,game.charge*230);}
      if(game.state==='playing'&&!paused&&!this.reducedMotion.matches){
        this.trail=this.trail.filter(p=>game.balls.some(b=>b.id===p.id));
        for(const b of game.balls)this.trail.push({id:b.id,x:b.x,y:b.y});
        while(this.trail.length>game.balls.length*8)this.trail.shift();
      }else if(!paused)this.trail=[];
      this.trail.forEach((p,i)=>this.circle(c,p.x,p.y,game.hyperspeed?3:5,`rgba(${game.hyperspeed?'120,244,255':'169,212,219'},${.04+.12*i/(this.trail.length||1)})`));
      for(const b of game.balls){
        if(game.hyperspeed){c.shadowBlur=18;c.shadowColor='#8af3ff';}
        this.circle(c,b.x+5,b.y+8,b.r+2,'#0008');const g=c.createRadialGradient(b.x-4,b.y-5,1,b.x,b.y,b.r);g.addColorStop(0,'#ffffff');g.addColorStop(.24,'#f4f5ea');g.addColorStop(.5,b.meteor?'#ffe1ad':'#b7cbd1');g.addColorStop(.76,'#536d7c');g.addColorStop(1,'#e3e8de');this.circle(c,b.x,b.y,b.r,g,'#c6d5d6',.7);c.shadowBlur=0;this.circle(c,b.x-3,b.y-4,2,'#fff');
      }
      this.effects=this.effects.filter(e=>e.life>0);for(const e of this.effects){if(!paused)e.life-=dt*1.9;c.globalAlpha=Math.max(0,e.life);if(e.type==='hit'||e.type==='meteorDrop'||e.type==='shield'){const r=this.reducedMotion.matches?24:20+(1-e.life)*55;this.circle(c,e.x,e.y,r,null,e.type==='shield'||e.kind?.startsWith('bumper')?'#b0eeec':'#f0cc82',2);if(!this.reducedMotion.matches)for(let i=0;i<8;i++){const a=i*TAU/8;this.star(c,e.x+Math.cos(a)*r,e.y+Math.sin(a)*r,3,'#f4d393');}}else this.text(c,`+${e.value.toLocaleString()}`,e.x,e.y-24-(this.reducedMotion.matches?0:(1-e.life)*36),16,'#ffe4a5','sans-serif');}c.globalAlpha=1;
      if(game.state==='playing'&&game.time<game.saveUntil){this.text(c,`BALL SAVE · ${Math.ceil(game.saveUntil-game.time)}`,294,1000,9,'#91e0ca','sans-serif');}
      if(game.tilted){this.text(c,'T I L T',294,778,25,'#ff9c72','sans-serif');}else if(game.tilt>1){this.text(c,'NUDGE WARNING',294,778,9,'#efbc7c','sans-serif');}
    }
  }
  root.ParlorRenderer=Renderer;
})(globalThis);
