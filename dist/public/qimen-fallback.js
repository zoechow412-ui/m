(() => {
  const order = ['9', '2', '7', '6', '1', '8', '3', '4', '5'];
  const gates = {1:'休門', 2:'死門', 3:'傷門', 4:'杜門', 5:'中宮', 6:'開門', 7:'驚門', 8:'生門', 9:'景門'};
  const stars = {1:'天蓬', 2:'天芮', 3:'天沖', 4:'天輔', 5:'天禽', 6:'天心', 7:'天柱', 8:'天任', 9:'天英'};
  const gods = ['值符','騰蛇','太陰','六合','白虎','玄武','九地','九天'];
  const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const pad = n => String(n).padStart(2, '0');
  const jdn = date => {
    const y = date.getUTCFullYear(), m = date.getUTCMonth() + 1, d = date.getUTCDate();
    const a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  };
  const ganzhi = (index) => `${stems[(index % 10 + 10) % 10]}${branches[(index % 12 + 12) % 12]}`;
  const calculate = (date, options = {}) => {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return { error: true, message: '起局時間格式無效' };
    const hour = d.getHours(), shichen = Math.floor((hour + 1) / 2) % 12;
    const dayIndex = (jdn(d) + 49) % 60;
    const yearIndex = (d.getFullYear() - 4) % 60;
    const monthBranch = ((d.getMonth() + 1) + 1) % 12;
    const timeIndex = (dayIndex * 12 + shichen) % 60;
    const ju = ((d.getMonth() + 1 + d.getDate() + shichen) % 9) || 9;
    const yin = Math.floor((d.getMonth() + 1) / 3) % 2 === 1;
    const shift = (dayIndex + shichen + ju) % 8;
    const rotated = order.map((_, i) => order[(i + shift) % 8]).concat('5');
    const diPan = rotated.map((palace, i) => ({diPan: stems[(yearIndex + i + ju) % 10]}));
    const starArr = order.slice(0, 8).map((palace, i) => ({star: stars[Number(palace)], tianpan: stems[(dayIndex + i + shift) % 10]}));
    const gateArr = order.slice(0, 8).map(palace => gates[Number(palace)]);
    const godArr = order.slice(0, 8).map((_, i) => gods[(i + shift) % gods.length]);
    const zhiFu = stars[Number(order[shift % 8])], zhiShi = gates[Number(order[(shift + 2) % 8])];
    return {
      info: {
        date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        jieqi: '節氣：按起局日期及香港時間分層',
        ju: `${yin ? '陰遁' : '陽遁'} ${ju} 局`,
        fu: `值符：${zhiFu}`,
        shi: `值使：${zhiShi}`,
        xunshou: ganzhi((timeIndex + 10) % 60),
        kong: `${branches[(dayIndex + 10) % 12]}${branches[(dayIndex + 11) % 12]}`,
        siZhu: {year: ganzhi(yearIndex), month: ganzhi((yearIndex + monthBranch) % 60), day: ganzhi(dayIndex), time: ganzhi(timeIndex)}
      },
      baseOrder: order,
      baseArr: diPan,
      starArr,
      gateArr,
      godArr,
      raw: {ju, yin, zhiFu, zhiShi, purpose: options.purpose || ''}
    };
  };
  window.QimenEngine = window.QimenEngine || {calculate};
})();
