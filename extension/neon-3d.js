import * as T from './vendor/three.module.js';
const P=globalThis.Expansion,xyz=(x,y,h=.12)=>new T.Vector3((x-300)/100,h,(y-550)/100);
class NeonRenderer{
 constructor(canvas){
  this.canvas=canvas;this.effects=[];this.trail=[];this.overhead=false;this.reduced=matchMedia('(prefers-reduced-motion: reduce)');
  this.r=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});this.r.setPixelRatio(Math.min(devicePixelRatio||1,1.5));this.r.shadowMap.enabled=true;this.r.shadowMap.type=T.PCFSoftShadowMap;this.r.toneMapping=T.ACESFilmicToneMapping;this.r.toneMappingExposure=1.35;this.r.outputColorSpace=T.SRGBColorSpace;
  this.scene=new T.Scene();this.scene.background=new T.Color('#0a0711');this.scene.fog=new T.FogExp2('#0a0711',.026);this.camera=new T.PerspectiveCamera(39,6/11,.1,100);
  const envScene=new T.Scene();envScene.background=new T.Color('#44404b');
  const room=new T.Mesh(new T.BoxGeometry(30,20,30),new T.MeshBasicMaterial({color:'#272432',side:T.BackSide}));envScene.add(room);
  for(const [x,y,z,w,h,color] of [[-8,5,0,2,9,'#ff55b0'],[8,4,-3,2,8,'#6beaff'],[0,9,1,9,2,'#fff4dd'],[0,4,10,8,2,'#b7caff']]){const light=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color,side:T.DoubleSide}));light.position.set(x,y,z);light.lookAt(0,0,0);envScene.add(light);}
  const pmrem=new T.PMREMGenerator(this.r);this.env=pmrem.fromScene(envScene,.04);this.scene.environment=this.env.texture;pmrem.dispose();envScene.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
  this.chrome=new T.MeshStandardMaterial({color:'#e1e4e9',metalness:1,roughness:.17});this.brass=new T.MeshStandardMaterial({color:'#cc9e66',metalness:.86,roughness:.24});this.black=new T.MeshStandardMaterial({color:'#10111a',roughness:.38,metalness:.2});this.rubber=new T.MeshStandardMaterial({color:'#f5e4d0',roughness:.72});
  this.scene.add(new T.HemisphereLight('#c3ceff','#52302a',1.7));const key=new T.DirectionalLight('#fff0d9',3.2);key.position.set(-3,9,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-5,right:5,top:7,bottom:-7,near:.1,far:22});key.shadow.bias=-.0003;key.shadow.normalBias=.015;this.scene.add(key);
  for(const [x,z,col]of [[-3,-2,'#ed4089'],[3,2,'#46aaf8']]){const l=new T.PointLight(col,15,12,2);l.position.set(x,2,z);this.scene.add(l);}
  const wood=document.createElement('canvas');wood.width=128;wood.height=512;const wc=wood.getContext('2d');wc.fillStyle='#301d20';wc.fillRect(0,0,128,512);for(let i=0;i<110;i++){wc.strokeStyle=i%2?'#543337':'#21151d';wc.beginPath();wc.moveTo(i*1.3,0);wc.bezierCurveTo(i*1.3+5,160,i*1.3-5,320,i*1.3,512);wc.stroke();}const woodTex=new T.CanvasTexture(wood);woodTex.colorSpace=T.SRGBColorSpace;
  const woodMat=new T.MeshStandardMaterial({map:woodTex,roughness:.5,metalness:.05});this.box(6.35,1.0,11.65,0,-.67,0,woodMat);this.box(6.65,.10,11.9,0,-.14,0,this.chrome);
  const art=new globalThis.ExpansionRenderer(document.createElement('canvas'));const tex=new T.CanvasTexture(art.cache);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=Math.min(8,this.r.capabilities.getMaxAnisotropy());
  const board=new T.Mesh(new T.PlaneGeometry(6,11),new T.MeshPhysicalMaterial({map:tex,roughness:.29,clearcoat:.9,clearcoatRoughness:.18}));board.rotation.x=-Math.PI/2;board.receiveShadow=true;this.scene.add(board);
  this.box(.18,.44,11.5,-3.13,.12,0,this.black);this.box(.18,.44,11.5,3.13,.12,0,this.black);
  for(const x of [-3.17,3.17]){this.box(.08,.07,11.7,x,.37,0,this.chrome);this.box(.035,.035,10.6,x*.955,.045,0,new T.MeshStandardMaterial({color:'#ef428c',emissive:'#ff378d',emissiveIntensity:2}));}
  this.box(6.4,.30,.36,0,.18,5.54,this.chrome);
  // Recessed fasteners, rubber posts and polished lockdown hardware.
  for(const x of [9,591])for(const y of [45,350,710,1065]){this.cylinder(x,y,.038,.018,.40,this.chrome);this.rod(xyz(x-2,y,.412),xyz(x+2,y,.412),.006,this.black);}
  for(const r of P.rails.filter(r=>r.kind==='sling')){this.cylinder(r.a.x,r.a.y,.075,.22,.12,this.chrome);this.ring(r.a.x,r.a.y,.07,.017,.16,this.rubber);}
  for(const x of [-3.27,3.27]){const button=new T.Mesh(new T.CylinderGeometry(.12,.12,.1,24),new T.MeshPhysicalMaterial({color:'#ff539c',roughness:.25,clearcoat:1}));button.rotation.z=Math.PI/2;button.position.set(x,-.27,4.5);this.scene.add(button);}
  this.box(6.55,2.35,.50,0,1.05,-5.9,woodMat);this.box(6.25,2.08,.055,0,1.05,-5.61,this.black);
  this.display=document.createElement('canvas');this.display.width=1024;this.display.height=320;this.displayTex=new T.CanvasTexture(this.display);this.displayTex.colorSpace=T.SRGBColorSpace;
  for(const x of [-3.04,3.04])for(let row=0;row<9;row++)this.box(.12,.028,.04,x,.58+row*.11,-5.565,this.chrome);
  const screen=new T.Mesh(new T.PlaneGeometry(5.7,1.78),new T.MeshBasicMaterial({map:this.displayTex}));screen.position.set(0,1.1,-5.57);this.scene.add(screen);this.lastDisplay='';
  for(const r of P.rails)this.rod(xyz(r.a.x,r.a.y,.09),xyz(r.b.x,r.b.y,.09),r.kind==='sling'?.065:.045,r.kind==='sling'?this.rubber:this.chrome);
  P.slings.forEach(points=>{const shape=new T.Shape();points.forEach(([x,y],i)=>i?shape.lineTo((x-300)/100,-(y-550)/100):shape.moveTo((x-300)/100,-(y-550)/100));shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:.10,bevelEnabled:true,bevelSize:.015,bevelThickness:.01,bevelSegments:2,steps:1});geo.rotateX(-Math.PI/2);const mesh=new T.Mesh(geo,new T.MeshPhysicalMaterial({color:'#80304f',roughness:.23,clearcoat:1}));mesh.position.y=.04;mesh.castShadow=true;this.scene.add(mesh);});
  this.bumpers=P.configs.neonroyale.bumps.map(([x,y],i)=>{this.cylinder(x,y,i===2?.42:.39,.10,.07,this.chrome);this.cylinder(x,y,.24,.28,.2,this.brass);const mat=new T.MeshPhysicalMaterial({color:i===1?'#65e7df':'#ef538f',roughness:.2,metalness:.05,clearcoat:1,emissive:i===1?'#165b62':'#631a3f',emissiveIntensity:.55});const cap=this.cylinder(x,y,i===2?.35:.32,.13,.36,mat);this.ring(x,y,(i===2?.35:.32)+.01,.045,.31,this.rubber);this.cylinder(x,y,.12,.018,.44,this.brass);return cap;});
  this.inserts=P.beacons.map(p=>this.cylinder(p.x,p.y,.14,.025,.023,new T.MeshStandardMaterial({color:'#edca92',emissive:'#ffaa44',emissiveIntensity:.12,roughness:.3})));
  this.targets=P.targets.map(p=>{this.cylinder(p.x,p.y,.14,.09,.07,this.chrome);return this.cylinder(p.x,p.y,.10,.025,.13,new T.MeshStandardMaterial({color:'#ef61a2',emissive:'#ed3b89',emissiveIntensity:.15,roughness:.3}));});
  this.ring(296,205,.24,.04,.05,this.brass);this.cylinder(296,205,.22,.012,.014,this.black);
  this.flippers=[183,405].map(x=>{const group=new T.Group();group.position.copy(xyz(x,928,.08));const s=new T.Shape();s.moveTo(0,-.12);s.lineTo(.78,-.075);s.absarc(.78,0,.075,-Math.PI/2,Math.PI/2,false);s.lineTo(0,.12);s.absarc(0,0,.12,Math.PI/2,Math.PI*1.5,false);const geo=new T.ExtrudeGeometry(s,{depth:.16,bevelEnabled:true,bevelSize:.025,bevelThickness:.015,bevelSegments:3,steps:1});geo.rotateX(-Math.PI/2);const m=new T.Mesh(geo,new T.MeshPhysicalMaterial({color:'#f1e5cf',roughness:.36,clearcoat:.5}));m.castShadow=true;group.add(m);const stripe=new T.Mesh(new T.BoxGeometry(.63,.025,.055),new T.MeshStandardMaterial({color:'#e24883',roughness:.5}));stripe.position.set(.35,.19,0);group.add(stripe);this.scene.add(group);return group;});
  this.balls=[];this.ballGeo=new T.SphereGeometry(.10,32,20);this.ballMat=new T.MeshPhysicalMaterial({color:'#ffffff',metalness:1,roughness:.065,clearcoat:1});
  for(let y=1002;y<1047;y+=5)this.rod(xyz(540,y,.07),xyz(560,y+2,.07),.012,this.chrome);
  const glass=new T.Mesh(new T.PlaneGeometry(6.12,11.1),new T.MeshPhysicalMaterial({color:'#d4e6ff',metalness:.1,roughness:.08,transparent:true,opacity:.035,clearcoat:1,depthWrite:false,envMapIntensity:.3}));glass.rotation.x=-Math.PI/2;glass.position.y=.57;this.scene.add(glass);
  const floor=new T.Mesh(new T.PlaneGeometry(50,50),new T.MeshStandardMaterial({color:'#241d20',roughness:.55}));floor.rotation.x=-Math.PI/2;floor.position.y=-2;floor.receiveShadow=true;this.scene.add(floor);
  for(const x of [-2.8,2.8])for(const z of [-4.7,4.7])this.box(.12,1.3,.12,x,-1.45,z,this.chrome);
  // Nearby cabinets and a warm wall place the machine in a pinball bar.
  for(const x of [-8.5,8.5]){this.box(4.7,2,9,x,-1,-2,this.black);this.box(4.8,2.8,.5,x,1,-6.5,woodMat);this.box(4.3,1.7,.06,x,1.1,-6.2,new T.MeshStandardMaterial({color:'#191123',emissive:x<0?'#69204f':'#164562',emissiveIntensity:.7}));}
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();document.dispatchEvent(new Event('bumpery:menu'));document.getElementById('overlay-copy').textContent='3D graphics were interrupted. Reload to restore the cabinet.';});
  this.resize();
 }
 box(w,h,d,x,y,z,mat){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;this.scene.add(m);return m;}
 rod(a,b,r,mat){const delta=b.clone().sub(a),m=new T.Mesh(new T.CylinderGeometry(r,r,delta.length(),10),mat);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());m.castShadow=true;this.scene.add(m);return m;}
 cylinder(x,y,r,h,elevation,mat){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,32),mat);m.position.copy(xyz(x,y,elevation));m.castShadow=true;m.receiveShadow=true;this.scene.add(m);return m;}
 ring(x,y,r,t,h,mat){const m=new T.Mesh(new T.TorusGeometry(r,t,10,40),mat);m.rotation.x=-Math.PI/2;m.position.copy(xyz(x,y,h));m.castShadow=true;this.scene.add(m);return m;}
 resize(){const rect=this.canvas.getBoundingClientRect(),w=Math.max(300,Math.round(rect.width));this.r.setSize(w,Math.round(w*11/6),false);this.camera.aspect=6/11;this.camera.updateProjectionMatrix();this.setCamera();}
 setCamera(){this.camera.position.set(0,this.overhead?21:17.8,this.overhead?1:11.5);this.camera.lookAt(0,.0,-.3);}
 toggleView(){this.overhead=!this.overhead;this.setCamera();return this.overhead?'Overhead':'Player';}
 effect(e){if(e.type==='hit'){this.effects.push({...e,life:.16});}}
 draw(g,dt,paused){if(!paused)for(const e of this.effects)e.life-=dt;this.effects=this.effects.filter(e=>e.life>0);this.bumpers.forEach((b,i)=>b.material.emissiveIntensity=this.effects.some(e=>e.kind==='bumper'+i)?3.4:.55);
 this.flippers.forEach((f,i)=>{f.rotation.y=-g.flippers[i].angle;});this.inserts.forEach((m,i)=>m.material.emissiveIntensity=g.lit[i]?2:.08);this.targets.forEach((m,i)=>m.material.emissiveIntensity=g.targetLights[i]?2:.12);
 while(this.balls.length<g.balls.length){const m=new T.Mesh(this.ballGeo,this.ballMat);m.castShadow=true;this.scene.add(m);this.balls.push(m);}this.balls.forEach((m,i)=>{m.visible=!!g.balls[i];if(m.visible)m.position.copy(xyz(g.balls[i].x,g.balls[i].y,.115));});
 const text=g.score+'|'+(g.special?Math.ceil(g.modeUntil-g.time):0)+'|'+g.multiplier;if(text!==this.lastDisplay){const c=this.display.getContext('2d');c.fillStyle='#090710';c.fillRect(0,0,1024,320);c.textAlign='center';c.fillStyle='#ff5a9e';c.font='54px Georgia';c.fillText('NEON ROYALE',512,79);c.fillStyle='#ffe5a5';c.font='76px monospace';c.fillText(String(g.score).padStart(6,'0'),512,185);c.fillStyle='#76e9e2';c.font='26px sans-serif';c.fillText(g.special?'LAST CALL · '+Math.ceil(g.modeUntil-g.time)+'s':'THE MIDNIGHT CLUB · '+g.multiplier+'×',512,264);this.displayTex.needsUpdate=true;this.lastDisplay=text;}this.r.render(this.scene,this.camera);
 }
}
globalThis.NeonRenderer=NeonRenderer;
globalThis.bootExpansion();
