import {pipeline,env} from './public/vendor/transformers-3.7.2/transformers.min.js';
import {CPU_MODEL_ID,CPU_MODEL_REVISION} from './browser-cpu.js';
import OpenCC from './public/vendor/opencc-cn2t-1.4.2.js';
const toTraditional=OpenCC.Converter({from:'cn',to:'hk'});
// Single-thread WASM does not require WebGPU, SharedArrayBuffer or cross-origin isolation.
env.allowLocalModels=false;
env.useBrowserCache=true;
env.backends.onnx.wasm.numThreads=1;
env.backends.onnx.wasm.proxy=false;
env.backends.onnx.wasm.wasmPaths=new URL('./public/vendor/transformers-3.7.2/',import.meta.url).href;
let generator,loading;
function load(){return loading??=pipeline('text-generation',CPU_MODEL_ID,{revision:CPU_MODEL_REVISION,device:'wasm',dtype:'q8',progress_callback:p=>{const progress=Number.isFinite(p.progress)?p.progress/100:0;self.postMessage({type:'progress',progress,text:p.status==='progress'?`CPU 模型下載中：${Math.round(progress*100)}%`:'CPU 模型：'+(p.status==='ready'?'整理運算記憶體…':'載入檔案／運算程式…')});}}).then(g=>generator=g);}
self.onmessage=async({data:{id,type,payload}})=>{
 try{
  if(type==='load'){await load();self.postMessage({id,type:'result',result:true});return;}
  if(type!=='ask'||!generator)throw Error('CPU 模型尚未就緒');
  const out=await generator(payload.messages,{max_new_tokens:Math.min(payload.max_tokens||192,256),do_sample:false,repetition_penalty:1.1});
  const generated=out[0]?.generated_text;
  const answer=Array.isArray(generated)?generated.at(-1)?.content:generated;
  if(typeof answer!=='string'||!answer.trim())throw Error('CPU 模型未有有效輸出');
  self.postMessage({id,type:'result',result:{choices:[{message:{content:toTraditional(answer)}}]}});
 }catch(e){self.postMessage({id,type:'error',message:String(e?.message||e).slice(0,600)});}
};
