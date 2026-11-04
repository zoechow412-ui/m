const hidden={子:'癸',丑:'己癸辛',寅:'甲丙戊',卯:'乙',辰:'戊乙癸',巳:'丙戊庚',午:'丁己',未:'己丁乙',申:'庚壬戊',酉:'辛',戌:'戊辛丁',亥:'壬甲'};
const stems='甲乙丙丁戊己庚辛壬癸';
export function baziStructure(rows,tenGod){
 if(!Array.isArray(rows)||rows.length!==4||rows.some(([,gz])=>!stems.includes(gz?.[0])||!hidden[gz?.[1]]))throw Error('四柱資料不完整');
 const day=rows[2][1][0],month=rows[1][1][1],qi=hidden[month];
 const visible=rows.filter((_,i)=>i!==2).map(([pillar,gz])=>({pillar,stem:gz[0]}));
 const roots=rows.flatMap(([pillar,gz])=>[...hidden[gz[1]]].filter(g=>Math.floor(stems.indexOf(g)/2)===Math.floor(stems.indexOf(day)/2)).map(g=>({pillar,branch:gz[1],stem:g,role:g===hidden[gz[1]][0]?'本氣':'藏氣'})));
 const exposed=[...qi].map(g=>({stem:g,god:tenGod(day,g),pillars:visible.filter(x=>x.stem===g).map(x=>x.pillar)}));
 return {day,month,principal:qi[0],principalGod:tenGod(day,qi[0]),roots,exposed};
}
