const { main_handler } = require(".");

// 测试时不要直接编辑jdCookie, 将PT_KEY和pt_pin加到计算机环境变量, 防止泄露

// main_handler({
//     TriggerName:"config"
// })

main_handler({
    Message:"jd_angryKoi"
})

// 腾讯部署测试
// 1. 打开src目录
// 2. 忽略.env文件: git update-index --assume-unchanged .env serverless.yml
// 3. 将PT_KEY和PT_PIN加到serverless.yml作为环境变量
// 4. 执行sls deploy