(function(root){
'use strict';
const MIME_TYPES=['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/webm','audio/ogg','audio/mp4'];
const MAX_DURATION_MS=180000,MAX_BYTES=30*1024*1024;
function chooseMimeType(Recorder=root.MediaRecorder){
 if(!Recorder)return'';
 if(typeof Recorder.isTypeSupported!=='function')return'';
 return MIME_TYPES.find(type=>Recorder.isTypeSupported(type))||'';
}
function extensionForMime(type){
 const mime=String(type||'').split(';')[0].toLowerCase();
 if(mime==='audio/webm')return'webm';
 if(mime==='audio/ogg')return'ogg';
 if(mime==='audio/mp4'||mime==='audio/aac')return'm4a';
 if(mime==='audio/wav'||mime==='audio/x-wav')return'wav';
 return'webm';
}
function filenameForRole(role,type,stamp=Date.now()){
 const slug=String(role||'voice').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'voice';
 return'wf-'+slug+'-'+String(stamp)+'.'+extensionForMime(type);
}
function mount(host,role,onLayer){
 if(!host||!root.document)return null;
 const panel=root.document.createElement('section');panel.className='voice-recorder-panel';
 panel.innerHTML='<div class="eyebrow">RECORD A NEW TRACK</div><h3>Record your own '+String(role||'voice')+' take</h3><p>Use the microphone to create a separate audio layer. Use headphones to keep the playing song out of the microphone. This does not generate an AI voice or change your original background music.</p><div class="voice-recorder-actions"><button type="button" class="btn small primary" id="wfRecordStart">● Start recording</button><button type="button" class="btn small" id="wfRecordStop" disabled>Stop</button><button type="button" class="btn small" id="wfRecordDiscard" disabled>Discard take</button></div><p class="voice-recorder-status hint" id="wfRecordStatus" aria-live="polite">Microphone permission is required. Maximum recording: 3 minutes / 30 MB.</p><audio id="wfRecordPreview" controls hidden></audio><button type="button" class="btn small" id="wfRecordAdd" disabled>Add recording as a separate layer</button><small class="voice-recorder-note">Recording stays in this project until you add it as a layer. If microphone access is denied or unsupported, use Import audio instead.</small>';
 host.appendChild(panel);
 const $=id=>panel.querySelector('#'+id);
 let stream=null,recorder=null,chunks=[],file=null,previewUrl=null,startedAt=0,elapsedTimer=null,disposed=false,totalBytes=0,recordingFailed=false;
 function report(message){if(!disposed)$('wfRecordStatus').textContent=message;}
 function stopTracks(){if(stream){stream.getTracks().forEach(track=>{try{track.stop();}catch(e){}});stream=null;}}
 function releasePreview(){if(previewUrl){root.URL.revokeObjectURL(previewUrl);previewUrl=null;}$('wfRecordPreview').removeAttribute('src');$('wfRecordPreview').hidden=true;}
 function clearTimer(){if(elapsedTimer){root.clearInterval(elapsedTimer);elapsedTimer=null;}}
 function resetTake(){
  file=null;chunks=[];totalBytes=0;releasePreview();$('wfRecordAdd').disabled=true;$('wfRecordDiscard').disabled=true;
 }
 function finishRecording(){
  clearTimer();stopTracks();$('wfRecordStart').disabled=false;$('wfRecordStop').disabled=true;
  if(disposed)return;
  if(recordingFailed){report('The microphone recorder reported an error. This take was discarded; please try again or import an audio file.');resetTake();recordingFailed=false;return;}
  if(!chunks.length){report('No audio data was captured. Check microphone permission and try again.');resetTake();return;}
  const type=(recorder&&recorder.mimeType)||chunks.find(x=>x.type)?.type||'audio/webm';
  const blob=new Blob(chunks,{type});
  if(blob.size>MAX_BYTES){report('Recording exceeded the 30 MB safety limit. Please make a shorter take.');resetTake();return;}
  try{file=new File([blob],filenameForRole(role,type),{type,lastModified:Date.now()});}
  catch(error){report('This browser cannot package the recording as an audio file. Use Import audio instead.');resetTake();return;}
  releasePreview();previewUrl=root.URL.createObjectURL(file);$('wfRecordPreview').src=previewUrl;$('wfRecordPreview').hidden=false;$('wfRecordAdd').disabled=false;$('wfRecordDiscard').disabled=false;
  report('Take ready · '+(file.size/1024/1024).toFixed(2)+' MB · preview it, then add it as a new layer.');
 }
 async function start(){
  if(disposed)return;
  resetTake();
  if(!root.navigator||!root.navigator.mediaDevices||typeof root.navigator.mediaDevices.getUserMedia!=='function'){report('Microphone recording is unavailable in this browser or WebView. Use Import audio instead.');return;}
  if(typeof root.MediaRecorder!=='function'){report('MediaRecorder is not supported on this device. Use Import audio instead.');return;}
  $('wfRecordStart').disabled=true;report('Requesting microphone permission…');
  try{
   stream=await root.navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
   if(disposed){stopTracks();return;}
   const mimeType=chooseMimeType();
   recorder=mimeType?new root.MediaRecorder(stream,{mimeType}):new root.MediaRecorder(stream);
   chunks=[];totalBytes=0;recordingFailed=false;startedAt=Date.now();
   recorder.ondataavailable=event=>{
    if(!event.data||!event.data.size)return;
    totalBytes+=event.data.size;chunks.push(event.data);
    if(totalBytes>MAX_BYTES){report('Recording reached the 30 MB safety limit. Finishing this take…');if(recorder&&recorder.state==='recording')recorder.stop();}
   };
   recorder.onerror=event=>{recordingFailed=true;report('Recording error: '+(event.error&&event.error.message||'microphone capture failed'));if(recorder&&recorder.state==='recording')recorder.stop();};
   recorder.onstop=finishRecording;
   recorder.start(500);$('wfRecordStop').disabled=false;$('wfRecordDiscard').disabled=false;
   report('Recording '+String(role||'voice').toLowerCase()+'… 00:00 / 03:00');
   elapsedTimer=root.setInterval(()=>{
    const elapsed=Date.now()-startedAt,seconds=Math.floor(elapsed/1000),label=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
    report('Recording '+String(role||'voice').toLowerCase()+'… '+label+' / 03:00');
    if(elapsed>=MAX_DURATION_MS&&recorder&&recorder.state==='recording'){report('Three-minute limit reached. Finishing take…');recorder.stop();}
   },250);
  }catch(error){
   stopTracks();clearTimer();$('wfRecordStart').disabled=false;$('wfRecordStop').disabled=true;
   const reason=error&&error.name==='NotAllowedError'?'Microphone permission was denied. Allow microphone access in Android app settings, or use Import audio.':error&&error.name==='NotFoundError'?'No microphone was found on this device.':'Could not start recording: '+(error&&error.message||'unknown error');
   report(reason);
  }
 }
 $('wfRecordStart').onclick=start;
 $('wfRecordStop').onclick=()=>{if(recorder&&recorder.state==='recording'){report('Finishing recording…');recorder.stop();}};
 $('wfRecordDiscard').onclick=()=>{
  if(recorder&&recorder.state==='recording'){recorder.onstop=null;try{recorder.stop();}catch(e){}}
  clearTimer();stopTracks();resetTake();$('wfRecordStart').disabled=false;$('wfRecordStop').disabled=true;report('Take discarded. You can record another one.');
 };
 $('wfRecordAdd').onclick=()=>{
  if(!file||typeof onLayer!=='function')return;
  const chosen=file;
  try{onLayer(chosen);report('Recording added as a separate '+String(role||'voice').toLowerCase()+' layer.');$('wfRecordAdd').disabled=true;}
  catch(error){report('Could not add this recording: '+(error&&error.message||'mixer rejected the audio file')+'. The take is still available to retry.');}
 };
 const api={dispose(){
  disposed=true;root.removeEventListener('beforeunload',api.dispose);clearTimer();
  if(recorder&&recorder.state==='recording'){recorder.onstop=null;try{recorder.stop();}catch(e){}}
  stopTracks();releasePreview();panel.remove();
 }};
 root.addEventListener('beforeunload',api.dispose);
 return api;
}
const api={MIME_TYPES,MAX_DURATION_MS,MAX_BYTES,chooseMimeType,extensionForMime,filenameForRole,mount};
root.WaveForgeRecorder=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
