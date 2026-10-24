const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const Astronomy=require('../public/astronomy.browser.min.js');
const source=fs.readFileSync(require.resolve('../rebuild.js'),'utf8');
const calcSource=source.slice(source.indexOf('const signs='),source.indexOf('const trigram='));
const context=vm.createContext({window:{Astronomy},Date,Intl});
vm.runInContext(calcSource,context);
const calculate=p=>{context.p=p;return vm.runInContext('indianCalc(p)',context);};
const utc=p=>{context.p=p;return vm.runInContext('birthUtcDate(p)',context);};
const profile={year:1990,month:1,day:2,hour:9,minute:0,place:'香港'};
const difference=(a,b)=>Math.abs((a-b+540)%360-180);
let checks=[];
const test=(name,fn)=>{fn();checks.push(name);};
test('Hong Kong clock converted to UTC',()=>assert.equal(utc(profile).toISOString(),'1990-01-02T01:00:00.000Z'));
test('London daylight saving conversion',()=>assert.equal(utc({...profile,month:7,place:'倫敦'}).toISOString(),'1990-07-02T08:00:00.000Z'));
test('New York daylight saving conversion',()=>assert.equal(utc({...profile,month:7,place:'紐約'}).toISOString(),'1990-07-02T13:00:00.000Z'));
test('Nonexistent DST clock rejected',()=>assert.throws(()=>utc({...profile,year:2024,month:3,day:10,hour:2,minute:30,place:'紐約'})));
test('Ambiguous DST clock rejected',()=>assert.throws(()=>utc({...profile,year:2024,month:11,day:3,hour:1,minute:30,place:'紐約'})));
for(const year of [1990,1996,2020]){
 const p={...profile,year},r=calculate(p),date=utc(p);
 test(year+' all seven apparent planets calculate',()=>{assert.ok(!r.error,r.error);assert.equal(r.planets.length,7);r.planets.forEach(x=>assert.ok(x.lon>=0&&x.lon<360));});
 test(year+' Mercury stays within physical elongation bound',()=>assert.ok(difference(r.planets[2].lon,r.planets[0].lon)<29));
 test(year+' Venus stays within physical elongation bound',()=>assert.ok(difference(r.planets[3].lon,r.planets[0].lon)<49));
 test(year+' Moon-Sun angle matches geocentric pair longitude',()=>assert.ok(difference((r.planets[1].lon-r.planets[0].lon+360)%360,Astronomy.PairLongitude('Moon','Sun',date))<.01));
 test(year+' ascendant lies on eastern horizon',()=>{
  const longitude=(+r.asc+r.ayan)*Math.PI/180;
  const vector=new Astronomy.Vector(Math.cos(longitude),Math.sin(longitude),0,new Astronomy.AstroTime(date));
  const equ= Astronomy.EquatorFromVector(Astronomy.RotateVector(Astronomy.Rotation_ECT_EQD(date),vector));
  const horizon=Astronomy.Horizon(date,new Astronomy.Observer(22.3193,114.1694,0),equ.ra,equ.dec);
  assert.ok(Math.abs(horizon.altitude)<.03,JSON.stringify(horizon));assert.ok(horizon.azimuth<180);
 });
 test(year+' current Dasha encloses today',()=>{assert.ok(r.active);assert.ok(new Date()>=r.active.start&&new Date()<r.active.end);});
}
test('Historical birth has a current period, not a false first period',()=>{const r=calculate({...profile,year:1900});assert.ok(r.active);assert.ok(r.active.start.getFullYear()>1900);});
test('Different birth date gives different Moon and Ascendant',()=>{const a=calculate(profile),b=calculate({...profile,month:4,day:12});assert.notEqual(a.nak,b.nak);assert.notEqual(a.asc,b.asc);});
console.log(JSON.stringify({status:'passed',count:checks.length,checks},null,2));
