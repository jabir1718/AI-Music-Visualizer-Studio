(function(){
'use strict';
async function detect(file,onProgress){
 if(!file||!file.type.startsWith('audio/'))throw new Error('Import an audio track before BPM analysis.');
 const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)throw new Error('Audio decoding is unavailable on this device.');
 const ctx=new Ctx();
 try{
  onProgress&&onProgress('Decoding audio…');
  const buffer=await ctx.decodeAudioData(await file.arrayBuffer());
  if(!buffer.duration||buffer.duration<8)throw new Error('Use a music clip at least 8 seconds long for tempo analysis.');
  const channels=Array.from({length:buffer.numberOfChannels},(_,i)=>buffer.getChannelData(i));
  const hop= Math.max(256,Math.floor(buffer.sampleRate*.02)),env=new Float32Array(Math.ceil(buffer.length/hop));
  for(let i=0;i<env.length;i++){let energy=0,count=0;const start=i*hop,end=Math.min(buffer.length,start+hop);for(let j=start;j<end;j+=4){let v=0;for(const ch of channels)v+=ch[j]||0;v/=channels.length;energy+=v*v;count++;}env[i]=Math.sqrt(energy/Math.max(1,count));}
  onProgress&&onProgress('Analysing rhythm…');
  const novelty=new Float32Array(env.length);let mean=0;
  for(let i=1;i<env.length;i++){const rise=Math.max(0,env[i]-env[i-1]);novelty[i]=rise;mean+=rise;}
  mean/=Math.max(1,novelty.length);let variance=0;for(const x of novelty)variance+=(x-mean)*(x-mean);const sd=Math.sqrt(variance/Math.max(1,novelty.length));
  if(sd<1e-5)throw new Error('This clip has too little rhythmic change for a reliable BPM estimate.');
  const rate=buffer.sampleRate/hop,minLag=Math.floor(rate*60/200),maxLag=Math.ceil(rate*60/60);
  let best={lag:0,score:-Infinity};
  for(let lag=minLag;lag<=maxLag;lag++){let score=0,n=0;for(let i=lag;i<novelty.length;i++){score+=(novelty[i]-mean)*(novelty[i-lag]-mean);n++;}score/=Math.max(1,n);if(score>best.score)best={lag,score};}
  if(!best.lag||best.score<=0)throw new Error('No stable beat pattern was found. Try a longer section with a clear rhythm.');
  let bpm=60*rate/best.lag;
  while(bpm<70)bpm*=2;while(bpm>180)bpm/=2;
  return{bpm:Math.round(bpm*10)/10,confidence:Math.max(0,Math.min(1,best.score/(variance/Math.max(1,novelty.length)))),duration:buffer.duration};
 }finally{await ctx.close().catch(()=>{});}
}
function fromTaps(times){if(!Array.isArray(times)||times.length<3)throw new Error('Tap at least three beats to estimate tempo.');const intervals=[];for(let i=1;i<times.length;i++){const d=Number(times[i])-Number(times[i-1]);if(Number.isFinite(d)&&d>=.25&&d<=2)intervals.push(d);}if(intervals.length<2)throw new Error('Tap at a steady pace between 30 and 240 BPM.');const sorted=intervals.slice().sort((a,b)=>a-b),median=sorted[Math.floor(sorted.length/2)],kept=intervals.filter(x=>Math.abs(x-median)<=median*.22);if(kept.length<2)throw new Error('Tap more steadily to estimate tempo.');const mean=kept.reduce((a,b)=>a+b,0)/kept.length,bpm=60/mean;if(bpm<30||bpm>240)throw new Error('Tap at a steady pace between 30 and 240 BPM.');const variance=kept.reduce((a,x)=>a+(x-mean)*(x-mean),0)/kept.length,confidence=Math.max(0,Math.min(1,1-Math.sqrt(variance)/mean));return{bpm:Math.round(bpm*10)/10,confidence,interval:mean};}
window.WaveForgeBPM={detect,fromTaps};
})();