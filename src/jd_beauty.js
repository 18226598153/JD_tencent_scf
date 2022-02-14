/*
美丽研究院
修复+尽量优化为同步执行,减少并发,说不定就减小黑号概率了呢?
https://raw.githubusercontent.com/aTenb/jdOpenSharePicker/master/jd_beautyStudy.js
更新时间:2021-12-03
活动入口：京东app首页-美妆馆-底部中间按钮
20 7,12,19 * * * jd_beautyStudy.js, tag=美丽研究院, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true
 */
const { Env } = require('./env');
const WebSocket = require('ws');
const $ = new Env('美丽研究院');
const notify = $.isNode() ? require('./sendNotify') : '';
console.log('已废弃,能不能用随缘!!!')
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const UA = process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)
$.accountCheck = true;
$.init = false;
let cookiesArr = [], cookie = '', message;
function oc(fn, defaultVal) {
  try {
    return fn()
  } catch (e) {
    return undefined
  }
}
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}
const JD_API_HOST = 'https://api.m.jd.com/client.action';
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {"open-url": "https://bean.m.jd.com/"});
    return;
  }
  if (!$.isNode()) {
    $.msg($.name, 'iOS端不支持websocket，暂不能使用此脚本', '');
    return
  }
  helpInfo = []
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      message = '';
      $.token = '';
      await TotalBean();
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/`, {"open-url": "https://bean.m.jd.com/"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await accountCheck();
      await $.wait(10000)
      if ($.accountCheck) {
        await jdBeauty();
      }
      if ($.accountCheck) {
        helpInfo = $.helpInfo;
      }
    }
  }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })

async function accountCheck() {
  $.hasDone = false;
  console.log(`***检测账号是否黑号***`);
  await getIsvToken()
  await $.wait(10000)
  await getIsvToken2()
  await $.wait(10000)
  await getToken()
  await $.wait(10000)
  if (!$.token) {
    console.log(`\n\n提示：请尝试换服务器ip或者设置"xinruimz-isv.isvjcloud.com"域名直连，或者自定义UA再次尝试(环境变量JD_USER_AGENT)\n\n`)
    $.accountCheck = false;
    return
  }
  let client = new WebSocket(`wss://xinruimz-isv.isvjcloud.com/wss/?token=${$.token}`, null, {
    headers: {
        'user-agent': UA,
    }
  });
  client.onopen = async () => {
    console.log(`美容研究院服务器连接成功`);
    client.send('{"msg":{"type":"action","args":{"source":1},"action":"_init_"}}');
    await $.wait(20000);
    client.send(`{"msg":{"type":"action","args":{"source":1},"action":"get_user"}}`);
    await $.wait(20000);
  };
  client.onmessage = async function (e) {
    if (e.data !== 'pong' && e.data && safeGet(e.data)) {
      let vo = JSON.parse(e.data);
      if (vo.action === "_init_") {
        let vo = JSON.parse(e.data);
        if (vo.msg === "风险用户") {
          $.accountCheck = false;
          // $.init=true;
          client.close();
          console.log(`${vo.msg}，跳过此账号`)
        }
      } else if (vo.action === "get_user") {
        // $.init=true;
        $.accountCheck = true;
        client.close();
        console.log(`${vo.msg}，账号正常`);
      }
    }
    client.onclose = (e) => {
      $.hasDone = true;
      console.log('服务器连接关闭\n');
    };
  }
}

async function jdBeauty() {
  $.hasDone = false
  await mr()
  while (!$.hasDone) {
    await $.wait(10000)
  }
  await showMsg();
}

