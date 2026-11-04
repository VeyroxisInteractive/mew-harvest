'use strict';
function validateWorkerFlow(a){const f=a?.workerFlow;if(f===undefined)return true;const obj=v=>v&&typeof v==='object'&&!Array.isArray(v),num=v=>Number.isFinite(v)&&v>=0;
 if(!obj(f)||f.version!==1||typeof f.auto!=='boolean'||!Array.isArray(f.jobs)||f.jobs.length>250)return false;
 const keys=new Set(),cats=new Set();for(const j of f.jobs){if(!obj(j)||!['harvest','animal','kitchen','handover','reel'].includes(j.type)||!Number.isInteger(j.target)||!num(j.end)||!num(j.created)||typeof j.manual!=='boolean'||j.cat!==null&&!a.cats.some(c=>c.id===j.cat))return false;const key=j.type+':'+j.target;if(keys.has(key))return false;keys.add(key);if(j.end){if(j.cat===null||cats.has(j.cat))return false;cats.add(j.cat);}if(j.type==='handover'){const o=a.orders.find(o=>o.id===j.target);if(!o||!obj(j.goods)||JSON.stringify(Object.entries(j.goods).sort())!==JSON.stringify(Object.entries(o.need).sort())||Object.entries(j.goods).some(([k,n])=>!ITEMS[k]||!Number.isSafeInteger(n)||n<1)||!Number.isInteger(j.slot)||j.slot<0||!Number.isFinite(j.x)||!Number.isFinite(j.y))return false;}if(j.type==='reel'&&typeof j.bonus!=='boolean')return false;}
 return true;
}
