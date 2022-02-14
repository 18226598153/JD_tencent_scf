const { getEnv } = require("./getEnv");

// 账号一ck,例:pt_key=XXX;pt_pin=XXX;
let CookieJDs = [
  // 'pt_key=XXX;pt_pin=XXX'
]
// 判断环境变量里面是否有京东ck

const ptKey = getEnv('PT_KEY')
const ptPin = getEnv('PT_PIN')
const jdCookie = getEnv('JD_COOKIE')

if (ptKey && ptPin) {
  CookieJDs.push(`pt_key=${ptKey};pt_pin=${ptPin}`)
}

if (jdCookie) {
  if (jdCookie.indexOf('&') > -1) {
    console.log(`您的cookie选择的是用&隔开\n`)
    CookieJDs = CookieJDs.concat(jdCookie.split('&'));
  } else if (jdCookie.indexOf('\n') > -1) {
    console.log(`您的cookie选择的是用换行隔开\n`)
    CookieJDs = CookieJDs.concat(jdCookie.split('\n'));
  } else {
    CookieJDs.push(jdCookie)
  }
}

CookieJDs = [...new Set(CookieJDs.filter(item => !!item))]
console.log(`\n====================共有${CookieJDs.length}个京东账号Cookie=========\n`);
console.log(`==================脚本执行- 北京时间(UTC+8)：${new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 + 8 * 60 * 60 * 1000).toLocaleString()}=====================\n`)
if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => { };
for (let i = 0; i < CookieJDs.length; i++) {
  const index = (i + 1 === 1) ? '' : (i + 1);
  exports['CookieJD' + index] = CookieJDs[i].trim();
}
// exports['cookies']=CookieJDs;
