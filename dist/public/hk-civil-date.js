// A fixed UTC+08 civil clock for the vendored qimen engine's local-field API.
// Epoch milliseconds remain real instants. No browser/device timezone is read.
const NativeDate=globalThis.Date, offset=8*3600000;
export class HongKongDate extends NativeDate {
 constructor(...args){
  if(args.length>1){const [y,m,d=1,h=0,min=0,s=0,ms=0]=args;super(NativeDate.UTC(y,m,d,h,min,s,ms)-offset);}
  else if(args.length===1)super(args[0]);else super();
 }
 civil(){return new NativeDate(this.getTime()+offset);}
 getFullYear(){return this.civil().getUTCFullYear();}
 getMonth(){return this.civil().getUTCMonth();}
 getDate(){return this.civil().getUTCDate();}
 getDay(){return this.civil().getUTCDay();}
 getHours(){return this.civil().getUTCHours();}
 getMinutes(){return this.civil().getUTCMinutes();}
 getSeconds(){return this.civil().getUTCSeconds();}
 getMilliseconds(){return this.civil().getUTCMilliseconds();}
 getTimezoneOffset(){return -480;}
}
