import {calculate} from '../public/qimen-engine.js';
const instant=new Date('2026-11-03T06:01:00Z');
const r=calculate(instant,{type:'三元',method:'时家',location:'香港',purpose:'timezone regression'});
console.log(JSON.stringify({zone:process.env.TZ,localHour:instant.getHours(),info:r.info,error:r.error}));
