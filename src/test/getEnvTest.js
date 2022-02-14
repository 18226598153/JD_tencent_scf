const { getEnv } = require("../getEnv");

// set jd_cookie=1 && node getEnvTest.js 

console.log(getEnv("JD_COOKIE"))
console.log(getEnv("PT_KEY"))
console.log(getEnv("pt_key"))