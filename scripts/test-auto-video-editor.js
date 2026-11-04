'use strict';
const assert=require('assert');
class MockVideo{
 constructor(){this.duration=6;this.videoWidth=1280;this.videoHeight=720;this.readyState=2;this.currentTime=0;this.paused=true;this.src='';}
 setAttribute(){}
 load(){if(this.onloadedmetadata)this.onloadedmetadata();}
 pause(){this.paused=true;}
 play(){this.paused=false;return Promise.resolve();}
}
const root={document:{createElement:(tag)=>{if(tag!=='video')throw new Error('unexpected element');return new MockVideo();}},URL:{createObjectURL:file=>'blob:'+file.name,revokeObjectURL(){}},setTimeout:()=>1,clearTimeout(){}};
root.window=root;
const source=require('fs').readFileSync(require('path').join(__dirname,'..','auto-video-editor.js'),'utf8');
new Function('window','document','URL','setTimeout','clearTimeout',source)(root,root.document,root.URL,root.setTimeout,root.clearTimeout);
const api=root.WaveForgeAutoVideo;
const stored=new Map();
const bridge={saveMediaAsset:async(id,file)=>{stored.set(id,{blob:file,name:file.name,type:file.type});return true;},getMediaAsset:async id=>stored.get(id),deleteMediaAsset:async()=>{},onChange:()=>{},getBpm:()=>120};
api.mount({querySelector:()=>null},bridge);
(async()=>{
 await api.addFiles([{name:'one.mp4',type:'video/mp4',size:1024},{name:'two.mp4',type:'video/mp4',size:1024}].map(x=>({...x})).map(x=>Object.assign(x,{arrayBuffer:async()=>new ArrayBuffer(0)})));
 const manual=api.getState();
 assert.strictEqual(manual.assets.length,2);
 assert.strictEqual(manual.segments.length,2);
 const result=api.generateAutoCut({bpm:120});
 assert.ok(!(result&&typeof result.then==='function'),'Auto Cut must return its plan synchronously for the click handler');
 assert.ok(result.count>2,'Auto Cut should split source videos into beat-sized segments');
 assert.ok(result.duration>10&&result.duration<13,'Auto Cut should preserve total source duration');
 assert.strictEqual(api.getState().segments.length,result.count);
 const beforeSplit=api.getCount();
 assert.strictEqual(api.splitSegment(api.getState().segments[0].id),true,'manual split should divide a clip into two segments');
 assert.strictEqual(api.getCount(),beforeSplit+1);
 const frame=api.sync(0,false);
 assert.ok(frame instanceof MockVideo,'playhead should resolve the active source video');
 api.move(1,-1);
 assert.strictEqual(api.getState().segments[0].assetId,manual.assets[1].id,'manual reorder should change clip order');
 api.removeSegment(api.getState().segments[0].id);
 assert.strictEqual(api.getCount(),result.count-1,'manual removal should remove only one segment');
 console.log('Auto Video tests passed: local imports, BPM cut planning, source playback mapping, reorder and removal.');
})().catch(error=>{console.error(error);process.exit(1);});
