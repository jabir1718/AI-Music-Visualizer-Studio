'use strict';
(function(root){
 let settings={enabled:false,keyColor:'#00ff00',tolerance:88,softness:38,spill:55};
 let workCanvas=null,workContext=null;
 function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
 function rgb(hex){const s=String(hex||'#00ff00').replace('#','');const n=parseInt(s.length===3?s.split('').map(x=>x+x).join(''):s,16);return[(n>>16)&255,(n>>8)&255,n&255];}
 function set(next){if(next&&typeof next==='object')settings={...settings,...next};settings.tolerance=clamp(Number(settings.tolerance)||0,0,255);settings.softness=clamp(Number(settings.softness)||0,0,160);settings.spill=clamp(Number(settings.spill)||0,0,100);if(!/^#[0-9a-f]{6}$/i.test(settings.keyColor))settings.keyColor='#00ff00';return getSettings();}
 function getSettings(){return{...settings};}
 function processPixels(data,options=settings){
  const key=rgb(options.keyColor),tol=clamp(Number(options.tolerance)||0,0,255),soft=clamp(Number(options.softness)||0,0,160),spill=clamp(Number(options.spill)||0,0,100)/100;
  for(let i=0;i<data.length;i+=4){
   const r=data[i],g=data[i+1],b=data[i+2],dr=r-key[0],dg=g-key[1],db=b-key[2],distance=Math.sqrt(dr*dr+dg*dg+db*db);
   let alpha=distance<=tol?0:soft>0&&distance<tol+soft?(distance-tol)/soft:1;
   if(alpha<1){const excess=Math.max(0,g-Math.max(r,b));data[i+1]=Math.round(g-excess*spill);}
   data[i+3]=Math.round(data[i+3]*alpha);
  }
  return data;
 }
 function process(source,x,y,dw,dh,outW,outH){
  const scale=Math.min(1,540/Math.max(outW,outH)),cw=Math.max(1,Math.round(outW*scale)),ch=Math.max(1,Math.round(outH*scale));
  if(!workCanvas){workCanvas=document.createElement('canvas');workContext=workCanvas.getContext('2d',{willReadFrequently:true});}
  if(workCanvas.width!==cw||workCanvas.height!==ch){workCanvas.width=cw;workCanvas.height=ch;}
  workContext.clearRect(0,0,cw,ch);workContext.drawImage(source,x*scale,y*scale,dw*scale,dh*scale);
  const frame=workContext.getImageData(0,0,cw,ch);processPixels(frame.data,settings);workContext.putImageData(frame,0,0);
  return workCanvas;
 }
 function mount(host,onChange){
  if(!host||document.getElementById('chromaKeyStudio'))return;
  const panel=document.createElement('section');panel.id='chromaKeyStudio';panel.className='chroma-key-studio';
  panel.innerHTML='<div class="mixer-heading"><div><b>Green-screen / chroma key</b><small>Remove a solid-color background from imported photo or video using local canvas processing.</small></div></div><label class="chroma-enable"><input id="chromaEnabled" type="checkbox"> Enable background removal</label><div class="chroma-grid"><label>Key color<input id="chromaColor" type="color" value="#00ff00"></label><label>Tolerance <output id="chromaToleranceValue">88</output><input id="chromaTolerance" type="range" min="0" max="255" value="88"></label><label>Edge softness <output id="chromaSoftnessValue">38</output><input id="chromaSoftness" type="range" min="0" max="160" value="38"></label><label>Green spill reduction <output id="chromaSpillValue">55%</output><input id="chromaSpill" type="range" min="0" max="100" value="55"></label></div><button type="button" class="btn small" id="chromaReset">Reset key settings</button><p class="chroma-note">Processing uses a 540 px working canvas to reduce mobile load. Fine hair and complex edges may need manual cleanup; this is chroma keying, not AI object segmentation.</p>';
  host.appendChild(panel);
  const $=id=>document.getElementById(id);
  function sync(){ $('chromaEnabled').checked=settings.enabled;$('chromaColor').value=settings.keyColor;$('chromaTolerance').value=settings.tolerance;$('chromaSoftness').value=settings.softness;$('chromaSpill').value=settings.spill;$('chromaToleranceValue').textContent=settings.tolerance;$('chromaSoftnessValue').textContent=settings.softness;$('chromaSpillValue').textContent=settings.spill+'%';}
  function changed(){sync();if(typeof onChange==='function')onChange(getSettings());}
  $('chromaEnabled').onchange=e=>{settings.enabled=e.target.checked;changed();};
  $('chromaColor').oninput=e=>{settings.keyColor=e.target.value;changed();};
  [['chromaTolerance','tolerance'],['chromaSoftness','softness'],['chromaSpill','spill']].forEach(([id,key])=>$(id).oninput=e=>{settings[key]=Number(e.target.value);changed();});
  $('chromaReset').onclick=()=>{settings={enabled:false,keyColor:'#00ff00',tolerance:88,softness:38,spill:55};changed();};
  sync();
 }
 root.WaveForgeChromaKey={set,getSettings,processPixels,process,mount};
})(window);