async function mr() {
  $.coins = 0
  let positionList = ['b1', 'h1', 's1', 'b2', 'h2', 's2']
  $.tokens = []
  $.pos = []
  $.helpInfo = []
  $.needs = []
  let client = new WebSocket(`wss://xinruimz-isv.isvjcloud.com/wss/?token=${$.token}`,null,{
    headers:{
        'user-agent': UA,
    }
  })
  console.log(`wss://xinruimz-isv.isvjcloud.com/wss/?token=${$.token}`)
  client.onopen = async () => {
    console.log(`美容研究院服务器连接成功`);
    client.send('{"msg":{"type":"action","args":{"source":1},"action":"_init_"}}');
    await $.wait(10000);
    client.send(`{"msg":{"type":"action","args":{"source":"meizhuangguandibudaohang"},"action":"stats"}}`)
    await $.wait(10000);
    while (!$.init) {
      client.send(`ping`)
      await $.wait(10000);
    }
    console.log(`\n========生产任务相关========\n`)
    client.send(`{"msg":{"type":"action","args":{},"action":"get_produce_material"}}`)
    await $.wait(20000);
    // 获得正在生产的商品信息
    client.send('{"msg":{"type":"action","args":{},"action":"product_producing"}}')
    await $.wait(20000);
    // 获得可生成的商品列表
    client.send(`{"msg":{"type":"action","args":{"page":1,"num":10},"action":"product_lists"}}`)
    await $.wait(20000);
   // 获得原料生产列表
    for (let pos of positionList) {
        client.send(`{"msg":{"type":"action","args":{"position":"${pos}"},"action":"produce_position_info_v2"}}`)
        await $.wait(20000);
    }
    console.log(`\n========日常任务相关========`)
    client.send(`{"msg":{"type":"action","args":{},"action":"check_up"}}`)
    await $.wait(20000);
    if($.check_up){
      //收集
      client.send(`{"msg":{"type":"action","args":{},"action":"collect_coins"}}`);
      await $.wait(20000);
      //兑换
      client.send(`{"msg":{"type":"action","args":{},"action":"get_benefit"}}`)
      await $.wait(50000);
      //最后做时间最久的日常任务
      client.send(`{"msg":{"type":"action","args":{},"action":"shop_products"}}`)
      await $.wait(20000);
    }
  };
  client.onclose = () => {
    console.log(`本次运行获得美妆币${$.coins}`)
    console.log('服务器连接关闭');
    $.init = true;
    $.hasDone = true;
    for (let i = 0; i < $.pos.length && i < $.tokens.length; ++i) {
      $.helpInfo.push(`{"msg":{"type":"action","args":{"inviter_id":"${$.userInfo.id}","position":"${$.pos[i]}","token":"${$.tokens[i]}"},"action":"employee"}}`)
    }
  };
  client.onmessage = async function (e) {
    if (e.data !== 'pong' && e.data && safeGet(e.data)) {
      let vo = JSON.parse(e.data);
      await $.wait(Math.random()*2000+500);
      console.log(`\n开始任务："${JSON.stringify(vo.action)}`);
      switch (vo.action) {
        case "get_ad":
          console.log(`当期活动：${vo.data.screen.name}`)
          if (vo.data.check_sign_in === 1) {
            // 去签到
            console.log(`去做签到任务`)
            client.send(`{"msg":{"type":"action","args":{},"action":"sign_in"}}`)
            await $.wait(20000);
            client.send(`{"msg":{"action":"write","type":"action","args":{"action_type":1,"channel":2,"source_app":2}}}`)
            await $.wait(20000);
          }
          break
        case "get_user":
          $.userInfo = vo.data
          $.total = vo.data.coins
          if ($.userInfo.newcomer === 0) {
            console.log(`去做新手任务`)
            for (let i = $.userInfo.step; i < 15; ++i) {
              client.send(`{"msg":{"type":"action","args":{},"action":"newcomer_update"}}`)
              await $.wait(20000);
            }
          } else
            $.init = true;
          $.level = $.userInfo.level;
          console.log(`当前美妆币${$.total}，用户等级${$.level}`);
          break;
        case "check_up":
          //获得当前任务状态
          $.taskState = vo.data
          console.log($.taskState)
          $.check_up = true
          // 6-9点签到
          //for (let check_up of vo.data.check_up) {
           // if (check_up['receive_status'] !== 1) {
           //   console.log(`去领取第${check_up.times}次签到奖励`)
           //   client.send(`{"msg":{"type":"action","args":{"check_up_id":${check_up.id}},"action":"check_up_receive"}}`)
           // } else {
           //   console.log(`第${check_up.times}次签到奖励已领取`)
           // }
         // }
          break
        case "shop_products":
          let count = $.taskState.shop_view.length;
          if (count < $.taskState.daily_shop_follow_times) console.log(`\n去做关注店铺任务\n`);
          for (let i = 0; i < vo.data.shops.length && count < $.taskState.daily_shop_follow_times; ++i) {
            const shop = vo.data.shops[i];
            if (!$.taskState.shop_view.includes(shop.id)) {
              count++;
              console.log(`\n去做关注店铺【${shop.name}】`);
              client.send(`{"msg":{"type":"action","args":{"shop_id":${shop.id}},"action":"shop_view"}}`);
              await $.wait(5000);
              client.send(`{"msg":{"action":"write","type":"action","args":{"action_type":6,"channel":2,"source_app":2,"vender":"${shop.vender_id}"}}}`);
              await $.wait(5000);
            }
            await $.wait(10000);
          }
          count = $.taskState.product_adds.length;
          if (count < $.taskState.daily_product_add_times && process.env.FS_LEVEL) console.log(`\n去做浏览并加购任务\n`)
          for (let i = 0; i < vo.data.products.length && count < $.taskState.daily_product_add_times && process.env.FS_LEVEL; ++i) {
            const product = vo.data.products[i];
            if (!$.taskState.product_adds.includes(product.id)) {
              count++;
              console.log(`\n去加购商品【${product.name}】`);
              client.send(`{"msg":{"type":"action","args":{"add_product_id":${product.id}},"action":"add_product_view"}}`);
              await $.wait(5000);
              client.send(`{"msg":{"action":"write","type":"action","args":{"action_type":9,"channel":2,"source_app":2,"vender":"${product.id}"}}}`);
              await $.wait(5000);
              client.send(`{"msg":{"action":"write","type":"action","args":{"action_type":5,"channel":2,"source_app":2,"vender":"${product.id}"}}}`);
              await $.wait(5000);
            }
            await $.wait(10000);
          }
          for (let i = $.taskState.meetingplace_view; i < $.taskState.mettingplace_count; ++i) {
            console.log(`去做第${i + 1}次浏览会场任务`)
            client.send(`{"msg":{"type":"action","args":{"source":1},"action":"meetingplace_view"}}`)
            await $.wait(10000);
          }
          if ($.taskState.today_answered === 0) {
            console.log(`去做每日问答任务`)
            client.send(`{"msg":{"type":"action","args":{"source":1},"action":"get_question"}}`)
            await $.wait(10000);
          }
          break
        case 'newcomer_update':
          if (vo.code === '200' || vo.code === 200) {
            console.log(`第${vo.data.step}步新手任务完成成功，获得${vo.data.coins}美妆币`)
            if (vo.data.step === 15) $.init = true
            if (vo.data.coins) $.coins += vo.data.coins
          } else {
            console.log(`新手任务完成失败，错误信息：${JSON.stringify(vo)}`)
          }
          break
        case 'get_question':
          const questions = vo.data
          let commit = {}
          for (let i = 0; i < questions.length; ++i) {
            const ques = questions[i]
            commit[`${ques.id}`] = parseInt(ques.answers)
          }
          client.send(`{"msg":{"type":"action","args":{"commit":${JSON.stringify(commit)},"correct":${questions.length}},"action":"submit_answer"}}`)
          await $.wait(10000);
          break
        case 'complete_task':
        case 'action':
        case 'submit_answer':
        case "check_up_receive":
        case "shop_view":
        case "add_product_view":
        case "meetingplace_view":
          if (vo.code === '200' || vo.code === 200) {
            console.log(`任务完成成功，获得${vo.data.coins}美妆币`)
            if (vo.data.coins) $.coins += vo.data.coins
            $.total = vo.data.user_coins
          } else {
            console.log(`任务完成失败，错误信息${vo.msg}`)
          }
          break
        case "produce_position_info_v2":
          // console.log(`${Boolean(oc(() => vo.data))};${oc(() => vo.data.material_name) !== ''}`);
          if (vo.data && vo.data.material_name !== '') {
            console.log(`【${oc(() => vo.data.position)}】上正在生产【${oc(() => vo.data.material_name)}】，可收取 ${vo.data.produce_num} 份`)
            if (new Date().getTime() > vo.data.procedure.end_at) {
              console.log(`去收取${oc(() => vo.data.material_name)}`)
              client.send(`{"msg":{"type":"action","args":{"position":"${oc(() => vo.data.position)}","replace_material":false},"action":"material_fetch_v2"}}`)
              await $.wait(5000);
              client.send(`{"msg":{"type":"action","args":{},"action":"to_employee"}}`)
              await $.wait(5000);
              $.pos.push(oc(() => vo.data.position))
            }
          } else {
            if (oc(() => vo.data) && vo.data.valid_electric > 0) {
              console.log(`【${vo.data.position}】上尚未开始生产`)
              let ma
              console.log(`$.needs:${JSON.stringify($.needs)}`);
              if($.needs.length){
                ma = $.needs.pop()
                console.log(`ma:${JSON.stringify(ma)}`);
              } else {
                ma = $.material.base[0]['items'][positionList.indexOf(vo.data.position)];
                console.log(`elsema:${JSON.stringify(ma)}`);
              }
              console.log(`ma booleam${Boolean(ma)}`);
              if (ma) {
                console.log(`去生产${ma.name}`)
                client.send(`{"msg":{"type":"action","args":{"position":"${vo.data.position}","material_id":${ma.id}},"action":"material_produce_v2"}}`)
                await $.wait(5000);
              } else {
                ma = $.material.base[1]['items'][positionList.indexOf(vo.data.position)]
                if (ma) {
                  console.log(`else去生产${ma.name}`)
                  client.send(`{"msg":{"type":"action","args":{"position":"${vo.data.position}","material_id":${ma.id}},"action":"material_produce_v2"}}`)
                  await $.wait(5000);
                }
              }
            }
            else{
              console.log(`【${vo.data.position}】电力不足`)
            }
          }
          break
        case "material_produce_v2":
          console.log(`【${oc(() => vo.data.position)}】上开始生产${oc(() => vo.data.material_name)}`)
          client.send(`{"msg":{"type":"action","args":{},"action":"to_employee"}}`)
          await $.wait(5000);
          if(oc(() => vo.data.position)){
            $.pos.push(vo.data.position)
          }else{
            console.log(`not exist:${oc(() => vo.data)}`)
          }
          break
        case "material_fetch_v2":
          if (vo.code === '200' || vo.code === 200) {
            console.log(`【${vo.data.position}】收取成功，获得${vo.data.procedure.produce_num}份${vo.data.material_name}\n`);
          } else {
            console.log(`任务完成失败，错误信息${vo.msg}`)
          }
          break
        case "get_package":
          if (vo.code === '200' || vo.code === 200) {
            // $.products = vo.data.product
            $.materials = vo.data.material
            let msg = `仓库信息:`
            for (let material of $.materials) {
              msg += `【${material.material.name}】${material.num}份 `
            }
            console.log(msg)
          } else {
            console.log(`仓库信息获取失败，错误信息${vo.msg}`)
          }
          break
        case "product_lists":
          let need_material = []
          if (vo.code === '200' || vo.code === 200) {
            $.products = vo.data.filter(vo=>vo.level===$.level)
            console.log(`========可生产商品信息========`)
            for (let product of $.products) {
              let num = Infinity
              let msg = ''
              msg += `生产【${product.name}】`
              for (let material of product.product_materials) {
                msg += `需要原料“${material.material.name}${material.num} 份” ` //material.num 需要材料数量
                const ma = $.materials.filter(vo => vo.item_id === material.material_id)[0] //仓库里对应的材料信息
                // console.log(`ma:${JSON.stringify(ma)}`);
                if (ma) {
                  msg += `（库存 ${ma.num} 份）`;
                  num = Math.min(num, Math.trunc(ma.num / material.num)) ;//Math.trunc 取整数部分
                  if(material.num > ma.num){need_material.push(material.material)};
                  // console.log(`num:${JSON.stringify(num)}`);
                } else {
                  if(need_material.findIndex(vo=>vo.id===material.material.id)===-1)
                    need_material.push(material.material)
                  //console.log(`need_material:${JSON.stringify(need_material)}`);
                  msg += `(没有库存)`
                  num = -1000
                }
              }
              if (num !== Infinity && num > 0) {
                msg += `，可生产 ${num}份`
                console.log(msg)
                console.log(`【${product.name}】可生产份数大于0，去生产`)
                //product_produce 产品研发里的生产
                client.send(`{"msg":{"type":"action","args":{"product_id":${product.id},"amount":${num}},"action":"product_produce"}}`)
                await $.wait(10000);
              } else {
                console.log(msg)
                console.log(`【${product.name}】原料不足，无法生产`)
              }
            }
            $.needs = need_material
            // console.log(`product_lists $.needs:${JSON.stringify($.needs)}`);
            console.log(`=======================`)
          } else {
            console.log(`生产信息获取失败，错误信息：${vo.msg}`)
          }
          // await $.wait(5000);
          // client.close();
          break
        case "product_produce":
          if (vo.code === '200' || vo.code === 200) {
            // console.log(`product_produce:${JSON.stringify(vo)}`)
            console.log(`生产成功`)
          } else {
            console.log(`生产信息获取失败，错误信息${vo.msg}`)
          }
          break
        case "collect_coins":
          if (vo.code === '200' || vo.code === 200) {
            // console.log(`product_produce:${JSON.stringify(vo)}`)
            console.log(`收取成功，获得${vo['data']['coins']}美妆币，当前总美妆币：${vo['data']['user_coins']}\n`)
          } else {
            console.log(`收取美妆币失败，错误信息${vo.msg}`)
          }
          break
        case "product_producing":
          if (vo.code === '200' || vo.code === 200) {
            for (let product of vo.data) {
              if (product.num === product.produce_num) {
                client.send(`{"msg":{"type":"action","args":{"log_id":${product.id}},"action":"new_product_fetch"}}`)
                await $.wait(5000);
              } else {
                console.log(`产品【${product.product.id}】未生产完成，无法收取`)
              }
            }
          } else {
            console.log(`生产商品信息获取失败，错误信息${vo.msg}`)
          }
          break
        case "new_product_fetch":
          if (vo.code === '200' || vo.code === 200) {
            console.log(`收取产品【${vo.data.product.name}】${vo.data.num}份`)
          } else {
            console.log(`收取产品失败，错误信息${vo.msg}`)
          }
          break
        // case "get_task":
        //   console.log(`当前任务【${vo.data.describe}】，需要【${vo.data.product.name}】${vo.data.package_stock}/${vo.data.num}份`)
        //   if (vo.data.package_stock >= vo.data.num) {
        //     console.log(`满足任务要求，去完成任务`)
        //     client.send(`{"msg":{"type":"action","args":{"task_id":${vo.data.id}},"action":"complete_task"}}`)
        //   }
        //   break
        case 'get_benefit':
          for (let benefit of vo.data) {
            if (benefit.type === 1) { //type 1 是京豆
              //console.log(`benefit:${JSON.stringify(benefit)}`);
              if(benefit.description === "1 京豆" && parseInt(benefit.day_exchange_count) < 10 && $.total > benefit.coins){
                $timenum = parseInt($.total / benefit.coins);
                if ($timenum > 10) $timenum = 10;
                console.log(`\n可兑换${$timenum}次京豆:`)
                for (let i = 0; i < $timenum; i++){
                  client.send(`{"msg":{"type":"action","args":{"benefit_id":${benefit.id}},"action":"to_exchange"}}`);
                  await $.wait(5000)
                  client.send(`{"msg":{"type":"action","args":{"source":1},"action":"get_user"}}`)
                  await $.wait(5000);
                }
              }
              // console.log(`物品【${benefit.description}】需要${benefit.coins}美妆币，库存${benefit.stock}份`)
              // if (parseInt(benefit.setting.beans_count) === bean && //兑换多少豆 bean500就500豆
              //   $.total > benefit.coins &&
              //   parseInt(benefit.day_exchange_count) < benefit.day_limit) {
              //   console.log(`满足条件，去兑换`)
              //   client.send(`{"msg":{"type":"action","args":{"benefit_id":${benefit.id}},"action":"to_exchange"}}`)
              //   await $.wait(10000)
              // }
            }
          }
          break
        case "to_exchange":
          if(oc(() => vo.data.coins)){
            console.log(`兑换${vo.data.coins/-1000}京豆成功`)
          }else{
            console.log(`兑换京豆失败`)
          }
          break
        case "get_produce_material":
          $.material = vo.data
          break
        case "to_employee":
          console.log(`雇佣助力码【${oc(() => vo.data.token)}】`)
          if(oc(() => vo.data.token)){
            $.tokens.push(vo.data.token)
          }else{
            console.log(`not exist:${oc(() => vo.data)}`)
          }
          break
        case "employee":
          console.log(`${vo.msg}`)
          break
      }
    }
  };
}

