const { readFileSync, existsSync } = require("fs")

function getEnv(name) {
    if (!name) return null;

    const fromEnv = process.env[name] || process.env[name.toLowerCase()] || process.env[name.toUpperCase()]
    if (fromEnv) return fromEnv.trim();

    const envFile = process.cwd() + "/env.json"
    if (!existsSync(envFile)) return null;

    try {
        const env = JSON.parse(readFileSync(envFile, 'utf-8'))
        let val = env[name] || env[name.toLowerCase()] || env[name.toUpperCase()];
        if (val) val = val.trim()
        return val;
    } catch (error) {
        console.log('读取配置文件失败:', error)
        return null;
    }

}

module.exports = { getEnv }
