import {WebWorkerMLCEngineHandler} from './public/vendor/webllm-0.2.85.js';
const handler=new WebWorkerMLCEngineHandler();
self.onmessage=event=>handler.onmessage(event);
