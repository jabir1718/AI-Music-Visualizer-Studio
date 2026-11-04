(function(root){
'use strict';
const SIZE=1024,HOP=512;
function fft(real,imag,inverse){
 const n=real.length;
 for(let i=1,j=0;i<n;i++){
  let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;
  if(i<j){let t=real[i];real[i]=real[j];real[j]=t;t=imag[i];imag[i]=imag[j];imag[j]=t;}
 }
 for(let len=2;len<=n;len<<=1){
  const angle=(inverse?2:-2)*Math.PI/len,stepR=Math.cos(angle),stepI=Math.sin(angle);
  for(let base=0;base<n;base+=len){
   let wr=1,wi=0;
   for(let j=0;j<len/2;j++){
    const even=base+j,odd=even+len/2;
    const vr=real[odd]*wr-imag[odd]*wi,vi=real[odd]*wi+imag[odd]*wr;
    const ur=real[even],ui=imag[even];
    real[even]=ur+vr;imag[even]=ui+vi;real[odd]=ur-vr;imag[odd]=ui-vi;
    const nextR=wr*stepR-wi*stepI;wi=wr*stepI+wi*stepR;wr=nextR;
   }
  }
 }
 if(inverse)for(let i=0;i<n;i++){real[i]/=n;imag[i]/=n;}
}
const windowFn=Float64Array.from({length:SIZE},(_,i)=>.5-.5*Math.cos(2*Math.PI*i/(SIZE-1)));
function estimateNoise(samples,sampleRate,start,end){
 const startSample=Math.max(0,Math.min(samples.length-1,Math.floor(start*sampleRate)));
 const endSample=Math.max(startSample+1,Math.min(samples.length,Math.floor(end*sampleRate)));
 const noise=new Float64Array(SIZE/2+1),real=new Float64Array(SIZE),imag=new Float64Array(SIZE);
 let frames=0;
 const last=Math.max(startSample,endSample-SIZE);
 for(let pos=startSample;pos<=last;pos+=HOP){
  for(let i=0;i<SIZE;i++){real[i]=(samples[pos+i]||0)*windowFn[i];imag[i]=0;}
  fft(real,imag,false);
  for(let k=0;k<noise.length;k++)noise[k]+=Math.hypot(real[k],imag[k]);
  frames++;
 }
 if(!frames){
  for(let i=0;i<SIZE;i++){real[i]=(samples[startSample+i]||0)*windowFn[i];imag[i]=0;}
  fft(real,imag,false);
  for(let k=0;k<noise.length;k++)noise[k]=Math.hypot(real[k],imag[k]);
  frames=1;
 }
 for(let k=0;k<noise.length;k++)noise[k]/=frames;
 return noise;
}
function denoiseChannel(samples,sampleRate,options={}){
 const start=Math.max(0,Number(options.noiseStart)||0),end=Math.max(start+.02,Number(options.noiseEnd)||.5);
 const strength=Math.max(0,Math.min(3,options.strength===undefined?1.25:Number(options.strength))),floor=Math.max(.02,Math.min(.5,Number(options.floor)||.08));
 const noise=estimateNoise(samples,sampleRate,start,end),out=new Float64Array(samples.length),weight=new Float64Array(samples.length);
 const real=new Float64Array(SIZE),imag=new Float64Array(SIZE),bins=SIZE/2+1;
 for(let pos=0;pos<samples.length;pos+=HOP){
  for(let i=0;i<SIZE;i++){real[i]=(samples[pos+i]||0)*windowFn[i];imag[i]=0;}
  fft(real,imag,false);
  for(let k=0;k<SIZE;k++){
   const bin=k<bins?k:SIZE-k,mag=Math.hypot(real[k],imag[k]),noiseMag=noise[bin];
   const reduced=Math.max(mag-noiseMag*strength,mag*floor),ratio=mag>1e-12?reduced/mag:0;
   real[k]*=ratio;imag[k]*=ratio;
  }
  fft(real,imag,true);
  for(let i=0;i<SIZE&&pos+i<samples.length;i++){const w=windowFn[i];out[pos+i]+=real[i]*w;weight[pos+i]+=w*w;}
 }
 const result=new Float32Array(samples.length);
 for(let i=0;i<samples.length;i++)result[i]=weight[i]>1e-8?out[i]/weight[i]:samples[i];
 return result;
}
function processBuffer(buffer,options={},onProgress){
 const channels=[];
 for(let c=0;c<buffer.numberOfChannels;c++){
  channels.push(denoiseChannel(buffer.getChannelData(c),buffer.sampleRate,options));
  if(onProgress)onProgress(Math.round((c+1)/buffer.numberOfChannels*100));
 }
 return{sampleRate:buffer.sampleRate,channels,length:buffer.length,duration:buffer.duration};
}
function encodeWav(result){
 const channels=result.channels.length,length=result.length,bytes=44+length*channels*2,buffer=new ArrayBuffer(bytes),view=new DataView(buffer);
 const write=(offset,str)=>{for(let i=0;i<str.length;i++)view.setUint8(offset+i,str.charCodeAt(i));};
 write(0,'RIFF');view.setUint32(4,bytes-8,true);write(8,'WAVE');write(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,channels,true);view.setUint32(24,result.sampleRate,true);view.setUint32(28,result.sampleRate*channels*2,true);view.setUint16(32,channels*2,true);view.setUint16(34,16,true);write(36,'data');view.setUint32(40,bytes-44,true);
 let offset=44;
 for(let i=0;i<length;i++)for(let c=0;c<channels;c++){const s=Math.max(-1,Math.min(1,result.channels[c][i]));view.setInt16(offset,s<0?s*32768:s*32767,true);offset+=2;}
 return new Blob([buffer],{type:'audio/wav'});
}
async function processFile(file,options={},onProgress){
 if(!file||!file.type.startsWith('audio/'))throw new Error('Choose a supported audio file.');
 if(file.size>60*1024*1024)throw new Error('For mobile safety, noise cleanup is limited to 60 MB per file.');
 const Ctx=root.AudioContext||root.webkitAudioContext;if(!Ctx)throw new Error('Web Audio decoding is not supported in this browser.');
 const context=new Ctx();
 try{
  if(onProgress)onProgress({progress:5,status:'Decoding audio…'});
  const buffer=await context.decodeAudioData(await file.arrayBuffer());
  if(!Number.isFinite(buffer.duration)||buffer.duration>120)throw new Error('Noise cleanup is limited to 2-minute clips. Split the audio layer first.');
  const start=Math.max(0,Number(options.noiseStart)||0),end=Math.max(start+.02,Number(options.noiseEnd)||.5);
  if(end>buffer.duration)throw new Error('Noise sample range must be inside the audio clip.');
  if(onProgress)onProgress({progress:15,status:'Estimating the noise profile…'});
  const result=processBuffer(buffer,{...options,noiseStart:start,noiseEnd:end},p=>{if(onProgress)onProgress({progress:15+Math.round(p*.8),status:'Reducing steady background noise…'});});
  if(onProgress)onProgress({progress:100,status:'Creating cleaned WAV…'});
  const blob=encodeWav(result),name=(file.name.replace(/\.[^.]+$/,'')||'audio')+'-cleaned.wav';
  return new File([blob],name,{type:'audio/wav',lastModified:Date.now()});
 }finally{try{await context.close();}catch(e){}}
}
function mount(host,options={}){
 if(!host||root.document.getElementById('noiseCleanupPanel'))return;
 const panel=root.document.createElement('section');panel.id='noiseCleanupPanel';panel.className='noise-cleanup-panel';
 panel.innerHTML='<div class="eyebrow">LOCAL AUDIO CLEANUP</div><h3>Spectral noise reduction</h3><p>Choose a short section containing only background noise. WaveForge estimates its frequency profile and reduces similar steady noise across the clip. The original file is never overwritten.</p><label class="file-button">＋ Choose noisy voice/audio<input id="cleanupFile" type="file" accept="audio/*" hidden></label><div class="noise-cleanup-grid"><label>Noise sample start (s)<input id="cleanupStart" type="number" min="0" step=".05" value="0"></label><label>Noise sample end (s)<input id="cleanupEnd" type="number" min=".05" step=".05" value=".5"></label><label>Reduction strength <output id="cleanupStrengthValue">125%</output><input id="cleanupStrength" type="range" min="0" max="300" value="125"></label></div><button type="button" class="btn small primary" id="cleanupProcess" disabled>Reduce background noise</button><div class="noise-cleanup-progress"><div id="cleanupProgress"></div></div><p id="cleanupStatus" class="hint" aria-live="polite">Choose an audio file to begin. Maximum 60 MB / 2 minutes.</p><div id="cleanupResult" class="noise-cleanup-result" hidden><button type="button" class="btn small" id="cleanupAdd">＋ Add cleaned audio as a new layer</button><a id="cleanupDownload" class="btn small" download>Download cleaned WAV</a></div><small class="noise-cleanup-note">This is local spectral noise reduction, not AI source separation. Best results require a noise-only sample without vocals/music; it may affect quiet speech or musical detail.</small>';
 host.appendChild(panel);
 const $=id=>panel.querySelector('#'+id);let file=null,cleaned=null,url=null;
 $('cleanupFile').onchange=e=>{file=e.target.files&&e.target.files[0]||null;$('cleanupProcess').disabled=!file;if(url)URL.revokeObjectURL(url);url=null;cleaned=null;$('cleanupResult').hidden=true;$('cleanupStatus').textContent=file?file.name+' · '+(file.size/1024/1024).toFixed(1)+' MB':'Choose an audio file to begin.';};
 $('cleanupStrength').oninput=e=>$('cleanupStrengthValue').textContent=e.target.value+'%';
 $('cleanupProcess').onclick=async()=>{
  if(!file)return;$('cleanupProcess').disabled=true;$('cleanupProgress').style.width='2%';$('cleanupStatus').textContent='Starting…';
  try{
   cleaned=await processFile(file,{noiseStart:Number($('cleanupStart').value),noiseEnd:Number($('cleanupEnd').value),strength:Number($('cleanupStrength').value)/100},p=>{$('cleanupStatus').textContent=p.status;$('cleanupProgress').style.width=p.progress+'%';});
   if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(cleaned);$('cleanupDownload').href=url;$('cleanupDownload').download=cleaned.name;$('cleanupResult').hidden=false;$('cleanupStatus').textContent='Noise reduction complete · '+(cleaned.size/1024/1024).toFixed(1)+' MB';
  }catch(error){$('cleanupStatus').textContent='Cleanup failed: '+error.message;}
  finally{$('cleanupProcess').disabled=!file;}
 };
 $('cleanupAdd').onclick=()=>{if(cleaned&&typeof options.onLayer==='function')options.onLayer(cleaned);};
}
const api={fft,estimateNoise,denoiseChannel,processBuffer,encodeWav,processFile,mount};
root.WaveForgeCleanup=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
