const cookies = require('../jdCookie.js').cookies;
const { getName } = require('./jd.js');
(async () => {
    for (const cookie of cookies) {
        const name = await getName(cookie)
        if (!name) continue;
    }
})()