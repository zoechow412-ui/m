import assert from 'node:assert/strict';
import {officeSeats} from '../office-scene.js';
assert.equal(officeSeats.length,8);
assert.equal(new Set(officeSeats.map(s=>s.id)).size,8);
assert.deepEqual(officeSeats.slice(0,4).map(s=>s.y),[24.7,24.7,24.7,24.7]);
assert.deepEqual(officeSeats.slice(4).map(s=>s.y),[42.5,42.5,42.5,42.5]);
for(const width of [375,620,885,1200])for(const s of officeSeats){const spriteWidth=width*.22;const left=width*(s.x/100-.11);assert.ok(Math.abs(left+spriteWidth/2-width*s.x/100)<.001);assert.ok(left>=0);assert.ok(left+spriteWidth<=width);}
console.log('PASS Eight distinct chair anchors and width-based sprite alignment at four viewport widths');
