const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const esc = value => String(trad(value ?? '')).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state = { screen:'intro', storyIndex:0, profileIndex:0, unknownTime:false, gender:'', topic:'工作', method:null, results:new Map(), terms:new Map(), palaceExplanations:new Map() };
const screens = ['intro','story','profile','methods','reading'];
const asset = name => `./public/teaser/${name}`;

const term = (label, explanation, key = label) => { state.terms.set(key, {label, explanation}); return `<button class="term-link" type="button" data-term="${esc(key)}">${esc(label)}</button>`; };
const nowHK = () => {
  const value = new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Hong_Kong',hour12:false,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date());
  return value.replace(' ','T');
};
const hkLabel = raw => raw ? raw.replace('T',' ') : '香港時間未指定';
const inputDateTime = raw => { const m = String(raw||'').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/); return m ? {year:+m[1],month:+m[2],day:+m[3],hour:+m[4],minute:+m[5]} : null; };
const profile = () => {
  const date = $('#birthDate').value, time = $('#birthTime').value;
  const [year,month,day] = date.split('-').map(Number), [hour,minute] = (time || '12:00').split(':').map(Number);
  return {year,month,day,hour,minute, timeKnown:!state.unknownTime, place:$('#birthPlace').value, gender:state.gender, name:$('#profileName').value.trim() || '你'};
};
const question = () => $('#question').value.trim() || `${state.topic}的下一步`;
const setScreen = id => { screens.forEach(x => { const el=$(`#${x}`); el.classList.toggle('is-active',x===id); el.setAttribute('aria-hidden',x===id?'false':'true'); }); state.screen=id; window.scrollTo({top:0,behavior:'smooth'}); };

const storyScenes = [
  {bg:asset('male-choice-amber.png'), title:'你終於來了。', text:'先別急住相信我。把你真正想問嘅事留低，等盤面自己講。'},
  {bg:asset('mokawa-pose-liuren.png'), title:'命唔係一句吉凶。', text:'我會先看你點樣承受事情，再看哪一個時間層正在推你向前。'},
  {bg:asset('mokawa-pose-compass.png'), title:'八門，各自有規矩。', text:'八字看出生四柱；紫微看宮位星曜；掐指一算，就只按香港此刻起課。'},
  {bg:asset('mokawa-pose-threads.png'), title:'而家，輪到你開口。', text:'你可以問工作、財運、感情、家庭，或者一句你唔敢同人講嘅問題。'}
];
const renderStory = () => { const scene=storyScenes[state.storyIndex]; $('#storyVisual').style.backgroundImage=`linear-gradient(180deg,rgba(2,8,11,.1),rgba(2,8,11,.12) 45%,rgba(2,8,11,.93)),url("${scene.bg}")`; $('#storyCounter').textContent=`${String(state.storyIndex+1).padStart(2,'0')} / 04`; $('#storyTitle').textContent=scene.title; $('#storyText').textContent=scene.text; ['#storyTitle','#storyText'].forEach((s,i)=>{const el=$(s);el.classList.remove('text-enter');void el.offsetWidth;el.classList.add('text-enter');}); };

const methods = [
  {id:'bazi',name:'八字',sub:'四柱 · 日主 · 十神 · 大運',visual:'mokawa-bg-archive.png'},
  {id:'ziwei',name:'紫微斗數',sub:'命宮 · 十二宮 · 星曜 · 四化',visual:'mokawa-bg-astral.png'},
  {id:'indian',name:'印度占星',sub:'Lagna · Bhava · Nakshatra · Dasha',visual:'mokawa-bg-rooftop.png'},
  {id:'meihua',name:'梅花易數',sub:'農曆時間 · 體用 · 本互變卦',visual:'mokawa-pose-compass.png'},
  {id:'liuren',name:'掐指一算',sub:'小六壬 · 月日時 · 落宮',visual:'mokawa-pose-liuren.png'},
  {id:'iching',name:'易經',sub:'六爻 · 動爻 · 卦辭 · 變卦',visual:'mokawa-bg-astral.png'},
  {id:'qimen',name:'奇門遁甲',sub:'九宮 · 八門 · 九星 · 八神',visual:'mokawa-pose-compass.png'},
  {id:'cross',name:'綜合解讀',sub:'八法交叉 · 找出真正矛盾',visual:'mokawa-bg-consultation.png'}
];
const renderMethods = () => { $('#hkClock').textContent=`香港時間 ${hkLabel(nowHK())}`; $('#methodGrid').innerHTML=methods.map((m,i)=>`<button class="method-card ${i===0?'is-featured':''}" data-method="${m.id}" style="animation-delay:${i*55}ms" type="button"><span class="method-no">0${i+1}</span><h3>${m.name}</h3><p>${m.sub}</p></button>`).join(''); };

