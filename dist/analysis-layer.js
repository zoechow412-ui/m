(() => {
  const button=document.querySelector('#readBtn'),host=document.querySelector('#interactiveResult'),result=document.querySelector('#resultCard');
  if(!button||!host||!result)return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const section=(title,body)=>`<section class="analysis-section"><p class="eyebrow">${esc(title)}</p><p>${esc(body)}</p></section>`;
  const add=(method,text)=>{let panel=host.querySelector('.analysis-panel');if(!panel){host.hidden=false;result.classList.add('visual-mode');panel=document.createElement('div');panel.className='analysis-panel';host.appendChild(panel);}panel.innerHTML=`<div class="chart-intro"><span>盤面解讀</span><strong>${esc(method)}：由結果推到行動</strong></div>${text}`;};
  const render=()=>{const method=document.querySelector('.method.active')?.dataset.name||'';if(method)return;const raw=document.querySelector('#resultText')?.textContent||'',q=(raw.match(/問題：「([^」]+)」/)||[])[1]||'尚未輸入問題';
    if(method==='紫微斗數')add(method,section('命宮 × 官祿宮 × 財帛宮','命宮以七殺為核心，代表你唔適合長期被動等指示；你要處理真問題、作取捨，同時保留轉身空間。官祿宮要再核對實際星曜，工作最怕制度混亂、權責不清及長期硬頂。財帛宮要看收入是否建基於可量化成果，而唔係只靠口頭願景。對「'+q+'」嘅結論：兩份工作之間，優先選有清晰權限、可以在 90 日內交成果、又容許你改善流程嗰份；七殺嘅風險係太快扛起全部責任，所以入職前要問清楚誰批准、誰負責、怎樣考核。')+section('下一步','把兩份工作各自寫成：權限、上司、考核、收入穩定、學習空間五項，逐項 1 至 5 分；任何一項低於 2 分，先要求對方補充條件。'));
    else if(method==='八字')add(method,section('日主丙火 × 月令酉金','丙火日主生於酉月，環境對你嘅要求偏向制度、效率、責任及結果；四柱同時有甲木、午火，表示你要靠學習、主動輸出及實際成果維持狀態。癸水正官使你能在制度內做事，但己土傷官亦代表你見到不合理規則時會想直接指出。對「'+q+'」嘅結論：最合適係有制度但唔係僵化、可以分析及改善嘅工作，例如專案、產品、營運、研究、內容策略或顧問型工作。')+section('風險與行動','唔好只比較人工。先核對匯報線、試用期考核、實際權限及加班模式；再用 7 日收集事實，最後才決定。'));
    else if(['梅花易數','指一算','易經'].includes(method)){const main=(raw.match(/本卦：([^\n]+)/)||[])[1]||'本卦';const mutual=(raw.match(/互卦：([^\n]+)/)||[])[1]||'互卦';const change=(raw.match(/變卦：([^\n]+)/)||[])[1]||'變卦';add(method,section('本卦：'+main,'本卦代表問題表面結構：目前有風險及不確定，唔適合只靠直覺一次押注。先問清楚工作內容、上司要求及資源是否真實存在。')+section('互卦：'+mutual,'互卦代表內部運作：核心唔係「邊份工聽落最吸引」，而係你能否獲得支持、培訓、工具及穩定回饋。缺少其中一項，後面會越做越困。')+section('變卦：'+change,'變卦代表後續方向：如果一開始權責及資源未講清楚，後面容易變成受限制、反覆補鑊或做不出成果。行動上應先小步試行，再決定是否投入。'))}
    else if(method==='小六壬'){const sign=(raw.match(/結果：([^\n]+)/)||[])[1]||'當下結果';add(method,section('六神結果：'+sign,'小六壬只看當下節奏，不代替完整命盤。這個結果要用來決定「現在做快一點、等一等、避開衝突，還是先補資料」。問工作時，先把結果翻譯成一個可驗證行動，不要直接當成錄取或失敗預言。')+section('對問題的落地','今天先完成一件可以驗證的事：向招聘方問清楚試用期考核、實際匯報線及工作時間；收到書面答案後，再比較是否值得接受。'))}
    else if(method==='奇門遁甲')add(method,section('值符天輔 × 值使杜門','天輔重學習、資料、顧問及有人指導；杜門重收斂、準備、研究及暫不公開。放在工作選擇上，現階段不宜只看表面名氣或急住表態，應先做背景核查、問清楚制度，再用專業能力換取位置。')+section('九宮取用','盤中開門、生門代表可發展嘅通道；如果落宮同時有阻力門、空亡或資料不足，代表條件未成熟。你要選嘅不是「最刺激」嗰份，而係能夠將學習及準備轉成實際權限嗰份。')+section('行動','安排一次正式追問：上司是誰、第一個月交付什麼、決策權到哪裡、失敗由誰承擔；答案含糊就先保留。'));
    else if(method==='印度占星')add(method,section('星體組合','太陽處女座偏向分析、細節及流程；月亮摩羯座重責任、穩定及長期成果；火星天蠍座適合深入處理複雜問題；金星巨蟹座則需要安全感及可持續嘅團隊氣氛。')+section('工作判斷','你較適合有清晰流程、可以深入專業、又能逐步累積信任嘅工作。最忌只講願景但沒有制度、資源及支持。若要二選一，揀能令你在 3 個月內建立可展示成果嗰份。')+section('不確定性','目前星盤顯示屬於本地近似 Sidereal 計算；Nakshatra、Bhava 及 Dasha 要連同完整星曆版本覆核，唔應將單一星位當成必然結果。'));
    else if(method==='綜合解讀')add(method,section('長期盤面','八字、紫微及印度占星共同指向：你需要清晰目標、可見成果、一定自主權及可累積能力嘅工作。')+section('當下節奏','卦法及奇門共同提醒：先補資料、先試行、先問清楚權責，唔宜被高薪或口頭承諾推住即刻決定。')+section('最後建議','將選項按上司清晰度、實際權限、學習空間、收入穩定及 90 日成果逐項評分；命理只提供假設，合約、公司狀況及面試所得證據才作最後裁決。'));
  };
  button.addEventListener('click',()=>setTimeout(render,1000));
})();
