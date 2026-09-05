(() => {
  const button = document.querySelector('#readBtn');
  if (!button) return;
  const signs=['白羊座','金牛座','雙子座','巨蟹座','獅子座','處女座','天秤座','天蠍座','射手座','摩羯座','水瓶座','雙魚座'];
  const nakshatra=['Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati'];
  const lord=['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'],years={Ketu:7,Venus:20,Sun:6,Moon:10,Mars:7,Rahu:18,Jupiter:16,Saturn:19,Mercury:17};
  const coords={香港:[22.3193,114.1694],台北:[25.033,121.5654],臺北:[25.033,121.5654],深圳:[22.5431,114.0579],廣州:[23.1291,113.2644],澳門:[22.1987,113.5439]};
  const val=id=>document.querySelector('#'+id)?.value||'', norm=x=>(x%360+360)%360, sign=x=>signs[Math.floor(norm(x)/30)%12];
  const d9=x=>{const r=Math.floor(norm(x)/30),part=Math.floor((norm(x)%30)/(30/9));return (r+(r%3===0?0:r%3===1?8:4)+part)%12;};
  const add=(d,n)=>new Date(d.getTime()+n*86400000), node=d=>{const t=(d.getTime()-Date.UTC(2000,0,1,12))/(36525*86400000);return norm(125.044555-1934.13626197*t+0.0020762*t*t);};
  function calculate(){
    if(typeof Astronomy==='undefined')throw Error('Astronomy Engine 未載入');
    const birth=val('birthDate'),time=val('birthTime')||'12:00',place=val('birthPlace')||'香港',question=val('question').trim()||'目前最重要的選擇';
    if(!birth||!val('gender'))throw Error('請先填寫出生日期、時間及性別');
    const [year]=birth.split('-').map(Number),date=new Date(`${birth}T${time}:00+08:00`),now=new Date(),ayan=23.85+(year-2000)*0.01396,[lat,lon]=coords[place]||coords.香港,observer=new Astronomy.Observer(lat,lon,0),eclipticLongitude=(body,when)=>Astronomy.Ecliptic(Astronomy.Equator(body,when,observer,true,true).vec).elon;
    const tropical=b=>eclipticLongitude(b,date), sid=b=>norm(tropical(b)-ayan), p={太陽:sid('Sun'),月亮:sid('Moon'),水星:sid('Mercury'),金星:sid('Venus'),火星:sid('Mars'),木星:sid('Jupiter'),土星:sid('Saturn')};
    p.羅喉=norm(node(date)-ayan);p.計都=norm(p.羅喉+180);
    const moon=p.月亮,nak=Math.floor(moon/(360/27)),pada=Math.floor((moon%(360/27))/((360/27)/4))+1;
    const jd=2451545+(date.getTime()-Date.UTC(2000,0,1,12))/86400000,lst=norm(280.46061837+360.98564736629*(jd-2451545)+lon),ob=23.4393*Math.PI/180,phi=lat*Math.PI/180,theta=lst*Math.PI/180,asc=norm(Math.atan2(-Math.cos(theta),Math.sin(theta)*Math.cos(ob)+Math.tan(phi)*Math.sin(ob))*180/Math.PI-ayan),ascSign=Math.floor(asc/30);
    const planets=Object.entries(p).map(([n,d])=>`${n} ${d.toFixed(2)}°（${sign(d)}｜Bhava ${((Math.floor(d/30)-ascSign+12)%12)+1}）`).join('\n');
    const bhava=Array.from({length:12},(_,i)=>`第${i+1}宮：${sign((ascSign+i)*30+15)}`).join('；'),navamsa=Object.entries(p).map(([n,d])=>`${n}→${sign(d9(d)*30+15)}`).join('、');
    const start=lord[nak%9],span=360/27,balance=((span-(moon%span))/span)*years[start]*365.2425;let cursor=date,idx=lord.indexOf(start),active='未能落在週期內';
    for(let k=0;k<9&&active==='未能落在週期內';k++){const L=lord[(idx+k)%9],days=years[L]*365.2425,end=add(cursor,days);if(now>=cursor&&now<end){let sub=lord[(idx+k)%9],subStart=cursor,antar='';for(let j=0;j<9;j++){const S=lord[(idx+k+j)%9],sd=days*years[S]/120,se=add(subStart,sd);if(now>=subStart&&now<se){antar=`${S}（${subStart.toISOString().slice(0,10)}–${se.toISOString().slice(0,10)}）`;break;}subStart=se;}active=`${L}（${cursor.toISOString().slice(0,10)}–${end.toISOString().slice(0,10)}）／Antar：${antar}`;}cursor=end;}
    const transit=['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn'].map(b=>`${b} ${norm(eclipticLongitude(b,now)-(23.85+(now.getFullYear()-2000)*0.01396)).toFixed(1)}°`).join('、');
    return `問題：「${question}」\n\n印度占星完整計算：${birth} ${time} · ${place}（${lat},${lon}）\nLahiri ayanamsa：${ayan.toFixed(2)}°\n\nLagna：${asc.toFixed(2)}°（${sign(asc)}）\n\n${planets}\n\nMoon Nakshatra：${nakshatra[nak]} · Pada ${pada}\n\nBhava（Whole Sign）：${bhava}\n\nNavamsa D9：${navamsa}\n\nVimshottari Dasha：起始 ${start}；出生時餘額約 ${balance.toFixed(1)} 日\n目前 Maha／Antar：${active}\n\n今日 Transit：${transit}\n\n判讀：以 Lagna／Moon、目前 Maha–Antar 及 Transit 交叉處理「${question}」，再落實成可控制行動。\n\n資料層：Lagna、九曜、Whole-Sign Bhava、Nakshatra、Pada、D9、Vimshottari Maha／Antar、Transit\n來源：Astronomy Engine + Lahiri ayanamsa 公式；如作商用，仍應用同一套 Swiss Ephemeris 檔案重算校驗。`;
  }
  window.__indianCalculate=calculate;
  button.addEventListener('click',()=>{if(document.querySelector('.method.active')?.dataset.name!=='印度占星')return;try{document.querySelector('#resultTitle').textContent='印度占星 · 完整計算';document.querySelector('#resultText').textContent=calculate();document.querySelector('#readingPanel').classList.remove('is-open');document.querySelector('#resultCard').classList.add('is-open');}catch(e){document.querySelector('#selectedNote').textContent='印度星曆計算失敗：'+(e?.message||String(e));}});
})();
