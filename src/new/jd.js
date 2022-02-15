const cookieMap = require('../jdCookie.js');
const { getH5st } = require('./crypt.js');
const axios = require('axios').default;
axios.defaults.headers.common['User-Agent'] = 'ScriptableWidgetExtension/185 CFNetwork/1312 Darwin/21.0.0';
axios.defaults.headers.common['Origin'] = 'https://h5.m.jd.com';
axios.defaults.headers.common['Referer'] = 'https://h5.m.jd.com';
axios.defaults.headers.common['X-Requested-With'] = 'com.jingdong.app.mall';
axios.interceptors.response.use(response => response.data, err => console.log('出现错误:', err.response))

function getCookies() {
    return Object.keys(cookieMap).map(key => cookieMap[key])
}

function configAxios(headers) {
    if (!headers) {
        console.warn('未发现请求头!')
    }
    for (const header in headers) {
        axios.defaults.headers.common[header] = headers[header];
    }
}


function getH5stUrl(option = { appid: '', functionId: '', body: {}, }) {
    if (!option.body) option.body = { invitePin: '', reqSource: "h5" }
    if (!option.appid) option.appid = 'jdchoujiang_h5'
    const now = new Date();
    const time = now.getTime()
    const h5st = encodeURIComponent(getH5st({ ...option, now }));
    return `https://api.m.jd.com/api?client=&clientVersion=&appid=${option.appid}&t=${time}&functionId=${option.functionId}&body=${JSON.stringify(option.body)}&h5st=${h5st}&uuid=${time}`
}

function getName() {
    return axios.get("https://me-api.jd.com/user_new/info/GetJDUserInfoUnion").then(res => {
        if (!res || res.retcode == '1001') {
            console.log('cookie过期')
        } else if (res.retcode == '0' && res.data && res.data.userInfo) {
            return res.data.userInfo.baseInfo.nickname
        }
        return null;
    })
}

module.exports = { getCookies, configAxios, getName, getH5stUrl }