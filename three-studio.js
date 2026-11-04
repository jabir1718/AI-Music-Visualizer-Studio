(function(root){
'use strict';
const FONT_URLS={
 helvetiker_bold:'https://cdn.jsdelivr.net/npm/three@0.187.0/examples/fonts/helvetiker_bold.typeface.json',
 helvetiker_regular:'https://cdn.jsdelivr.net/npm/three@0.187.0/examples/fonts/helvetiker_regular.typeface.json',
 optimer_bold:'https://cdn.jsdelivr.net/npm/three@0.187.0/examples/fonts/optimer_bold.typeface.json',
 optimer_regular:'https://cdn.jsdelivr.net/npm/three@0.187.0/examples/fonts/optimer_regular.typeface.json',
 gentilis_bold:'https://cdn.jsdelivr.net/npm/three@0.187.0/examples/fonts/gentilis_bold.typeface.json',
 gentilis_regular:'https://cdn.jsdelivr.net/npm/three@0.187.0/examples/fonts/gentilis_regular.typeface.json',
 droid_sans_bold:'https://cdn.jsdelivr.net/npm/three@0.187.0/examples/fonts/droid/droid_sans_bold.typeface.json',
 droid_serif_bold:'https://cdn.jsdelivr.net/npm/three@0.187.0/examples/fonts/droid/droid_serif_bold.typeface.json'
};
const FONT_FAMILIES=Object.keys(FONT_URLS);
const SHAPES=['box','sphere','torus','torus-knot','cone','cylinder','octahedron','dodecahedron','icosahedron','tetrahedron','text'];
const DEFAULTS={shape:'torus-knot',color:'#57d8ff',scale:1,rotationX:0,rotationY:0,rotationZ:0,positionX:0,positionY:0,positionZ:0,text:'WAVEFORGE',textDepth:.16,fontFamily:'helvetiker_bold',metalness:.65,roughness:.25,light:1.35,autoRotate:true};
let THREE=null,loading=null,FontLoaderClass=null,TextGeometryClass=null,loadedFonts=new Map(),textToolsLoading=null,fontLoads=new Map();
function normalizeConfig(input={}){
 const number=(v,f,min,max)=>Math.max(min,Math.min(max,Number.isFinite(Number(v))?Number(v):f));
 return{
  shape:SHAPES.includes(input.shape)?input.shape:DEFAULTS.shape,
  color:/^#[0-9a-f]{6}$/i.test(String(input.color||''))?input.color:DEFAULTS.color,
  scale:number(input.scale,DEFAULTS.scale,.35,2.5),
  rotationX:number(input.rotationX,0,-180,180),
  rotationY:number(input.rotationY,0,-180,180),
  rotationZ:number(input.rotationZ,0,-180,180),
  positionX:number(input.positionX,0,-1.5,1.5),positionY:number(input.positionY,0,-1.5,1.5),positionZ:number(input.positionZ,0,-1.5,1.5),
  text:String(input.text||DEFAULTS.text).slice(0,18),textDepth:number(input.textDepth,DEFAULTS.textDepth,.05,.6),fontFamily:FONT_FAMILIES.includes(input.fontFamily)?input.fontFamily:DEFAULTS.fontFamily,
  metalness:number(input.metalness,DEFAULTS.metalness,0,1),
  roughness:number(input.roughness,DEFAULTS.roughness,.05,1),
  light:number(input.light,DEFAULTS.light,.2,3),
  autoRotate:input.autoRotate===undefined?DEFAULTS.autoRotate:!!input.autoRotate
 };
}
async function loadThree(){
 if(THREE)return THREE;if(loading)return loading;
 loading=import('three').then(mod=>{THREE=mod;return mod;}).catch(error=>{loading=null;throw error;});
 return loading;
}
async function loadTextTools(fontFamily='helvetiker_bold'){
 const selected=FONT_FAMILIES.includes(fontFamily)?fontFamily:'helvetiker_bold';
 if(loadedFonts.has(selected))return loadedFonts.get(selected);
 if(fontLoads.has(selected))return fontLoads.get(selected);
 const task=(async()=>{
  if(!FontLoaderClass||!TextGeometryClass){
   if(!textToolsLoading)textToolsLoading=Promise.all([import('three/addons/loaders/FontLoader.js'),import('three/addons/geometries/TextGeometry.js')]).then(([loaderModule,geometryModule])=>{FontLoaderClass=loaderModule.FontLoader;TextGeometryClass=geometryModule.TextGeometry;}).catch(error=>{textToolsLoading=null;throw error;});
   await textToolsLoading;
  }
  const loader=new FontLoaderClass(),font=await loader.loadAsync(FONT_URLS[selected]);
  loadedFonts.set(selected,font);return font;
 })();
 fontLoads.set(selected,task);
 try{return await task;}finally{fontLoads.delete(selected);}
}
function geometry(T,shape){
 switch(shape){
  case'box':return new T.BoxGeometry(1.45,1.45,1.45,2,2,2);
  case'sphere':return new T.SphereGeometry(1,48,32);
  case'torus':return new T.TorusGeometry(.78,.28,24,72);
  case'cone':return new T.ConeGeometry(.9,1.8,56,2);
  case'cylinder':return new T.CylinderGeometry(.72,.72,1.55,56,2);
  case'octahedron':return new T.OctahedronGeometry(1.15,1);
  case'dodecahedron':return new T.DodecahedronGeometry(1.05,1);
  case'icosahedron':return new T.IcosahedronGeometry(1.05,1);
  case'tetrahedron':return new T.TetrahedronGeometry(1.25,1);
  default:return new T.TorusKnotGeometry(.72,.22,128,20,2,3);
 }
}
function mount(host,options={}){
 if(!host||root.document.getElementById('threeObjectStudio'))return;
 const panel=root.document.createElement('section');panel.id='threeObjectStudio';panel.className='three-object-studio';
 panel.innerHTML='<div class="three-studio-head"><div><span class="eyebrow">REAL-TIME WEBGL OBJECT</span><h3>3D Object Studio</h3><p>Build a lit 3D primitive, rotate it by touch, then export a transparent PNG logo.</p></div><span class="font-count">3D</span></div><button type="button" class="btn small" id="threeLoad">Load 3D workspace</button><div id="threeViewport" class="three-viewport" aria-label="Interactive 3D object preview"></div><div class="three-controls" id="threeControls" hidden><label>Object<select id="threeShape">'+SHAPES.map(x=>'<option value="'+x+'">'+x.replace('-',' ')+'</option>').join('')+'</select></label><label id="threeTextWrap" hidden>3D text<input id="threeText" type="text" maxlength="18" value="WAVEFORGE"></label><label id="threeFontWrap" hidden>3D font<select id="threeFont">'+FONT_FAMILIES.map(x=>'<option value="'+x+'">'+x.replace(/_/g,' ')+'</option>').join('')+'</select></label><label id="threeDepthWrap" hidden>Extrusion depth <output id="threeDepthValue">0.16</output><input id="threeDepth" type="range" min="5" max="60" value="16"></label><label>Material color<input id="threeColor" type="color" value="#57d8ff"></label><label>Scale <output id="threeScaleValue">100%</output><input id="threeScale" type="range" min="35" max="250" value="100"></label><label>Metalness <output id="threeMetalValue">65%</output><input id="threeMetal" type="range" min="0" max="100" value="65"></label><label>Roughness <output id="threeRoughValue">25%</output><input id="threeRough" type="range" min="5" max="100" value="25"></label><label>Light <output id="threeLightValue">135%</output><input id="threeLight" type="range" min="20" max="300" value="135"></label><label>Rotation X <output id="threeXValue">0°</output><input id="threeX" type="range" min="-180" max="180" value="0"></label><label>Rotation Y <output id="threeYValue">0°</output><input id="threeY" type="range" min="-180" max="180" value="0"></label><label>Rotation Z <output id="threeZValue">0°</output><input id="threeZ" type="range" min="-180" max="180" value="0"></label><label>Position X <output id="threePXValue">0</output><input id="threePX" type="range" min="-150" max="150" value="0"></label><label>Position Y <output id="threePYValue">0</output><input id="threePY" type="range" min="-150" max="150" value="0"></label><label>Position Z <output id="threePZValue">0</output><input id="threePZ" type="range" min="-150" max="150" value="0"></label><label class="three-auto"><input id="threeAuto" type="checkbox" checked> Auto rotate</label></div><div class="three-actions"><button type="button" class="btn small primary" id="threeExport" disabled>Export transparent PNG logo</button><button type="button" class="btn small" id="threeReset" disabled>Reset object</button></div><p id="threeStatus" class="hint" aria-live="polite">The 3D engine loads only when you tap the button. Internet and WebGL support are required.</p><small class="three-license">Powered by Three.js (MIT). Export is a 1024 × 1024 PNG snapshot; it is not a 3D model file or 16K render.</small>';
 host.appendChild(panel);
 const $=id=>panel.querySelector('#'+id),viewport=$('threeViewport');let renderer=null,scene=null,camera=null,mesh=null,material=null,raf=0,config=normalizeConfig(),drag=null,resizeObserver=null;
 function report(message){$('threeStatus').textContent=message;}
 function updateLabels(){
  $('threeScaleValue').textContent=Math.round(config.scale*100)+'%';$('threeMetalValue').textContent=Math.round(config.metalness*100)+'%';$('threeRoughValue').textContent=Math.round(config.roughness*100)+'%';$('threeLightValue').textContent=Math.round(config.light*100)+'%';
  $('threeXValue').textContent=Math.round(config.rotationX)+'°';$('threeYValue').textContent=Math.round(config.rotationY)+'°';$('threeZValue').textContent=Math.round(config.rotationZ)+'°';$('threePXValue').textContent=config.positionX.toFixed(2);$('threePYValue').textContent=config.positionY.toFixed(2);$('threePZValue').textContent=config.positionZ.toFixed(2);
 }
 function resize(){
  if(!renderer||!camera)return;const w=Math.max(240,viewport.clientWidth||520),h=Math.max(220,viewport.clientHeight||320);
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.render(scene,camera);
 }
 async function setShape(shape){
  if(!THREE||!scene)return;
  const shapeName=SHAPES.includes(shape)?shape:DEFAULTS.shape;config.shape=shapeName;
  let geom;
  if(shapeName==='text'){
   const font=await loadTextTools(config.fontFamily);const label=config.text||'WAVEFORGE',fontSize=Math.min(.72,5.2/Math.max(1,label.length));geom=new TextGeometryClass(label,{font,size:fontSize,depth:config.textDepth,curveSegments:10,bevelEnabled:true,bevelThickness:.018,bevelSize:.012,bevelSegments:3});geom.computeBoundingBox();geom.center();
  }else geom=geometry(THREE,shapeName);
  if(config.shape!==shapeName){geom.dispose();return;}
  if(mesh){scene.remove(mesh);mesh.geometry.dispose();mesh.material.dispose();}
  material=new THREE.MeshStandardMaterial({color:config.color,metalness:config.metalness,roughness:config.roughness});
  mesh=new THREE.Mesh(geom,material);
  mesh.scale.setScalar(config.scale);mesh.rotation.set(config.rotationX*Math.PI/180,config.rotationY*Math.PI/180,config.rotationZ*Math.PI/180);mesh.position.set(config.positionX,config.positionY,config.positionZ);scene.add(mesh);$('threeTextWrap').hidden=config.shape!=='text';$('threeFontWrap').hidden=config.shape!=='text';$('threeDepthWrap').hidden=config.shape!=='text';$('threeFont').value=config.fontFamily;
 }
 function apply(){
  if(!mesh||!material)return;
  material.color.set(config.color);material.metalness=config.metalness;material.roughness=config.roughness;material.needsUpdate=true;
  mesh.scale.setScalar(config.scale);mesh.rotation.set(config.rotationX*Math.PI/180,config.rotationY*Math.PI/180,config.rotationZ*Math.PI/180);mesh.position.set(config.positionX,config.positionY,config.positionZ);
  if(scene&&renderer)renderer.render(scene,camera);updateLabels();
 }
 function animate(){
  raf=root.requestAnimationFrame(animate);
  if(mesh&&config.autoRotate&&!drag){mesh.rotation.y+=.004;config.rotationY=mesh.rotation.y*180/Math.PI;$('threeY').value=Math.round(config.rotationY);$('threeYValue').textContent=Math.round(config.rotationY)+'°';}
  if(renderer&&scene&&camera)renderer.render(scene,camera);
 }
 async function initialize(){
  const T=await loadThree();
  renderer=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
  renderer.setPixelRatio(Math.min(2,root.devicePixelRatio||1));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  renderer.domElement.style.width='100%';renderer.domElement.style.height='100%';renderer.domElement.style.display='block';renderer.domElement.style.touchAction='none';
  viewport.replaceChildren(renderer.domElement);
  scene=new T.Scene();camera=new T.PerspectiveCamera(35,1,.1,100);camera.position.set(3,2.1,4);camera.lookAt(0,0,0);
  const ambient=new T.AmbientLight(0xffffff,.75),key=new T.DirectionalLight(0xffffff,config.light);key.position.set(3,4,5);
  const rim=new T.PointLight(0x57d8ff,config.light*1.15,12);rim.position.set(-3,1.5,-2);
  scene.add(ambient,key,rim);scene.userData.keyLight=key;scene.userData.rimLight=rim;
  await setShape(config.shape);resize();
  if(root.ResizeObserver){resizeObserver=new root.ResizeObserver(resize);resizeObserver.observe(viewport);}else root.addEventListener('resize',resize);
  renderer.domElement.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);});
  renderer.domElement.addEventListener('pointermove',e=>{if(!drag||!mesh)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag={x:e.clientX,y:e.clientY};mesh.rotation.y+=dx*.01;mesh.rotation.x+=dy*.01;config.rotationY=mesh.rotation.y*180/Math.PI;config.rotationX=mesh.rotation.x*180/Math.PI;$('threeX').value=Math.round(config.rotationX);$('threeY').value=Math.round(config.rotationY);updateLabels();});
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>renderer.domElement.addEventListener(type,()=>{drag=null;}));
  $('threeControls').hidden=false;$('threeExport').disabled=false;$('threeReset').disabled=false;$('threeLoad').disabled=true;$('threeLoad').textContent='3D workspace ready';
  updateLabels();animate();report('3D scene ready. Drag the object to rotate it, or use the XYZ controls.');
 }
 $('threeLoad').onclick=async()=>{ $('threeLoad').disabled=true;report('Loading Three.js and preparing WebGL…');try{await initialize();}catch(error){$('threeLoad').disabled=false;report('3D workspace unavailable: '+error.message+' — check WebGL and internet access.');}};
 $('threeShape').onchange=async e=>{config.shape=e.target.value;report(config.shape==='text'?'Loading 3D font…':'Changing geometry…');try{await setShape(config.shape);apply();report(config.shape==='text'?'Extruded 3D text ready.':'3D geometry changed.');}catch(error){report('Could not build this 3D object: '+error.message);}};
 $('threeText').onchange=async e=>{config.text=String(e.target.value||'WAVEFORGE').slice(0,18);if(config.shape==='text'){try{await setShape('text');apply();}catch(error){report('3D text failed: '+error.message);}}};
 $('threeFont').onchange=async e=>{config.fontFamily=FONT_FAMILIES.includes(e.target.value)?e.target.value:'helvetiker_bold';if(config.shape==='text'){report('Loading '+config.fontFamily.replace(/_/g,' ')+' 3D font…');try{await setShape('text');apply();report('3D font changed.');}catch(error){report('Could not load 3D font: '+error.message);}}};
 $('threeDepth').oninput=e=>{config.textDepth=Number(e.target.value)/100;$('threeDepthValue').textContent=config.textDepth.toFixed(2);};
 $('threeDepth').onchange=async()=>{if(config.shape==='text'){try{await setShape('text');apply();}catch(error){report('3D extrusion failed: '+error.message);}}};
 $('threeColor').oninput=e=>{config.color=e.target.value;apply();};
 [['Scale','scale',v=>v/100],['Metal','metalness',v=>v/100],['Rough','roughness',v=>v/100],['Light','light',v=>v/100],['X','rotationX',v=>v],['Y','rotationY',v=>v],['Z','rotationZ',v=>v],['PX','positionX',v=>v/100],['PY','positionY',v=>v/100],['PZ','positionZ',v=>v/100]].forEach(([id,key,convert])=>{$('three'+id).oninput=e=>{config[key]=convert(Number(e.target.value));if(key==='light'&&scene){scene.userData.keyLight.intensity=config.light;scene.userData.rimLight.intensity=config.light*1.15;}apply();};});
 $('threeAuto').onchange=e=>{config.autoRotate=e.target.checked;};
 $('threeReset').onclick=()=>{config=normalizeConfig();$('threeShape').value=config.shape;$('threeColor').value=config.color;$('threeScale').value=100;$('threeMetal').value=65;$('threeRough').value=25;$('threeLight').value=135;$('threeX').value=0;$('threeY').value=0;$('threeZ').value=0;$('threeText').value=config.text;$('threeFont').value=config.fontFamily;$('threeDepth').value=16;$('threeDepthValue').textContent='0.16';$('threePX').value=0;$('threePY').value=0;$('threePZ').value=0;$('threeAuto').checked=true;setShape(config.shape).then(()=>{apply();report('3D object reset.');}).catch(error=>report('3D reset failed: '+error.message));};
 $('threeExport').onclick=async()=>{
  if(!renderer||!mesh)return;$('threeExport').disabled=true;
  try{
   renderer.setPixelRatio(1);renderer.setSize(1024,1024,false);camera.aspect=1;camera.updateProjectionMatrix();renderer.render(scene,camera);
   const blob=await new Promise(resolve=>renderer.domElement.toBlob(resolve,'image/png'));
   renderer.setPixelRatio(Math.min(2,root.devicePixelRatio||1));resize();
   if(!blob)throw new Error('PNG export returned an empty image.');
   const file=new File([blob],'waveforge-3d-object.png',{type:'image/png'});
   if(typeof options.onLogo==='function')await options.onLogo(file);
   report('Transparent 1024 × 1024 PNG exported and added as a logo layer.');
  }catch(error){report('3D PNG export failed: '+error.message);}
  finally{$('threeExport').disabled=false;}
 };
 root.addEventListener('beforeunload',()=>{if(raf)root.cancelAnimationFrame(raf);if(resizeObserver)resizeObserver.disconnect();if(renderer)renderer.dispose();},{once:true});
}
const api={SHAPES,FONT_FAMILIES,DEFAULTS,normalizeConfig,geometry,mount,loadThree,loadTextTools};
root.WaveForge3D=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
