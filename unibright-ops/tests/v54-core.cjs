const assert=require('node:assert/strict');const C=require('../v54/core.js');
const rows=[{quantity:2,unit_price:100},{quantity:4,unit_price:2000,optional:true,selected:false}];
assert.deepEqual(C.totals(rows),{subtotal:200,discount:0,total:200});rows[1].selected=true;assert.equal(C.totals(rows).total,8200);assert.equal(C.totals(rows,'percent',10).total,7380);
const notes=C.write('保留舊備註',{options:rows,payment:{method:'現金'}});assert.equal(C.read(notes).payment.method,'現金');assert.ok(notes.startsWith('保留舊備註'));assert.deepEqual(C.read('舊單'),{});
assert.deepEqual(C.stages(100,[{percent:33.33},{percent:33.33},{percent:33.34}]).map(x=>x.amount),[33.33,33.33,33.34]);
assert.equal(C.stages(0.01,[{percent:50},{percent:50}]).reduce((s,x)=>s+x.amount,0),.01);
assert.equal(C.number('INV','QO/MK/ZOE/20261110/001','2026-11-10'),'INV/MK/ZOE/20261110/001');assert.equal(C.number('RCP','INV/MK/ZOE/20261110/001','2026-11-10',['RCP/MK/ZOE/20261110/001']),'RCP/MK/ZOE/20261110/002');
console.log('v54 core: totals, option selection, note persistence, installments and typed numbering passed');
