(()=>{
'use strict';
window.UNIBRIGHT_BUILD='20260911-logo-pdf-v4';
const LOGO_URL='https://raw.githubusercontent.com/zoechow412-ui/m/02bdfd579baf460413046b598fa356ac5088eec8/unibright-ops/v7/logo.png';
let logoDataPromise=null;
let pdfCache={sig:'',blob:null,name:''};
let primeTimer=null;
let building=false;

const toastSafe=(m)=>{try{if(typeof window.toast==='function')window.toast(m)}catch(_){} };
const cleanName=s=>String(s||'UNIBRIGHT').replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,' ').trim();
const isiOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);

async function toDataURL(blob){return await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob)})}
async function logoData(){
  if(!logoDataPromise)logoDataPromise=(async()=>{
    const r=await fetch(LOGO_URL,{cache:'force-cache',mode:'cors'});
    if(!r.ok)throw new Error('Logo 載入失敗');
    return await toDataURL(await r.blob());
  })();
  return logoDataPromise;
}
async function applyOriginalLogo(root=document){
  const imgs=[...root.querySelectorAll('.a4-logo img')];
  if(!imgs.length)return;
  try{
    const src=await logoData();
    imgs.forEach(img=>{
      if(img.src!==src)img.src=src;
      img.alt='恆輝建築（香港）有限公司 UNIBRIGHT CONSTRUCTION (H.K.) LTD.';
      img.style.width='245px';img.style.height='78px';img.style.maxHeight='78px';img.style.objectFit='contain';img.style.objectPosition='left center';
    });
  }catch(e){console.warn('UNIBRIGHT logo:',e)}
}

async function ensurePdfEngine(){
  if(window.html2pdf)return;
  await new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    s.onload=resolve;s.onerror=()=>reject(new Error('PDF engine 載入失敗'));document.head.appendChild(s);
  });
  if(!window.html2pdf)throw new Error('PDF engine 未能啟動');
}
function paperSig(paper){
  let h=2166136261;const s=(paper?.innerText||'')+'|'+(paper?.querySelector('.a4-title')?.innerText||'');
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
  return String(h>>>0)+'-'+s.length;
}
function filenameFor(paper){
  const title=paper?.querySelector('.a4-title b')?.textContent?.trim()||'Document';
  const text=paper?.innerText||'';
  const m=text.match(/(?:QO|TQ|INV|RCP|RC)[A-Z0-9\/-]*/i);
  return cleanName(`UNIBRIGHT_${title}_${m?.[0]||new Date().toISOString().slice(0,10)}`)+'.pdf';
}
async function makeClone(paper){
  const clone=paper.cloneNode(true);
  clone.style.transform='none';clone.style.transformOrigin='top left';clone.style.margin='0';clone.style.boxShadow='none';clone.style.width='794px';clone.style.minHeight='1123px';clone.style.height='1123px';clone.style.background='#fff';clone.style.overflow='hidden';
  await applyOriginalLogo(clone);
  const wrap=document.createElement('div');wrap.className='ub-pdf-scratch';
  Object.assign(wrap.style,{position:'fixed',left:'-12000px',top:'0',width:'794px',height:'1123px',background:'#fff',zIndex:'-9999',overflow:'hidden'});
  wrap.appendChild(clone);document.body.appendChild(wrap);
  return{wrap,clone};
}
async function buildPdfBlob(paper){
  if(building)while(building)await new Promise(r=>setTimeout(r,80));
  building=true;let wrap;
  try{
    await ensurePdfEngine();
    const c=await makeClone(paper);wrap=c.wrap;
    const worker=window.html2pdf().set({
      margin:0,
      image:{type:'jpeg',quality:.995},
      html2canvas:{scale:2,useCORS:true,allowTaint:false,backgroundColor:'#ffffff',logging:false,scrollX:0,scrollY:0,windowWidth:794,windowHeight:1123},
      jsPDF:{unit:'mm',format:'a4',orientation:'portrait',compress:true},
      pagebreak:{mode:['css','legacy']}
    }).from(c.clone).toPdf();
    const pdf=await worker.get('pdf');
    const blob=pdf.output('blob');
    if(!blob||blob.size<1000)throw new Error('PDF 檔案建立失敗');
    return blob;
  }finally{building=false;wrap?.remove()}
}
function forceDownload(blob,name){
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=name;a.rel='noopener';a.style.display='none';document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
  return true;
}
function openPdf(blob){
  const url=URL.createObjectURL(blob);
  const w=window.open(url,'_blank');
  if(!w)window.location.href=url;
  setTimeout(()=>URL.revokeObjectURL(url),120000);
}
function deliverNow(blob,name){
  const file=typeof File!=='undefined'?new File([blob],name,{type:'application/pdf'}):null;
  if(isiOS()&&file&&navigator.share){
    try{
      if(!navigator.canShare||navigator.canShare({files:[file]})){
        navigator.share({files:[file],title:name}).catch(err=>{if(err?.name!=='AbortError'){forceDownload(blob,name);setTimeout(()=>openPdf(blob),250)}});
        return true;
      }
    }catch(_){}
  }
  forceDownload(blob,name);
  return true;
}
async function primePdf(){
  const paper=document.querySelector('.a4-sheet');if(!paper)return;
  await applyOriginalLogo(document);
  const sig=paperSig(paper);if(pdfCache.blob&&pdfCache.sig===sig)return;
  try{
    const blob=await buildPdfBlob(paper);
    if(document.querySelector('.a4-sheet')===paper||paper.isConnected)pdfCache={sig,blob,name:filenameFor(paper)};
  }catch(e){console.warn('PDF prime failed',e)}
}
function schedulePrime(){clearTimeout(primeTimer);primeTimer=setTimeout(()=>primePdf(),450)}

