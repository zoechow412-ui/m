const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const C=require('../v54/core.js');
const photo={src:'data:image/jpeg;base64,YQ==',caption:'走廊入口'};
const quote={id:'quote',project_id:'project',quotation_no:'QO/SSP/ZOE/20261111/999',notes:'原備註',price_tier:'customer'};
let saved,canonical=[{id:'old',quotation_id:'quote',sort_order:1,description:'工程 A',unit:'項',quantity:1,unit_price:100}];
const fields={qnumber:{value:quote.quotation_no},qdate:{value:'2026-11-11'},qvalid:{value:'2027-01-01'},dtype:{value:'percent'},dval:{value:'0'},npname:{value:'測試工程'},npno:{value:'TEST'},nsite:{value:''}};
const ctx={console,UB54:C,document:{getElementById:id=>fields[id],querySelectorAll:()=>[]},MutationObserver:class{observe(){}},app:{querySelectorAll:()=>[]},D:{quotes:[quote],pricing:[]},draft:[],tier:'customer',toast(){},alert:m=>{throw Error(m)},project:()=>({}),today:()=> '2026-11-11',refreshData:async()=>{},viewQuote:async()=>{},gen:()=>'',ub50UpdatePreview(){},ub44DrawItems(){},ub44PickItem(){},newQuote(){},quoteDocumentHTML(){},ub50RenderEditor(){},api:async(table,query,opts)=>{
 if(table==='quotations'&&opts){saved=opts.body;Object.assign(quote,saved);return [quote]}
 if(table==='quotation_items'&&!opts)return canonical;
 if(table==='quotation_items'&&opts.method==='POST'){const row={...opts.body,id:'new'};canonical.push(row);return [row]}
 if(table==='quotation_items'&&opts.method==='PATCH'){Object.assign(canonical.find(x=>query.includes(x.id)),opts.body);return []}
 if(table==='quotation_items'&&opts.method==='DELETE'){canonical=canonical.filter(x=>!query.includes(x.id));return []}
 return [];
}};
fields['ub54-panel']={};ctx.window=ctx;ctx.__ub44EditQuote=quote;
vm.createContext(ctx);vm.runInContext(fs.readFileSync(require.resolve('../v54/workflow.js'),'utf8'),ctx);
(async()=>{
 ctx.draft=[{description:'自選 B',sort_order:1,unit:'項',quantity:1,unit_price:300,optional:true,selected:false,photos:[photo]},{...canonical[0],sort_order:2,photos:[{...photo,caption:'二樓左側'}]}];
 await ctx.saveQuote();
 let meta=C.read(saved.notes);
 assert.equal(saved.total,100);assert.equal(canonical.length,1);assert.equal(canonical[0].sort_order,2);
 assert.equal(meta.item_photos[0].photos[0].caption,'走廊入口');assert.equal(meta.item_photos[1].photos[0].caption,'二樓左側');
 assert.equal(saved.notes.startsWith('原備註\n'),true);
 await ctx.editQuote('quote');
 assert.equal(ctx.draft[0].photos[0].caption,'走廊入口');assert.equal(ctx.draft[1].photos[0].caption,'二樓左側');
 ctx.draft.reverse();ctx.__ub44EditQuote=quote;await ctx.saveQuote();await ctx.editQuote('quote');
 assert.equal(ctx.draft[0].photos[0].caption,'二樓左側');assert.equal(ctx.draft[1].photos[0].caption,'走廊入口');
 ctx.draft[0].photos=[];ctx.__ub44EditQuote=quote;await ctx.saveQuote();await ctx.editQuote('quote');assert.equal(ctx.draft[0].photos.length,0);
 assert.equal(ctx.draft[1].photos[0].caption,'走廊入口');
 console.log('PASS: save/reopen, optional exclusion, reorder, removal, notes preservation');
})().catch(e=>{console.error(e);process.exitCode=1});
