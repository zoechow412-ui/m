const weekdays=text=>[...text.matchAll(/(?:星期|週|周)([一二三四五六日天])/g)].map(m=>m[1]==='天'?'日':m[1]);
/** Reject, do not rewrite, drafts which change a weekday explicitly supplied by the user. */
export function validateDraftAnswer(question,answer){
 if(!/訊息|電郵|短信|草擬|改寫|寫.{0,5}句/.test(question))return null;
 const expected=new Set(weekdays(question)),actual=weekdays(answer);
 if(expected.size&&(actual.length===0||actual.some(d=>!expected.has(d))))return '模型未有保留你指定嘅星期，呢次草稿未採用。可以重新問一次，或者直接沿用你輸入嘅日期；唔會將改錯日期嘅內容當成答案。';
 return null;
}