window.exportCurrentPDF=function(filename){
  const paper=document.querySelector('.a4-sheet');
  if(!paper){alert('未有可匯出嘅 A4 文件');return Promise.resolve(false)}
  const sig=paperSig(paper),name=filename||filenameFor(paper);
  if(pdfCache.blob&&pdfCache.sig===sig){deliverNow(pdfCache.blob,name);toastSafe('PDF 已準備好');return Promise.resolve(true)}
  toastSafe('正在製作 PDF…');
  return (async()=>{
    try{
      await applyOriginalLogo(document);
      const blob=await buildPdfBlob(paper);pdfCache={sig:paperSig(paper),blob,name};
      forceDownload(blob,name);
      if(isiOS())setTimeout(()=>openPdf(blob),350);
      toastSafe('PDF 已產生');return true;
    }catch(e){console.error(e);alert('PDF 下載失敗：'+String(e?.message||e));return false}
  })();
};
window.printA4=function(){if(typeof window.printCurrentA4==='function')return window.printCurrentA4();window.print()};

function polishButtons(){
  document.querySelectorAll('button').forEach(b=>{
    const oc=b.getAttribute('onclick')||'',t=(b.textContent||'').trim();
    if(/exportCurrentPDF/.test(oc)||/下載 PDF|列印\s*\/\s*PDF|列印／PDF/.test(t)){
      b.textContent=isiOS()?'下載／儲存 PDF':'下載 PDF';
      b.setAttribute('onclick','exportCurrentPDF()');
    }
  });
}
async function refresh(){await applyOriginalLogo(document);polishButtons();schedulePrime()}
const app=document.getElementById('app');
if(app)new MutationObserver(()=>refresh()).observe(app,{childList:true,subtree:true});
window.addEventListener('load',refresh);setTimeout(refresh,50);setTimeout(refresh,800);
window.UNIBRIGHT_PDF_HEALTH=()=>({build:window.UNIBRIGHT_BUILD,logo:!!document.querySelector('.a4-logo img'),cached:!!pdfCache.blob,pdf:typeof window.exportCurrentPDF==='function'});
})();