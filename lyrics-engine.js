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
      return_timestamps:'word'
    });
    const tokens=tokensFromResult(result,decoded.duration);
    const lines=groupTokens(tokens);
    if(onProgress)onProgress({status:'Lyrics ready — review the words and timing',progress:100});
    return lines;
  }
  function tokensFromResult(result,duration){
    const chunks=(result&&result.chunks)||[],tokens=[];
    if(chunks.length){
      let previousEnd=0;
      chunks.forEach((chunk,index)=>{
        const text=String(chunk&&chunk.text||'').trim(),parts=text.match(/\S+/g)||[];
        if(!parts.length)return;
        const stamp=chunk.timestamp||[],rawStart=stamp[0],rawEnd=stamp[1];
        const hasStart=typeof rawStart==='number'&&Number.isFinite(rawStart),hasEnd=hasStart&&typeof rawEnd==='number'&&Number.isFinite(rawEnd)&&rawEnd>rawStart;
        const fallbackStart=duration*index/chunks.length,fallbackEnd=duration*(index+1)/chunks.length;
        const maxStart=Number.isFinite(duration)&&duration>.04?duration-.04:Math.max(0,duration||0);
        const start=hasStart?Math.max(0,Math.min(maxStart,rawStart)):Math.max(previousEnd,fallbackStart);
        const boundedEnd=Number.isFinite(duration)?Math.min(duration,rawEnd):rawEnd;
        const end=hasEnd?Math.max(start+.04,boundedEnd):Math.max(start+.08,fallbackEnd);
        parts.forEach((word,i)=>{
          const a=start+(end-start)*i/parts.length,b=start+(end-start)*(i+1)/parts.length;
          tokens.push({text:word,start:a,end:Math.max(a+.04,b),source:hasEnd?'whisper-word-timestamp':'estimated'});
        });
        previousEnd=end;
      });
      return tokens;
    }
    const text=String(result&&result.text||'').trim(),words=text.match(/\S+/g)||[];
    words.forEach((word,i)=>{
      const start=duration*i/Math.max(1,words.length),end=duration*(i+1)/Math.max(1,words.length);
      tokens.push({text:word,start,end:Math.max(start+.04,end),source:'estimated'});
    });
    return tokens;
  }
  function groupTokens(tokens,wordsPerLine=5){
    const lines=[];
    for(let i=0;i<tokens.length;i+=wordsPerLine){
      const words=tokens.slice(i,i+wordsPerLine);if(!words.length)continue;
      const start=words[0].start,end=words[words.length-1].end;
      lines.push({start,end:Math.max(start+.5,end),text:words.map(x=>x.text).join(' '),words,timingSource:words.every(x=>x.source==='whisper-word-timestamp')?'whisper-word-timestamps':'estimated'});
    }
    return lines;
  }
  window.WaveForgeLyrics={transcribe,tokensFromResult,groupTokens};
  if(typeof module!=='undefined'&&module.exports)module.exports=window.WaveForgeLyrics;
})();