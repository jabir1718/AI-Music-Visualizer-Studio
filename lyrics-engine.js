(function(){
  let pipePromise=null, activeModel='';
  async function loadModel(model,onProgress){
    if(pipePromise&&activeModel===model)return pipePromise;
    activeModel=model;
    pipePromise=(async()=>{
      const mod=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2');
      mod.env.allowLocalModels=false;
      mod.env.useBrowserCache=true;
      return mod.pipeline('automatic-speech-recognition',model,{
        device:'wasm',
        dtype:'q8',
        progress_callback:(p)=>{if(onProgress)onProgress(p);}
      });
    })();
    try{return await pipePromise;}catch(e){pipePromise=null;activeModel='';throw e;}
  }
  async function toMono16k(file){
    const bytes=await file.arrayBuffer();
    const AudioCtx=window.AudioContext||window.webkitAudioContext;
    if(!AudioCtx)throw new Error('This browser does not support audio decoding.');
    const ctx=new AudioCtx();
    try{
      const decoded=await ctx.decodeAudioData(bytes.slice(0));
      const length=Math.ceil(decoded.duration*16000);
      const offline=new OfflineAudioContext(1,length,16000);
      const buffer=offline.createBuffer(1,decoded.length,decoded.sampleRate);
      const channel=buffer.getChannelData(0);
      for(let c=0;c<decoded.numberOfChannels;c++){
        const data=decoded.getChannelData(c);
        for(let i=0;i<data.length;i++)channel[i]+=data[i]/decoded.numberOfChannels;
      }
      const source=offline.createBufferSource();source.buffer=buffer;source.connect(offline.destination);source.start(0);
      const rendered=await offline.startRendering();
      return {audio:rendered.getChannelData(0),duration:decoded.duration};
    }finally{await ctx.close();}
  }
  async function transcribe(file,model,onProgress){
    if(!file)throw new Error('Choose an audio track first.');
    if(onProgress)onProgress({status:'Preparing audio',progress:2});
    const decoded=await toMono16k(file);
    if(onProgress)onProgress({status:'Loading speech model (first use downloads model files)',progress:8});
    const recognizer=await loadModel(model,(p)=>{
      if(onProgress&&p&&typeof p.progress==='number')onProgress({status:'Downloading recognition model',progress:Math.min(70,8+p.progress*.62)});
    });
    if(onProgress)onProgress({status:'Listening to vocals and creating timed lines',progress:72});
    const result=await recognizer(decoded.audio,{
      sampling_rate:16000,
      chunk_length_s:30,
      stride_length_s:5,
      return_timestamps:true
    });
    let chunks=(result&&result.chunks)||[];
    const lines=[];
    if(chunks.length){
      chunks.forEach((chunk)=>{
        const text=(chunk.text||'').trim();
        const ts=chunk.timestamp||[];
        if(!text)return;
        const start=Number.isFinite(ts[0])?ts[0]:0;
        const end=Number.isFinite(ts[1])?ts[1]:Math.min(decoded.duration,start+5);
        const words=text.split(/\\s+/).filter(Boolean);
        const groupSize=6;
        const groups=[];
        for(let i=0;i<words.length;i+=groupSize)groups.push(words.slice(i,i+groupSize).join(' '));
        const span=Math.max(.8,end-start);
        groups.forEach((piece,i)=>{
          const a=start+span*i/groups.length,b=start+span*(i+1)/groups.length;
          lines.push({start:a,end:Math.max(a+.55,b),text:piece});
        });
      });
    }else if(result&&result.text){
      const words=result.text.trim().split(/\\s+/).filter(Boolean),groups=[];
      for(let i=0;i<words.length;i+=6)groups.push(words.slice(i,i+6).join(' '));
      groups.forEach((piece,i)=>lines.push({start:decoded.duration*i/groups.length,end:decoded.duration*(i+1)/groups.length,text:piece}));
    }
    if(onProgress)onProgress({status:'Lyrics ready — review the words and timing',progress:100});
    return lines;
  }
  window.WaveForgeLyrics={transcribe};
})();