(function(){
  const MIME=['video/mp4;codecs=h264,aac','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
  function supportedMime(){if(!window.MediaRecorder)return null;return MIME.find(m=>MediaRecorder.isTypeSupported(m))||'';}
  async function record(canvas,audio,options,onProgress){
    if(!window.MediaRecorder)throw new Error('Video recording is not supported in this browser. Try an updated browser.');
    if(!canvas.captureStream)throw new Error('Canvas recording is not supported in this browser.');
    const start=audio.currentTime||0,duration=Math.max(0,(audio.duration||0)-start);
    if(!duration)throw new Error('Add and load an audio track before exporting.');
    const mime=supportedMime();
    if(mime===null)throw new Error('MediaRecorder is unavailable.');
    const fps=Number(options.fps)||30,videoStream=canvas.captureStream(fps),stream=videoStream;
    try{
      const audioStream=options.audioStream||(audio&&audio.captureStream?audio.captureStream():null);
      if(audioStream)audioStream.getAudioTracks().forEach(track=>stream.addTrack(track));
    }catch(error){stream.getTracks().forEach(track=>track.stop());throw new Error('Audio could not be connected to the export. '+error.message);}
    let recorder;
    try{recorder=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:Number(options.quality)>=1080?8000000:4500000}:undefined);}
    catch(error){stream.getTracks().forEach(track=>track.stop());throw new Error('This device cannot start the selected video encoder. '+error.message);}
    return new Promise((resolve,reject)=>{
      const chunks=[];let timer=null,settled=false;
      const onPause=()=>{if(!audio.ended&&audio.currentTime<start+duration-.25)fail(new Error('Audio playback was paused before export finished. Resume playback and export again.'));};
      const cleanup=()=>{if(timer!==null){clearInterval(timer);timer=null;}audio.removeEventListener('pause',onPause);audio.removeEventListener('ended',onEnded);stream.getTracks().forEach(track=>{try{track.stop();}catch(e){}});};
      const fail=error=>{if(settled)return;settled=true;cleanup();try{if(recorder.state!=='inactive')recorder.stop();}catch(e){}reject(error);};
      recorder.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};
      recorder.onerror=()=>fail(new Error('Recording failed. Try a shorter project or lower resolution.'));
      const onEnded=()=>{if(timer!==null){clearInterval(timer);timer=null;}if(recorder.state!=='inactive')recorder.stop();};
      recorder.onstop=()=>{
        if(settled)return;settled=true;cleanup();
        if(!chunks.length){reject(new Error('The recorder produced an empty video. Try another browser or lower settings.'));return;}
        const type=recorder.mimeType||mime||'video/webm',blob=new Blob(chunks,{type}),ext=type.includes('mp4')?'mp4':'webm',url=URL.createObjectURL(blob),link=document.createElement('a');
        link.href=url;link.download='waveforge-export.'+ext;link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
        resolve({type,ext,size:blob.size});
      };
      try{
        recorder.start(1000);
        audio.play().catch(error=>fail(new Error('Audio playback could not start for export. '+error.message)));
        timer=setInterval(()=>{
          const progress=Math.min(100,Math.round(((audio.currentTime-start)/duration)*100));
          if(onProgress)onProgress(progress);
          if(audio.ended||audio.paused&&progress>=99){try{if(recorder.state!=='inactive')recorder.stop();}catch(error){fail(error);}}
        },200);
        audio.addEventListener('pause',onPause);audio.addEventListener('ended',onEnded,{once:true});
      }catch(error){fail(error);}
    });
  }
  window.WaveForgeExport={record,supportedMime};
})();
