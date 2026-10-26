export const CPU_MODEL_ID='onnx-community/Qwen2.5-0.5B-Instruct';
export const CPU_MODEL_REVISION='22942cb7d7ba4cc81bb4673549ca4d4614469b5e';
/** Same small completion interface as the GPU engine; actual inference stays in a worker. */
export class CPUWorkerEngine{
 constructor(worker,{initProgressCallback=()=>{}}={}){
  this.worker=worker;this.progress=initProgressCallback;this.jobs=new Map();this.sequence=0;
  worker.addEventListener('message',({data})=>{if(data.type==='progress'){this.progress(data);return;}const job=this.jobs.get(data.id);if(!job)return;this.jobs.delete(data.id);data.type==='error'?job.reject(Error(data.message)):job.resolve(data.result);});
  worker.addEventListener('error',()=>{for(const job of this.jobs.values())job.reject(Error('CPU 模型工作程序停止'));this.jobs.clear();});
  this.chat={completions:{create:args=>this.request('ask',args)}};
 }
 request(type,payload){return new Promise((resolve,reject)=>{const id=++this.sequence;this.jobs.set(id,{resolve,reject});try{this.worker.postMessage({id,type,payload});}catch(e){this.jobs.delete(id);reject(e);}});}
 reload(){return this.request('load',{});}
}
