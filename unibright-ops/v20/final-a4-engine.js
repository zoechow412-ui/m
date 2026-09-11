(()=>{'use strict';
window.UNIBRIGHT_BUILD='20260912-v20-final-a4-engine';
const A4W=794,A4H=1123;
let LOGO='';
const LOGO_SOURCE='https://cdn.jsdelivr.net/gh/zoechow412-ui/m@e85ff9bd81b0751837904d1888667ec3a4eca6ff/unibright-ops/v19/document-engine.js';

async function getLogo(){
  if(LOGO) return LOGO;
  try{
    const txt=await fetch(LOGO_SOURCE,{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error('logo source');return r.text()});
    const m=txt.match(/const LOGO='([^']+)'/);
    if(m&&m[1].startsWith('data:image/')) LOGO=m[1];
  }catch(e){console.error('logo load',e)}
  if(!LOGO) throw new Error('藍色 B Logo 載入失敗');
  return LOGO;
}
async function patchBrand(p){
  if(!p) return p;
  const logo=await getLogo();
  const box=p.querySelector('.a4-logo');
  if(box){
    box.innerHTML=`<img class="ub-b-logo" src="${logo}" alt="UNIBRIGHT B Logo"><div class="ub-v15-brandtext"><b>恒輝建築（香港）有限公司</b><span>UNIBRIGHT CONSTRUCTION (H.K.) LTD.</span></div>`;
  }
  return p;
}
function paperCandidates(){
  return [...document.querySelectorAll('.preview-stage .a4-sheet,.single-preview .a4-sheet,.a4-sheet')];
}
function getPaper(){
  const list=[...new Set(paperCandidates())];
  return list.find(el=>{
    const r=el.getBoundingClientRect(),s=getComputedStyle(el);
    return s.display!=='none'&&s.visibility!=='hidden'&&r.width>100&&r.height>100;
  })||list[0]||null;
}
async function cleanClone(src){
  const c=src.cloneNode(true);
  await patchBrand(c);
  c.style.setProperty('transform','none','important');
  c.style.setProperty('transform-origin','top left','important');
  c.style.setProperty('width',A4W+'px','important');
  c.style.setProperty('height',A4H+'px','important');
  c.style.setProperty('min-height',A4H+'px','important');
  c.style.setProperty('max-height',A4H+'px','important');
  c.style.setProperty('margin','0','important');
  c.style.setProperty('box-shadow','none','important');
  c.style.setProperty('overflow','hidden','important');
  c.style.setProperty('background','#fff','important');
  c.style.setProperty('position','relative','important');
  return c;
}
async function renderCanvas(){
  const src=getPaper();
  if(!src) throw new Error('畫面上搵唔到正式 A4 文件');
  if(!window.html2canvas) throw new Error('PDF 畫布引擎未載入');
  await patchBrand(src);
  if(document.fonts?.ready) await document.fonts.ready;
  const clone=await cleanClone(src);
  const host=document.createElement('div');
  host.style.cssText=`position:fixed;left:-12000px;top:0;width:${A4W}px;height:${A4H}px;overflow:hidden;background:#fff;z-index:-9999;pointer-events:none`;
  host.appendChild(clone);
  document.body.appendChild(host);
  try{
    await Promise.all([...clone.querySelectorAll('img')].map(im=>new Promise(res=>{
      if(im.complete&&im.naturalWidth) return res();
      im.onload=res; im.onerror=res;
    })));
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    const rect=clone.getBoundingClientRect();
    if(Math.abs(rect.width-A4W)>1||Math.abs(rect.height-A4H)>1) throw new Error(`A4 DOM 尺寸錯誤 ${Math.round(rect.width)}×${Math.round(rect.height)}`);
    const canvas=await html2canvas(clone,{
      backgroundColor:'#fff',scale:2,useCORS:true,allowTaint:true,logging:false,
      width:A4W,height:A4H,windowWidth:A4W,windowHeight:A4H,scrollX:0,scrollY:0
    });
    if(canvas.width!==1588||canvas.height!==2246) throw new Error(`A4 畫布錯誤 ${canvas.width}×${canvas.height}`);
    return canvas;
  }finally{host.remove()}
}
function fileName(){
  const p=getPaper(),txt=p?.innerText||'';
  const type=/RECEIPT|收據/i.test(txt)?'Receipt':/INVOICE|付款通知單/i.test(txt)?'Invoice':'Quotation';
  const no=(txt.match(/(?:QO|TQ|INV|RCP|RC)[A-Z0-9\/-]*/i)||[])[0]||new Date().toISOString().slice(0,10);
  return `UNIBRIGHT_${type}_${String(no).replace(/[\\/:*?"<>|]+/g,'-')}.pdf`;
}
async function makePDF(){
  if(!(window.jspdf&&window.jspdf.jsPDF)) throw new Error('PDF 引擎未載入');
  const canvas=await renderCanvas();
  const {jsPDF}=window.jspdf;
  const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
  pdf.addImage(canvas.toDataURL('image/jpeg',0.99),'JPEG',0,0,210,297,undefined,'FAST');
  if(pdf.getNumberOfPages()!==1) throw new Error('PDF 唔係單頁 A4');
  const blob=pdf.output('blob');
  if(!blob||blob.size<5000) throw new Error('PDF 建立失敗');
  return blob;
}
let busy=false;
async function downloadPDF(){
  if(busy) return; busy=true;
  const mobile=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  let popup=null;
  try{
    if(mobile){
      popup=window.open('about:blank','_blank');
      if(popup) popup.document.write('<meta name="viewport" content="width=device-width"><p style="font:16px sans-serif;padding:24px">正在建立 A4 PDF…</p>');
    }
    const blob=await makePDF(),url=URL.createObjectURL(blob);
    if(mobile){if(popup)popup.location.replace(url);else location.href=url}
    else{
      const a=document.createElement('a');a.href=url;a.download=fileName();document.body.appendChild(a);a.click();a.remove();
    }
    setTimeout(()=>URL.revokeObjectURL(url),300000);
  }catch(e){
    try{popup?.close()}catch(_){}
    console.error('V20 PDF',e);alert('PDF 下載失敗：'+String(e?.message||e));
  }finally{busy=false}
}
async function printPDF(){
  const src=getPaper();
  if(!src){alert('畫面上搵唔到正式 A4 文件');return}
  const clone=await cleanClone(src);
  const w=window.open('about:blank','_blank');
  if(!w){alert('瀏覽器阻止咗列印視窗');return}
  w.document.open();
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/zoechow412-ui/m@f5f55fb1b62550121a2053b213d4248ed31a028f/unibright-ops/v15/a4-approved.css"><style>html,body{margin:0!important;padding:0!important;width:210mm!important;height:297mm!important;overflow:hidden!important;background:#fff!important}.a4-sheet{width:210mm!important;height:297mm!important;min-height:297mm!important;max-height:297mm!important;margin:0!important;transform:none!important;box-shadow:none!important;overflow:hidden!important;box-sizing:border-box!important}@page{size:A4 portrait;margin:0}</style></head><body>${clone.outerHTML}<script>window.onload=()=>setTimeout(()=>{window.focus();window.print()},500)<\/script></body></html>`);
  w.document.close();
}
window.downloadCurrentPDF=window.exportCurrentPDF=downloadPDF;
window.printCurrentA4=window.printA4=printPDF;

window.addEventListener('click',e=>{
  const b=e.target.closest?.('button');if(!b)return;
  const t=(b.textContent||'').replace(/\s+/g,' ').trim();
  if(t==='下載 PDF'||t==='下載／儲存 PDF'||t==='下載 / 儲存 PDF'||t==='列印 / PDF'){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();downloadPDF();return;
  }
  if(t==='列印'){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();printPDF();return;
  }
},true);

async function patchAll(){for(const p of document.querySelectorAll('.a4-sheet')){try{await patchBrand(p)}catch(_){}}}
const mo=new MutationObserver(()=>requestAnimationFrame(()=>patchAll()));
mo.observe(document.getElementById('app')||document.body,{subtree:true,childList:true});
window.addEventListener('load',()=>patchAll(),{once:true});
setTimeout(()=>patchAll(),100);setTimeout(()=>patchAll(),800);

window.UNIBRIGHT_V20=()=>{const p=getPaper(),r=p?.getBoundingClientRect();return{build:window.UNIBRIGHT_BUILD,paper:!!p,displayWidth:Math.round(r?.width||0),logo:!!p?.querySelector('.ub-b-logo'),pdf:typeof window.downloadCurrentPDF==='function',print:typeof window.printCurrentA4==='function'}};
})();