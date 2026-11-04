(function(){
'use strict';
const DB_NAME='waveforge-media-v1',STORE='assets',MAX_BYTES=250*1024*1024;
const $=id=>document.getElementById(id);
function dbOpen(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function readAssets(){return dbOpen().then(db=>new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly'),r=tx.objectStore(STORE).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error);}));}
function writeAssets(items){return dbOpen().then(db=>new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite'),store=tx.objectStore(STORE);store.clear();items.forEach(x=>store.put(x));tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Project media import was cancelled'));}));}
function toBase64(blob){return blob.arrayBuffer().then(buffer=>{const bytes=new Uint8Array(buffer);let binary='';const step=0x8000;for(let i=0;i<bytes.length;i+=step)binary+=String.fromCharCode(...bytes.subarray(i,Math.min(i+step,bytes.length)));return btoa(binary);});}
function fromBase64(value){const binary=atob(value),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return new Blob([bytes]);}
function download(data,name){const blob=new Blob([JSON.stringify(data)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
function buildUI(){
 const host=document.querySelector('.inspector');if(!host||$('projectFilePanel'))return;
 const panel=document.createElement('section');panel.id='projectFilePanel';panel.className='project-file-panel';
 panel.innerHTML='<div class="eyebrow">PROJECT FILE</div><h3>Save & restore studio</h3><p>Export a portable .waveforge project with editor settings, original audio and imported mixer layers. Import restores it on this device.</p><div class="project-file-actions"><button type="button" id="saveProjectFile" class="btn small">💾 Save project</button><button type="button" id="loadProjectFile" class="btn small">📂 Open project</button><input id="projectFileInput" type="file" accept=".waveforge,.json,application/json" hidden></div><small id="projectFileStatus" role="status">Project files stay on your device. Large audio files create large project files.</small>';
 const version=host.querySelector('.version');host.insertBefore(panel,version||null);
 $('saveProjectFile').onclick=saveProject;
 $('loadProjectFile').onclick=()=>$('projectFileInput').click();
 $('projectFileInput').onchange=async e=>{const f=e.target.files&&e.target.files[0];if(f)await loadProject(f);e.target.value='';};
}
async function saveProject(){
 const status=$('projectFileStatus'),button=$('saveProjectFile');button.disabled=true;
 try{
  const settings=JSON.parse(localStorage.getItem('waveforge-v1')||'{}');
  const assets=await readAssets();let total=0;const packed=[];
  for(const item of assets){if(!item||!item.blob)continue;total+=item.blob.size;if(total>MAX_BYTES)throw new Error('Project media exceeds the 250 MB portable-project limit. Remove large files or save a smaller project.');packed.push({id:item.id,name:item.name||'media',type:item.type||item.blob.type||'application/octet-stream',lastModified:item.lastModified||Date.now(),data:await toBase64(item.blob)});status.textContent='Packaging media… '+packed.length+'/'+assets.length;}
  const project={format:'waveforge-project',version:1,createdAt:new Date().toISOString(),settings,assets:packed};
  const title=String(settings.title||'untitled').replace(/[^a-z0-9-_]+/gi,'-').slice(0,48)||'untitled';
  download(project,'WaveForge-'+title+'.waveforge');status.textContent='Project file created · '+packed.length+' media asset(s).';
 }catch(err){status.textContent='Save failed: '+err.message;}
 finally{button.disabled=false;}
}
async function loadProject(file){
 const status=$('projectFileStatus'),button=$('loadProjectFile');button.disabled=true;
 try{
  if(file.size>MAX_BYTES*1.5)throw new Error('This project file is larger than the supported 375 MB import limit.');
  const project=JSON.parse(await file.text());
  if(!project||project.format!=='waveforge-project'||project.version!==1||!project.settings||!Array.isArray(project.assets))throw new Error('This is not a supported WaveForge project file.');
  let total=0;const assets=project.assets.map(item=>{if(!item||typeof item.id!=='string'||typeof item.data!=='string')throw new Error('Project contains an invalid media record.');const blob=fromBase64(item.data);total+=blob.size;if(total>MAX_BYTES)throw new Error('Unpacked media exceeds 250 MB.');return{id:item.id,name:String(item.name||'media'),type:String(item.type||blob.type||'application/octet-stream'),lastModified:Number(item.lastModified)||Date.now(),blob};});
  if(!confirm('Open this WaveForge project? Current saved editor settings and stored media will be replaced.'))return;
  status.textContent='Restoring project media…';await writeAssets(assets);localStorage.setItem('waveforge-v1',JSON.stringify(project.settings));status.textContent='Project restored. Reloading studio…';location.reload();
 }catch(err){status.textContent='Open failed: '+err.message;}
 finally{button.disabled=false;}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',buildUI,{once:true});else buildUI();
})();