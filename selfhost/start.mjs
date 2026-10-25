import {spawn} from 'node:child_process';
const model=spawn('llama-server',['-m','/models/qwen.gguf','--host','127.0.0.1','--port','8081','--ctx-size','8192','--parallel','1','--threads',process.env.MODEL_THREADS||'2','--jinja'],{stdio:['ignore','ignore','inherit']});
const gateway=spawn(process.execPath,['selfhost/server.mjs'],{stdio:'inherit'});
let stopping=false;function stop(code=0){if(stopping)return;stopping=true;model.kill('SIGTERM');gateway.kill('SIGTERM');setTimeout(()=>process.exit(code),1000).unref();}
model.on('exit',code=>stop(code||1));gateway.on('exit',code=>stop(code||1));for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>stop());
