const assert=require('node:assert/strict');
const O=require('../v54/optional-defaults.js'),C=require('../v54/core.js');
const fresh=O.ensure([]);
assert.equal(fresh.length,8);
assert.equal(C.totals(fresh).total,0);
assert.equal(O.ensure(fresh).length,8);
const existing=[{description:'通風管道建造工程',unit_price:2500,quantity:2,optional:true,selected:false,sort_order:4,photos:[{src:'x'}]}];
const merged=O.ensure(existing);
assert.equal(merged.length,8);assert.equal(merged[0],existing[0]);
assert.equal(merged[0].unit_price,2500);
assert.equal(O.ensure(merged.filter(x=>O.key(x)!=='capacity')).length,8);
assert.equal(O.defaults.find(x=>x.optional_key==='capacity').unit_price,6500);
assert.equal(O.defaults.find(x=>x.optional_key==='cable65').unit_price,1800);
assert.equal(O.defaults.find(x=>x.optional_key==='fireboard').unit_price,2000);
console.log('Fixed options: new orders, repeat edits, custom values/photos, restoration, prices and zero unchecked totals passed');

for(const rooms of [1,2,3]){const r=O.ensure([],rooms);assert.equal(r.length,7);assert.ok(r.some(x=>O.key(x)==='cable65'));assert.ok(!r.some(x=>O.key(x)==='cable100'));}
for(const rooms of [4,5,10]){const r=O.ensure([],rooms);assert.ok(r.some(x=>O.key(x)==='cable100'));assert.ok(!r.some(x=>O.key(x)==='cable65'));}
assert.ok(O.ensure(O.ensure([],4),3).some(x=>O.key(x)==='cable65'));
assert.ok(!O.ensure(O.ensure([],4),3).some(x=>O.key(x)==='cable100'));
assert.equal(O.inferRooms([{unit:'房',quantity:4}]),4);
assert.equal(O.filename('QO/MK/ZOE/001','旺角新填地街439號B'),'QO-MK-ZOE-001_旺角新填地街439號B.pdf');
assert.equal(O.defaults.find(x=>x.optional_key==='fireboard').unit,'平方米');
console.log('Room thresholds, capacity switching, square-metre fireboard and address filenames passed');

assert.equal(O.ensure([{description:'拆除防火板及安裝工程',unit_price:2000},{description:'防火板拆卸、復裝及還原工程',unit_price:2000}],3).filter(x=>O.key(x)==='fireboard').length,1);
