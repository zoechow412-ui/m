import assert from 'node:assert/strict';
import {officePoseAt} from '../office-scene.js';
for(let i=0;i<8;i++){
 const frames=new Set();for(let t=0;t<9000;t+=40)frames.add(officePoseAt(t,i));
 assert.deepEqual([...frames].sort(),[0,1,2]);
 assert.equal(officePoseAt(0,i),officePoseAt(9000,i));
}
assert.ok(new Set(Array.from({length:8},(_,i)=>officePoseAt(3000,i))).size>1);
console.log('PASS all 8 workers blink/work; staggered loops exclude standing frame');
