(()=>{
'use strict';
const isiOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const safeName=s=>String(s||'UNIBRIGHT').replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,' ').trim();
const toastSafe=m=>{try{if(typeof window.toast==='function')window.toast(m)}catch(_){}};
function getPaper(){return document.querySelector('.a4-sheet')}
function docName(p){const title=p?.querySelector('.a4-title b')?.textContent?.trim()||'Document';const text=p?.innerText||'';const m=text.match(/(?:QO|TQ|INV|RCP|RC)[A-Z0-9\/-]*/i);return safeName(`UNIBRIGHT_${title}_${m?.[0]||new Date().toISOString().slice(0,10)}`)+'.pdf'}
async function ensurePdf(){if(window.html2pdf)return;await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';s.onload=ok;s.onerror=()=>no(new Error('PDF engine 載入失敗'));document.head.appendChild(s)});if(!window.html2pdf)throw new Error('PDF engine 未能啟動')}
async function pdfBlob(paper){await ensurePdf();const clone=paper.cloneNode(true);Object.assign(clone.style,{transform:'none',transformOrigin:'top left',margin:'0',boxShadow:'none',width:'794px',minHeight:'1123px',height:'1123px',background:'#fff',overflow:'hidden'});const host=document.createElement('div');Object.assign(host.style,{position:'fixed',left:'-12000px',top:'0',width:'794px',height:'1123px',overflow:'hidden',background:'#fff',pointerEvents:'none',zIndex:'-1'});host.appendChild(clone);document.body.appendChild(host);try{const worker=window.html2pdf().set({margin:0,image:{type:'jpeg',quality:.99},html2canvas:{scale:2,useCORS:true,allowTaint:false,backgroundColor:'#fff',logging:false,scrollX:0,scrollY:0,windowWidth:794,windowHeight:1123},jsPDF:{unit:'mm',format:'a4',orientation:'portrait',compress:true},pagebreak:{mode:['css','legacy']}}).from(clone).toPdf();const pdf=await worker.get('pdf');const blob=pdf.output('blob');if(!blob||blob.size<1000)throw new Error('PDF 檔案建立失敗');return blob}finally{host.remove()}}
function desktopSave(blob,name){const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;a.rel='noopener';a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),120000)}
async function savePDF(preopened){const paper=getPaper();if(!paper){preopened?.close?.();alert('未有可下載嘅 A4 文件');return false}try{toastSafe('正在製作 PDF…');const blob=await pdfBlob(paper);const name=docName(paper);const u=URL.createObjectURL(blob);if(isiOS()){
 if(preopened&&!preopened.closed){preopened.location.replace(u)}else{window.location.assign(u)}
 setTimeout(()=>URL.revokeObjectURL(u),300000);toastSafe('PDF 已開啟，可用分享儲存到「檔案」');
}else{desktopSave(blob,name);toastSafe('PDF 已下載')}
return true}catch(e){try{preopened?.close?.()}catch(_){}console.error(e);alert('PDF 下載失敗：'+String(e?.message||e));return false}}
window.exportCurrentPDF=()=>savePDF(null);
window.downloadPDF=window.exportCurrentPDF;
window.printA4=()=>{const p=getPaper();if(!p){alert('未有可列印嘅 A4 文件');return false}window.print();return true};

document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 const t=(b.textContent||'').replace(/\s+/g,' ').trim();
 if(/下載/.test(t)&&/PDF/.test(t)){
   e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
   const w=isiOS()?window.open('about:blank','_blank'):null;
   if(w){try{w.document.write('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>PDF</title><body style="font-family:-apple-system;padding:28px">正在製作 PDF…</body>');w.document.close()}catch(_){}}
   savePDF(w);return;
 }
 if(/^列印$/.test(t)||/^列印\s*\/\s*PDF$/.test(t)||/^列印／PDF$/.test(t)){
   e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();window.print();return;
 }
},true);
window.UNIBRIGHT_A4_V12=()=>({pdf:typeof window.exportCurrentPDF==='function',print:typeof window.printA4==='function',paper:!!getPaper(),ios:isiOS()});
})();