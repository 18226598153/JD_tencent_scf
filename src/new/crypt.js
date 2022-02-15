const { Env } = require('../env.js');
const $ = new Env('加解密');
const CryptoJS = require('crypto-js');
const jsdom = $.isNode() ? require('jsdom') : '';
let cookiesArr = [], cookie = '';
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

const JD_API_HOST = 'https://api.m.jd.com/';
function generateFp() {
    let e = "0123456789";
    let a = 13;
    let i = '';
    for (; a--;)
        i += e[Math.random() * e.length | 0];
    return (i + Date.now()).slice(0, 16)
}


let algo = {
    '3adb2': {
        fp:generateFp(),
        enCryptMethodJD:function test(tk,fp,ts,ai,algo){var rd='IDNcFRg1RwOa';var str=`${tk}${fp}${ts}${ai}${rd}`;return algo.SHA256(str)}
    }
}
let h5st = ''

let inited=false;
async function init(){
    if(inited)return;
    await getAlgo('3adb2');
    await jstoken();
    inited=true;
}

async function jstoken() {
    const { JSDOM } = jsdom;
    let resourceLoader = new jsdom.ResourceLoader({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0',
        referrer: "https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu"
    });
    let virtualConsole = new jsdom.VirtualConsole();
    let options = {
        url: "https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu",
        referrer: "https://msitepp-fm.jd.com/rest/priceprophone/priceProPhoneMenu",
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0',
        runScripts: "dangerously",
        resources: resourceLoader,
        includeNodeLocations: true,
        storageQuota: 10000000,
        pretendToBeVisual: true,
        virtualConsole
    };
    // const { window } = new JSDOM(``, options);
    // const jdPriceJs = await downloadUrl("https://js-nocaptcha.jd.com/statics/js/main.min.js")
    const dom = new JSDOM(`<body><script src="https://js-nocaptcha.jd.com/statics/js/main.min.js"></script></body>`, options);
    await $.wait(1000)
    try {
        // window.eval(jdPriceJs)
        // window.HTMLCanvasElement.prototype.getContext = () => {
        //   return {};
        // };
        $.jab = new dom.window.JAB({
            bizId: 'jdjiabao',
            initCaptcha: false
        })
    } catch (e) { }
}

function taskUrl(functionId, body) {
    return {
        url: `${JD_API_HOST}api?appid=siteppM&functionId=${functionId}&forcebot=&t=${Date.now()}`,
        body: `body=${encodeURIComponent(JSON.stringify(body))}&h5st=${encodeURIComponent(h5st)}`,
        headers: {
            "Host": "api.m.jd.com",
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            "Origin": "https://msitepp-fm.jd.com",
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
            "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"),
            "Referer": "https://msitepp-fm.jd.com/",
            "Accept-Encoding": "gzip, deflate, br",
            "Cookie": cookie
        }
    }
}

async function getAlgo(id) {
    let fp = generateFp();
    algo[id].fingerprint = fp;
    const options = {
        "url": `https://cactus.jd.com/request_algo?g_ty=ajax`,
        "headers": {
            'Authority': 'cactus.jd.com',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
            'Content-Type': 'application/json',
            'Origin': 'https://h5.m.jd.com',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Dest': 'empty',
            'Referer': 'https://h5.m.jd.com/',
            'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7'
        },
        'body': JSON.stringify({
            "version": "3.0",
            "fp": fp,
            "appId": id.toString(),
            "timestamp": Date.now(),
            "platform": "web",
            "expandParams": ""
        })
    }
    return new Promise(async resolve => {
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`request_algo 签名参数API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        data = JSON.parse(data);
                        if (data['status'] === 200) {
                            algo[id].token = data.data.result.tk;
                            let enCryptMethodJDString = data.data.result.algo;
                            console.log(enCryptMethodJDString)
                            if (enCryptMethodJDString) algo[id].enCryptMethodJD = new Function(`return ${enCryptMethodJDString}`)();
                            console.log(`获取加密参数成功！`)
                        } else {
                            console.log(`fp: ${fp}`)
                            console.log('request_algo 签名参数API请求失败:')
                        }
                    } else {
                        console.log(`京东服务器返回空数据`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function getSHA256(key, params, dete) {
    let SHA256 = CryptoJS.SHA256(JSON.stringify(params.body)).toString()
    let stringSign = `appid:siteppM&body:${SHA256}&&functionId:${params.functionId}&t:${dete}`
    let hash = CryptoJS.HmacSHA256(stringSign, key);
    let hashInHex = CryptoJS.enc.Hex.stringify(hash);

    return hashInHex;
}

 function getH5st(params = { appid: '3adb2', functionId: '', body: {}, now: new Date() }) {
    let date = params.now, timestamp, key, SHA256;
    timestamp = date.Format("yyyyMMddhhmmssS");
    const code = '3adb2';
    key =  algo[code].enCryptMethodJD(algo[code].token, algo[code].fingerprint, timestamp, code, CryptoJS).toString();
    SHA256 = getSHA256(key, params, date.getTime());
    return `${timestamp};${algo[code].fingerprint};${code};${algo[code].token};${SHA256};3.0;${date.getTime()}`
}

// 20220215111311574;1198928460382227;2bba1;tk02wc6dd1cb118nqdIbbcgMxQ9MInf0sLl9spbl4G4cm7qC13wNYbk4R5avbqhGlQCptYdaOmiwFlWPVs7S7pC328qh;667007642483512b5d6eb4e5b8cff585b73c59249433169818cde213d8161616;3.0;1644894791574

module.exports = { getH5st ,init}