'use strict';
const assert=require('assert');
const recorder=require('../voice-recorder.js');
assert.strictEqual(recorder.extensionForMime('audio/webm;codecs=opus'),'webm');
assert.strictEqual(recorder.extensionForMime('audio/ogg;codecs=opus'),'ogg');
assert.strictEqual(recorder.extensionForMime('audio/mp4'),'m4a');
assert.strictEqual(recorder.extensionForMime('audio/wav'),'wav');
assert.strictEqual(recorder.filenameForRole('Ad-lib','audio/webm',123),'wf-ad-lib-123.webm');
assert.strictEqual(recorder.filenameForRole('Humming / harmony','audio/ogg',456),'wf-humming-harmony-456.ogg');
const supported={isTypeSupported:type=>type==='audio/ogg;codecs=opus'};
assert.strictEqual(recorder.chooseMimeType(supported),'audio/ogg;codecs=opus');
assert.strictEqual(recorder.chooseMimeType({isTypeSupported:()=>false}),'');
assert.strictEqual(recorder.MAX_DURATION_MS,180000);
assert.strictEqual(recorder.MAX_BYTES,30*1024*1024);
assert.strictEqual(recorder.mount(null,'Voice',()=>{}),null,'mount must safely skip without a DOM host');
console.log('Voice recording helper tests passed.');

const {addMicrophonePermission}=require('./patch-android-manifest.js');
const manifest='<manifest xmlns:android="http://schemas.android.com/apk/res/android"><application /></manifest>';
const patched=addMicrophonePermission(manifest);
assert(patched.includes('android.permission.RECORD_AUDIO'),'Android manifest must declare microphone permission');
assert.strictEqual(addMicrophonePermission(patched),patched,'permission patch must be idempotent');
assert.throws(()=>addMicrophonePermission('<application />'),/manifest root/);


// Exercise the browser recorder lifecycle with a small DOM/MediaRecorder mock.
const original={document:global.document,navigator:Object.getOwnPropertyDescriptor(global,'navigator'),MediaRecorder:Object.getOwnPropertyDescriptor(global,'MediaRecorder'),File:Object.getOwnPropertyDescriptor(global,'File')};
class FakeElement{
 constructor(id=''){this.id=id;this.disabled=false;this.hidden=false;this.textContent='';this.children=[];this.handlers={};this.attributes={};this.src='';}
 addEventListener(name,fn){this.handlers[name]=fn;}
 removeAttribute(name){delete this.attributes[name];if(name==='src')this.src='';}
 appendChild(child){this.children.push(child);return child;}
 remove(){this.removed=true;}
 set innerHTML(html){this.markup=html;this.elements={};for(const match of html.matchAll(/id="([^"]+)"/g))this.elements[match[1]]=new FakeElement(match[1]);}
 querySelector(selector){const id=selector.startsWith('#')?selector.slice(1):selector;return this.elements?.[id]||null;}
}
class FakeMediaRecorder{
 static isTypeSupported(type){return type==='audio/webm;codecs=opus';}
 constructor(stream,options){this.stream=stream;this.mimeType=options?.mimeType||'audio/webm';this.state='inactive';FakeMediaRecorder.latest=this;}
 start(){this.state='recording';}
 stop(){this.state='inactive';if(this.onstop)this.onstop();}
}
global.document={createElement:()=>new FakeElement()};
Object.defineProperty(global,'navigator',{configurable:true,writable:true,value:{mediaDevices:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}}});
Object.defineProperty(global,'MediaRecorder',{configurable:true,writable:true,value:FakeMediaRecorder});
Object.defineProperty(global,'File',{configurable:true,writable:true,value:global.File||class extends Blob{constructor(parts,name,opts={}){super(parts,opts);this.name=name;this.lastModified=opts.lastModified||0;}}});
const wait=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
 const host=new FakeElement(),added=[];
 const api=recorder.mount(host,'Voice',file=>{if(!added.length)throw new Error('mixer busy');added.push(file);});
 const panel=host.children[0],el=id=>panel.querySelector('#'+id);
 await el('wfRecordStart').onclick();
 const media=FakeMediaRecorder.latest;
 assert.equal(media.state,'recording','record button should start MediaRecorder');
 media.ondataavailable({data:new Blob(['sample'],{type:'audio/webm'})});
 el('wfRecordStop').onclick();
 assert.equal(el('wfRecordAdd').disabled,false,'stopped recording should become addable');
 assert.match(el('wfRecordStatus').textContent,/Take ready/,'successful take should show preview-ready state');
 el('wfRecordAdd').onclick();
 assert.match(el('wfRecordStatus').textContent,/still available to retry/,'mixer add failure should keep the take available');
 assert.equal(el('wfRecordAdd').disabled,false,'failed add should not disable retry');
 el('wfRecordAdd').onclick();
 assert.equal(added.length,1,'retry should add the recording');
 assert.equal(el('wfRecordAdd').disabled,true,'successful add should disable duplicate add');
 api.dispose();
 assert.equal(panel.removed,true,'disposing recorder should remove its panel');

 const errorHost=new FakeElement();
 const errorApi=recorder.mount(errorHost,'Humming',()=>{});
 const errorPanel=errorHost.children[0],errorEl=id=>errorPanel.querySelector('#'+id);
 await errorEl('wfRecordStart').onclick();
 const broken=FakeMediaRecorder.latest;
 broken.ondataavailable({data:new Blob(['partial'],{type:'audio/webm'})});
 broken.onerror({error:new Error('device disconnected')});
 assert.match(errorEl('wfRecordStatus').textContent,/reported an error/,'failed recorder must discard partial data');
 assert.equal(errorEl('wfRecordAdd').disabled,true,'failed take must not be offered as successful audio');
 errorApi.dispose();
 if(original.document===undefined)delete global.document;else global.document=original.document;for(const key of ['navigator','MediaRecorder','File']){if(original[key])Object.defineProperty(global,key,original[key]);else delete global[key];}
 console.log('Voice recorder lifecycle tests passed.');
})().catch(error=>{if(original.document===undefined)delete global.document;else global.document=original.document;for(const key of ['navigator','MediaRecorder','File']){if(original[key])Object.defineProperty(global,key,original[key]);else delete global[key];}console.error(error);process.exitCode=1;});