const stemElement={甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
const branchElement={子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};
const hiddenStems={子:'癸',丑:'己癸辛',寅:'甲丙戊',卯:'乙',辰:'戊乙癸',巳:'丙戊庚',午:'丁己',未:'己丁乙',申:'庚壬戊',酉:'辛',戌:'戊辛丁',亥:'壬甲'};
const yinStem = s => '乙丁己辛癸'.includes(s);
const tenGod = (day, other) => {
  if(!day || !other || day===other) return '比肩';
  const rel={木:{木:'比劫',火:'食傷',土:'財',金:'官殺',水:'印'},火:{木:'印',火:'比劫',土:'食傷',金:'財',水:'官殺'},土:{木:'官殺',火:'印',土:'比劫',金:'食傷',水:'財'},金:{木:'財',火:'官殺',土:'印',金:'比劫',水:'食傷'},水:{木:'食傷',火:'財',土:'官殺',金:'印',水:'比劫'}};
  const group=rel[stemElement[day]]?.[stemElement[other]]||'關係';
  const same=yinStem(day)===yinStem(other);
  return ({比劫:same?'比肩':'劫財',食傷:same?'食神':'傷官',財:same?'正財':'偏財',官殺:same?'正官':'七殺',印:same?'正印':'偏印'})[group]||group;
};
const baziCalc = p => {
  if(!window.Solar) return {error:'八字計算套件未載入，沒有用文字冒充結果。'};
  try {
    const ec=window.Solar.fromYmdHms(p.year,p.month,p.day,p.hour,p.minute,0).getLunar().getEightChar();
    const rows=[['年柱',ec.getYear(),ec.getYearNaYin()],['月柱',ec.getMonth(),ec.getMonthNaYin()],['日柱',ec.getDay(),ec.getDayNaYin()],['時柱',ec.getTime(),ec.getTimeNaYin()]];
    const dayGan=ec.getDayGan(), dayBranch=ec.getDay().slice(1), visible=rows.flatMap(r=>[r[1][0],r[1][1]]), counts={木:0,火:0,土:0,金:0,水:0};
    visible.forEach((x,i)=>{const e=i%2===0?stemElement[x]:branchElement[x];if(e)counts[e]+=i%2===0?2:1;});
    [...rows.map(r=>r[1][1])].flatMap(b=>[...(hiddenStems[b]||'')]).forEach(x=>{if(stemElement[x])counts[stemElement[x]]+=.5;});
    const max=Math.max(...Object.values(counts)), strength=counts[stemElement[dayGan]]>=max-1?'有根偏旺':counts[stemElement[dayGan]]<=1.5?'偏弱需借力':'中和要看運勢';
    const relations=[]; const has=(a,b)=>visible.includes(a)||visible.includes(b);
    [['子','午','沖'],['卯','酉','沖'],['寅','亥','合'],['巳','申','合'],['辰','酉','合'],['午','未','合']].forEach(([a,b,n])=>{if([dayBranch,...rows.map(r=>r[1][1])].includes(a)&&[dayBranch,...rows.map(r=>r[1][1])].includes(b))relations.push(`${a}${b}${n}`);});
    let luck='大運資料要按起運歲數另行核對';
    try { const yun=ec.getYun(p.gender==='male'?1:0,2), ds=yun.getDaYun(10)||[], current=ds.find(x=>new Date().getFullYear()>=x.getStartYear()&&new Date().getFullYear()<=x.getEndYear()); if(current) luck=`${current.getGanZhi()} · ${current.getStartYear()}–${current.getEndYear()}（約 ${current.getStartAge()}–${current.getEndAge()} 歲）`; } catch(_){}
    return {rows,dayGan,dayBranch,dayElement:stemElement[dayGan],counts,strength,relations,luck,terms:['四柱','日主','月令','十神','藏干','旺衰','刑沖合害','大運','流年'],evidence:`年柱 ${rows[0][1]}／月柱 ${rows[1][1]}／日柱 ${rows[2][1]}／時柱 ${rows[3][1]}`};
  } catch(e) { return {error:`八字排盤失敗：${e.message}`}; }
};

const signs=['白羊座','金牛座','雙子座','巨蟹座','獅子座','處女座','天秤座','天蠍座','射手座','摩羯座','水瓶座','雙魚座'];
const nakshatras=['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
const locations={香港:[22.3193,114.1694,8],澳門:[22.1987,113.5439,8],台北:[25.033,121.5654,8],新加坡:[1.3521,103.8198,8],吉隆坡:[3.139,101.6869,8],東京:[35.6762,139.6503,9],首爾:[37.5665,126.978,9],紐約:[40.7128,-74.006,-5],倫敦:[51.5072,-.1276,0]};
const utcDate = (p, offset=8) => new Date(Date.UTC(p.year,p.month-1,p.day,p.hour-offset,p.minute));
const indianCalc = p => {
  if(!window.Astronomy) return {error:'印度占星計算套件未載入，沒有用估算文字代替。'};
  try {
    const [lat,lon,offset]=locations[p.place]||[]; if(!lat) return {error:'此出生地未有本地座標，請先選擇支援城市。'}; const date=utcDate(p,offset), ayan=24.0+(p.year-2000)*0.01396;
    const tropical=body=>body==='Sun'
      ? window.Astronomy.SunPosition(date).elon
      : window.Astronomy.EclipticLongitude(body,date);
    const sidereal=body=>(tropical(body)-ayan+360)%360;
    const planetNames=[['太陽','Sun'],['月亮','Moon'],['水星','Mercury'],['金星','Venus'],['火星','Mars'],['木星','Jupiter'],['土星','Saturn']];
    const planets=planetNames.map(([label,body])=>{const lonValue=sidereal(body);return {label,lon:lonValue,sign:signs[Math.floor(lonValue/30)],degree:(lonValue%30).toFixed(2)}});
    const jd=2451545+(date.getTime()-Date.UTC(2000,0,1,12))/86400000,lst=(280.46061837+360.98564736629*(jd-2451545)+lon)%360,obl=23.4393*Math.PI/180,phi=lat*Math.PI/180,theta=lst*Math.PI/180;
    const asc=(Math.atan2(-Math.cos(theta),Math.sin(theta)*Math.cos(obl)+Math.tan(phi)*Math.sin(obl))*180/Math.PI+360)%360, moon=planets[1].lon, nakIndex=Math.floor(moon/(360/27)),nakProgress=(moon%(360/27))/(360/27);
    const lords=['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'],years={Ketu:7,Venus:20,Sun:6,Moon:10,Mars:7,Rahu:18,Jupiter:16,Saturn:19,Mercury:17}; let dasha=[]; let cursor=utcDate(p,offset), idx=nakIndex%9, firstRemain=years[lords[idx]]*(1-nakProgress);
    const add=(d,yrs)=>new Date(d.getTime()+yrs*365.2425*86400000); cursor=add(cursor,0); for(let i=0;i<5;i++){const lord=lords[(idx+i)%9],dur=i===0?firstRemain:years[lord],end=add(cursor,dur);dasha.push({lord,start:new Date(cursor),end,dur});cursor=end;}
    const today=new Date(), active=dasha.find(x=>today>=x.start&&today<x.end)||dasha[0];
    return {planets,asc:asc.toFixed(2),ascSign:signs[Math.floor(asc/30)],nak:nakshatras[nakIndex],nakIndex:nakIndex+1,dasha,active,ayan,place:p.place,offset};
  } catch(e) { return {error:`印度占星排盤失敗：${e?.message||String(e)}`}; }
};

const trigram={1:{name:'乾',symbol:'☰',bits:[1,1,1],element:'金'},2:{name:'兌',symbol:'☱',bits:[1,1,0],element:'金'},3:{name:'離',symbol:'☲',bits:[1,0,1],element:'火'},4:{name:'震',symbol:'☳',bits:[1,0,0],element:'木'},5:{name:'巽',symbol:'☴',bits:[0,1,1],element:'木'},6:{name:'坎',symbol:'☵',bits:[0,1,0],element:'水'},7:{name:'艮',symbol:'☶',bits:[0,0,1],element:'土'},8:{name:'坤',symbol:'☷',bits:[0,0,0],element:'土'}};
const kuaNames=[['乾為天','天澤履','天火同人','天雷無妄','天風姤','天水訟','天山遯','天地否'],['澤天夬','兌為澤','澤火革','澤雷隨','澤風大過','澤水困','澤山咸','澤地萃'],['火天大有','火澤睽','離為火','火雷噬嗑','火風鼎','火水未濟','火山旅','火地晉'],['雷天大壯','雷澤歸妹','雷火豐','震為雷','雷風恆','雷水解','雷山小過','雷地豫'],['風天小畜','風澤中孚','風火家人','風雷益','巽為風','風水渙','風山漸','風地觀'],['水天需','水澤節','水火既濟','水雷屯','水風井','坎為水','水山蹇','水地比'],['山天大畜','山澤損','山火賁','山雷頤','山風蠱','山水蒙','艮為山','山地剝'],['地天泰','地澤臨','地火明夷','地雷復','地風升','地水師','地山謙','坤為地']];
const bitsToTri=bits=>Object.keys(trigram).find(k=>trigram[k].bits.join('')===bits.join(''))||8;
let hexagrams=[]; fetch('./public/hexagrams.json').then(r=>r.json()).then(d=>{hexagrams=d['周易']||[];}).catch(()=>{});
const trad=s=>String(s||'').replaceAll('为','為').replaceAll('风','風').replaceAll('泽','澤').replaceAll('归','歸').replaceAll('讼','訟').replaceAll('无','無').replaceAll('观','觀').replaceAll('临','臨').replaceAll('复','復').replaceAll('师','師').replaceAll('谦','謙').replaceAll('剥','剝').replaceAll('遁','遯').replaceAll('贲','賁').replaceAll('颐','頤').replaceAll('蛊','蠱').replaceAll('损','損').replaceAll('既济','既濟').replaceAll('未济','未濟').replaceAll('个','個').replaceAll('阳','陽').replaceAll('阴','陰').replaceAll('节','節').replaceAll('气','氣').replaceAll('门','門').replaceAll('惊','驚').replaceAll('开','開').replaceAll('伤','傷').replaceAll('腾','騰').replaceAll('冲','沖').replaceAll('长','長').replaceAll('炉','爐').replaceAll('蜡','蠟').replaceAll('积','積').replaceAll('时','時').replaceAll('数','數').replaceAll('应','應').replaceAll('对','對').replaceAll('传','傳').replaceAll('结','結').replaceAll('间','間').replaceAll('变','變').replaceAll('经','經').replaceAll('体','體').replaceAll('内','內').replaceAll('现','現').replaceAll('实','實').replaceAll('术','術').replaceAll('须','須').replaceAll('从','從').replaceAll('后','後').replaceAll('见','見').replaceAll('证','證').replaceAll('说','說').replaceAll('简','簡').replaceAll('學','學');
const hexText=num=>{const raw=hexagrams.find(x=>String(x).startsWith(`第${num}卦`)); if(!raw)return {judgement:'本地卦典尚未載入。',image:'卦文暫未載入。'};const a=raw.split('\n');return {judgement:trad(a[1]||''),image:trad(a[3]||''),explain:trad(a[4]||''),topic:trad((a.find(x=>/事业|經商|婚恋|婚戀/.test(x))||a[5]||'').trim())};};
const hexBuild=(upper,lower,moving,basis)=>{const lines=trigram[lower].bits.concat(trigram[upper].bits), next=lines.map((v,i)=>i===moving-1?1-v:v), mutualLower=bitsToTri([lines[1],lines[2],lines[3]]), mutualUpper=bitsToTri([lines[2],lines[3],lines[4]]), changedLower=bitsToTri(next.slice(0,3)),changedUpper=bitsToTri(next.slice(3));return {upper,lower,moving,main:kuaNames[upper-1][lower-1],mutual:kuaNames[changedUpper?mutualUpper-1:mutualUpper-1][mutualLower-1],changed:kuaNames[changedUpper-1][changedLower-1],basis,mainText:hexText(kuaNumber(upper,lower)),mutualText:hexText(kuaNumber(mutualUpper,mutualLower)),changedText:hexText(kuaNumber(changedUpper,changedLower))};};
const kuaNumber=(upper,lower)=>{const name=kuaNames[upper-1][lower-1]; const raw=hexagrams.find(x=>trad(String(x).split('\n')[0]).includes(name)); return raw?Number(String(raw).match(/^第(\d+)/)?.[1]):((upper-1)*8+lower);};
const meihuaCalc=(p, q, mode='time')=>{
  if(!window.Solar) return {error:'梅花易數需要農曆換算套件，尚未載入。'};
  try { const lunar=window.Solar.fromYmdHms(p.year,p.month,p.day,p.hour,p.minute,0).getLunar(), month=Math.abs(lunar.getMonth()), day=lunar.getDay(), yearBranch=((p.year-4)%12+12)%12+1, hourIndex=Math.floor((p.hour+1)/2)%12+1, total=yearBranch+month+day; let upper,lower,moving,basis;
    if(mode==='question'){const seed=[...q].reduce((n,c)=>n+c.charCodeAt(0),p.year+p.month+p.day); upper=(seed%8)||8;lower=((seed+hourIndex)%8)||8;moving=((seed+month+day)%6)||6;basis=`問題起卦：以「${q}」字序及香港時間作起卦種子`;} else {upper=(total%8)||8;lower=((total+hourIndex)%8)||8;moving=((total+hourIndex)%6)||6;basis=`時間起卦：農曆 ${lunar.getYear()} 年 ${month} 月 ${day} 日；時辰數 ${hourIndex}`;}
    return hexBuild(upper,lower,moving,basis);
  } catch(e){return {error:`梅花易數起卦失敗：${e.message}`};}
};
const liurenCalc=p=>{
  if(!window.Solar) return {error:'小六壬需要農曆日期換算套件，尚未載入。'};
  try {const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Hong_Kong',hour12:false,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).formatToParts(new Date()),now=Object.fromEntries(parts.filter(x=>x.type!=='literal').map(x=>[x.type,Number(x.value)])),solarDate=`${now.year}-${String(now.month).padStart(2,'0')}-${String(now.day).padStart(2,'0')}`,solarTime=`${String(now.hour).padStart(2,'0')}:${String(now.minute).padStart(2,'0')}`,lunar=window.Solar.fromYmdHms(now.year,now.month,now.day,now.hour,now.minute,0).getLunar(),month=Math.abs(lunar.getMonth()),day=lunar.getDay(),hour=Math.floor((now.hour+1)/2)%12+1,names=['大安','留連','速喜','赤口','小吉','空亡'],m=(month-1)%6,d=(m+day-1)%6,h=(d+hour-1)%6;return {month,day,hour,names,positions:[m,d,h],god:names[h],solarDate,solarTime,trace:`香港陽曆 ${solarDate} ${solarTime} 起課；換算農曆第 ${month} 月第 ${day} 日：大安起正月落 ${names[m]} → 月上起日落 ${names[d]} → 日上起時辰數 ${hour} 落 ${names[h]}`};}catch(e){return {error:`掐指一算失敗：${e?.message||String(e)}`};}
};

const ziweiCalc=p=>{
  if(p.gender==='other') return {error:'你選擇不透露性別；此派紫微排限需要男／女順逆排法，系統不會替你猜。'};
  const lib=window.iztro; if(!lib?.astro?.bySolar) return {error:'紫微排盤套件未載入，沒有顯示假星曜。'};
  try {const gender=p.gender==='male'?'男':'女',timeIndex=Math.floor((p.hour+1)/2)%12,chart=lib.astro.bySolar(`${p.year}-${String(p.month).padStart(2,'0')}-${String(p.day).padStart(2,'0')}`,timeIndex,gender,true,'zh-TW'),palaces=(chart.palaces||[]).slice(0,12).map(x=>({name:x.name||'宮位',stars:[...(x.majorStars||[]),...(x.minorStars||[]),...(x.adjectiveStars||[])].map(s=>s.name||s).filter(Boolean)})); const ming=palaces.find(x=>x.name.includes('命'))||palaces[0], guan=palaces.find(x=>x.name.includes('官祿')||x.name.includes('官禄')), cai=palaces.find(x=>x.name.includes('財帛')||x.name.includes('财帛')), couple=palaces.find(x=>x.name.includes('夫妻'));return {palaces,ming,guan,cai,couple,yearStem:['丙','丁','戊','己','庚','辛','壬','癸','甲','乙'][((p.year-4)%10+10)%10],chart};} catch(e){return {error:`紫微排盤失敗：${e.message}`};}
};

const ziweiPalaceMeaning={命宮:'本人性格、選擇方式及人生主軸',兄弟宮:'同輩、手足、合作及資源分配',夫妻宮:'親密關係、伴侶互動及承諾模式',子女宮:'創作、作品、下屬及你養成的事物',財帛宮:'收入模式、理財方式及資源安全感',疾厄宮:'身心壓力、生活習慣及需要保養的位置',遷移宮:'外出、環境變動、客戶及外界給你的回應',僕役宮:'朋友、同事、團隊及你如何用人',官祿宮:'工作方向、責任、名聲及職業角色',田宅宮:'居住、家庭根基、資產及安全感',福德宮:'內在休息、慾望、精神狀態及享受方式',父母宮:'長輩、制度、上司、文書及保護資源'};
const ziweiStarExplain=s=>{const n=String(s||''); if(n.includes('七殺'))return '七殺屬開創及決斷型主星：遇事傾向直接切入、承擔風險及打破舊局；落入不同宮位，會把這種強度帶到該生活領域，不等於必然凶。'; if(n.includes('紫微'))return '紫微是統籌、主導及承擔責任的主星：重視格局、位置及能否掌握全局；要連同會照星曜看你係得到授權，定係只係被推上前線。'; if(n.includes('天府'))return '天府偏向守成、管理及資源收納：重視穩定、庫存及可持續性；落在財帛或田宅時尤其要看你點樣管理而不是只看擁有幾多。'; if(n.includes('廉貞'))return '廉貞關於界線、慾望、規則及選擇：容易對模糊關係敏感，也會在原則與現實之間反覆衡量。'; if(n.includes('貪狼'))return '貪狼關於吸引力、社交、欲望及多元嘗試：優點是有感染力，風險是選項太多而分散承諾。'; if(n.includes('破軍'))return '破軍代表拆舊立新、重整及高變動：適合處理已經失效的安排，但要先設退出線，避免把衝動誤認成自由。'; if(n.includes('天相'))return '天相重視協調、規格、公平及呈現方式：能處理人與制度之間的接口，但容易因顧全大局而延後自己的決定。'; if(n.includes('天機'))return '天機偏分析、變通及訊息流動：善於看見可能性，但過度比較會令行動延遲。'; if(n.includes('太陰'))return '太陰偏內在安全感、細節、累積及照顧：敏感度高，做決定前會先評估環境是否可靠。'; if(n.includes('太陽'))return '太陽偏公開、承擔、帶領及被看見：容易主動照亮別人，但要留意責任是否有相應權限。'; if(n.includes('武曲'))return '武曲偏執行、數字、效率及資源控制：適合落地與管理，但表達感受時可能顯得過於直接。'; if(n.includes('天同'))return '天同偏和氣、享受、適應及減壓：能化解衝突，但面對必須取捨時容易拖延。'; return '此星曜代表一種傾向，必須連同落入宮位、會照星曜及四化閱讀；單獨一粒星不能宣判吉凶。';};
const ziweiPalaceText=(palace,r)=>{const name=palace.name||'宮位', stars=palace.stars.length?palace.stars.join('、'):'空宮（借對宮參考）', meaning=Object.entries(ziweiPalaceMeaning).find(([k])=>name.includes(k))?.[1]||'此宮所代表的生活領域'; const tone=palace.stars.length?`本宮見 ${stars}，表示「${meaning}」會以呢組星曜嘅方式呈現；真正要核對的是你近期遇到的具體人、事及選擇。`:`本宮未見主星，先借對宮看主題，再用三方四正補充，唔會硬塞一粒不存在的星。`; return `【${name}】\n術語意思：${meaning}。\n白話解釋：${tone}\n盤面作用：宮位定義事情發生在哪個生活範圍；星曜定義你在這個範圍用甚麼方式回應。\n工作／財運／感情／家庭影響：${name}同${r.ming?.name||'命宮'}互相牽動，工作安排可能改變收入、關係及家庭責任；要按你揀的「${state.topic}」核對實際事件，不把象意當成必然結果。\n可能時間窗口：先以 2026 流年及未來 60 日觀察重複出現的訊號，再配合大限、流月核對，唔用單一宮位預言確切日期。\n實際行動：記低一件同此宮有關、七日內可驗證的事，列出你能控制的下一步及一條不可接受的界線。\n星曜逐粒解釋：${palace.stars.length?palace.stars.map(s=>`${s}：${ziweiStarExplain(s)}`).join(' | '):'空宮：唔代表沒有事情，而是要借對宮及會照星曜閱讀。'}`;};

const qimenCalc=async(p,q)=>{
  try {const mod=await import('./public/qimen-engine.js'), loc=locations[p.place]||locations['香港'], d=utcDate(p,loc[2]); const chart=mod.calculate(d,{type:'三元',method:'时家',location:p.place,purpose:q}); if(chart?.error) return {error:chart.message||'奇門排盤失敗'};return {chart};}catch(e){return {error:`奇門排盤失敗：${e.message}`};}
};

const impacts=(focus, signal, method='default') => {
  if(method==='default') method=signal.includes('日主')?'bazi':signal.includes('命宮')?'ziwei':signal.includes('Lagna')?'indian':signal.includes('落宮')?'liuren':signal.includes('值符')?'qimen':signal.includes('綜合盤面')?'cross':signal.includes('本卦')?'meihua':'default';
  const profiles={
    bazi:{
      工作:`${signal}；日主偏旺時主動量大，但最怕責任增加而權限未同步。先把交付標準、截止日及誰有最後決定權寫清楚，唔好用硬頂證明能力。`,
      財運:`${signal}；比劫、財星及五行分布只提示你點樣處理資源，唔係保證收入。先分開固定現金流、一次性支出及人情借貸，任何新投入設上限。`,
      感情:`${signal}；八字睇的是你承受親密關係的方式，唔預設對象性別。你較容易把「我做得到」變成「我應該負責」，要直接講需要、界線及回應期限。`,
      '家庭／人際':`${signal}；刑沖合害落在人際時，常見係責任互相牽連，不等於一定決裂。把「我願意做」同「我被要求做」分成兩張清單，減少猜測。`,
      健康:`${signal}；五行旺衰只可作生活節奏提示，唔係診斷。連續七日記錄睡眠、壓力同身體反應；若有症狀，交由醫護判斷。`,
      '學業／方向':`${signal}；食傷、印及官殺的語言可以幫你分辨輸出、吸收及規範。先用兩星期完成一個可展示成果，再決定是否長期轉向。`,
      其他:`${signal}；原局要配合你真正問的事情，唔可以只用日主下結論。把問題改成一個有期限、有成本、可回頭檢查的選擇。`
    },
    ziwei:{
      工作:`${signal}；命宮與官祿宮要一齊看，重點係你想控制方向，定係只係被職位要求推住走。向上級提出一頁紙的權責與成功標準，先測試對方是否真的授權。`,
      財運:`${signal}；財帛宮唔只代表賺幾多，亦反映你把資源交給誰管理。大額承諾先冷靜四十八小時，核對現金流、退出條件及實際回報。`,
      感情:`${signal}；夫妻宮與命宮互照的是相處契約，不是替你指定愛誰。最易出現的摩擦係一方要空間、一方要確認；用具體頻率和底線代替試探。`,
      '家庭／人際':`${signal}；三方四正顯示一件事會牽動家庭、工作與外部圈子。涉及多人時先定一個發言人及一個決策時間，唔好讓每個人都變成臨時主事者。`,
      健康:`${signal}；福德與疾厄相關的象意只用來提醒休息和壓力來源。當你開始以失眠、心悸或痛楚換取效率，應即時停低並尋求專業協助。`,
      '學業／方向':`${signal}；主星落宮提供的是偏好的學習和行動方式。選一個能在三十日內交付的作品或證書課程，用實際產出驗證方向，不要只收集資訊。`,
      其他:`${signal}；紫微的價值在於看牽連層，不是用一粒星替你作決定。先標出命宮、對宮及最受影響的一宮，再只處理其中一個矛盾。`
    },
    indian:{
      工作:`${signal}；Lagna 是你進場方式，Dasha 是時間背景，唔等於職位注定。現階段先選一項能提高可見度的輸出，兩星期後用回應數量而唔係情緒評估。`,
      財運:`${signal}；月亮與金星反映安全感及價值取向，容易令你因為想穩陣而錯過成本檢查。每筆投入先寫最壞情況、流動性及退出點。`,
      感情:`${signal}；Moon sign、Nakshatra 只描述情緒節奏，唔把伴侶限定為異性。你要避免用沉默測試對方，直接講清楚需要、期待和不接受的行為。`,
      '家庭／人際':`${signal}；Bhava 將同一個問題放回不同生活領域，可能看出工作壓力如何帶返屋企。每次只談一件可處理的事，避免在情緒最高時一次清算所有舊帳。`,
      健康:`${signal}；月亮與 Dasha 可作作息觀察，唔能夠代替醫療判斷。連續十日固定睡眠與進食時間；身體不適就停止自行推論。`,
      '學業／方向':`${signal}；木星、Mercury及第九／第五宮的象意要配合實際落點，先選一個老師、課程或作品路線，設三個可驗證里程碑。`,
      其他:`${signal}；印度占星需要把星體、宮位和當下 Transit 放在同一時間軸。先寫清楚你要問的是人、錢、時間還是選擇，再讀窗口。`
    },
    meihua:{
      工作:`${signal}；本卦是現況、動爻是最先變的環節，工作上先處理那個會改變全局的細節。先做一次小型試行，唔好未驗證就一次過改晒。`,
      財運:`${signal}；體用反映你與外部資源的互動，卦象唔代表必然得財。先查現金流與合約條款，再決定是收縮、保留還是增加投入。`,
      感情:`${signal}；卦看互動結構，不會替你判定對象性別或對方心意。將問題由「佢愛唔愛我」改成「我下一次應否主動溝通」，答案先可驗證。`,
      '家庭／人際':`${signal}；互卦常把表面衝突底下的牽連照出來。先找出真正未講清楚的條件，再安排一次有時間限制的對話，避免反覆講同一句。`,
      健康:`${signal}；卦象只作生活取捨提醒，不是診斷。若卦意指向反覆或過勞，先減少一項可延後的安排；症狀由醫護處理。`,
      '學業／方向':`${signal}；動爻顯示學習過程中最需要轉換的方法。先用一個星期改變一個變量，例如練習方式或回饋來源，再看成果。`,
      其他:`${signal}；梅花的重點係把抽象煩惱落到本、互、變三層。寫下本卦提醒的一個限制和你能做的一步，完成後再重新判斷。`
    },
    iching:{
      工作:`${signal}；易經先看卦辭與象，再由動爻指出你不可逃避的環節。工作上先守住程序和證據，等回應出現後再擴大決定。`,
      財運:`${signal}；卦辭講的是取捨與時勢，不是報價或投資保證。任何財務行動先設定最大損失、檢查資料來源，唔好因為一個吉字追價。`,
      感情:`${signal}；爻位描述關係在起步、中段還是後段，唔會替你預言誰會出現。先講一件具體感受，再聽對方如何回應，不要靠冷處理試答案。`,
      '家庭／人際':`${signal}；象曰常提醒位置與分寸，家庭問題要先分清誰有責任、誰只是在提供意見。安排一次短談，結束時確認下一步由誰負責。`,
      健康:`${signal}；易經只能提醒節奏與過度，不能診斷。把爻象化成一個休息或求醫行動，不要拿卦象否定專業意見。`,
      '學業／方向':`${signal}；卦的轉化重點在於方法是否合時。選一項可重複練習的技能，建立七日回饋表，讓結果而不是直覺決定下一步。`,
      其他:`${signal}；本卦、動爻和變卦要形成一條因果鏈，唔可以只抽一句卦辭。先列出目前限制、正在變的位及可控制行動。`
    },
    liuren:{
      工作:`${signal}；小六壬只給當下短課的節奏，唔等於升職或失敗結論。按落宮提示調整速度，先核對一個訊息或條件，再決定是否回覆。`,
      財運:`${signal}；六神只能提示快慢、阻滯或空缺，唔可以替代金額計算。先補齊付款、退款、合約及風險資料，任何決定保留退出位。`,
      感情:`${signal}；落宮描述今次互動的氣氛，唔預設對象性別，更唔代表對方一定會主動。用一次清楚邀請或界線測試回應，唔好自行補完對方心意。`,
      '家庭／人際':`${signal}；短課最適合看「而家應否講、等、避開或補資料」。家庭對話先限於一件事，若訊息混亂就延後至雙方冷靜。`,
      健康:`${signal}；小六壬不是醫療方法。若落宮提醒混亂、延誤或過度，先停低高風險活動及安排休息；症狀交由醫護判斷。`,
      '學業／方向':`${signal}；短課只適合決定下一個小步驟，唔適合代替長期規劃。先做一次練習、查詢或試堂，記錄真實回饋。`,
      其他:`${signal}；你今次只得到一個落宮，不是六個獨立答案。把落宮意思轉成一個今日能完成的動作，完成後再以新課核對。`
    },
    qimen:{
      工作:`${signal}；奇門要看門、星、神是否同向，唔係單挑一粒吉星。先選一個可掌控的溝通方向，帶齊證據再出手，避免在空間或權責不明時硬闖。`,
      財運:`${signal}；值符值使是局勢主導層，不是獲利保證。先看資金應放在哪個環節、由誰掌控及何時止損，再決定是否進場。`,
      感情:`${signal}；九宮將人、位置與行動方式分開，唔會把對象限定為異性。先改變一次接觸方式或時間，觀察對方是否有對等回應。`,
      '家庭／人際':`${signal}；門、星、神互相牽制時，家庭問題最易出現多頭指令。先定唯一議題、唯一聯絡人及回覆期限，避免人人都用自己的版本行動。`,
      健康:`${signal}；奇門盤只可作節奏與環境提醒，不是診斷。若局勢指向驚、傷或死的壓力語氣，先降低暴露與過勞，身體問題交由醫護。`,
      '學業／方向':`${signal}；九星可提示適合分析、表達、行動或整理，但要用實際結果校驗。選一個方向做三日試驗，再按成果調整。`,
      其他:`${signal}；奇門真正回答的是「此刻用哪種姿態行動」，不是替你保證終局。列出要爭取及要避開各一項，再選最低風險的門路試行。`
    },
    cross:{
      工作:`${signal}；長期出生盤與當下卦局若同時指向責任、等待或溝通，先處理共同訊號；若互相矛盾，先補事實，不要用平均數製造答案。`,
      財運:`${signal}；交叉結果只可指出哪些風險重複出現，唔會變成投資指令。先以現金流和可承受損失作硬限制，再把象意當作檢查清單。`,
      感情:`${signal}；八字、紫微、印度看長期傾向，卦法看當下互動，沒有一門可以替你指定伴侶性別。用真實對話和對等行動核對，不以神秘感代替同意。`,
      '家庭／人際':`${signal}；如果不同方法都指向牽連，先處理界線；如果只有一門出現警號，就把它當成要核對的假設，不要直接升級衝突。`,
      健康:`${signal}；任何方法都不能作診斷。交叉解讀最多提醒你哪種生活壓力反覆出現，下一步應是休息、記錄或求醫，而不是自行下結論。`,
      '學業／方向':`${signal}；出生盤可提供偏好，卦局可提供當下試行節奏，兩者要靠成果接回來。先做一個七日小實驗，再決定是否投入長期成本。`,
      其他:`${signal}；綜合唔係把八門句子疊高，而是列出一致、矛盾及未計算的地方。只採取一個低風險動作，完成後重新收集證據。`
    }
  };
  const richProfiles={
    bazi:{工作:`${signal}。八字先看日主、月令、十神與大運：你在工作上真正要處理的是能力、責任與權限是否對等；若只加責任而沒有授權，盤面所示的壓力會先落在交付與情緒。行動：把職責、期限、回報人寫成一頁，七日內要求對方確認。`,財運:`${signal}。財星與比劫要連五行旺衰看，白話不是「有財／冇財」，而是收入是否容易被分散、代人承擔或追逐短期回報。行動：分開固定現金流、可變支出及不可承受損失，任何投入先設上限。`,感情:`${signal}。八字用日主與十神看你如何承受親密、責任與衝突，唔會替你指定伴侶性別；你要防止照顧變成控制，或沉默變成測試。行動：直接講需要、界線及回應期限，觀察對方是否對等回應。`,'家庭／人際':`${signal}。刑沖合害不是「一定不和」，而是指出關係中有拉扯、牽連或未浮面的責任。行動：分開「我自願做」與「別人要求我做」兩張清單，再決定邊項要拒絕。`,健康:`${signal}。五行只可提醒作息、過勞與情緒節奏，不能診斷。行動：連續七日記錄睡眠、壓力與身體反應；有症狀就交由醫護判斷。`,'學業／方向':`${signal}。食傷、印、官殺分別提供輸出、吸收與規範的語言；方向要靠產出驗證，不是靠一句適合你。行動：兩星期完成一件可展示成果，再決定是否長期投入。`,其他:`${signal}。原局必須配合你真正問的事件，不能只用日主作答案。行動：把問題改成有期限、有成本、可回頭核對的選擇。`},
    ziwei:{工作:`${signal}。紫微工作判讀要把命宮、官祿、財帛、遷移放進三方四正：你是想掌握方向，還是被職位推住走？行動：向上級提出權責與成功標準，等實際授權再加碼。`,財運:`${signal}。財帛宮不只看收入，亦看你如何管理資源與承擔風險；化祿、化權、化科、化忌落點不同，答案就不同。行動：大額承諾冷靜四十八小時，先核對現金流與退出條件。`,感情:`${signal}。夫妻宮要連命宮、福德及四化看的是相處契約，不是替你判定誰會出現。行動：將空間、聯絡頻率與承諾寫清楚，避免一方猜、一方逃。`,'家庭／人際':`${signal}。田宅、福德、父母及遷移會把家庭壓力牽連到外部生活；三方四正出現重複星曜，代表責任需要重新分配。行動：定唯一發言人與決策時間，不讓所有人臨時主事。`,健康:`${signal}。疾厄與福德只可提醒壓力來源及休息方式，不能代替醫療意見。行動：當效率要靠失眠或疼痛換取時，立即停低並求助。`,'學業／方向':`${signal}。主星落宮描述偏好的學習與行動方式，身宮則提示力氣實際投放處。行動：揀一個三十日可交付的作品或課程，用結果驗證方向。`,其他:`${signal}。紫微的核心是宮位之間的牽連，不是一粒星替你拍板。行動：先打開命宮、對宮及最受影響的一宮，再只處理一個矛盾。`},
    indian:{工作:`${signal}。Lagna 是進場方式，Bhava 是工作落點，Dasha 是時間背景；三者要一齊看，不能由星座直接判職位。行動：揀一項可提高可見度的輸出，兩星期以回應數量檢查。`,財運:`${signal}。月亮與金星反映安全感、價值取向，未等於收入保證；財務仍要看相關宮位及現金流。行動：每筆投入先寫最壞情況、流動性與退出點。`,感情:`${signal}。Moon sign 與 Nakshatra 描述情緒節奏，不會把對象限定為異性，也不代表對方必然主動。行動：停止用沉默測試，直接講期待與不接受的行為。`,'家庭／人際':`${signal}。Bhava 會顯示工作、關係與家庭壓力如何互相帶動；Dasha 只是一段背景。行動：每次只談一件可以處理的事，避免一次清算舊帳。`,健康:`${signal}。月亮與 Dasha 可作作息觀察，不能作診斷。行動：固定十日睡眠與進食時間，身體不適就停止自行推論。`,'學業／方向':`${signal}。木星、Mercury 與第五／第九宮要配合實際落點，才可談學習方法。行動：選一位老師、一個作品或一條課程路線，設三個里程碑。`,其他:`${signal}。印度占星需要把星體、宮位與 Transit 放同一時間軸。行動：先寫清楚你問的是人、錢、時間還是選擇，再讀窗口。`},
    meihua:{工作:`${signal}。梅花以本卦看現況、體用看你與外部條件、動爻看最先變的環節；工作先處理那個會改變全局的細節。行動：做一次小型試行，唔好未驗證就全盤改動。`,財運:`${signal}。互卦會照出資源背後的流程與條款，變卦只提供行動後可能方向，不是得財保證。行動：先查現金流、合約及退款條件，再決定收縮或投入。`,感情:`${signal}。梅花讀的是互動結構，不替你判定對象性別或對方心意；體用失衡時，常見是主動與回應不對等。行動：把問題改成一次可驗證的溝通。`,'家庭／人際':`${signal}。互卦可把表面爭拗底下未講清楚的責任照出來。行動：安排一場有開始、有結束時間的對話，只處理一個條件。`,健康:`${signal}。卦象只作生活取捨提醒，不是診斷。行動：若提示反覆或過勞，先減少一項可延後安排；症狀交醫護。`,'學業／方向':`${signal}。動爻顯示方法要轉換的位，不代表要立即轉行。行動：一星期只改一個學習變量，再比較成果。`,其他:`${signal}。梅花價值是把煩惱落到本、互、變三層。行動：寫下限制、變化位及一個可撤回步驟。`},
    liuren:{工作:`${signal}。小六壬只看香港當下短課節奏，落宮不是升職或失敗結論。行動：先核對一個訊息或條件，再決定今日回覆速度。`,財運:`${signal}。六神只提示快慢、阻滯或資料空缺，不能代替金額計算。行動：補齊付款、退款、合約及風險資料，保留退出位。`,感情:`${signal}。落宮描述今次互動氣氛，不預設對象性別，更不代表對方會主動。行動：用一次清楚邀請或界線測試回應。`,'家庭／人際':`${signal}。短課適合判斷而家應講、等、避開或補資料，不適合清算多年關係。行動：家庭對話限於一件事，混亂就延後。`,健康:`${signal}。小六壬不是醫療方法；混亂或延誤只作節奏提醒。行動：停低高風險活動並休息，症狀交醫護。`,'學業／方向':`${signal}。短課只決定下一步，不代替長期規劃。行動：先做一次練習、查詢或試堂，記錄真實回饋。`,其他:`${signal}。你得到的是一個落宮，不是六個答案。行動：把落宮意思轉成今日能完成的一步。`},
    iching:{工作:`${signal}。易經先讀卦辭與象，再由動爻指出工作不可逃避的環節；重點是時與位，不是吉字。行動：先守住程序與證據，等回應才擴大決定。`,財運:`${signal}。本卦與變卦描述取捨及時勢，不能當報價或投資指令。行動：先設定最大損失，資料未齊就不追價。`,感情:`${signal}。爻位描述關係在起步、中段或收束，不預言誰會出現。行動：講一件具體感受，聽對方如何回應，唔好冷處理。`,'家庭／人際':`${signal}。象曰常提醒位置與分寸；家庭要分清誰有責任、誰只提供意見。行動：短談結束前確認下一步由誰負責。`,健康:`${signal}。易經只能提醒節奏與過度，不能診斷。行動：把爻象化成休息或求醫行動，不用卦象否定專業意見。`,'學業／方向':`${signal}。變卦指出方法是否合時，方向要靠反覆練習驗證。行動：建立七日回饋表，用成果決定下一步。`,其他:`${signal}。本卦、動爻、變卦要形成因果鏈。行動：列出限制、正在變的位及可控制行動。`},
    qimen:{工作:`${signal}。奇門以門、星、神是否同向判斷行動入口；值使比單粒吉星更關鍵。行動：揀一個可控溝通方向，帶齊證據再出手。`,財運:`${signal}。值符值使只表示局勢主導與落地方式，不是獲利保證。行動：先看資金由誰掌控、何時止損，再決定進場。`,感情:`${signal}。九宮把人、位置、時間與行動方式分開，唔把對象限定為異性。行動：改變一次接觸方式，觀察是否有對等回應。`,'家庭／人際':`${signal}。門、星、神互相牽制時容易出現多頭指令。行動：定唯一議題、聯絡人與回覆期限。`,健康:`${signal}。奇門只作環境與節奏提醒，不是診斷。行動：降低暴露與過勞，身體問題交醫護。`,'學業／方向':`${signal}。九星可提示分析、表達、行動或整理，但仍要用成果校驗。行動：做三日試驗，再按結果調整。`,其他:`${signal}。奇門回答的是此刻用哪種姿態，不保證終局。行動：列出要爭取與要避開各一項。`},
    cross:{工作:`${signal}。綜合只接受多門方法重複指向的工作訊號；長期出生盤與短期卦局矛盾時，先補事實。行動：把責任、權限與期限分開核對。`,財運:`${signal}。交叉結果只用來找重複風險，唔會變成投資指令。行動：以現金流與可承受損失作硬限制。`,感情:`${signal}。出生盤看長期傾向，卦法看當下互動；任何方法都唔替你指定伴侶性別。行動：用真實對話與對等行動核對。`,'家庭／人際':`${signal}。若多門都指向牽連，先處理界線；若只有一門警示，就當作待核對假設。行動：不要直接升級衝突。`,健康:`${signal}。任何方法都不能診斷；最多提醒反覆生活壓力。行動：記錄、休息或求醫，唔自行下結論。`,'學業／方向':`${signal}。出生盤提供偏好，卦局提供試行節奏，方向必須靠成果接回來。行動：做七日小實驗。`,其他:`${signal}。綜合唔係把八門句子疊高，而是列出一致、矛盾及未計算之處。行動：只採取一個低風險動作。`}
  };
  if(richProfiles[method]) return Object.entries(richProfiles[method]).map(([k,v])=>`<div class="impact-item ${k===focus?'is-focus':''}"><b>${escs(k)}</b><span>${escs(v)}</span></div>`).join('');
  const copy=profiles[method]||{
    工作:`${signal}落到工作，先看你能控制的權責、流程和交付。`,
    財運:`${signal}落到財運，先檢查收入、支出、風險和退出條件。`,
    感情:`${signal}落到感情，先講清楚界線、節奏、承諾和對象自主選擇。`,
    '家庭／人際':`${signal}落到家庭／人際，先分清責任與情緒，避免代人承擔。`,
    健康:`${signal}落到健康，只作生活節奏提醒；症狀交由醫護處理。`,
    '學業／方向':`${signal}落到學業／方向，先做一個可驗證的小試驗。`,
    其他:`${signal}落到你最在意的位置，先拆成一個可觀察的下一步。`
  };
  return Object.entries(copy).map(([k,v])=>`<div class="impact-item ${k===focus?'is-focus':''}"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('');
};
const methodImpact=(id,r,q,focus)=>{
  const escs=esc;
  const data={
    bazi:[
      ['日主承壓',`由日主 ${r.strength} 同月令先看你承受責任嘅方式。工作上係「能力夠唔夠」同「權責有冇同步」嘅問題；財運要先分開穩定收入與一次性支出；感情容易由照顧變成過度負責；家庭要留意長期默默補位。`, '七日內列出一項你正在代人承擔的責任，寫清楚誰應該負責。'],
      ['五行取用',`五行數量係木 ${r.counts.木}、火 ${r.counts.火}、土 ${r.counts.土}、金 ${r.counts.金}、水 ${r.counts.水}。白話係：盤面用五行描述你係偏向輸出、承擔、分析、累積，唔係用顏色直接判吉凶。工作可用來揀節奏；財運可用來設風險上限；感情可用來分辨熱心同消耗。`, '兩星期記錄一個令你回氣的安排，以及一個令你透支的安排。'],
      ['十神關係',`十神將資源、輸出、同伴、規範及財務放入同一張圖。你真正要核對嘅唔係「有冇財星」一句，而係你面對收入、上司、伴侶及家人時，會唔會把責任全部攬上身。`, '把一個承諾改寫成期限、回報、退出條件三行文字。'],
      ['大運／流月',`大運係十年背景，流月係近一年節奏；兩者只指出事情容易被推動嘅時間層，不係事件保證。工作可觀察權責變化，財運觀察現金流，感情觀察承諾是否穩定，家庭觀察責任是否重新分配。`, '未來 45 日每週只核對一項實際變化，唔用單一日子下結論。']
    ],
    ziwei:[
      ['命宮／身宮',`命宮睇核心反應，身宮睇你實際把力氣放在哪裡。若兩者訊號唔同，可能係表面好似自己話事，實際卻被工作、關係或家庭推住走。`, '先打開命宮及身宮兩格，分開寫「我想要」同「我實際正在做」。'],
      ['三方四正',`紫微唔可以只讀命宮；命宮、官祿、財帛、遷移會照，先能看一個選擇如何牽動工作、收入及外部環境。感情與家庭亦要放返夫妻、福德、田宅等宮位核對。`, '逐格打開命宮、官祿、財帛、遷移，圈出最常重複出現的星曜。'],
      ['四化／星曜',`四化係資源、權責、被看見與卡點的流動，不是四個吉凶標籤。七殺、紫微、天府等星曜亦要連落宮及會照閱讀；同一粒星落夫妻宮同落官祿宮，生活含義完全不同。`, '點擊每粒星曜，將「星曜性格」改寫成一個你可觀察的行為。'],
      ['流年／限運',`流年係年度背景，大限係較長時間層；時間窗口只表示哪個生活領域較容易被觸發。工作可核對職責，財運核對資源，感情核對契約，家庭核對居住與照顧分工。`, '由今日起 60 日只記錄重複出現的人事，等證據累積後再判斷。']
    ],
    indian:[
      ['Lagna 上升',`Lagna 不是「你是甚麼星座」咁簡單，而係出生地點與時刻計出的進場方式。它描述你如何面對陌生環境、工作機會與關係互動；財運則要再看資源宮位，不能由上升單獨推斷。`, '寫低一個你最近如何進場的場景，再比較你想呈現與實際呈現的差距。'],
      ['Moon sign／Nakshatra',`月亮落座描述情緒與安全感，Nakshatra 再把反應細分到 27 個月宿。工作上影響你如何接收壓力，財運影響你對穩定的取捨，感情影響你要求確認的方式，家庭影響你如何吸收氣氛。`, '連續十日記錄觸發你不安的具體情境，唔好只寫「心情不好」。'],
      ['Bhava 宮位',`Bhava 將行星功能放入工作、收入、伴侶、家庭等生活領域。白話係：同一粒火星落第五宮與第十宮，可能分別牽動創作戀愛或事業競爭，不能只讀星體名稱。`, '選一個最關心的 Bhava，列出一件現實事件作對照。'],
      ['Dasha／Transit',`Dasha 提供行星主周期，Transit 補充天空當下如何觸發出生盤；兩者一齊先有時間軸。窗口代表機會密度，不代表必然發生。`, '以 14 日小測試驗證目前周期：記錄邀請、阻力、成本及結果。']
    ],
    meihua:[
      ['本卦／體用',`本卦係當下局面，體代表你或主體，用代表外部條件。兩者生剋描述你係得到支援、被消耗，定係需要先守住自己；工作、財運、感情及家庭都要按「誰是體、誰是用」重新落地。`, '把問題重寫成「我與哪個外部條件互動」，避免問空泛吉凶。'],
      ['互卦／內部過程',`互卦由本卦中間爻位重組，常揭示表面事件底下真正卡住的過程。工作可能是流程，財運可能是條款，感情可能是期待落差，家庭可能是長期未講清楚的責任。`, '找出一個你一直重複講、但從未落實的條件。'],
      ['動爻／變卦',`動爻係最需要處理的變化位，變卦係行動後可能出現的方向。它不是預言結局，而是提醒你先改哪個環節、避免哪個代價。`, '只做一個低成本、可撤回的小改動，觀察一週後回應。'],
      ['卦象時間',`梅花適合把起卦當刻的結構轉成短中期觀察；窗口按動爻位置看起步、中段或後段，唔可當成指定日期。`, '在 1–3 星期內記錄限制有冇解除，冇證據就唔擴大投入。']
    ],
    liuren:[
      ['香港起課時間',`小六壬今次只用香港當下陽曆時間，再換算農曆月、日、時辰；你出生日期唔會代替起課時間。它回答的是「此刻應快、等、避開，還是補資料」。`, '先核對香港時間與起課紀錄，再決定要不要回覆或出手。'],
      ['月上起日',`由農曆月份落到日位，係事情由背景進入當日狀態的第一層。落到工作是流程是否已齊，財運是付款條件，感情是對話氣氛，家庭是誰正在承擔當下責任。`, '只核對一項當日條件，唔好用六神代替完整事實。'],
      ['日上起時',`由日位推到時辰，最後落在大安、留連、速喜、赤口、小吉或空亡。六神是短課節奏：速喜偏快、留連偏拖、赤口偏口舌，並不等於升職、分手或賺錢。`, '按落宮提示調整速度，保留一個可以退出的選擇。'],
      ['短窗口',`小六壬不負責十年命運，只適合短期驗證。工作看訊息與條件，財運看付款與退款，感情看對方是否回應，家庭看對話是否降溫。`, '起課後 9–30 日內記錄實際變化，再決定是否重新起課。']
    ],
    iching:[
      ['卦辭／象曰',`卦辭講整體方向與限制，象曰用畫面說明應採取的姿態。工作要看程序與位置，財運要看取捨，感情要看互動分寸，家庭要看誰在正確位置負責。`, '將卦辭改寫成一條「可以做」和一條「不要做」。'],
      ['六爻位置',`初爻到上爻不是六個獨立答案，而是事情由起步、發展到收束的層次。動爻位置會改變時間感：初爻先觀察，上爻要小心過度。`, '按動爻所在位置設定 1–2 日、1–3 星期或 1–2 個月驗證期。'],
      ['本卦／變卦',`本卦描述現在，變卦描述採取行動後可能轉向。它可以幫你看工作策略、財務風險、關係回應與家庭分工，但不能替你保證對方或市場一定照劇本走。`, '先驗證本卦指出的限制，再決定是否放大行動。'],
      ['時勢／分寸',`易經最重視「時」與「位」：同一個行動在不同時機、不同位置，結果可以不同。`, '做一個可反悔的小決定，等真實回應出現才進下一步。']
    ],
    qimen:[
      ['局數／節氣',`奇門局數由節氣、陰陽遁與時辰組成，是當刻環境的棋盤。它不直接回答你「命中注定咩」，而是回答此刻環境是否適合出手、等待或轉位。`, '先確認你問的是當下決策，不要用時家局代替出生盤。'],
      ['九宮／方位',`九宮把人、位置及資源分開，讓你看問題卡在空間、權責還是溝通路徑。工作看部署，財運看資金位置，感情看接觸方式，家庭看誰掌握決策。`, '改變一次接觸位置或溝通渠道，再觀察結果。'],
      ['八門／九星／八神',`八門是行動入口，九星是策略氣質，八神是氣氛與干擾；三者同向先算有支援，互相牽制就代表要降低風險，不能單挑一粒吉星。`, '分開寫「我要爭取」與「我要避開」，再選值使對應的一步。'],
      ['值符／值使',`值符代表局勢主導核心，值使代表事情如何落地。工作是權責與流程，財運是資金控制，感情是互動節奏，家庭是唯一決策出口。`, '只做一次低成本試探，帶齊證據，24 小時後再檢查。']
    ],
    cross:[
      ['一致訊號',`綜合解讀不是把八門句子疊埋，而是分清哪些方法真的指向同一個問題。若八字看長期承擔、紫微看宮位牽連、卦局看短期阻滯同時出現，才可視為重複訊號。`, '列出最多三個一致訊號，逐個找現實證據。'],
      ['矛盾訊號',`出生盤與當下卦局可以不一致：長期適合不代表今日適合，短期順利也不代表長線值得。工作、財運、感情及家庭都要分開處理，不能用平均答案掩蓋矛盾。`, '把最矛盾的一組結果寫成兩個假設，先測試風險較低的一個。'],
      ['時間層',`八字、紫微、印度提供較長時間層；梅花、易經、小六壬、奇門偏向當下局勢。綜合時要把 7 日、1–3 個月及流年分開，避免將短課當成命定劇本。`, '為同一問題設短、中、長三個檢查日期。'],
      ['最後決策',`真正的綜合答案不是「一定會」，而是你在資料、時間、成本及界線都清楚後，仍然可以選擇的下一步。`, '只採取一個可撤回行動，完成後用結果更新判讀。']
    ]
  };
  const rows=data[id]||data.cross;
  return rows.map(([title,body,action])=>`<article class="method-impact-card"><h5>${title}</h5><p>${body}</p><p class="method-action"><b>實際行動：</b>${action}</p></article>`).join('');
};
const section=(title, html)=>`<section class="reading-section"><h4>${title}</h4>${html}</section>`;
const dateWindow=(days=21)=>{const d=new Date();const a=new Date(d.getTime()+86400000),b=new Date(d.getTime()+days*86400000);return `${a.getFullYear()} 年 ${a.getMonth()+1} 月 ${a.getDate()} 日至 ${b.getFullYear()} 年 ${b.getMonth()+1} 月 ${b.getDate()} 日（觀察窗口，不是必然事件）`;};
const baseLead=(title, evidence, line)=>`<div class="reading-lead"><p class="kicker">盤面先出現</p><h3>${esc(title)}</h3><p class="evidence-line">${evidence}</p><p>${line}</p></div>`;
const genericError=(method, result)=>baseLead(`${method} 暫時不能下判斷`,`計算狀態：${esc(result.error)}`,`我唔會用一段似樣嘅形容詞填滿空白。請核對輸入資料後再試。`)+section('目前需要知道',`<p>呢一門依賴完整計算資料；今次沒有成功排出，故不顯示未核實嘅時間窗口或吉凶結論。</p>`);

const buildReading=(id,r,p)=>{
  const q=question(), name=esc(p.name), focus=state.topic;
  if(r.error) return genericError(methods.find(x=>x.id===id)?.name||id,r);
  if(id==='bazi'){
    const rows=r.rows.map(x=>`${x[0]} ${x[1]}`).join(' · '), sig=`${r.dayGan}日主（${r.dayElement}）${r.strength}`;
    return baseLead(`八字｜${sig}`,`${term('四柱','年柱、月柱、日柱、時柱合成出生底盤；不是只睇一粒字。','bazi-four')}：${esc(rows)}`,`你表面上會先處理眼前責任，但${term('日主','代表本人承受及回應事情嘅核心天干；強弱要連月令、根氣及全盤一齊看。','bazi-day')}顯示，你真正煩惱係「我再頂落去，會唔會連選擇權都冇埋？」${name}，呢個問題唔係靠一句「你很堅強」可以解。`)+section(`${term('月令','出生月份所處季節，是判斷日主旺衰與全盤氣勢的第一層。','bazi-month')}｜盤面作用`, `<p>四柱納音：${esc(r.rows.map(x=>x[2]).join('／'))}。五行權重提示：木 ${r.counts.木}／火 ${r.counts.火}／土 ${r.counts.土}／金 ${r.counts.金}／水 ${r.counts.水}。呢個只係讀盤輔助，唔單獨定吉凶。</p><p>${term('十神','按日主同其他天干的生剋及陰陽分類，將資源、輸出、責任、同伴及財務放入同一套語言。','bazi-ten')}：其他天干對你係 ${esc([r.rows[0][1][0],r.rows[1][1][0],r.rows[3][1][0]].map(x=>tenGod(r.dayGan,x)).join('、'))}。白話即係：你要處理嘅唔只係能力，而係邊啲責任值得接。</p>`)+section('工作／財運／感情／家庭等影響',`<div class="impact-grid">${impacts(focus,`日主${r.strength}，盤內${r.relations.length?r.relations.join('、'):'未見所列主要刑沖合'}`)}</div>`)+section(`${term('藏干','地支內藏住嘅天干，代表未浮面嘅資源、習慣同事件背景。','bazi-hidden')}與${term('刑沖合害','地支之間嘅互動：沖偏向變動，合偏向牽連；要看全盤先可判力度。','bazi-rel')}，` ,`<p>${r.relations.length?`目前見到 ${esc(r.relations.join('、'))}，白話係某個關係或安排有拉扯，唔等於一定分開或一定轉工。`:'目前未見所列主要組合，應把注意力放返去月令、日主及運勢。'} ${term('大運','約十年一段嘅人生時間層，要配合原局及流年，唔可以單獨當成劇本。','bazi-luck')}：${esc(r.luck)}。</p>`)+section('可能時間窗口',`<p>${term('流年','某一年加入原局嘅背景，適合定策略而唔係宣判命運。','bazi-year')}：2026 先當作年度背景；較近嘅 ${term('流月','一年內按月細分嘅節奏，適合排先後次序。','bazi-month-flow')} 窗口係 ${esc(dateWindow(45))}，用嚟觀察你有冇實際證據支持變動。</p>`)+section('墨川要你而家做',`<p class="action-line">把「${esc(q)}」改寫成兩個可量度答案：一個係你想得到嘅結果，一個係你最多可以承受嘅成本。七日內只做一個小步驟，再返嚟對照盤面。</p>`);
  }
  if(id==='ziwei'){
    const starNames=r.ming?.stars?.slice(0,7)||[], mingName=r.ming?.name||'命宮', guan=r.guan?.stars?.slice(0,4).join('、')||'—',cai=r.cai?.stars?.slice(0,4).join('、')||'—',couple=r.couple?.stars?.slice(0,4).join('、')||'—';
    const stars=starNames.length?starNames.join('、'):'本宮未見已載入星曜';
    state.palaceExplanations.clear();
    const palaceGrid=(r.palaces||[]).map((palace,i)=>{const ps=[...(palace.stars||[])]; state.palaceExplanations.set(String(i),ziweiPalaceText({name:palace.name||`第${i+1}宮`,stars:ps},r)); return `<article class="palace-card"><button class="palace-open" type="button" data-palace="${i}"><span class="palace-index">${String(i+1).padStart(2,'0')}</span><span><b>${esc(palace.name||`第${i+1}宮`)}</b><small>${ps.length?esc(ps.join('、')):'空宮 · 點擊看借對宮解釋'}</small></span><span class="palace-arrow">↗</span></button><div class="palace-stars">${ps.length?ps.map((s,j)=>term(s,ziweiStarExplain(s),`ziwei-star-${i}-${j}`)).join(''):term('空宮','本宮未見主星，需借對宮及三方四正參考；空宮不是沒有事情。',`ziwei-empty-${i}`)}</div></article>`}).join('');
    return baseLead(`紫微斗數｜${mingName}星曜`,`${term('命宮','紫微用命宮看本人核心表現，但仍要連三方四正、福德及運限一齊看。','ziwei-ming')}：${esc(stars)}`,`你表面上似係自己話事，隱藏嗰層其實係好怕一個決定牽連身邊人；你真正煩惱係「我應該照原本條路行，定係承認局勢已經變？」`)+section(`${term('十二宮','十二個生活領域各自承接星曜，不能只看命宮一格。','ziwei-12')}｜逐宮盤面`,`<p>今次排盤實際載入 ${r.palaces?.length||0} 宮。每一格都可以打開完整解釋；星曜名稱亦可以逐粒點擊。${term('三方四正','命宮、財帛、官祿、遷移互相會照嘅骨架，用來看一個主題點樣牽動其他生活面。','ziwei-san')}、${term('四化','化祿看資源與順勢，化權看責任與控制，化科看被看見的方法，化忌看卡點與反覆。','ziwei-sihua')}要放回實際宮位先有意思。</p><div class="palace-grid">${palaceGrid}</div>`)+section('三方四正｜交叉作用',`<p>命宮星曜：${esc(stars)}。官祿宮：${esc(guan)}；財帛宮：${esc(cai)}；夫妻宮：${esc(couple)}。白話係：一個選擇唔會只影響一格，工作安排可能同收入、親密關係及外部環境一齊郁。</p>`)+section('工作／財運／感情／家庭等影響',`<div class="impact-grid">${impacts(focus,`命宮見 ${stars}；三方四正要處理「自己定位」同「別人期待」嘅拉扯`)}</div>`)+section('可能時間窗口',`<p>${term('流年','一年嘅主題盤，指出邊一類事情較易被觸發，唔代表事件百分百發生。','ziwei-year')}：2026 年先作觀察層；由今日起 ${esc(dateWindow(60))}，留意同${esc(focus)}相關嘅人事是否重複出現，再用事實核對。</p>`)+section('墨川要你而家做',`<p class="action-line">先逐格打開命宮、對宮、官祿、財帛及夫妻宮，揀一格最貼近你問題的宮位，記低一件七日內可驗證的事。唔好用一粒星代替整張盤。</p>`);
  }
  if(id==='indian'){
    const planets=r.planets.map(x=>`${x.label} ${x.degree}° ${x.sign}`).join(' · '),active=r.active?`${r.active.lord} · ${r.active.start.toISOString().slice(0,10)}–${r.active.end.toISOString().slice(0,10)}`:'尚未進入已列週期';
    return baseLead(`印度占星｜${r.ascSign} Lagna · ${r.nak}`,`${term('Lagna','出生時刻及地點計出的上升點，代表你如何走入世界及事情如何從外界開始。','india-lagna')} ${r.asc}°（${esc(r.place)}）`,`你表面上反應快，隱藏嗰層係要先確保自己安全先肯投入；你目前真正煩惱係「我係冇機會，定係其實未到可以落注嘅時候？」`)+section(`${term('Moon sign','月亮落座，常用來觀察情緒反應、習慣及安全感。','india-moon')}｜盤面作用`,`<p>七曜黃經（sidereal、Lahiri 近似）：${esc(planets)}。${term('Nakshatra','把黃道分成 27 個月宿，用月亮位置細分情緒模式及時間節奏。','india-nak')}：${esc(r.nak)}（第 ${r.nakIndex}/27）。${term('Bhava','以 Lagna 起算嘅生活宮位，將星體放入工作、關係、家庭等領域。','india-bhava')}：上升落 ${esc(r.ascSign)}，所以事件先由你點樣進場開始。</p><p>${term('Vimshottari Dasha','按月亮月宿分配行星主周期，用來排時間層；不是單靠星座下結論。','india-dasha')}：${esc(active)}。這是週期窗口，不是保證會發生某件事。</p>`)+section('工作／財運／感情／家庭等影響',`<div class="impact-grid">${impacts(focus,`Lagna ${r.ascSign}、月宿 ${r.nak}、目前 Dasha ${r.active?.lord||'未定'}；先處理安全感再放大投入`)}</div>`)+section('星體點樣對應你問嘅事',`<p>火星／土星等實際落點先決定壓力如何呈現；金星偏向關係與價值，木星偏向擴張與學習。呢啲係象徵語言，唔係醫療、投資或法律結論。${term('Transit','當下天空行星相對出生盤嘅移動，用來補充事件何時較容易被觸發。','india-transit')}需在完整行星盤上再核對。</p>`)+section('可能時間窗口',`<p>第一窗口係目前 Dasha：${esc(active)}；第二窗口係起局後 ${esc(dateWindow(30))}，用來觀察同${esc(focus)}相關嘅邀請、阻力或重複模式。時間係機會密度，不係宿命倒數。</p>`)+section('墨川要你而家做',`<p class="action-line">揀一件小事做 14 日測試：記錄實際回應、成本同身體感受。兩星期後有數據，你先知道係時機未到，定係策略要改。</p>`);
  }
  if(id==='meihua'||id==='iching'){
    const label=id==='meihua'?'梅花易數':'易經', moving=r.moving, text=r.mainText||{};
    return baseLead(`${label}｜${r.main}`,`${term('本卦','當下局面嘅主結構；先讀卦象，再按動爻看變化位。',`${id}-main`)}：${esc(r.main)} · ${term('動爻','六條爻中正在變動嘅位置，提示最需要處理嘅環節。',`${id}-move`)} 第 ${moving} 爻`,`你表面上想快啲攞答案，隱藏嗰層係其實已經知道風險，只係想有人替你確認。卦象唔會替你拍板；佢會指出「邊個位」唔可以再含糊。`)+section(`${term('卦辭','一卦嘅總提示，先提供方向同限制，唔係把現代事件逐字預言。',`${id}-judgement`)}｜白話`,`<p>${esc(text.judgement||'本地卦典尚未載入。')}</p><p>${term('象曰','用象徵畫面說明卦嘅氣勢及行動姿態。',`${id}-image`)}：${esc(text.image||'—')}</p><p>起卦依據：${esc(r.basis)}。上卦 ${esc(trigram[r.upper].name)}／下卦 ${esc(trigram[r.lower].name)}，體用要看你問嘅主體同外部條件，而唔係只睇卦名。</p>`)+section('互卦、變卦同盤面作用',`<p>${term('互卦','由本卦中間四爻重組，常用來看事情內部過程。',`${id}-mutual`)}：${esc(r.mutual)}。${term('變卦','把動爻翻轉後得到，表示局勢在行動後可能走向，唔係保證終局。',`${id}-changed`)}：${esc(r.changed)}。</p><p>卦典白話：${esc(r.mutualText?.explain||'互卦資料已計算，需連同問題判斷。')}；變卦提醒：${esc(r.changedText?.explain||'先以動爻所指環節做驗證。')}</p>`)+section('工作／財運／感情／家庭等影響',`<div class="impact-grid">${impacts(focus,`本卦 ${r.main}、動爻第 ${moving} 爻：先處理變動位，再處理大方向`)}</div>`)+section('可能時間窗口',`<p>${moving===1?'初爻：事情仍在起步，先用 1–2 日收集資料':moving<=3?'中前段爻位：先用 1–3 星期觀察對方／環境回應':'後段爻位：先用 1–2 個月檢驗長期代價'}；窗口只係卦象節奏嘅白話化，唔係保證事件到期。</p>`)+section('墨川要你而家做',`<p class="action-line">將「${esc(q)}」寫成一個可反悔、可核對嘅小決定；先驗證 ${esc(r.main)} 所指嘅限制，再考慮放大投入。</p>`);
  }
  if(id==='liuren'){
    const meaning={大安:'事情偏穩，但節奏慢；適合守住基本盤。',留連:'事情有牽連或延宕；先清理卡住嘅人或條件。',速喜:'訊息及進展較快；適合把握短窗口，但仍要核實。',赤口:'口舌及衝突訊號較強；避免即時回覆或硬碰硬。',小吉:'有小助力及可行一步；先從細節落手。',空亡:'訊息未足或落空感重；先補資料，唔好急於定案。'};
    return baseLead(`掐指一算｜${r.god}`,`${term('小六壬','以香港當下陽曆時間起課，再換算農曆月、日、時辰，依六個固定落宮順序推算；唔用起卦數字。','liu-method')}：${esc(r.trace)}`,`我手指最後停喺「${esc(r.god)}」。今次用嘅係香港陽曆 ${esc(r.solarDate)} ${esc(r.solarTime)}，唔係攞你出生日期代替起課時間：${esc(meaning[r.god])}`)+section(`${term('落宮','最後由時辰推到嘅六神位置，是今次問題嘅當下課象。','liu-palace')}｜白話`,`<p>${esc(meaning[r.god])}。計算順序固定為：${esc(r.names.join(' → '))}；香港陽曆 ${esc(r.solarDate)} ${esc(r.solarTime)}，換算農曆月 ${r.month}、日 ${r.day}、時辰數 ${r.hour}。六神係判讀語言，唔係六個獨立預言。</p>`)+section('工作／財運／感情／家庭等影響',`<div class="impact-grid">${impacts(focus,`落宮 ${r.god}；${meaning[r.god]}`)}</div>`)+section('可能時間窗口',`<p>傳統小六壬只提供短課節奏，今次以 ${esc(r.solarDate)} ${esc(r.solarTime)} 香港起課後 ${esc(dateWindow(r.god==='速喜'?9:r.god==='留連'?30:21))} 作驗證窗口；期間記錄實際訊息、延誤或衝突，唔將象意當成已發生事實。</p>`)+section('墨川要你而家做',`<p class="action-line">${r.god==='赤口'?'今日先唔好用情緒回覆重要訊息，隔一晚再核對事實。':r.god==='空亡'?'先補一項缺失資料，再決定要唔要行動。':r.god==='速喜'?'如果有窗口，先做一個小而不可逆風險低嘅行動。':'保留彈性，先完成一個基本步驟，等下一個實際訊號。'}</p>`);
  }
  if(id==='qimen'){
    const c=r.chart, raw=c.raw||{}, order=c.baseOrder||[], rows=order.map(g=>`${g}宮：地 ${raw.diPan?.[g]||'—'}／天 ${raw.tianPan?.[g]||'—'}／星 ${raw.jiuXing?.[g]||'—'}／門 ${raw.baMen?.[g]||'—'}／神 ${raw.baShen?.[g]||'—'}`).join('；');
    return baseLead(`奇門遁甲｜${c.info?.ju||'當時局'}`,`${term('局數','按節氣、陰陽遁及時辰排出的九宮時間結構。','qi-ju')}：${esc(c.info?.jieqi||'—')} · ${esc(c.info?.ju||'—')}`,`你表面上想搵一個最有利方向，隱藏嗰層係唔想再用錯力。奇門可以指出當刻邊個門、星、神較貼近問題，但唔會將風險抹走。`)+section(`${term('九宮','把空間及事件分成九個位置，用來容納天盤、地盤、八門、九星、八神。','qi-palace')}｜實際排局`,`<p>${esc(rows)}</p><p>${term('值符','九星系統嘅主導點，常用來定位局勢核心。','qi-fu')}：${esc(c.info?.fu||'—')}；${term('值使','八門系統嘅主導點，常用來看事情如何落地。','qi-shi')}：${esc(c.info?.shi||'—')}；空亡：${esc(c.info?.kong||'—')}。</p>`)+section('工作／財運／感情／家庭等影響',`<div class="impact-grid">${impacts(focus,`值符 ${c.info?.fu||'—'}、值使 ${c.info?.shi||'—'}；先定主導位置，再揀行動`)}</div>`)+section(`${term('八門','開、休、生、傷、杜、景、死、驚八個行動入口，分別帶出開展、休整、資源、阻力等取向。','qi-gate')}、${term('九星','九個星曜象徵策略氣質，例如天蓬偏風險，天心偏分析；必須連宮位看。','qi-star')}、${term('八神','八個神煞象徵事件的氣氛及助力／干擾層。','qi-god')}`,`<p>盤面作用唔係見到一粒吉星就叫你衝，而係睇門、星、神有冇同一方向支持。今次先記錄 ${esc(c.info?.fu||'—')} 同 ${esc(c.info?.shi||'—')} 對你「${esc(q)}」嘅主題。</p>`)+section('可能時間窗口',`<p>奇門係時家局，先以起局後 24 小時作短窗口，再以 ${esc(dateWindow(7))} 作第二層驗證；期間只做低成本、可撤回嘅測試。</p>`)+section('墨川要你而家做',`<p class="action-line">先將問題拆成「我要爭取咩」同「我要避開咩」，再按值使所指嘅行動節奏做一次試探，記錄真實回應。</p>`);
  }
  if(id==='cross'){
    const b=r.bazi,l=r.liuren,m=r.meihua,i=r.indian,z=r.ziwei; const available=[b,l,m,i,z].filter(x=>x&&!x.error).length;
    return baseLead(`綜合解讀｜${available} 層資料互相對照`,`${term('交叉核對','唔係把八門文字拼埋，而係比較不同方法是否指向同一個問題層。','cross-check')}：出生盤 ${b&&!b.error?'已計算':'未完成'} · 當下卦局 ${l&&!l.error&&m&&!m.error?'已計算':'部分完成'}`,`你真正煩惱唔係要一個神諭，而係想知道下一步應該承擔幾多、等幾耐、同邊個講清楚。八門如果互相矛盾，矛盾本身就係結果：代表你要先補資料，而唔係硬搵吉凶。`)+section(`${term('出生盤','由出生日期、時間及地點計出的長期傾向，八字、紫微及印度各自有不同算法。','cross-birth')} × ${term('當下卦局','以香港起課時間或問題起卦得到嘅短期結構。','cross-now')}｜交叉結果`,`<p>八字：${esc(b?.evidence||b?.error||'未完成')}。小六壬：${esc(l?.god||l?.error||'未完成')}。梅花：${esc(m?.main||m?.error||'未完成')}。印度：${esc(i?.ascSign&&i?.nak?`${i.ascSign} Lagna · ${i.nak}`:i?.error||'未完成')}。紫微：${esc(z?.ming?.stars?.slice(0,4).join('、')||z?.error||'未完成')}。</p><p>目前可落地嘅共通點係：${esc(state.topic)}唔應該只問「得唔得」，而要問「用咩成本、用幾耐、由邊一步開始」。</p>`)+section('工作／財運／感情／家庭等影響',`<div class="impact-grid">${impacts(focus,`綜合盤面未顯示百分百事件；先把${focus}問題拆成資源、界線、時間同回應`)}</div>`)+section('可能時間窗口',`<p>短窗口：${esc(dateWindow(7))}，只驗證訊息及第一步；中窗口：未來 1–3 個月，觀察重複出現嘅人事模式；長窗口：跟出生盤運勢層重新核對。三層唔可以混為一個「你一定會」嘅答案。</p>`)+section('墨川最後講',`<p class="action-line">揀一個低風險、可撤回、七日內完成嘅動作。完成後再回到同一門術數，將實際結果同盤面對照；命理嘅價值係幫你睇清選擇，不係代替你生活。</p>`);
  }
  return '';
};

const renderReading=async id=>{
  const p=profile(); state.method=id; state.terms.clear(); $('#termDrawer').classList.remove('is-open'); $('#termDrawer').setAttribute('aria-hidden','true'); const meta=methods.find(x=>x.id===id), no=methods.findIndex(x=>x.id===id)+1; $('#readingTitle').textContent=meta.name;$('#readingMethodNo').textContent=`0${no} / 08`;$('#readingBackdrop').style.backgroundImage=`linear-gradient(180deg,rgba(3,12,16,.5),rgba(3,12,16,.96)),url("${asset(meta.visual)}")`;$('#guideQuote').textContent='等我把你問緊嘅事，放返入盤面。';$('#readingContent').innerHTML=`<div class="loading-reading"><span class="loader"></span><p>墨川正在按規則排盤……</p></div>`;setScreen('reading');
  const q=question(); let r;
  if(id==='bazi') r=baziCalc(p); else if(id==='ziwei') r=ziweiCalc(p); else if(id==='indian') r=indianCalc(p); else if(id==='meihua') r=meihuaCalc(p,q,'time'); else if(id==='iching') r=meihuaCalc(p,q,'question'); else if(id==='liuren') r=liurenCalc(p); else if(id==='qimen') r=await qimenCalc(p,q); else {const [b,z,i,m,l]=[baziCalc(p),ziweiCalc(p),indianCalc(p),meihuaCalc(p,q,'time'),liurenCalc(p)];r={bazi:b,ziwei:z,indian:i,meihua:m,liuren:l};}
  if(id==='cross'){state.results.set(id,r);$('#readingContent').innerHTML=buildReading(id,r,p);$('#guideQuote').textContent='五種讀法未必講同一把聲；我會先指出邊度一致，邊度要你自己驗證。';} else {state.results.set(id,r);$('#readingContent').innerHTML=buildReading(id,r,p);$('#guideQuote').textContent=r.error?'資料未齊，我唔會扮有答案。':id==='liuren'?`手指停喺 ${r.god}。先看呢個落宮點樣落地。`:`${p.name||'你'}，${meta.name}先指出：${state.topic}唔可以只看一個表面。`;}
  bindTerms(); bindPalaces();
};
const bindTerms=()=>$$('.term-link').forEach(b=>b.addEventListener('click',()=>{const key=b.dataset.term,info=state.terms.get(key),body=info?.explanation||'呢個術語要連同所在宮位、卦位或時間層一齊看。';$('#termName').textContent=info?.label||b.textContent;$('#termBody').textContent=body;$('#termDrawer').classList.add('is-open');$('#termDrawer').setAttribute('aria-hidden','false');}));
const bindPalaces=()=>$$('.palace-open').forEach(b=>b.addEventListener('click',()=>{const body=state.palaceExplanations.get(b.dataset.palace)||'此宮解釋未載入。';$('#termName').textContent=b.querySelector('b')?.textContent||'宮位解釋';$('#termBody').textContent=body;$('#termDrawer').classList.add('is-open');$('#termDrawer').setAttribute('aria-hidden','false');}));
const closeTerm=()=>{$('#termDrawer').classList.remove('is-open');$('#termDrawer').setAttribute('aria-hidden','true');};

const validProfile=idx=>{if(idx===0&&!$('#birthDate').value)return false;if(idx===1&&!$('#birthTime').value&&!state.unknownTime)return false;if(idx===2&&!$('#birthPlace').value)return false;if(idx===3&&!state.gender)return false;return true;};
const init=()=>{
  $('#enterBtn').addEventListener('click',()=>{state.storyIndex=0;renderStory();setScreen('story');});
  $('#storyNext').addEventListener('click',()=>{if(state.storyIndex<storyScenes.length-1){state.storyIndex++;renderStory();}else setScreen('profile');});
  $('#storySkip').addEventListener('click',()=>setScreen('profile'));
  $$('.back-link').forEach(b=>b.addEventListener('click',()=>setScreen(b.dataset.back||'methods')));
  $('#unknownTime').addEventListener('click',()=>{state.unknownTime=true;$('#birthTime').removeAttribute('required');$('#birthTime').value='';$('#profileNext').textContent='以未知時辰繼續  ↗';});
  $$('.gender-choice').forEach(b=>b.addEventListener('click',()=>{state.gender=b.dataset.gender;$$('.gender-choice').forEach(x=>x.classList.toggle('is-selected',x===b));setTimeout(()=>{state.profileIndex=4;$$('.profile-step').forEach(x=>x.classList.toggle('is-active',x.dataset.step==='4'));$('#profileCount').textContent='05 / 05';$('#profileProgress').style.width='100%';},220);}));
  $('#profileNext').addEventListener('click',()=>{if(!validProfile(state.profileIndex))return; if(state.profileIndex<4){state.profileIndex++;$$('.profile-step').forEach(x=>x.classList.toggle('is-active',Number(x.dataset.step)===state.profileIndex));$('#profileCount').textContent=`0${state.profileIndex+1} / 05`;$('#profileProgress').style.width=`${(state.profileIndex+1)*20}%`; if(state.profileIndex===3)return;}else{renderMethods();setScreen('methods');}});
  $$('#topicStrip button').forEach(b=>b.addEventListener('click',()=>{state.topic=b.dataset.topic;$$('#topicStrip button').forEach(x=>x.classList.toggle('is-selected',x===b));}));
  $('#methodGrid').addEventListener('click',e=>{const card=e.target.closest('[data-method]');if(card)renderReading(card.dataset.method);});
  $('#readingBack').addEventListener('click',()=>{closeTerm();renderMethods();setScreen('methods');}); $('#nextMethod').addEventListener('click',()=>{closeTerm();renderMethods();setScreen('methods');}); $('#resetFlow').addEventListener('click',()=>location.reload()); $('#termClose').addEventListener('click',closeTerm);
  renderStory(); $('#momentTime')?.setAttribute('value',nowHK());
};
init();
