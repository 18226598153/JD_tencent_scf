const { MD5 } = require('crypto-js');
const { init } = require('./crypt.js');
const { getName, configAxios, getCookies, getH5stUrl } = require('./jd.js');
const axios = require('axios').default;
// https://jdjoy.jd.com/pet/index
axios.interceptors.request.use(req => {
    if (req.url.includes('jdjoy.jd')) {
        const lkt = new Date().getTime()
        const lks = MD5("q8DNJdpcfRQ69gIx" + lkt).toString();
        req.headers['lkt'] = lkt;
        req.headers['lks'] = lks;
    }
    return req;
});

(async () => {
    const cookies = getCookies();
    for (const cookie of cookies) {
        configAxios({ cookie })
        const name = await getName()
        if (!name) continue;
        console.log(name)


        const configUrl = getH5stUrl({ functionId: "petEnterRoom" })
        const { petFood, petCoin, userSign } = await axios.post(configUrl).then(res => res.data ? res.data : {})
        if (!petCoin) {
            console.log('调用基础信息接口失败...')
            continue;
        }

        newUserSign(userSign)
        console.log(`积分为:${petCoin}, 饲料数量:${petFood}`)


        axios.post(getH5stUrl({ functionId: "petGetPetTaskConfig" })).then(res => {
            // console.log(res)
        })

        // const lkt = new Date().getTime()
        // const lks = "q8DNJdpcfRQ69gIx"+MD5(lkt).toString();
        // axios.get("https://jdjoy.jd.com/common/pet/getTodayFeedInfo?reqSource=h5&invokeKey=q8DNJdpcfRQ69gIx", { headers: { lkt, lks } }).then(res => {
        //     console.log('喂养总数', res)
        // })

        // axios.get("https://jdjoy.jd.com/common/gift/getCheapSale?reqSource=h5&invokeKey=q8DNJdpcfRQ69gIx",{
        //     headers:{
        //         lks: '34d89e6596507be4e27fecb0b476d2b4',
        //         lkt: '1644890704624'
        //     }
        // }).then(res => {
        //     console.log(res)
        // })

    }
})()

// {index:0,records=[]}
function newUserSign(userSign) {
    if (!userSign) return;
    const { index, records } = userSign;
    if (records[index].status == 0) {
        axios.get(`https://jdjoy.jd.com/common/pet/newUserSign?reqSource=h5&invokeKey=q8DNJdpcfRQ69gIx&index=${index}`).then(res => {
            console.log('新用户签到:', res)
        })
    }

}