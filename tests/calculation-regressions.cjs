const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{execFileSync}=require('node:child_process');
(async()=>{
 const {castCoins}=await import('../coin-casting.js');
 const c={Date,Intl,console,castCoins};c.window=c;c.self=c;vm.createContext(c);
 for(const f of ['public/lunar.js','public/iztro.min.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c);
 const src=fs.readFileSync('rebuild.js','utf8'),run=s=>vm.runInContext(s,c);
 run(src.slice(src.indexOf('const stemElement='),src.indexOf('const signs=')));
 let godCases=0;for(const d of '甲乙丙丁戊己庚辛壬癸')for(const t of '甲乙丙丁戊己庚辛壬癸'){
  assert.equal(run(`tenGod('${d}','${t}')`),c.LunarUtil.SHI_SHEN[d+t].replaceAll('财','財').replaceAll('伤','傷').replaceAll('杀','殺'));godCases++;
 }
 run(src.slice(src.indexOf('const ziweiCalc='),src.indexOf('const ziweiPalaceMeaning=')));
 let ziweiCases=0;for(const hour of [0,1,22,23])for(const day of [1,2,31]){
  c.p={year:2000,month:1,day,hour,minute:30,gender:'male'};
  const got=run('ziweiCalc(p)');assert.ok(!got.error,got.error);
  const expected=c.iztro.astro.bySolar(`2000-01-${day}`,hour===23?12:Math.floor((hour+1)/2),'男',true,'zh-TW');
  assert.equal(JSON.stringify(got.chart.palaces),JSON.stringify(expected.palaces));ziweiCases++;
 }
 c.fetch=async()=>({ok:true,json:async()=>JSON.parse(fs.readFileSync('public/hexagrams.json','utf8').replace(/^\uFEFF/,''))});
 c.hkNowParts=()=>({year:2026,month:1,day:1,hour:14,minute:0});c.nowHK=()=> '2026-01-01T14:00';c.hkLabel=s=>s.replace('T',' ');
 run(src.slice(src.indexOf('const trigram='),src.indexOf('const ziweiCalc=')));
 assert.equal(await run('hexagramsReady'),true);
 const m=run("meihuaCalc({},'test','time')");assert.ok(!m.error,m.error);
 const l=c.Solar.fromYmdHms(2026,1,1,14,0,0).getLunar(),total=((l.getYear()-4)%12+12)%12+1+Math.abs(l.getMonth())+l.getDay();
 assert.equal(m.upper,total%8||8);
 let coinCases=0;for(let n=0;n<4096;n++){
  let code=n,values=[];for(let i=0;i<6;i++){values.push(6+code%4);code=Math.floor(code/4);}
  const rng={getRandomValues(b){values.forEach((v,i)=>{for(let j=0;j<3;j++)b[i*3+j]=j<v-6?1:0;});return b;}};
  const cast=castCoins(rng);assert.deepEqual(cast.values,values);
  c.draw=cast;const r=run("hexBuild(Number(bitsToTri(draw.lines.slice(3))),Number(bitsToTri(draw.lines.slice(0,3))),draw.movingLines[0]||0,'test',draw.movingLines)");
  const expectedBits=values.map(v=>v===6?1:v===9?0:v%2);c.bits=expectedBits;
  assert.equal(r.changed,run('kuaNames[Number(bitsToTri(bits.slice(3)))-1][Number(bitsToTri(bits.slice(0,3)))-1]'));coinCases++;
 }
 let zoneRows=[];for(const TZ of ['Asia/Hong_Kong','UTC','America/New_York'])zoneRows.push(JSON.parse(execFileSync(process.execPath,['tests/qimen-timezone-probe.mjs'],{env:{...process.env,TZ},encoding:'utf8'})));
 assert.equal(new Set(zoneRows.map(x=>JSON.stringify(x.info))).size,1);assert.equal(zoneRows[0].info.siZhu.time,'乙未');
 assert.ok(src.includes('iching:ichingCalc(),qimen:await qimenCalc(p,q)'));
 console.log(JSON.stringify({status:'passed',tenGodCases:godCases,ziweiBoundaryCases:ziweiCases,coinPatternCases:coinCases,meihuaLunarYearBoundary:true,qimenTimezoneCases:zoneRows.length,sevenMethodAggregation:true},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
