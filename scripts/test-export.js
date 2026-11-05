'use strict';
const assert=require('assert');
const listeners={};
let intervalFn=null,stoppedTracks=0,downloaded=0;
class FakeRecorder{
 static isTypeSupported(mime){return mime.startsWith('video/webm');}
 constructor(stream,options){this.stream=stream;this.mimeType=options?.mimeType||'video/webm';this.state='inactive';FakeRecorder.latest=this;}
 start(){this.state='recording';this.ondataavailable&&this.ondataavailable({data:{size:4}});}
 stop(){if(this.state==='inactive')return;this.state='inactive';this.onstop&&this.onstop();}
}
const audio={
 currentTime:0,duration:10,paused:false,ended:false,
 play(){this.paused=false;return Promise.resolve();},
 addEventListener(name,fn){(listeners[name]||(listeners[name]=[])).push(fn);},
 removeEventListener(name,fn){listeners[name]=(listeners[name]||[]).filter(x=>x!==fn);},
 pause(){this.paused=true;(listeners.pause||[]).slice().forEach(fn=>fn());},
 finish(){this.currentTime=this.duration;this.ended=true;(listeners.ended||[]).slice().forEach(fn=>fn());}
};
global.window={MediaRecorder:FakeRecorder};
global.MediaRecorder=FakeRecorder;
global.document={createElement:()=>({click(){downloaded++;}})};
global.URL={createObjectURL:()=> 'blob:export',revokeObjectURL(){}};
global.Blob=class FakeBlob{constructor(chunks,options){this.size=chunks.reduce((total,chunk)=>total+(chunk.size||0),0);this.type=options?.type||'';}};
global.setInterval=fn=>{intervalFn=fn;return 1;};
global.setTimeout=fn=>{fn();return 1;};
global.clearInterval=()=>{intervalFn=null;};
const canvas={captureStream:()=>({getTracks:()=>[{stop(){stoppedTracks++;}}],getAudioTracks:()=>[],addTrack(){}})};
const engineStream={getAudioTracks:()=>[]};
const api=require('../export.js')&&global.window.WaveForgeExport;
(async()=>{
 const failed=api.record(canvas,audio,{fps:30,quality:720,audioStream:engineStream});
 await Promise.resolve();
 audio.pause();
 await assert.rejects(failed,/paused before export finished/,'pausing audio must fail export instead of leaving it stuck');
 assert(stoppedTracks>0,'export tracks must be released after failure');
 assert.strictEqual(downloaded,0,'failed export must not download a partial file');
 assert.strictEqual((listeners.pause||[]).length,0,'pause listener must be removed after failure');

 audio.currentTime=0;audio.paused=false;audio.ended=false;
 const completed=api.record(canvas,audio,{fps:30,quality:720,audioStream:engineStream});
 await Promise.resolve();
 audio.finish();
 const result=await completed;
 assert.strictEqual(result.ext,'webm','successful recording should report its container');
 assert.strictEqual(result.size,4,'successful recording should report the recorded blob size');
 assert.strictEqual(downloaded,1,'completed export should trigger exactly one download');
 assert.strictEqual((listeners.ended||[]).length,0,'ended listener must be removed after success');
 assert.strictEqual(intervalFn,null,'progress timer must be cleared after success');
 assert(stoppedTracks>=2,'capture tracks must be released after success');
 console.log('Export tests passed: interrupted exports fail without partial downloads; completed exports download once and clean up.');
})().catch(error=>{console.error(error);process.exitCode=1;});
