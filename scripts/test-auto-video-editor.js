'use strict';
const assert=require('assert');
class MockVideo{
 constructor(){this.duration=6;this.videoWidth=1280;this.videoHeight=720;this.readyState=2;this._currentTime=0;this.paused=true;this.src='';this.listeners={};}
 setAttribute(){}load(){if(this.onloadedmetadata)this.onloadedmetadata();}
 pause(){this.paused=true;}play(){this.paused=false;return Promise.resolve();}
 get currentTime(){return this._currentTime;}set currentTime(v){this._currentTime=v;queueMicrotask(()=>{(this.listeners.seeked||[]).forEach(fn=>fn());if(this.onseeked)this.onseeked();});}
 addEventListener(n,fn){(this.listeners[n]||(this.listeners[n]=[])).push(fn);}removeEventListener(n,fn){this.listeners[n]=(this.listeners[n]||[]).filter(x=>x!==fn);}
}
class MockImage{constructor(){this.naturalWidth=1200;this.naturalHeight=800;this.src='';this.decoding='';}set src(v){this._src=v;queueMicrotask(()=>{if(this.onload)this.onload();});}get src(){return this._src;}}
let lastSceneFrame=null;const root={document:{createElement:tag=>tag==='video'?new MockVideo():tag==='img'?new MockImage():tag==='canvas'?({width:0,height:0,getContext:()=>({drawImage:v=>{lastSceneFrame=v;},getImageData:()=>{const data=new Uint8ClampedArray(32*18*4);data.fill(lastSceneFrame&&lastSceneFrame.currentTime>=3?240:5);return{data};}})}):null},URL:{createObjectURL:file=>'blob:'+file.name,revokeObjectURL(){}},setTimeout,clearTimeout,AudioContext:class{async decodeAudioData(){const rate=8000,length=rate*6,data=new Float32Array(length).fill(.1);for(let i=rate*2.5;i<rate*3.3;i++)data[i]=0;return{sampleRate:rate,length,duration:6,numberOfChannels:1,getChannelData:()=>data};}async close(){}}};root.window=root;root.Image=MockImage;
const source=require('fs').readFileSync(require('path').join(__dirname,'..','auto-video-editor.js'),'utf8');
new Function('window','document','URL','setTimeout','clearTimeout',source)(root,root.document,root.URL,setTimeout,clearTimeout);
const api=root.WaveForgeAutoVideo,stored=new Map();
const bridge={saveMediaAsset:async(id,file)=>{stored.set(id,{blob:file,name:file.name,type:file.type});return true;},getMediaAsset:async id=>stored.get(id),deleteMediaAsset:async()=>{},onChange:()=>{},getBpm:()=>120,getMusicDuration:()=>18};
api.mount({querySelector:()=>null},bridge);
const file=(name,type,size=1024)=>Object.assign({name,type,size,arrayBuffer:async()=>new ArrayBuffer(0)},{});
(async()=>{
 await api.addFiles([file('one.mp4','video/mp4'),file('two.mp4','video/mp4'),file('cover.jpg','image/jpeg')]);
 const imported=api.getState();assert.strictEqual(imported.assets.length,3);assert.strictEqual(imported.segments.length,2);
 assert.strictEqual(imported.assets.filter(a=>a.kind==='image').length,1,'photo import should be recognized');
 const result=api.generateAutoCut({bpm:120,musicDuration:18});
 assert.ok(result.count>=8,'photos should be repeated/segmented to cover a short music track');
 assert.ok(result.duration>=17.5&&result.duration<=18.5,'photo montage should fill supplied music duration');
 assert.strictEqual(api.getState().segments.length,result.count);
 assert.ok(api.getState().segments.some(s=>api.getState().assets.find(a=>a.id===s.assetId).kind==='image'),'auto cut should include photo segments');
 assert.strictEqual(Object.keys(api.PRESETS).length,10,'exactly ten editing templates should be available');
 const first=api.getState().segments[0];assert.strictEqual(api.setSpeedRamp(first.id,.7,1.5),true,'speed ramp should be editable');assert.ok(api.getState().segments[0].rateStart===.7&&api.getState().segments[0].rateEnd===1.5);
 assert.strictEqual(api.setTransition(first.id,'fade'),true,'transition should be editable');assert.strictEqual(api.getVisualEffect(first.timelineStart).type,'fade');
 assert.strictEqual(api.setTransition(first.id,'zoom'),true);assert.ok(api.getMotion(first.timelineStart).scale>1,'zoom transition should scale video/photo preview');
 api.move(1,-1);const before=api.getCount();assert.strictEqual(api.splitSegment(api.getState().segments[0].id),true);assert.strictEqual(api.getCount(),before+1);
 const videoAsset=api.getState().assets.find(a=>a.kind==='video');const sceneCuts=await api.detectScenes(videoAsset.id);assert.ok(sceneCuts.includes(3),'local frame-difference scene detection should find a visible cut');
 const quietGaps=await api.detectQuietGaps(videoAsset.id);assert.ok(quietGaps.some(g=>g.start<=2.5&&g.end>=3.3),'local audio-level analysis should find a quiet gap');
 const frame=api.sync(0,false);assert.ok(frame instanceof MockVideo||frame instanceof MockImage,'playhead should resolve active video or photo');
 const videoFrame=api.getState().segments.find(s=>api.getState().assets.find(a=>a.id===s.assetId).kind==='video');if(videoFrame){api.setSpeedRamp(videoFrame.id,.6,1.4);api.sync(videoFrame.timelineStart,false);assert.ok(Math.abs(api.getState().assets.find(a=>a.id===videoFrame.assetId).media.playbackRate-.6)<.01,'video playbackRate should follow ramp start speed');}
 assert.ok(api.getMotion(0).scale>=1,'photo template should provide gentle motion');
 api.removeSegment(api.getState().segments[0].id);assert.strictEqual(api.getCount(),before);
 console.log('Auto Video tests passed: mixed media import, ten templates, song-length photo montage, beat cuts, speed ramps, transitions, preview mapping and segment edits.');
})().catch(error=>{console.error(error);process.exit(1);});
