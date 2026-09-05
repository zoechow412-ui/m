(() => {
  const button=document.querySelector('#readBtn');
  if(!button)return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const section=(term,title,body,action)=>`<section class="rich-method-section"><button class="rich-method-term" data-term="${esc(term)}">${esc(term)}</button><h4>${esc(title)}</h4><p>${esc(body)}</p><p class="rich-method-action"><b>落到你身上：</b>${esc(action)}</p></section>`;
  const render=()=>{
    const method=document.querySelector('.method.active')?.dataset.name;
    if(!['八字','印度占星'].includes(method))return;
    const host=document.querySelector('#interactiveResult');
    const raw=document.querySelector('#resultText')?.textContent||'';
    if(!host)return;
    const q=(raw.match(/問題：「([^」]+)」/)||[])[1]||'目前最重要的選擇';
    const title=method==='八字'?'八字 · 四柱拆解與行動':'印度占星 · 星盤拆解與行動';
    let body='';
    if(method==='八字'){
      const pillars=raw.match(/四柱[^\n]*\n?([^\n]+)/)?.[1]||'出生四柱已排出';
      body=`<div class="rich-method-head"><span>METHOD READING</span><strong>${title}</strong><small>問題：「${esc(q)}」</small></div><div class="rich-method-grid">${section('日主','日主：你點樣承受事情','日主代表本人核心。判強弱一定要連月令、根氣、透干及全盤五行，唔可以只見一粒字就下結論。','先揀有清晰目標同回饋嘅工作，保留自主權，但唔好一開始就替所有人埋單。')}${section('四柱','四柱：四個人生層次',`年柱看背景，月柱看成長環境及工作基礎，日柱看自己與親密關係，時柱看後期發展同長期作品。今次盤面：${pillars}`,'比較職位時分開睇制度、日常工作、團隊關係及三個月後能否留下成果。')}${section('十神','十神：責任、資源、輸出與財務','十神係以日主同其他天干嘅生剋陰陽分類；官星似制度與責任，印星似學習與支援，食傷似表達與產出，財星似資源與回報。','問清楚權責有冇資源承托，唔好只比較人工或職稱。')}${section('大運／流年／流月','時間層：幾時郁、點樣郁','大運係約十年主題，流年係一年背景，流月同流日係較短節奏；佢哋係提醒，唔係保證事件。','未來 7 日先收集條件；1 至 3 個月內以小步試行驗證份工是否真係適合。')}</div>`;
    }else{
      body=`<div class="rich-method-head"><span>SIDEREAL READING</span><strong>${title}</strong><small>問題：「${esc(q)}」</small></div><div class="rich-method-grid">${section('Lagna','Lagna：你點樣出場','Lagna 係出生時東方地平線上升點，反映外在反應、行動方式及人生入口；唔係單一星座性格標籤。','揀能畀你主動處理問題、見到成果，而且工作規則講得清楚嘅環境。')}${section('Moon sign','Moon sign：你真正需要嘅安全感','月亮星座反映情緒反應、習慣同壓力下嘅需要；工作上會影響你對節奏、團隊氣氛及穩定程度嘅要求。','面試時實際問工作節奏、回饋方式及加班模式，唔好只聽文化口號。')}${section('Bhava','Bhava：行星影響邊個生活範圍','Bhava 將行星功能放入工作、財務、關係等生活領域；同一粒行星落唔同宮，事件表現可以完全唔同。','將職位拆成第十宮式嘅職責、第二宮式嘅收入、六宮式嘅日常壓力，逐項核對。')}${section('Nakshatra／Dasha','Nakshatra／Dasha：細分時間週期','Nakshatra 將月亮分成二十七宿，Dasha 用行星主周期讀較長時間；要以完整星曆校準，唔應當成百分百預言。','把可能窗口當作提醒：先準備履歷、約面試、試做任務，再用現實回覆決定。')}</div>`;
    }
    host.hidden=false;host.classList.add('method-rich-active');host.insertAdjacentHTML('afterbegin',`<div class="rich-method-result">${body}</div>`);
    host.querySelectorAll('.rich-method-term').forEach(el=>el.onclick=()=>{const text={日主:'八字核心天干，代表本人承受事情的方式。',四柱:'年、月、日、時四個層次，必須整體判讀。',十神:'將責任、資源、輸出、財務及同伴分類。','大運／流年／流月':'由長至短嘅時間層，幫你安排節奏。',Lagna:'上升點，代表出場方式及人生入口。','Moon sign':'月亮落點，代表情緒反應及安全感。',Bhava:'將星體放入工作、財務、關係等生活領域。','Nakshatra／Dasha':'月宿及行星周期，用來細分心理模式與時間。'}[el.dataset.term]||'術語要放回整張盤及問題一齊判讀。';const d=document.createElement('div');d.className='rich-method-popover';d.innerHTML=`<b>${el.dataset.term}</b><p>${text}</p><button>知道了</button>`;host.appendChild(d);d.querySelector('button').onclick=()=>d.remove();});
  };
  button.addEventListener('click',()=>setTimeout(render,260));
})();
