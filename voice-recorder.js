(function(root){
'use strict';
const MAX_DURATION=180,MAX_BYTES=100*1024*1024;
const MIME_TYPES=['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/mp4','audio/webm','audio/ogg'];
const active=new Set();
function chooseMimeType(Recorder){
 if(!Recorder||typeof Recorder.isTypeSupported!=='function')return'';
 return MIME_TYPES.find(type=>{try{return Recorder.isTypeSupported(type);}catch(e){return false;}})||'';
}
function extensionForMime(mime){
 const type=String(mime||'').toLowerCase();
 if(type.includes('ogg'))return'ogg';
 if(type.includes('mp4')||type.includes('m4a'))return'm4a';
 return'webm';
}
function formatTime(seconds){
 const s=Math.max(0,Math.floor(Number(seconds)||0));
 return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
}
function makeRecordingFile(blob,role,now=Date.now(),FileCtor=root.File){
 if(!blob||!blob.size)throw new Error('The microphone returned an empty recording.');
 if(blob.size>MAX_BYTES)throw new Error('Recording is larger than the 100 MB safety limit.');
 const mime=blob.type||'audio/webm',extension=extensionForMime(mime),safe=String(role||'voice').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'voice';
 if(typeof FileCtor!=='function')throw new Error('File creation is not supported in this browser.');
 return new FileCtor([blob],'waveforge-'+safe+'-'+now+'.'+extension,{type:mime,lastModified:now});
}
function mount(host,options={}){
 if(!host||!root.document)return null;
 const panel=root.document.createElement('section');panel.className='voice-recorder-panel';
 panel.innerHTML='<div class="eyebrow">MICROPHONE RECORDING</div><h4>Record a new '+String(options.role||'voice').replace(/[&<>"]/g,'')+' layer</h4><p>Record vocals, ad-libs, humming or harmonies directly into a separate mixer layer. The original song is not changed and microphone audio stays on this device.</p><div class="voice-recorder-actions"><button type="button" class="btn small primary" data-record-start>● Start recording</button><button type="button" class="btn small" data-record-stop disabled>■ Stop</button><button type="button" class="btn small" data-record-cancel disabled>Cancel</button></div><div class="voice-recorder-meter"><span data-record-meter></span></div><p class="hint" data-record-status aria-live="polite">Ready · maximum 03:00 per take</p><div class="voice-recorder-output" data-record-output hidden><audio controls preload="metadata" data-record-preview></audio><div class="voice-recorder-actions"><button type="button" class="btn small primary" data-record-add>Add to mixer</button><a class="btn small" data-record-download download>Download recording</a></div></div><small class="voice-recorder-note">Microphone permission is required. Use headphones while recording to reduce background music bleed. This records your performance; it does not generate vocals or automatically remove the backing track.</small>';
 host.appendChild(panel);
 const q=selector=>panel.querySelector(selector),start=q('[data-record-start]'),stop=q('[data-record-stop]'),cancel=q('[data-record-cancel]'),status=q('[data-record-status]'),meter=q('[data-record-meter]'),output=q('[data-record-output]'),preview=q('[data-record-preview]'),add=q('[data-record-add]'),download=q('[data-record-download]');
 let recorder=null,stream=null,chunks=[],file=null,url=null,timer=null,started=0,discard=false,bytes=0,requestId=0;
 const session={cancel:()=>cancelTake()};active.add(session);
 function releaseStream(){if(stream)stream.getTracks().forEach(track=>track.stop());stream=null;}
 function releaseOutput(){if(url)root.URL.revokeObjectURL(url);url=null;preview.removeAttribute('src');preview.load();file=null;output.hidden=true;}
 function setRecordingState(value){
  start.disabled=value;stop.disabled=!value;cancel.disabled=!value;
 }
 function elapsed(){return Math.min(MAX_DURATION,Math.floor((Date.now()-started)/1000));}
 function updateTimer(){const seconds=elapsed();status.textContent='Recording · '+formatTime(seconds)+' / 03:00';meter.style.width=(seconds/MAX_DURATION*100)+'%';}
 function finish(){
  if(timer){root.clearInterval(timer);timer=null;}
  releaseStream();setRecordingState(false);
  if(discard){discard=false;chunks=[];bytes=0;recorder=null;status.textContent='Recording discarded.';active.delete(session);return;}
  const blob=new root.Blob(chunks,{type:(recorder&&recorder.mimeType)||chunks[0]?.type||'audio/webm'});
  try{
   file=makeRecordingFile(blob,options.role);
   if(url)root.URL.revokeObjectURL(url);
   url=root.URL.createObjectURL(file);preview.src=url;download.href=url;download.download=file.name;output.hidden=false;
   status.textContent='Take ready · '+formatTime(elapsed())+' · '+(file.size/1024/1024).toFixed(2)+' MB';
  }catch(error){status.textContent='Recording failed: '+error.message;}
  chunks=[];bytes=0;recorder=null;
 }
 async function startRecording(){
  if(recorder&&recorder.state==='recording')return;
  if(!root.navigator||!root.navigator.mediaDevices||typeof root.navigator.mediaDevices.getUserMedia!=='function'){status.textContent='Microphone access is unavailable. Open the app in a secure browser or supported Android WebView.';return;}
  if(typeof root.MediaRecorder!=='function'){status.textContent='MediaRecorder is not supported on this device.';return;}
  releaseOutput();add.disabled=false;chunks=[];bytes=0;discard=false;const currentRequest=++requestId;
  start.disabled=true;status.textContent='Requesting microphone permission…';
  try{
   stream=await root.navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
   if(currentRequest!==requestId){releaseStream();return;}
   const mime=chooseMimeType(root.MediaRecorder),instance=mime?new root.MediaRecorder(stream,{mimeType:mime}):new root.MediaRecorder(stream);
   recorder=instance;started=Date.now();
   instance.ondataavailable=event=>{if(event.data&&event.data.size){bytes+=event.data.size;if(bytes>MAX_BYTES){status.textContent='Recording stopped: 100 MB safety limit reached.';discard=true;instance.stop();return;}chunks.push(event.data);}};
   instance.onerror=event=>{status.textContent='Microphone recording error: '+(event.error&&event.error.message||'unknown error');};
   instance.onstop=finish;
   instance.start(1000);setRecordingState(true);status.textContent='Recording · 00:00 / 03:00';meter.style.width='0%';
   timer=root.setInterval(()=>{updateTimer();if(elapsed()>=MAX_DURATION&&recorder&&recorder.state==='recording'){status.textContent='Maximum recording length reached. Saving take…';recorder.stop();}},250);
  }catch(error){releaseStream();recorder=null;start.disabled=false;status.textContent='Could not start microphone: '+(error&&error.message||'permission denied');}
 }
 function stopRecording(){if(recorder&&recorder.state==='recording')recorder.stop();}
 function cancelTake(){
  requestId++;discard=true;if(timer){root.clearInterval(timer);timer=null;}
  if(recorder&&recorder.state==='recording'){recorder.stop();}else{releaseStream();setRecordingState(false);chunks=[];bytes=0;recorder=null;releaseOutput();status.textContent='Recording cancelled.';active.delete(session);}
 }
 start.onclick=startRecording;stop.onclick=stopRecording;cancel.onclick=cancelTake;
 add.onclick=()=>{if(file&&typeof options.onAdd==='function'){options.onAdd(file);add.disabled=true;status.textContent='Recording added as a new '+(options.role||'voice')+' mixer layer.';}};
 const api={cancel:cancelTake,destroy(){cancelTake();if(url)root.URL.revokeObjectURL(url);panel.remove();}};
 panel.__voiceRecorder=api;return api;
}
function stopAll(){Array.from(active).forEach(session=>session.cancel());}
const api={MAX_DURATION,MAX_BYTES,MIME_TYPES,chooseMimeType,extensionForMime,formatTime,makeRecordingFile,mount,stopAll};
root.WaveForgeRecorder=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
