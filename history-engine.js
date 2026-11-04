(function(root){
'use strict';
function create(options={}){
 const limit=Math.max(2,Number(options.limit)||40),delay=Math.max(0,Number(options.delay)||250),onChange=typeof options.onChange==='function'?options.onChange:()=>{};
 let past=[],future=[],timer=null,pending=null;
 const parse=s=>JSON.parse(s);
 function notify(){onChange({canUndo:past.length>1,canRedo:future.length>0,undoCount:Math.max(0,past.length-1),redoCount:future.length});}
 function commit(snapshot){
  if(!snapshot||snapshot===past[past.length-1])return;
  past.push(snapshot);if(past.length>limit)past.shift();future=[];notify();
 }
 function flush(){if(timer!==null){clearTimeout(timer);timer=null;}if(pending!==null){const value=pending;pending=null;commit(value);}}
 function seed(value){if(timer!==null)clearTimeout(timer);timer=null;pending=null;past=[JSON.stringify(value)];future=[];notify();}
 function record(value){
  const snapshot=JSON.stringify(value);
  if(snapshot===past[past.length-1]||snapshot===pending)return;
  pending=snapshot;if(timer!==null)clearTimeout(timer);
  timer=setTimeout(()=>{timer=null;const next=pending;pending=null;commit(next);},delay);
 }
 function undo(){flush();if(past.length<=1)return null;future.unshift(past.pop());notify();return parse(past[past.length-1]);}
 function redo(){flush();if(!future.length)return null;past.push(future.shift());notify();return parse(past[past.length-1]);}
 function clear(){if(timer!==null)clearTimeout(timer);timer=null;pending=null;past=[];future=[];notify();}
 return{seed,record,flush,undo,redo,clear,canUndo:()=>past.length>1,canRedo:()=>future.length>0};
}
const api={create};
root.WaveForgeHistory=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
