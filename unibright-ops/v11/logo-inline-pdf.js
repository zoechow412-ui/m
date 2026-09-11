(()=>{
'use strict';
const LOGO_DATA='data:image/png;base64,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';
const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const safeName=s=>String(s||'UNIBRIGHT').replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,' ').trim();
function applyLogo(root=document){
  const imgs=[];
  if(root.nodeType===1&&root.matches?.('.a4-logo img'))imgs.push(root);
  root.querySelectorAll?.('.a4-logo img').forEach(x=>imgs.push(x));
  imgs.forEach(img=>{
    if(img.dataset.ubInlineLogo==='1')return;
    img.src=LOGO_DATA;img.removeAttribute('srcset');img.alt='';
    img.style.width='170px';img.style.height='auto';img.style.maxHeight='none';img.style.objectFit='contain';img.style.objectPosition='left top';
    img.dataset.ubInlineLogo='1';
    const head=img.closest('.a4-head');if(head)head.style.minHeight='128px';
  });
}
applyLogo(document);
const app=document.getElementById('app');
if(app)new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)applyLogo(n)}).observe(app,{childList:true,subtree:true});
function filename(paper){const title=paper.querySelector('.a4-title b')?.textContent?.trim()||'Document';const text=paper.innerText||'';const m=text.match(/(?:QO|TQ|INV|RCP|RC)[A-Z0-9\/-]*/i);return safeName(`UNIBRIGHT_${title}_${m?.[0]||new Date().toISOString().slice(0,10)}`)+'.pdf'}
async function makePdfBlob(paper){
  if(!window.html2pdf)throw new Error('PDF engine 未載入');
  const clone=paper.cloneNode(true);applyLogo(clone);
  Object.assign(clone.style,{transform:'none',transformOrigin:'top left',margin:'0',boxShadow:'none',width:'794px',minHeight:'1123px',height:'1123px',background:'#fff',overflow:'hidden'});
  const host=document.createElement('div');Object.assign(host.style,{position:'fixed',left:'-12000px',top:'0',width:'794px',height:'1123px',background:'#fff',overflow:'hidden',zIndex:'-9999',pointerEvents:'none'});host.appendChild(clone);document.body.appendChild(host);
  try{
    const worker=window.html2pdf().set({margin:0,image:{type:'jpeg',quality:.995},html2canvas:{scale:2,useCORS:true,allowTaint:false,backgroundColor:'#fff',logging:false,scrollX:0,scrollY:0,windowWidth:794,windowHeight:1123},jsPDF:{unit:'mm',format:'a4',orientation:'portrait',compress:true},pagebreak:{mode:['css','legacy']}}).from(clone).toPdf();
    const pdf=await worker.get('pdf');const blob=pdf.output('blob');if(!blob||blob.size<1000)throw new Error('PDF 建立失敗');return blob;
  }finally{host.remove()}
}
window.exportCurrentPDF=async function(name){
  const paper=document.querySelector('.a4-sheet');if(!paper){alert('未有可下載嘅 A4 文件');return false}applyLogo(paper);
  try{
    const blob=await makePdfBlob(paper),fn=name||filename(paper),url=URL.createObjectURL(blob);
    if(isIOS()){
      const w=window.open(url,'_blank');if(!w)location.href=url;setTimeout(()=>URL.revokeObjectURL(url),300000);
    }else{
      const a=document.createElement('a');a.href=url;a.download=fn;a.rel='noopener';a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),120000);
    }
    return true;
  }catch(e){console.error(e);alert('PDF 下載失敗：'+String(e?.message||e));return false}
};
window.downloadPDF=window.exportCurrentPDF;
window.UNIBRIGHT_LOGO_V11=()=>({embedded:true,visible:!!document.querySelector('.a4-logo img[data-ub-inline-logo="1"]')});
})();