// Office presentation shares the existing deterministic chart engines.
import { state, renderMethods, setScreen, renderReading, hkLabel, nowHK } from './rebuild.js?v=20260907-1';
const staff=[
 {id:'bazi',name:'子衡',role:'八字分析師',room:'01',color:'#b7b6f6',initial:'衡',desk:'四柱研究室',line:'由出生底盤，拆解你嘅長期方向。',skills:['四柱','十神','大運'],image:'male-book.png'},
 {id:'ziwei',name:'星澄',role:'紫微規劃師',room:'02',color:'#9ecac1',initial:'澄',desk:'星曜規劃部',line:'十二宮一齊睇，將人生關係連返起。',skills:['十二宮','星曜','四化'],image:'male-choice-silver.png'},
 {id:'indian',name:'曜辰',role:'印度占星師',room:'03',color:'#e6be93',initial:'辰',desk:'星際觀測站',line:'由上升、月宿同周期，整理你嘅節奏。',skills:['Lagna','月宿','Dasha'],image:'male-threads.png'},
 {id:'meihua',name:'知微',role:'梅花策略師',room:'04',color:'#d9afc5',initial:'微',desk:'即時策略室',line:'以香港此刻起卦，睇清變化喺邊度。',skills:['本卦','互卦','體用'],image:'male-fan.png'},
 {id:'liuren',name:'時安',role:'掐指一算專員',room:'05',color:'#bad3a3',initial:'安',desk:'快速應變組',line:'一件事、一個當下，先判斷下一步。',skills:['月日時','六神','短期節奏'],image:'mokawa-pose-liuren.png'},
 {id:'iching',name:'易言',role:'易經顧問',room:'06',color:'#a5c8e4',initial:'言',desk:'決策研究室',line:'由卦辭同動爻，逐層理解眼前選擇。',skills:['六十四卦','動爻','變卦'],image:'male-choice-amber.png'},
 {id:'qimen',name:'景策',role:'奇門行動顧問',room:'07',color:'#e3aa99',initial:'策',desk:'行動指揮部',line:'排好當刻九宮，搵你可以行動嘅入口。',skills:['九宮','八門','值符值使'],image:'mokawa-pose-compass.png'},
 {id:'cross',name:'墨川',role:'綜合解讀主管',room:'08',color:'#b5bdcf',initial:'川',desk:'聯合會議室',line:'召集不同讀法，比對一致同矛盾之處。',skills:['出生盤','當下卦局','交叉核對'],image:'male-choice-crimson.png'}
];
setTimeout(initOffice,0);
function initOffice(){
document.body.classList.add('office-mode');
document.title='玄頁 AI Office｜命理事務所';
const officeLink=document.createElement('link');officeLink.rel='stylesheet';officeLink.href='./office.css?v=20261024';document.head.append(officeLink);
const lobby=document.querySelector('#methods');
lobby.querySelector('.methods-header').innerHTML='<div class="office-brand"><b>玄頁<span> AI OFFICE</span></b><small>命理事務所</small></div><nav><button id="officeProfile" type="button">個人資料</button><span id="hkClock"></span></nav>';
lobby.querySelector('.methods-intro').outerHTML='<div class="office-welcome"><div><p class="kicker">YOUR PERSONAL ADVISORY TEAM</p><h1>一間事務所，<br>八位人生顧問。</h1><p>有啲事，搵啱人傾就清楚。將你嘅問題交俾專責同事。</p></div><aside><span class="office-live">辦公室開放中</span><strong>08 <small>位職員在線</small></strong><p>香港時間辦公 · 隨時入座</p></aside></div><div class="office-floor-label"><div><span class="floor-index">01/F</span><b>顧問辦公區</b></div><span>選擇一位職員開始諮詢</span></div>';
lobby.querySelector('.methods-rule').textContent='先揀你關心嘅範疇，再到職員工作位交低問題。';
const qbox=lobby.querySelector('.question-box');qbox.querySelector('span').textContent='今日想交俾我哋嘅問題';qbox.querySelector('input').placeholder='例如：面前兩個選擇，我應該點樣判斷？';
const grid=document.querySelector('#methodGrid');
function officeCards(){grid.innerHTML=staff.map(s=>`<button type="button" class="staff-desk" data-office-staff="${s.id}" style="--staff:${s.color}"><div class="desk-top"><span>${s.room} / ${s.desk}</span><i>可諮詢</i></div><div class="staff-scene"><div class="staff-window"></div><img src="./public/teaser/${s.image}" alt="${s.name}" loading="lazy"><div class="staff-monitor"><span>${s.skills[0]}</span><i></i><i></i><i></i></div><div class="staff-table"></div><span class="desk-nameplate">${s.name} · ${s.role}</span></div><div class="staff-info"><div><h2>${s.name}</h2><span>${s.role}</span></div><p>${s.line}</p><div class="staff-tags">${s.skills.map(x=>`<span>${x}</span>`).join('')}</div><span class="staff-invite">到工作位傾傾 <b>→</b></span></div></button>`).join('');}
const officeObserver=new MutationObserver(()=>{if(grid.querySelector('[data-method]'))officeCards();});officeObserver.observe(grid,{childList:true});
let selectedStaff=null;
const hasProfile=()=>Boolean(document.querySelector('#birthDate').value&&document.querySelector('#birthPlace').value&&state.gender&&(document.querySelector('#birthTime').value||state.unknownTime));
function showOffice(){renderMethods();officeCards();setScreen('methods');}
document.querySelector('#officeProfile').onclick=()=>{selectedStaff=null;state.profileIndex=0;document.querySelectorAll('.profile-step').forEach(x=>x.classList.toggle('is-active',x.dataset.step==='0'));setScreen('profile');};
grid.addEventListener('click',e=>{const card=e.target.closest('[data-office-staff]');if(!card)return;selectedStaff=staff.find(s=>s.id===card.dataset.officeStaff);if(['bazi','ziwei','indian','cross'].includes(selectedStaff.id)&&!hasProfile()){state.profileIndex=0;document.querySelectorAll('.profile-step').forEach(x=>x.classList.toggle('is-active',x.dataset.step==='0'));document.querySelector('#profileCount').textContent='01 / 05';document.querySelector('#profileProgress').style.width='20%';setScreen('profile');return;}openStaff(selectedStaff);});
function openStaff(s){renderReading(s.id);document.querySelector('#readingTitle').textContent=`${s.name} · ${s.role}`;document.querySelector('#readingKicker').textContent=s.desk;document.querySelector('.reading-guide img').src=`./public/teaser/${s.image}`;document.querySelector('.reading-guide img').alt=s.name;document.querySelector('.reading-guide p').textContent=`${s.name}正在整理你嘅問題`;document.querySelector('#readingBack').textContent='← 返回辦公室';document.querySelector('#nextMethod').innerHTML='搵另一位同事 <span>→</span>';document.querySelector('#readingMethodNo').textContent=`職員 ${s.room}`;}
document.querySelector('#profileNext').addEventListener('click',()=>{if(state.screen==='methods'&&selectedStaff){const s=selectedStaff;selectedStaff=null;openStaff(s);}});
document.querySelectorAll('.back-link[data-back]').forEach(b=>{b.dataset.back='methods';});
document.querySelector('#resetFlow').textContent='返回大廳';document.querySelector('#resetFlow').addEventListener('click',e=>{e.stopImmediatePropagation();showOffice();},true);
document.querySelector('.profile-step h2').textContent='先建立你嘅排盤資料。';
document.querySelector('#profile').insertAdjacentHTML('afterbegin','<div class="profile-office-label">玄頁 AI Office / 訪客登記</div>');
const readingObserver=new MutationObserver(()=>{document.querySelectorAll('#readingContent h4').forEach(h=>{h.childNodes.forEach(n=>{if(n.nodeType===3)n.textContent=n.textContent.replace(/墨川要你而家做/g,'顧問建議 · 下一步').replace(/墨川最後講/g,'聯合顧問建議');});});});readingObserver.observe(document.querySelector('#readingContent'),{childList:true});
setInterval(()=>{document.querySelector('#hkClock').textContent=`香港 ${hkLabel(nowHK())}`;},1000);
showOffice();
}
