'use strict';
const assert=require('assert');
const listeners={};
let intervalFn=null,stoppedTracks=0,downloaded=false;
class FakeRecorder{
 static isTypeSupported(){return true;}
 constructor(stream,options){this.stream=stream;this.mimeType=options?.mimeType||'video/webm';this.state='inactive';FakeRecorder.latest=this;}
 start(){this.state='recording';}
 stop(){if(this.state==='inactive')return;this.state='inactive';this.onstop&&this.onstop();}
}
const audio={
 currentTime:0,duration:10,paused:false,ended:false,
 play(){this.paused=false;return Promise.resolve();},
 addEventListener(name,fn){(listeners[name]||(listeners[name]=[])).push(fn);},
 removeEventListener(name,fn){listeners[name]=(listeners[name]||[]).filter(x=>x!==fn);},
 pause(){this.paused=true;(listeners.pause||[]).slice().forEach(fn=>fn());}
};
global.window={MediaRecorder:FakeRecorder};
global.MediaRecorder=FakeRecorder;
global.document={createElement:()=>({click(){downloaded=true;}})};
global.URL={createObjectURL:()=> 'blob:export',revokeObjectURL(){}};
global.setInterval=fn=>{intervalFn=fn;return 1;};
global.clearInterval=()=>{intervalFn=null;};
const canvas={captureStream:()=>({getTracks:()=>[{stop(){stoppedTracks++;}}],getAudioTracks:()=>[],addTrack(){}})};
const engineStream={getAudioTracks:()=>[]};
const api=require('../export.js')&&global.window.WaveForgeExport;
(async()=>{
 const pending=api.record(canvas,audio,{fps:30,quality:720,audioStream:engineStream});
 await Promise.resolve();
 audio.pause();
 await assert.rejects(pending,/paused before export finished/,'pausing audio must fail export instead of leaving it stuck');
 assert(stoppedTracks>0,'export tracks must be released after failure');
 assert.strictEqual(downloaded,false,'failed export must not download a partial file');
 console.log('Export tests passed: paused audio fails cleanly and releases capture tracks.');
})().catch(error=>{console.error(error);process.exitCode=1;});
