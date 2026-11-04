import { createSeparator, MODEL_REGISTRY } from 'web-audio-separation';
import utils from './source-separation-utils.js';

(function(root){
'use strict';
const separators=new Map();
function mount(host,options={}){
 if(!host||!root.document)return null;
 const panel=root.document.createElement('section');panel.className='ai-separation-panel';
 panel.innerHTML='<div class="eyebrow">ON-DEVICE AI SOURCE SEPARATION</div><h3>Split vocals and instrumental</h3><p>Separate a mixed song into two independent audio layers. The AI model runs on this device; your song is not uploaded. First use downloads a 30–67 MB model and caches it for later sessions.</p><div class="ai-separation-controls"><label>Separation model<select data-sep-model></select></label><label>Choose audio<input data-sep-file type="file" accept="audio/*"></label><button type="button" class="btn small" data-sep-main>Use current background song</button></div><button type="button" class="btn small primary" data-sep-run disabled>Load model & separate</button><div class="ai-separation-progress"><span data-sep-progress></span></div><p class="hint" data-sep-status aria-live="polite">Choose a song. WebGPU is used when available; otherwise processing falls back to CPU/WASM.</p><div class="ai-separation-results" data-sep-results></div><small class="ai-separation-note">Mobile inference can be slow and memory-intensive. Limit: 30 MB per file and 3 minutes per take. Model weights are downloaded from third-party repositories; check their separate terms and your source-audio rights before commercial use. This version creates vocals + instrumental, not separate drums/bass/guitar/piano stems.</small>';
 host.appendChild(panel);
 const $=selector=>panel.querySelector(selector),modelSelect=$('[data-sep-model]'),fileInput=$('[data-sep-file]'),useMain=$('[data-sep-main]'),run=$('[data-sep-run]'),status=$('[data-sep-status]'),bar=$('[data-sep-progress]'),results=$('[data-sep-results]');
 utils.MODEL_CHOICES.forEach(choice=>{const option=root.document.createElement('option');option.value=choice.id;option.textContent=choice.label+' (~'+choice.sizeMB+' MB)';modelSelect.appendChild(option);});
 let selectedFile=null,loadedModel='',separator=null,busy=false,disposed=false,runId=0,outputUrls=[];
 function report(message){if(!disposed)status.textContent=message;}
 function clearOutputs(){outputUrls.forEach(url=>root.URL.revokeObjectURL(url));outputUrls=[];results.innerHTML='';}
 function refreshRun(){run.disabled=busy||!selectedFile;useMain.disabled=busy;}
 function selectFile(file){
  const error=utils.validateAudioFile(file);
  if(error){selectedFile=null;report(error);refreshRun();return;}
  selectedFile=file;report(file.name+' · '+(file.size/1024/1024).toFixed(1)+' MB ready');refreshRun();
 }
 fileInput.addEventListener('change',()=>selectFile(fileInput.files&&fileInput.files[0]));
 useMain.onclick=()=>{const file=typeof options.getMainFile==='function'?options.getMainFile():null;if(!file){report('No background song is loaded yet. Choose an audio file above.');return;}selectFile(file);};
 run.onclick=async()=>{
  if(busy||disposed)return;
  const file=selectedFile||(typeof options.getMainFile==='function'?options.getMainFile():null),error=utils.validateAudioFile(file);
  if(error){report(error);return;}
  const modelName=modelSelect.value,model=MODEL_REGISTRY[modelName];
  if(!model){report('Selected model is unavailable.');return;}
  const thisRun=++runId;busy=true;refreshRun();clearOutputs();bar.style.width='0%';
  let inputUrl=null,stemUrls=[];
  try{
   if(!separator||loadedModel!==modelName){
    report('Preparing '+modelName+'…');
    separator=createSeparator(modelName,{
     common:{logLevel:'error',onProgress:progress=>{if(disposed||thisRun!==runId)return;report(utils.progressLabel(progress,modelName));bar.style.width=Math.round((Number(progress.fraction)||0)*100)+'%';}},
     mdx:{segmentSize:256,overlap:.25,batchSize:1,hopLength:1024,executionProviders:['webgpu','wasm']}
    });
    await separator.loadModel();loadedModel=modelName;
   }
   if(disposed||thisRun!==runId)return;
   report('AI model ready. Separating '+file.name+'…');inputUrl=root.URL.createObjectURL(file);
   stemUrls=await separator.separate(inputUrl);
   if(disposed||thisRun!==runId){stemUrls.forEach(url=>root.URL.revokeObjectURL(url));return;}
   const mapped=utils.mapStemOutputs(stemUrls,model.modelData.primary_stem);
   for(const item of mapped){
    const response=await root.fetch(item.url);if(!response.ok)throw new Error('Could not read '+item.stem+' output.');
    const blob=await response.blob(),stemFile=new root.File([blob],utils.stemFilename(file.name,item.stem),{type:'audio/wav',lastModified:Date.now()});
    const previewUrl=root.URL.createObjectURL(stemFile);outputUrls.push(previewUrl);
    const card=root.document.createElement('div');card.className='ai-separation-stem';
    const heading=root.document.createElement('b');heading.textContent=item.stem==='vocals'?'VOCALS':'INSTRUMENTAL';
    const audio=root.document.createElement('audio');audio.controls=true;audio.preload='metadata';audio.src=previewUrl;
    const actions=root.document.createElement('div');actions.className='ai-separation-actions';
    const add=root.document.createElement('button');add.type='button';add.className='btn small primary';add.textContent='Add '+item.stem+' to mixer';
    add.onclick=()=>{if(typeof options.onLayer==='function'){options.onLayer(stemFile,item.role);add.disabled=true;add.textContent='Added to mixer';}};
    const download=root.document.createElement('a');download.className='btn small';download.href=previewUrl;download.download=stemFile.name;download.textContent='Download WAV';
    actions.append(add,download);card.append(heading,audio,actions);results.appendChild(card);
    root.URL.revokeObjectURL(item.url);
   }
   report('Separation complete · vocals and instrumental are ready as separate WAV layers.');bar.style.width='100%';
  }catch(error){report('AI separation failed: '+(error&&error.message||'unknown error')+'. Try a shorter file or another model.');}
  finally{if(inputUrl)root.URL.revokeObjectURL(inputUrl);stemUrls.forEach(url=>{try{root.URL.revokeObjectURL(url);}catch(e){}});busy=false;refreshRun();}
 };
 const api={dispose(){disposed=true;runId++;clearOutputs();panel.remove();},getStatus:()=>status.textContent};
 return api;
}
const api={mount,models:utils.MODEL_CHOICES};
root.WaveForgeSeparation=api;
})(window);
