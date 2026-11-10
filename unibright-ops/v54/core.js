(function(root){
 const marker='\n[UNIBRIGHT_DOCUMENT_V54]\n';
 function read(notes){try{return JSON.parse(String(notes||'').split(marker)[1]||'{}')}catch(_){return {}}}
 function write(notes,data){return String(notes||'').split(marker)[0]+marker+JSON.stringify(data)}
 function money(n){return Math.round((Number(n)||0)*100)/100}
 function totals(items,type='percent',value=0){const subtotal=money(items.filter(x=>!x.optional||x.selected).reduce((a,x)=>a+money(Number(x.quantity)*Number(x.unit_price)),0));const discount=money(Math.min(subtotal,Math.max(0,Number(value)||0)*(type==='fixed'?1:subtotal/100)));return {subtotal,discount,total:money(subtotal-discount)}}
 function stages(total,rows){let paid=0;return rows.map((x,i)=>{const amount=i===rows.length-1?money(total-paid):money(total*Number(x.percent)/100);paid=money(paid+amount);return {...x,amount}})}
 function number(type,ref,date,used=[]){const parts=String(ref||'').split('/'),district=parts[0]==='QO'||parts[0]==='INV'||parts[0]==='RCP'?parts[1]:parts[0];const code=/^[A-Z0-9]{1,12}$/.test(district)?district:'HK';const prefix=type+'/'+code+'/ZOE/'+String(date).replaceAll('-','')+'/';let seq=1;while(used.includes(prefix+String(seq).padStart(3,'0')))seq++;return prefix+String(seq).padStart(3,'0')}
 const core={read,write,money,totals,stages,number};if(typeof module!=='undefined')module.exports=core;else root.UB54=core;
})(typeof window!=='undefined'?window:this);
