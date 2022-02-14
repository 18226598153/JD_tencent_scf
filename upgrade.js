const { existsSync, readdirSync, copyFile } = require("fs");
const { extname } = require("path");
const chalk = require('chalk');
const { execSync, exec } = require("child_process");

const syncDir = __dirname + "/sync";
if (!existsSync(syncDir)) {
    chalk.red('未发现脚本仓库, 取消同步..')
    process.exit();
}

const files = readdirSync(syncDir)
const newFiles=[];
for (const file of files) {
    const ext = extname(file).toLowerCase();
    if (file == 'package.json' || (ext == '.js' && file.startsWith("jd") && file!='jdCookie.js')) {
        const nFile = `${syncDir}/${file}`;
        const oFile = `${__dirname}/src/${file}`;
        const hasOld=existsSync(oFile);
        if (hasOld) {
            console.log(chalk.blue(`更新脚本${file}`))
        } else {
            newFiles.push(file)
        }
        copyFile(nFile, oFile, () => { })
    }
}

for (const file of newFiles) {
    console.log(chalk.green(`新增脚本${file}`))
    exec(`git add src/${file}`)
}