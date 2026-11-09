(()=>{
 'use strict';
 window.UNIBRIGHT_V53_BUILD='20261110-catalog-rooms-numbering';
 const $=id=>document.getElementById(id),e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const ordered=()=>[...(D.pricing||[])].filter(x=>x.active!==false).sort((a,b)=>String(a.price_tier).localeCompare(String(b.price_tier))||Number(a.sort_order)-Number(b.sort_order)||a.item_code.localeCompare(b.item_code));
 const rooms=()=>Number($('ub53-rooms')?.value)||0;
 function quantity(x,r){
   if(/搬運/.test(x.description))return null;
   if(/防火門|煙霧|火警偵測/.test(x.description))return r+1;
   if(/滅火[筒桶器]/.test(x.description))return 1;
   if(x.unit==='房'||['廁所','廚房'].includes(x.unit)||/抽氣扇|電錶|水錶|配電箱/.test(x.description))return r;
   return null;
 }
 window.ub53ApplyRooms=function(){
   const r=rooms();if(!r){toast('請先選擇房數');return;}
   let count=0;
   for(const item of draft){const x=(D.pricing||[]).find(p=>p.price_tier===tier&&(p.item_code===item.item_code||p.description===item.description));const qty=quantity(x||item,r);if(qty!==null){item.quantity=qty;count++;}}
   window.ub44DrawItems();toast('已更新 '+count+' 項數量；價錢及項目次序保持不變，儲存後生效');
 };
 window.ub44PickItem=function(code){
   const x=(D.pricing||[]).find(p=>p.price_tier===tier&&p.item_code===code&&p.active!==false);if(!x)return;
   const r=rooms();draft.push({item_code:x.item_code,description:x.description,unit:x.unit||'項',quantity:r?(quantity(x,r)??1):1,unit_price:Number(x.unit_price)||0});window.ub44DrawItems();
 };
 window.pickItem=window.ub44PickItem;
 window.ub44DrawCatalog=function(){
   const host=$('catalog');if(!host)return;const search=($('catalogSearch')?.value||'').trim().toLowerCase();
   const list=ordered().filter(x=>x.price_tier===tier),filtered=list.filter(x=>[x.description,x.item_code,x.pricing_rule].join(' ').toLowerCase().includes(search));
   host.innerHTML=filtered.map(x=>'<div class="ub44-catalog-row"><div><b>'+String(list.indexOf(x)+1).padStart(2,'0')+'. '+e(x.description)+'</b><small>'+hk(x.unit_price)+'／'+e(x.unit)+' · '+e(x.pricing_rule||'')+'</small></div><button type="button" aria-label="加入 '+e(x.item_code)+'" onclick="ub44PickItem(\''+e(x.item_code)+'\')">＋</button></div>').join('')||'<div class="ub44-empty">沒有符合條件的項目</div>';
 };
 window.drawCatalog=window.ub44DrawCatalog;
 const basePricing=window.ub52RenderPricing;
 window.ub52RenderPricing=window.renderPricing=function(){D.pricing=ordered();basePricing();};
 const districts=[['','請選擇地區'],['MK','旺角 MK'],['YMT','油麻地 YMT'],['TST','尖沙咀 TST'],['SSP','深水埗 SSP'],['CSW','長沙灣 CSW'],['PRE','太子 PRE'],['KWC','九龍城 KWC'],['WTS','黃大仙 WTS'],['KT','觀塘 KT'],['KLB','九龍灣 KLB'],['TKW','土瓜灣 TKW'],['HH','紅磡 HH'],['CEN','中環 CEN'],['SW','上環 SW'],['WC','灣仔 WC'],['CWB','銅鑼灣 CWB'],['NP','北角 NP'],['SKW','筲箕灣 SKW'],['ABD','香港仔 ABD'],['TW','荃灣 TW'],['KC','葵涌 KC'],['ST','沙田 ST'],['MOS','馬鞍山 MOS'],['TP','大埔 TP'],['FL','粉嶺 FL'],['SS','上水 SS'],['YL','元朗 YL'],['TM','屯門 TM'],['TKO','將軍澳 TKO'],['SK','西貢 SK'],['TC','東涌 TC'],['OTHER','其他（自行輸入）']];
 function district(){return $('ub53-district')?.value==='OTHER'?($('ub53-custom-district')?.value||'').trim().toUpperCase():$('ub53-district')?.value||'';}
 function newNumber(){
   const code=district(),date=($('qdate')?.value||today()).replaceAll('-','');if(!/^[A-Z0-9]{1,12}$/.test(code))return '';
   const prefix=code+'/ZOE/'+date+'/';let seq=1;const used=new Set((D.quotes||[]).map(x=>x.quotation_no));while(used.has(prefix+String(seq).padStart(3,'0')))seq++;return prefix+String(seq).padStart(3,'0');
 }
 window.ub53Number=function(force=false){
   const input=$('qnumber');if(!input)return;if(!force&&(window.__ub44EditQuote||input.dataset.manual==='1'))return;
   const number=newNumber();if(number){input.value=number;input.dataset.manual='0';window.ub44UpdatePreview();}
 };
 function wire(){
   const field=$('qnumber');if(!field||$('ub53-options'))return;
   const block=document.createElement('section');block.id='ub53-options';block.className='ub53-options';
   block.innerHTML='<h3>地區編號及房數</h3><div class="ub44-form-grid"><label>工程地區<select id="ub53-district">'+districts.map(([v,t])=>'<option value="'+v+'">'+t+'</option>').join('')+'</select></label><label>其他地區英文簡稱<input id="ub53-custom-district" placeholder="例如 MK" maxlength="12" disabled></label><label>房數<select id="ub53-rooms"><option value="">請選擇房數</option>'+Array.from({length:50},(_,i)=>'<option value="'+(i+1)+'">'+(i+1)+' 房</option>').join('')+'</select></label></div><p>新加入項目按所選房數填入數量；防火門及煙霧偵測器＝房數＋1，滅火筒＝1。現有項目須按下方按鈕才會更新，仍可逐項手動修改。</p><div class="ub52-actions"><button type="button" class="btn light" id="ub53-apply">套用房數至現有項目</button><button type="button" class="btn light" id="ub53-renumber">產生新格式報價編號</button></div><small>編號格式：MK/ZOE/YYYYMMDD/001。舊單編號不會自動改動；新工程的工程編號採用相同參考編號。</small>';
   field.closest('.ub44-form-grid').before(block);
   $('ub53-apply').onclick=window.ub53ApplyRooms;
   $('ub53-renumber').onclick=()=>{if(!district()){toast('請選擇地區或填寫英文簡稱');return;}window.ub53Number(true);};
   $('ub53-district').onchange=()=>{$('ub53-custom-district').disabled=$('ub53-district').value!=='OTHER';window.ub53Number();syncProject();};
   $('ub53-custom-district').oninput=()=>{window.ub53Number();syncProject();};
   field.addEventListener('input',()=>field.dataset.manual='1');
   $('qdate').addEventListener('change',()=>{window.ub53Number();syncProject();});
   const match=field.value.match(/^([A-Z0-9]+)\/ZOE\//);if(match){$('ub53-district').value=districts.some(([v])=>v===match[1])?match[1]:'OTHER';$('ub53-custom-district').value=match[1];$('ub53-custom-district').disabled=$('ub53-district').value!=='OTHER';}
   window.ub44DrawCatalog();
 }
 function syncProject(){if(!window.__ub44EditQuote&&$('qproject')?.value==='NEW'&&$('npno')&&newNumber()){$('npno').value=$('qnumber').value;window.ub44UpdatePreview();}}
 // Signatures are part of the document template itself, not dependent on an asynchronous observer.
 const documentHTML=window.quoteDocumentHTML;
 window.quoteDocumentHTML=function(...args){
   const box=document.createElement('div');box.innerHTML=documentHTML(...args);
   const sign=box.querySelector('.invoice-ref-sign');if(sign){
     sign.innerHTML='<div class="ub52-company-confirm"><div aria-hidden="true"></div><div class="ub52-sign-field ub52-company-identity"><span>恆輝建築（香港）有限公司</span><div>UNIBRIGHT CONSTRUCTION (H.K.) LIMITED</div></div><div class="ub52-sign-field"><span>公司簽署及蓋章 Signature &amp; Company Chop</span><div class="ub52-authorized-panel"><div class="ub52-handwriting-crop"><img src="/v52/authorized-handwriting.png" alt="公司授權人原版手寫簽名"></div><div class="ub52-stamp-crop"><img src="/v52/company-stamp-signature.png" alt="UNIBRIGHT 公司印章"></div></div></div><div class="ub52-sign-field"><span>簽署日期 Date</span><div></div></div></div><div class="ub52-client-confirm"><div aria-hidden="true"></div><div class="ub52-sign-field"><span>客戶名稱 Customer Name</span><div></div></div><div class="ub52-sign-field"><span>客戶簽名／印章 Signature / Company Chop</span><div></div></div><div class="ub52-sign-field"><span>簽署日期 Date</span><div></div></div></div>';
     box.querySelector('.quote-reference-sheet').append(sign);
   }return box.innerHTML;
 };
 const save=window.saveQuote;
 window.saveQuote=async function(){
   if(!window.__ub44EditQuote){if(!district()){toast('請先選擇工程地區，以建立地區／ZOE／日期編號');$('ub53-district')?.focus();return;}window.ub53Number();syncProject();}
   if((D.quotes||[]).some(x=>x.quotation_no===$('qnumber')?.value&&x.id!==window.__ub44EditQuote?.id)){toast('報價編號已存在，請重新產生或修改編號');return;}
   return save();
 };
 new MutationObserver(wire).observe(app,{childList:true,subtree:true});wire();
})();
