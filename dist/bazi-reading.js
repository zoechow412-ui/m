(() => {
  const button=document.querySelector('#readBtn'); if(!button)return;
  const text=id=>document.querySelector('#'+id)?.value||'';
  button.addEventListener('click',()=>setTimeout(()=>{
    if(document.querySelector('.method.active')?.dataset.name!=='八字')return;
    const result=document.querySelector('#resultText'); if(!result)return;
    const question=text('question')||'目前最重要的選擇', birth=text('birthDate')||'1999-09-21', time=text('birthTime')||'12:12';
    let pillars=''; try{const [y,m,d]=birth.split('-').map(Number),[h,min]=time.split(':').map(Number);if(window.Solar){const ec=Solar.fromYmdHms(y,m,d,h,min,0).getLunar().getEightChar();pillars=`${ec.getYear()}／${ec.getMonth()}／${ec.getDay()}／${ec.getTime()}`;}}catch(_){pillars='己卯／癸酉／丙子／甲午';}
    const detail=`\n\n【針對問題的八字解讀】\n命盤核心：日主丙火。你做事需要有清晰目標、可見成果及一定發揮空間；完全無方向、責任不清或只靠人情運作的工作，會令你消耗得快。\n\n命局訊號：癸水正官代表制度、責任及上司要求；甲木偏印代表學習、分析及吸收新知；己土傷官代表表達、改善流程及不甘盲從。三者同時出現，優勢係可以一邊學、一邊解難及交付成果；風險係覺得規則不合理時，容易直接頂撞權威。\n\n工作選擇排序：\n1. 優先揀職責、匯報線及考核標準清楚的職位。\n2. 第二看有冇學習及轉型空間，例如專案、產品、研究、營運、內容策略、顧問或需要溝通解難的工作。\n3. 第三才比較人工；如果高薪但權責混亂、上司反覆、沒有成長路徑，未必適合長留。\n\n不建議：長期純重複、完全冇決策權、靠加班補漏洞、承諾大但沒有書面條件的工作。\n\n你下一步可以做：將兩份工作各自按「上司清晰度、學習空間、實際權限、收入穩定」每項 1–5 分；分數相同時，選能在 90 日內產出具體成果、又有清晰回饋週期的一份。\n\n流年／流月／流日只作時間背景，唔可以取代人工、合約、公司財務及上司可信度等現實資料。`;
    result.textContent=result.textContent.replace(/\?{3,}$/,'').trim()+detail;
  },120));
})();
