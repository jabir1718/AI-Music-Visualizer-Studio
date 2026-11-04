'use strict';
const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const source=fs.readFileSync('video-audio-extractor.js','utf8');
class FakeRecorder{static isTypeSupported(type){return type==='audio/webm;codecs=opus';}}
const window={MediaRecorder:FakeRecorder};
vm.runInNewContext(source,{window,document:{getElementById:()=>null},URL,Math,String,Number,RegExp});
const api=window.WaveForgeMediaTools;
assert(api,'Media tools API should load');
assert.strictEqual(api.selectAudioMime(),'audio/webm;codecs=opus');
assert.strictEqual(api.outputName('my video.mp4'),'my-video-audio.webm');
assert.strictEqual(api.validateVideoFile({type:'video/mp4',size:1024}),true);
assert.throws(()=>api.validateVideoFile({type:'audio/mpeg',size:1024}),/video file/);
assert.throws(()=>api.validateVideoFile({type:'video/mp4',size:api.MAX_VIDEO_BYTES+1}),/500 MB/);
const noRecorder=api.selectAudioMime(null);
assert.strictEqual(noRecorder,null);
console.log('Video-to-audio validation and recorder-selection tests passed.');
