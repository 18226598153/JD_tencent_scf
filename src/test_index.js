const { main_handler } = require(".");

// 测试时不要直接编辑jdCookie, 将PT_KEY和pt_pin加到计算机环境变量, 防止泄露

main_handler({
    TriggerName:"config",
    Message:"6",
    async:true,
    // Message:"jd_CheckCK"
})