function getIsvToken() {
  let config = {
    url: 'https://api.m.jd.com/client.action?functionId=genToken',
    body: 'body=%7B%22to%22%3A%22https%3A%5C/%5C/xinruimz-isv.isvjcloud.com%5C/?channel%3Dmeizhuangguandibudaohang%26collectionId%3D96%26tttparams%3DYEyYQjMIeyJnTG5nIjoiMTE4Ljc2MjQyMSIsImdMYXQiOiIzMi4yNDE4ODIifQ8%253D%253D%26un_area%3D12_904_908_57903%26lng%3D118.7159742308471%26lat%3D32.2010317443041%22%2C%22action%22%3A%22to%22%7D&build=167490&client=apple&clientVersion=9.3.2&openudid=53f4d9c70c1c81f1c8769d2fe2fef0190a3f60d2&osVersion=14.2&partner=apple&rfs=0000&scope=01&sign=b0aac3dd04b1c6d68cee3d425e27f480&st=1610161913667&sv=111',
    headers: {
      'Host': 'api.m.jd.com',
      'accept': '*/*',
      'user-agent': UA,
      'content-type': 'application/x-www-form-urlencoded',
      'Cookie': cookie
    }
  }
  return new Promise(resolve => {
    $.post(config, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${$.name} API请求失败，请检查网路重试`);
          console.log(`${JSON.stringify(err)}`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            $.isvToken = data['tokenKey'];
            console.log(`isvToken:${$.isvToken}`);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function getIsvToken2() {
  let config = {
    url: 'https://api.m.jd.com/client.action?functionId=isvObfuscator',
    body: 'body=%7B%22url%22%3A%22https%3A%5C/%5C/xinruimz-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&build=167490&client=apple&clientVersion=9.3.2&openudid=53f4d9c70c1c81f1c8769d2fe2fef0190a3f60d2&osVersion=14.2&partner=apple&rfs=0000&scope=01&sign=6eb3237cff376c07a11c1e185761d073&st=1610161927336&sv=102&uuid=hjudwgohxzVu96krv/T6Hg%3D%3D',
    headers: {
      'Host': 'api.m.jd.com',
      'accept': '*/*',
      'user-agent': UA,
      'accept-language': 'zh-Hans-JP;q=1, en-JP;q=0.9, zh-Hant-TW;q=0.8, ja-JP;q=0.7, en-US;q=0.6',
      'content-type': 'application/x-www-form-urlencoded',
      'Cookie': cookie
    }
  }
  return new Promise(resolve => {
    $.post(config, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            $.token2 = data['token']
            console.log(`token2:${$.token2}`);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function getToken() {
  let config = {
    url: 'https://xinruimz-isv.isvjcloud.com/api/auth',
    body: JSON.stringify({"token":$.token2,"source":"01"}),
    headers: {
      'Host': 'xinruimz-isv.isvjcloud.com',
      'Accept': 'application/x.jd-school-island.v1+json',
      'Source': '02',
      'Accept-Language': 'zh-cn',
      'Content-Type': 'application/json;charset=utf-8',
      'Origin': 'https://xinruimz-isv.isvjcloud.com',
      'user-agent': UA,
      'Referer': 'https://xinruimz-isv.isvjcloud.com/logined_jd/',
      'Authorization': 'Bearer undefined',
      'Cookie': `IsvToken=${$.isvToken};`
    }
  }
  return new Promise(resolve => {
    $.post(config, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            $.token = data.access_token
            console.log(`$.token ${$.token}`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

function showMsg() {
  return new Promise(resolve => {
    message += `本次运行获得美妆币${$.coins}枚\n当前美妆币${$.total}`;
    $.msg($.name, '', `京东账号${$.index}${$.nickName}\n${message}`);
    resolve()
  })
}

function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
      "headers": {
        "Accept": "application/json,text/plain, */*",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Cookie": cookie,
        "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
        'user-agent': UA,
        }
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === 13) {
              $.isLogin = false; //cookie过期
              return
            }
            if (data['retcode'] === 0) {
              $.nickName = (data['base'] && data['base'].nickname) || $.UserName;
            } else {
              $.nickName = $.UserName
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

function safeGet(data) {
  try {
    if (typeof JSON.parse(data) == "object") {
      return true;
    }
  } catch (e) {
    console.log(e);
    console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
    return false;
  }
}

function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '不要在BoxJS手动复制粘贴修改cookie')
      return [];
    }
  }
}
