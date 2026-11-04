'use strict';
(function(){
 const KEY='waveforge-artwork-layers-v1',MAX_LAYERS=12,MAX_FILE=20*1024*1024;
 let layers=[],host=null,bridge=null,selected=null;
 const $=id=>host&&host.querySelector('#'+id);
 function persist(){try{localStorage.setItem(KEY,JSON.stringify(layers.map(({id,name,type,x,y,scale,opacity,rotation,visible,target})=>({id,name,type,x,y,scale,opacity,rotation,visible,target}))));}catch(e){}}
 function safe(v,min,max){return Math.max(min,Math.min(max,Number(v)||0));}
 function render(){
  if(!host)return;
  const list=$('#artworkLayerList');if(!list)return;
  list.innerHTML='';
  if(!layers.length){list.innerHTML='<p class="hint">No independent artwork layers yet. Add a PNG, JPG, WebP or SVG image.</p>';return;}
  layers.forEach(layer=>{
   const card=document.createElement('div');card.className='artwork-layer-card'+(selected===layer.id?' selected':'');
   const head=document.createElement('div');head.className='artwork-layer-head';
   const title=document.createElement('b');title.textContent=layer.name;
   const remove=document.createElement('button');remove.type='button';remove.className='btn small';remove.textContent='Remove';
   remove.addEventListener('click',async()=>{layers=layers.filter(x=>x.id!==layer.id);if(layer.url)URL.revokeObjectURL(layer.url);await bridge.deleteMediaAsset(layer.id);if(selected===layer.id)selected=layers[0]?.id||null;persist();render();bridge.onChange();});
   head.append(title,remove);card.append(head);
   const controls=[['X position','x',0,100,1],['Y position','y',0,100,1],['Size','scale',10,250,1],['Opacity','opacity',0,100,1],['Rotation','rotation',-180,180,1]];
   controls.forEach(([label,key,min,max,step])=>{
    const wrap=document.createElement('label');wrap.className='artwork-layer-control';const text=document.createElement('span');text.textContent=label+' · '+(key==='x'||key==='y'?Math.round(layer[key]*100):Math.round(layer[key]*(key==='scale'?100:1)))+(key==='x'||key==='y'||key==='scale'||key==='opacity'?'%': '°');
    const input=document.createElement('input');input.type='range';input.min=min;input.max=max;input.step=step;
    input.value=key==='x'||key==='y'?layer[key]*100:key==='scale'?layer.scale*100:key==='opacity'?layer.opacity*100:layer.rotation;
    input.addEventListener('input',()=>{layer[key]=key==='x'||key==='y'?safe(input.value,0,100)/100:key==='scale'?safe(input.value,10,250)/100:key==='opacity'?safe(input.value,0,100)/100:safe(input.value,-180,180);text.textContent=label+' · '+Math.round(Number(input.value))+(key==='rotation'?'°':'%');persist();});
    wrap.append(text,input);card.append(wrap);
   });
   const actions=document.createElement('div');actions.className='artwork-layer-actions';
   const select=document.createElement('button');select.type='button';select.className='btn small';select.textContent=selected===layer.id?'Selected':'Select';select.addEventListener('click',()=>{selected=layer.id;render();});
   const visibility=document.createElement('button');visibility.type='button';visibility.className='btn small';visibility.textContent=layer.visible?'Hide':'Show';visibility.addEventListener('click',()=>{layer.visible=!layer.visible;persist();render();});
   actions.append(select,visibility);card.append(actions);list.append(card);
  });
 }
 async function add(file,target='artwork'){
  if(!file||!file.type.startsWith('image/'))throw new Error('Choose an image file.');
  if(file.size>MAX_FILE)throw new Error('Each artwork layer must be 20 MB or smaller.');
  if(layers.length>=MAX_LAYERS)throw new Error('Maximum 12 independent artwork layers reached.');
  const id='artwork-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
  const ok=await bridge.saveMediaAsset(id,file);if(!ok)throw new Error('Could not save this layer on the device. Free some browser storage and try again.');
  const url=URL.createObjectURL(file),img=new Image();
  try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('Image could not be decoded.'));img.src=url;});}catch(error){URL.revokeObjectURL(url);await bridge.deleteMediaAsset(id);throw error;}
  const layer={id,name:file.name||'Artwork layer',type:file.type,url,image:img,x:.5,y:target==='text-decoration'?.34:.55,scale:target==='text-decoration'?.55:.8,opacity:1,rotation:0,visible:true,target};
  layers.push(layer);selected=id;persist();render();bridge.onChange();return true;
 }
 function draw(ctx,w,h){
  layers.forEach(layer=>{if(!layer.visible||!layer.image||!layer.image.complete||!layer.image.naturalWidth)return;
   const maxW=w*.72*layer.scale,maxH=h*.72*layer.scale,ratio=Math.min(maxW/layer.image.naturalWidth,maxH/layer.image.naturalHeight),dw=layer.image.naturalWidth*ratio,dh=layer.image.naturalHeight*ratio;
   ctx.save();ctx.globalAlpha=layer.opacity;ctx.translate(layer.x*w,layer.y*h);ctx.rotate(layer.rotation*Math.PI/180);ctx.drawImage(layer.image,-dw/2,-dh/2,dw,dh);ctx.restore();
  });
 }
 async function restore(){
  let metadata=[];try{metadata=JSON.parse(localStorage.getItem(KEY)||'[]');}catch(e){}
  for(const meta of metadata.slice(0,MAX_LAYERS)){
   const stored=await bridge.getMediaAsset(meta.id);if(!stored||!stored.blob)continue;
   const url=URL.createObjectURL(stored.blob),img=new Image();
   try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error('decode'));img.src=url;});
    layers.push({...meta,url,image:img,x:safe(meta.x,0,1),y:safe(meta.y,0,1),scale:safe(meta.scale,.1,2.5),opacity:safe(meta.opacity,0,1),rotation:safe(meta.rotation,-180,180),visible:meta.visible!==false});
   }catch(e){URL.revokeObjectURL(url);}
  }
  selected=layers[0]?.id||null;render();return layers.length;
 }
 function mount(container,api){host=container;bridge=api;const input=$('#artworkLayerInput'),addBtn=$('#addArtworkLayerBtn');if(addBtn&&input)addBtn.addEventListener('click',()=>input.click());if(input)input.addEventListener('change',async()=>{const file=input.files&&input.files[0];input.value='';if(!file)return;try{await add(file,$('#artworkLayerTarget')?.value||'artwork');}catch(e){const status=$('#artworkLayerStatus');if(status)status.textContent=e.message;}});render();}
 window.WaveForgeArtworkLayers={mount,add,draw,restore,getCount:()=>layers.length,getState:()=>layers.map(({id,name,x,y,scale,opacity,rotation,visible,target})=>({id,name,x,y,scale,opacity,rotation,visible,target}))};
})();