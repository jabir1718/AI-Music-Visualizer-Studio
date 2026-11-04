'use strict';
(function(root){
 const MAX_VIDEO_BYTES=500*1024*1024,MAX_DURATION_SECONDS=3600;
 const MIME_TYPES=['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/webm','audio/ogg'];
 function selectAudioMime(Recorder=root.MediaRecorder){
  if(!Recorder)return null;
  if(typeof Recorder.isTypeSupported!=='function')return '';
  return MIME_TYPES.find(type=>Recorder.isTypeSupported(type))||null;
 }
 function validateVideoFile(file){
  if(!file||!/^video\//i.test(file.type||''))throw new Error('Choose a supported video file.');
  if(file.size>MAX_VIDEO_BYTES)throw new Error('Video is larger than the 500 MB extraction limit.');
  return true;
 }
 function outputName(name){
  const base=String(name||'video').replace(/\.[a-z0-9]{2,6}$/i,'').replace(/[^a-z0-9_-]+/gi,'-').slice(0,60)||'video';
  return base+'-audio.webm';
 }
 function createJob(file,onProgress){
  let recorder=null,video=null,context=null,source=null,destination=null,objectUrl=null,cancelled=false,settled=false,stopNow=null;
  const cleanup=async()=>{
   if(video){video.pause();video.removeAttribute('src');try{video.load();}catch(e){}}
   if(source)try{source.disconnect();}catch(e){}
   if(destination)destination.stream.getTracks().forEach(t=>{try{t.stop();}catch(e){}});
   if(context)try{await context.close();}catch(e){}
   if(objectUrl)URL.revokeObjectURL(objectUrl);
  };
  const promise=(async()=>{
   try{
   validateVideoFile(file);
   const mime=selectAudioMime();if(mime===null)throw new Error('This browser does not support audio-only MediaRecorder output.');
   const AudioCtx=root.AudioContext||root.webkitAudioContext;if(!AudioCtx)throw new Error('Web Audio is not supported on this device.');
   objectUrl=URL.createObjectURL(file);video=document.createElement('video');video.preload='auto';video.playsInline=true;video.src=objectUrl;
   context=new AudioCtx();await context.resume();if(cancelled)throw new Error('Audio extraction cancelled.');
   source=context.createMediaElementSource(video);destination=context.createMediaStreamDestination();source.connect(destination);
   if(!destination.stream.getAudioTracks().length)throw new Error('The browser could not create an audio stream from this video.');
   const options=mime?{mimeType:mime,audioBitsPerSecond:160000}:{audioBitsPerSecond:160000};
   recorder=new root.MediaRecorder(destination.stream,options);
   return await new Promise((resolve,reject)=>{
    const chunks=[];
    const finishError=error=>{if(settled)return;settled=true;cleanup().finally(()=>reject(error));};
    recorder.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};
    recorder.onerror=()=>finishError(new Error('Audio extraction recording failed. Try another video or a shorter clip.'));
    recorder.onstop=()=>{
     if(settled)return;
     if(cancelled){finishError(new Error('Audio extraction cancelled.'));return;}
     const blob=new Blob(chunks,{type:recorder.mimeType||mime||'audio/webm'});
     if(!chunks.length||blob.size<512){finishError(new Error('No usable audio was recorded. The video may have no audio track or this codec may be unsupported.'));return;}
     settled=true;const type=blob.type||'audio/webm',ext=type.includes('ogg')?'ogg':'webm';
     const output=new File([blob],outputName(file.name).replace(/\.webm$/i,'.'+ext),{type,lastModified:Date.now()});
     cleanup().then(()=>resolve(output));
    };
    video.onloadedmetadata=()=>{
     if(video.duration>MAX_DURATION_SECONDS){finishError(new Error('Video is longer than the 60-minute extraction limit.'));return;}
    };
    video.ontimeupdate=()=>{if(typeof onProgress==='function'&&video.duration>0)onProgress(Math.min(99,Math.round(video.currentTime/video.duration*100)));};
    video.onended=()=>{if(recorder&&recorder.state!=='inactive')recorder.stop();};
    stopNow=()=>{if(recorder&&recorder.state!=='inactive')recorder.stop();else finishError(new Error('Audio extraction cancelled.'));};
    try{recorder.start(1000);video.play().catch(error=>finishError(new Error('Video audio could not start. '+error.message)));}
    catch(error){finishError(error);}
   });
   }catch(error){await cleanup();throw error;}
  })();
  return{promise,cancel(){cancelled=true;if(stopNow)stopNow();else cleanup();}};
 }
 function mount(host,actions){
  if(!host||document.getElementById('videoAudioExtractor'))return;
  const panel=document.createElement('section');panel.id='videoAudioExtractor';panel.className='video-audio-extractor';
  panel.innerHTML='<div class="mixer-heading"><div><b>Video to audio extractor</b><small>Extract the audio track from a local video. It records in real time and does not upload your file.</small></div></div><label class="extract-file">Choose video<input id="extractVideoInput" type="file" accept="video/*" hidden></label><span class="extract-file-name" id="extractVideoName">No video selected</span><div class="extract-progress"><div id="extractProgressBar"></div></div><p class="extract-status" id="extractStatus" role="status">Ready · up to 500 MB and 60 minutes per video</p><div class="extract-actions"><button class="btn small" id="extractStart" type="button" disabled>Extract audio</button><button class="btn small" id="extractCancel" type="button" hidden>Cancel</button><button class="btn small" id="extractUseMain" type="button" hidden>Use as main track</button><button class="btn small" id="extractAddLayer" type="button" hidden>Add as audio layer</button><button class="btn small" id="extractDownload" type="button" hidden>Download audio</button></div><p class="extract-note">Output is audio-only WebM/Opus or Ogg when supported. Extraction takes approximately the video's playback duration.</p>';
  host.appendChild(panel);
  const $=id=>document.getElementById(id),input=$('extractVideoInput');
  let selected=null,job=null,output=null,downloadUrl=null;
  const status=t=>$('extractStatus').textContent=t;
  input.onchange=e=>{selected=e.target.files&&e.target.files[0]||null;output=null;$('extractVideoName').textContent=selected?selected.name:'No video selected';$('extractStart').disabled=!selected;$('extractUseMain').hidden=true;$('extractAddLayer').hidden=true;$('extractDownload').hidden=true;$('extractProgressBar').style.width='0%';status(selected?'Video selected · ready to extract':'Ready');};
  $('extractStart').onclick=async()=>{
   if(!selected)return;
   try{validateVideoFile(selected);}catch(e){status(e.message);return;}
   $('extractStart').disabled=true;$('extractCancel').hidden=false;status('Preparing audio capture…');
   job=createJob(selected,p=>{$('extractProgressBar').style.width=p+'%';status('Extracting audio… '+p+'%');});
   try{
    output=await job.promise;$('extractProgressBar').style.width='100%';status('Audio ready · '+(output.size/1024/1024).toFixed(1)+' MB');$('extractUseMain').hidden=false;$('extractAddLayer').hidden=false;$('extractDownload').hidden=false;
    if(downloadUrl)URL.revokeObjectURL(downloadUrl);downloadUrl=URL.createObjectURL(output);
   }catch(e){status(e.message);if(downloadUrl){URL.revokeObjectURL(downloadUrl);downloadUrl=null;}}
   finally{job=null;$('extractStart').disabled=false;$('extractCancel').hidden=true;}
  };
  $('extractCancel').onclick=()=>{if(job){job.cancel();status('Cancelling extraction…');}};
  $('extractUseMain').onclick=()=>{if(output&&actions&&actions.onMain)actions.onMain(output);};
  $('extractAddLayer').onclick=()=>{if(output&&actions&&actions.onLayer)actions.onLayer(output);};
  $('extractDownload').onclick=()=>{if(downloadUrl){const link=document.createElement('a');link.href=downloadUrl;link.download=output.name;link.click();}};
 }
 root.WaveForgeMediaTools={selectAudioMime,validateVideoFile,outputName,createJob,mount,MAX_VIDEO_BYTES,MAX_DURATION_SECONDS};
})(window);
