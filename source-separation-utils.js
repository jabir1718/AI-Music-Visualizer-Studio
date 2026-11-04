'use strict';
const MODEL_CHOICES=[
 {id:'UVR_MDXNET_KARA_2',label:'Karaoke · instrumental with backing vocals',sizeMB:30,primary:'instrumental'},
 {id:'UVR-MDX-NET-Voc_FT',label:'Vocal isolation · lead and backing vocals',sizeMB:67,primary:'vocals'},
 {id:'Kim_Vocal_2',label:'Vocal isolation · high accuracy',sizeMB:67,primary:'vocals'},
 {id:'UVR_MDXNET_Main',label:'Vocal isolation · general purpose',sizeMB:67,primary:'vocals'}
];
const MAX_FILE_BYTES=30*1024*1024;
const MAX_DURATION_SECONDS=180;
function validateAudioFile(file){
 if(!file)return'Choose an audio file or use the current background song.';
 if(!file.type||!file.type.startsWith('audio/'))return'Choose a supported audio file.';
 if(file.size>MAX_FILE_BYTES)return'For mobile safety, AI separation is limited to 30 MB per file.';
 return'';
}
function mapStemOutputs(urls,primaryStem){
 if(!Array.isArray(urls)||urls.length!==2)throw new Error('The separation model did not return both vocal and instrumental stems.');
 const primary=String(primaryStem||'vocals').toLowerCase()==='instrumental'?'instrumental':'vocals';
 const secondary=primary==='vocals'?'instrumental':'vocals';
 const role=name=>name==='vocals'?'Voice':'Instrumental';
 return[
  {stem:secondary,role:role(secondary),url:urls[0]},
  {stem:primary,role:role(primary),url:urls[1]}
 ];
}
function progressLabel(progress,modelName){
 if(!progress)return'Preparing AI separation…';
 const pct=Math.max(0,Math.min(100,Math.round((Number(progress.fraction)||0)*100)));
 if(progress.stage==='loading-model')return'Loading '+modelName+' model · '+pct+'% (first use downloads and caches the model)';
 if(progress.stage==='demixing'){
  const chunk=Number(progress.chunk)||0,total=Number(progress.totalChunks)||0;
  return total?'Separating audio · segment '+chunk+' / '+total:'Separating audio · '+pct+'%';
 }
 if(progress.stage==='writing-output')return'Writing separated WAV stems · '+pct+'%';
 return'Processing · '+pct+'%';
}
function stemFilename(originalName,stem){
 const base=String(originalName||'audio').replace(/\.[^.]+$/,'').replace(/[^a-z0-9_-]+/gi,'-').replace(/^-|-$/g,'')||'audio';
 return base+'-'+stem+'.wav';
}
module.exports={MODEL_CHOICES,MAX_FILE_BYTES,MAX_DURATION_SECONDS,validateAudioFile,mapStemOutputs,progressLabel,stemFilename};
