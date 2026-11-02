// Three equally likely binary coins per line, six lines from bottom to top.
// RNG injection is for deterministic tests; production requires Web Crypto.
export function castCoins(random=globalThis.crypto){
 if(!random?.getRandomValues)throw Error('此瀏覽器沒有安全隨機來源，未有起卦。');
 const bytes=new Uint8Array(18);random.getRandomValues(bytes);
 const coins=Array.from({length:6},(_,i)=>Array.from(bytes.slice(i*3,i*3+3),b=>2+(b&1)));
 const values=coins.map(row=>row.reduce((a,b)=>a+b,0));
 return {coins,values,lines:values.map(v=>v%2),movingLines:values.flatMap((v,i)=>v===6||v===9?[i+1]:[])};
}
