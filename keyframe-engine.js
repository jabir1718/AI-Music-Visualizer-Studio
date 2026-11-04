(function(root){
'use strict';
function normalize(frame){
 return{
  time:Math.max(0,Number(frame.time)||0),
  x:Math.max(.05,Math.min(.95,Number(frame.x)||.5)),
  y:Math.max(.05,Math.min(.95,Number(frame.y)||.5)),
  scale:Math.max(.25,Math.min(2.5,Number(frame.scale)||1)),
  rotation:Math.max(-180,Math.min(180,Number(frame.rotation)||0)),
  opacity:Math.max(0,Math.min(1,frame.opacity===undefined?1:Number(frame.opacity)))
 };
}
function sort(frames){return(frames||[]).map(normalize).sort((a,b)=>a.time-b.time);}
function upsert(frames,time,state,tolerance=.04){
 const next=sort(frames),frame=normalize({...state,time});
 const index=next.findIndex(f=>Math.abs(f.time-frame.time)<=tolerance);
 if(index>=0)next[index]=frame;else next.push(frame);
 return next.sort((a,b)=>a.time-b.time);
}
function removeNearest(frames,time,tolerance=.2){
 const next=sort(frames);let index=-1,distance=Infinity;
 next.forEach((f,i)=>{const d=Math.abs(f.time-time);if(d<distance){distance=d;index=i;}});
 if(index<0||distance>tolerance)return{frames:next,removed:null};
 const removed=next.splice(index,1)[0];return{frames:next,removed};
}
function evaluate(frames,time,base={}){
 const list=sort(frames),fallback={x:.5,y:.5,scale:1,rotation:0,opacity:1,...base};
 if(!list.length||time<list[0].time)return fallback;
 if(time>=list[list.length-1].time)return{...fallback,...list[list.length-1]};
 let a=list[0],b=list[1];
 for(let i=1;i<list.length;i++){if(time<=list[i].time){a=list[i-1];b=list[i];break;}}
 const raw=Math.max(0,Math.min(1,(time-a.time)/(b.time-a.time||1))),t=raw*raw*(3-2*raw);
 const out={...fallback};
 ['x','y','scale','rotation','opacity'].forEach(k=>out[k]=a[k]+(b[k]-a[k])*t);
 return out;
}
const api={normalize,sort,upsert,removeNearest,evaluate};
root.WaveForgeKeyframes=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
