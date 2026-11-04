(function(root){
'use strict';
function bounds(layer,duration){
 const total=Number.isFinite(duration)&&duration>0?duration:Infinity;
 const start=Math.max(0,Number(layer.trimStart)||0);
 const rawEnd=Number(layer.trimEnd)||0;
 const end=Math.min(total,rawEnd>start?rawEnd:total);
 return{start,end,span:end-start,valid:end-start>.02};
}
function resolveLayerTime(layer,mainTime,duration){
 const b=bounds(layer,duration),offset=Math.max(0,Number(layer.offset)||0),rate=Math.max(.1,Math.min(4,Number(layer.rate)||1));
 if(!b.valid)return{active:false,currentTime:b.start,reason:'invalid-trim'};
 if(mainTime<offset)return{active:false,currentTime:b.start,reason:'before-start'};
 const elapsed=(mainTime-offset)*rate;
 if(elapsed>=b.span&&!layer.loop)return{active:false,currentTime:b.end,reason:'after-end'};
 return{active:true,currentTime:b.start+(layer.loop?elapsed%b.span:elapsed),reason:'playing'};
}
function splitLayer(layer,mainTime,duration){
 const b=bounds(layer,duration),offset=Math.max(0,Number(layer.offset)||0),rate=Math.max(.1,Math.min(4,Number(layer.rate)||1));
 if(!b.valid)return null;
 const mediaTime=b.start+(mainTime-offset)*rate;
 if(mediaTime<=b.start+.02||mediaTime>=b.end-.02)return null;
 return{
  first:{trimStart:b.start,trimEnd:mediaTime,offset:layer.offset||0},
  second:{trimStart:mediaTime,trimEnd:Number(layer.trimEnd)||b.end,offset:mainTime},
  splitMediaTime:mediaTime
 };
}
function setTrim(layer,start,end,duration){
 const total=Number.isFinite(duration)&&duration>0?duration:Infinity;
 const s=Math.max(0,Math.min(total,Number(start)||0));
 let e=Number(end)||0;
 if(e>0)e=Math.max(s+.03,Math.min(total,e));
 layer.trimStart=s;layer.trimEnd=e>0?e:0;
 return bounds(layer,duration);
}
const api={bounds,resolveLayerTime,splitLayer,setTrim};
root.WaveForgeTimeline=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
