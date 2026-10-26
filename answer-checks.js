const weekdays=text=>[...text.matchAll(/(?:星期|週|周)([一二三四五六日天])/g)].map(m=>m[1]==='天'?'日':m[1]);
/** Reject unsupported certainty and changed weekdays; never rewrite a failed model answer. */
export function validateDraftAnswer(question,answer){
 for(const match of answer.matchAll(/(?:保證|一定|必定)(?:成功|發財|復合|康復|會成功)/g)){const before=answer.slice(Math.max(0,match.index-10),match.index);if(!/唔|不|無|沒|未|並非|不是/.test(before))return '模型將象意講成保證結果，呢次回答未採用。命盤唔能夠保證成功、財富、關係或健康結果；請以實際條件判斷。';}
 if(!/訊息|電郵|短信|草擬|改寫|寫.{0,5}句/.test(question))return null;
 const expected=new Set(weekdays(question)),actual=weekdays(answer);
 if(expected.size&&(actual.length===0||actual.some(d=>!expected.has(d))))return '模型未有保留你指定嘅星期，呢次草稿未採用。可以重新問一次，或者直接沿用你輸入嘅日期；唔會將改錯日期嘅內容當成答案。';
 return null;
}
