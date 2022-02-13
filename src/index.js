const { readFileSync, existsSync } = require('fs')
/**
 * 脚本触发器列表:
 * - config: 每小时候执行一次config.json中配置的脚本, 当前小时和脚本配置的小时一致时, 进行执行
 * - 其他cron: 都是单脚本, argument中指定的就是脚本名称
 * 同异步执行: 每个脚本同步执行, 可在param配置timeout, 异步就是脚本同时执行
 */
exports.main_handler = async (event, context, callback) => {
    console.log(`开始执行: 参数为:${JSON.stringify(event)}`)
    const msg = event.Message;
    let scripts = []
    if (event.TriggerName == 'config') {
        scripts = loadScripts(msg);
    } else {
        if (!msg) {
            console.error('参数为空, 执行失败, 请在message中填入要测试脚本的名称或输入all测试全部...')
            return
        }
        console.log('参数触发方式(不读取配置文件),触发参数:', msg)
        scripts = msg == 'all' ? loadScripts(msg, true) : msg.split("&")
    }
    if (!scripts.length) {
        console.log('No Script to Execute, Exit!')
        return
    }
    ['log', 'warn', 'error', 'debug', 'info'].forEach((methodName) => {
        const originalMethod = console[methodName]
        console[methodName] = (...args) => {
            try {
                throw new Error()
            } catch (error) {
                let stack = error
                    .stack // Grabs the stack trace
                    .split('\n')[2] // Grabs third line
                    .split("/").slice(-1)[0] // Grabs  file name and line number
                stack = `${stack.substring(0, stack.lastIndexOf(':'))}:`
                originalMethod.apply(
                    console,
                    [
                        stack,
                        ...args
                    ]
                )
            }
        }
    })
    for (const script of scripts) {
        console.log(`run script:${script}`)
        const name = './' + script + '.js'
        try {
            require(name)
        } catch (e) {
            console.error(`异步${script}异常:`, e)
        }
    }

}


function loadScripts(msg, includeAll) {
    let now_hour = (new Date().getUTCHours() + 8) % 24
    console.log('hourly config触发,当前:', now_hour)
    if (msg) {
        const hour = Number(event["Message"])
        if (!isNaN(hour) && hour >= 0 && hour <= 23) {
            now_hour = hour
            console.log('hourly config触发,自定义触发小时:', now_hour)
        }
    }
    const config_file = __dirname + '/config.json'
    if (existsSync(config_file)) {
        console.log(`${config_file} 存在`)
    } else {
        console.error(`${config_file} 不存在,结束`)
        process.exit()
    }
    try {
        config = JSON.parse(readFileSync(config_file))
    } catch (e) {
        console.error(`读取配置文件失败:${e}`)
        return []
    }
    const scripts = [];
    for (let script in config) {
        if (includeAll) {
            scripts.push(script)
            continue;
        }
        // console.debug(`script:${script}`)
        const cron = config[script]
        if (typeof cron == 'number') {
            // console.debug(`number param:${cron}`)
            if (now_hour % cron == 0) {
                console.debug(`${script}:数字参数触发`)
                scripts.push(script)
            }
        } else {
            // console.debug(`dict param:${cron}`)
            if (cron.includes && cron.includes(now_hour)) {
                console.debug(`${script}:列表参数触发`)
                scripts.push(script)
            }
        }
    }
    return scripts;
}