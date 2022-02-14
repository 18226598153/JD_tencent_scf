const axios = require('axios').default;
axios.defaults.headers.common['User-Agent'] = 'ScriptableWidgetExtension/185 CFNetwork/1312 Darwin/21.0.0';
axios.interceptors.response.use(response => response.data)

function getName(cookie) {
    return axios.get("https://me-api.jd.com/user_new/info/GetJDUserInfoUnion", { headers: { cookie } }).then(res => {
        if (res.retcode == '1001') {
            console.log('cookie过期')
        } else if (res.retcode == '0' && res.data && res.data.userInfo) {
            return res.data.userInfo.baseInfo.nickname
        }
        return null;
    }).catch((err) => {
        console.log(err)
        return null;
    })
}

module.exports = { getName }