const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements={dtype:{value:'percent'},dval:{value:'10'},qtotal:{textContent:''},editorTotal:{textContent:''},qnumber:{value:'QA-QUOTE'},qdate:{value:'2026-09-28'},qvalid:{value:'2026-12-28'}};
const calls=[],alerts=[];
const context={document:{getElementById:id=>elements[id]},D:{quotes:[],projects:[],invoices:[{id:'invoice',quotation_id:'quote'}],payments:[]},draft:[{id:'keep',description:'Name\nDetails',unit:'項',quantity:2,unit_price:2100.5},{description:'New',unit:'項',quantity:1,unit_price:100}],tier:'trade',today:()=> '2026-09-28',addDays:()=> '2026-12-28',toast:()=>{},alert:s=>alerts.push(s),refreshData:async()=>{},api:async(table,query,options={})=>{calls.push({table,query,...options});if(!options.method)return [{id:'keep'},{id:'remove'}];return [{id:'added'}]},project:()=>({}),clientByProject:()=>({}),app:{innerHTML:''}};
context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync('v44/quote-editor.js','utf8'),context);
context.viewQuote=async()=>{};
(async()=>{
 context.ub44UpdatePreview();assert.equal(elements.qtotal.textContent,'HK$3,870.90');
 context.ub44UpdateText(0,{value:'Changed'},false);assert.equal(context.draft[0].description,'Changed\nDetails');
 context.ub44UpdateText(0,{value:'Two\nLines'},true);assert.equal(context.draft[0].description,'Changed\nTwo\nLines');
 context.__ub44EditQuote={id:'quote'};await context.saveQuote();
 assert.equal(alerts.length,0);assert(calls.some(c=>c.method==='PATCH'&&c.query.includes('keep')));
 assert(calls.some(c=>c.method==='POST'&&c.table==='quotation_items'));
 assert(calls.some(c=>c.method==='DELETE'&&c.query.includes('remove')));
 assert(!calls.some(c=>c.table==='invoices'||c.table==='invoice_items'));
 assert(!calls.some(c=>c.method==='DELETE'&&!c.query.includes('id=eq.remove')));
 assert.equal(context.__ub44Saving,false);
 console.log('PASS: decimal totals, name/description, item identity, selective removal, invoice preservation, save lock');
})().catch(e=>{console.error(e);process.exitCode=1});
