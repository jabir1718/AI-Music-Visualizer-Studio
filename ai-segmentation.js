(function(root){
'use strict';
const BASE='https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1.1675465747/';
let enabled=false,model=null,loading=null,processing=false,lastResults=null,lastSent=0,status='AI model not loaded',onStatus=()=>{};
let foreground=null,maskCanvas=null;
function setSettings(value){if(value&&typeof value.enabled==='boolean')enabled=value.enabled;return getSettings();}
function getSettings(){return{enabled};}
function report(message){status=message;onStatus(message);}
function loadScript(){
 if(root.SelfieSegmentation)return Promise.resolve();
 if(loading)return loading;
 loading=new Promise((resolve,reject)=>{
  const script=root.document.createElement('script');script.src=BASE+'selfie_segmentation.js';script.async=true;
  script.onload=()=>root.SelfieSegmentation?resolve():reject(new Error('The segmentation library did not initialize.'));
  script.onerror=()=>reject(new Error('Could not load the AI segmentation library. Check internet access.'));
  root.document.head.appendChild(script);
 }).catch(error=>{loading=null;throw error;});
 return loading;
}
async function loadModel(callback){
 if(typeof callback==='function')onStatus=callback;
 if(model)return true;
 if(loading&&model)return true;
 report('Loading AI person-segmentation library…');
 try{
  await loadScript();
  const instance=new root.SelfieSegmentation({locateFile:file=>BASE+file});
  instance.setOptions({modelSelection:1});
  instance.onResults(results=>{lastResults=results;processing=false;});
  await instance.initialize();
  model=instance;report('AI person segmentation ready. Processing stays on this device.');return true;
 }catch(error){processing=false;report('AI segmentation unavailable: '+error.message);throw error;}
}
function ensureCanvases(w,h){
 const scale=Math.min(1,720/Math.max(w,h)),width=Math.max(1,Math.round(w*scale)),height=Math.max(1,Math.round(h*scale));
 if(!foreground){foreground=root.document.createElement('canvas');maskCanvas=root.document.createElement('canvas');}
 if(foreground.width!==width||foreground.height!==height){foreground.width=maskCanvas.width=width;foreground.height=maskCanvas.height=height;}
 return{width,height,scale,fg:foreground.getContext('2d'),mask:maskCanvas.getContext('2d')};
}
function draw(ctx,source,x,y,dw,dh,w,h){
 if(!enabled)return false;
 if(!model){if(!loading)loadModel(onStatus).catch(()=>{});return false;}
 const now=Date.now();
 if(!processing&&now-lastSent>100){processing=true;lastSent=now;Promise.resolve(model.send({image:source})).catch(error=>{processing=false;report('AI segmentation frame failed: '+error.message);});}
 if(!lastResults||!lastResults.segmentationMask||!lastResults.image)return false;
 const c=ensureCanvases(w,h),sx=c.scale;
 c.fg.clearRect(0,0,c.width,c.height);c.mask.clearRect(0,0,c.width,c.height);
 c.fg.globalCompositeOperation='source-over';c.fg.drawImage(lastResults.image,x*sx,y*sx,dw*sx,dh*sx);
 c.mask.globalCompositeOperation='source-over';c.mask.filter='blur(1px)';c.mask.drawImage(lastResults.segmentationMask,x*sx,y*sx,dw*sx,dh*sx);c.mask.filter='none';
 c.fg.globalCompositeOperation='destination-in';c.fg.drawImage(maskCanvas,0,0);c.fg.globalCompositeOperation='source-over';
 ctx.drawImage(foreground,0,0,w,h);return true;
}
function mount(host,onChange){
 if(!host||root.document.getElementById('aiSegmentationPanel'))return;
 const panel=root.document.createElement('section');panel.id='aiSegmentationPanel';panel.className='ai-segmentation-panel';
 panel.innerHTML='<div class="eyebrow">AI SUBJECT CUTOUT</div><h3>Person background removal</h3><p>Optional on-device MediaPipe selfie segmentation for people in photos/videos. The model downloads on first use; a solid-color chroma key remains available as a lightweight alternative.</p><label class="ai-segmentation-toggle"><input id="aiSegmentationEnabled" type="checkbox"> Enable AI person cutout</label><button type="button" class="btn small" id="aiSegmentationLoad">Load AI model</button><p id="aiSegmentationStatus" class="hint" aria-live="polite">AI model not loaded.</p><small class="ai-segmentation-note">This model is for people, not arbitrary objects. Internet is required for first-time model download; real Android performance and edge quality need device testing.</small>';
 host.appendChild(panel);
 const toggle=panel.querySelector('#aiSegmentationEnabled'),button=panel.querySelector('#aiSegmentationLoad'),label=panel.querySelector('#aiSegmentationStatus');
 toggle.checked=enabled;
 const update=message=>{label.textContent=message;button.disabled=!!model;};
 onStatus=update;
 toggle.onchange=()=>{enabled=toggle.checked;if(onChange)onChange(getSettings());};
 button.onclick=async()=>{button.disabled=true;try{await loadModel(update);}catch(e){}finally{button.disabled=!!model;}};
}
const api={setSettings,getSettings,loadModel,draw,mount,getStatus:()=>status};
root.WaveForgeSegmentation=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
