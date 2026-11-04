'use strict';
const assert=require('assert');
class MockVideo{constructor(){this.duration=6;this.videoWidth=1280;this.videoHeight=720;this.readyState=2;this.currentTime=0;this.paused=true;this.src='';}setAttribute(){}load(){if(this.onloadedmetadata)this.onloadedmetadata();}pause(){this.paused=true;}play(){this.paused=false;return Promise.resolve();}}
class MockImage{constructor(){this.naturalWidth=1200;this.naturalHeight=800;this.src='';this.decoding='';}set src(v){this._src=v;if(this.onload)this.onload();}get src(){return this._src;}}
const root={document:{createElement:tag=>tag==='video'?new MockVideo():tag==='img'?new MockImage():null},URL:{createObjectURL:file=>'blob:'+file.name,revokeObjectURL(){}},setTimeout:()=>1,clearTimeout(){}};root.window=root;root.Image=MockImage;
const source=require('fs').readFileSync(require('path').join(__dirname,'..','auto-video-editor.js'),'utf8');
new Function('window','document','URL','setTimeout','clearTimeout',source)(root,root.document,root.URL,root.setTimeout,root.clearTimeout);
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
 api.move(1,-1);const before=api.getCount();assert.strictEqual(api.splitSegment(api.getState().segments[0].id),true);assert.strictEqual(api.getCount(),before+1);
 const frame=api.sync(0,false);assert.ok(frame instanceof MockVideo||frame instanceof MockImage,'playhead should resolve active video or photo');
 assert.ok(api.getMotion(0).scale>=1,'photo template should provide gentle motion');
 api.removeSegment(api.getState().segments[0].id);assert.strictEqual(api.getCount(),before);
 console.log('Auto Video tests passed: mixed local photo/video import, 10 templates, music-length photo montage, beat cuts, photo motion, preview mapping, reorder/split/remove.');
})().catch(error=>{console.error(error);process.exit(1);});
