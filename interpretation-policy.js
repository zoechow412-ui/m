// Original adaptation of the analysis order in bazi / bazi-ziwei Skills.
// A reading policy is not a calculation engine or proof of predictive accuracy.
export const readingPolicies = {
 bazi: '八字：依序核對日主、月令、通根、透干、十神與刑沖合害；分開解釋扶抑、調候及格局用神，不能用五行數量代替旺衰。未提供格局、用神或起運計算結果，必須明確標示未計算。只引用已提供的大運流年。',
 ziwei: '紫微：先講命宮、身宮，再核對本宮星曜、三方四正與生年四化。每個宮位及每粒星要分開說明，不得把命宮文字複製到其他宮。大限、流年、流月分層；沒有飛化資料不得編造飛化。空宮不等於沒有影響。',
 meihua: '梅花：分清本卦、互卦、變卦、動爻、體用及生剋；時間起卦以本次記錄時間及曆法為準，不用出生時間代替。象意不是實際事件證據。',
 iching: '易經：先核對本卦、六爻陰陽及全部動爻，再解釋變卦；靜卦不得虛構動爻。卦辭、爻辭、後人解說須區分，不能冒充原文。',
 liuren: '小六壬：只解釋本次月、日、時順推得到的落宮；六宮詞典不等於六個同時結果。說明取數、起點及落點，不得自行改換算法。',
 indian: '印度占星：分開上升、行星、宮位、Nakshatra、Dasha與Transit；不混用回歸黃道和恆星黃道。沒有月宿度數、歲差或分運計算，不能編造應期。',
 qimen: '奇門：依據本次起局時間、局數、陰陽遁、值符值使及相關宮位的門星神干解釋。不得只見吉門就判成功，也不得編造未提供的格局。',
 cross: '綜合：逐一列明各術數的實際依據與限制；同意與矛盾分開列，不把重複訊號計成獨立證據，不用投票聲稱提高準確率。'
};
export function interpretationPolicy(facts) {
 const matches = [['bazi', /八字|日主|四柱/], ['ziwei', /紫微|命宮/], ['meihua', /梅花/], ['iching', /易經|擲幣/], ['liuren', /小六壬/], ['indian', /印度|Dasha|Lagna/], ['qimen', /奇門/], ['cross', /綜合/]];
 const selected = matches.filter(([, pattern]) => pattern.test(facts)).map(([id]) => readingPolicies[id]);
 return selected.join('\n') + '\n先直接回答問題，再交代盤面依據、術語白話意思、生活影響與可執行行動。只分析用戶所問領域，不預設工作。時間窗口必須有已計算的運限依據；缺資料就說明缺甚麼，不自行加7日、14日或60日。不得推斷疾病、胎兒性別、他人內心或保證財富婚姻結果。';
}
