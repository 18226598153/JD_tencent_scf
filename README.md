# 京东薅羊毛脚本(刷京豆)

## 简介

该仓库是刷京东京豆的脚本合集, 每个月能刷2000(抱歉, 忘记具体多少了, 好像少于这个数)左右, 如果你的计算机有安装Docker, 推荐使用[本地部署](#本地部署)方式, 没有就使用[腾讯云函数部署](#腾讯云函数部署).

## 腾讯云函数部署

### 开通云函数服务

创建腾讯云账号, 依次登录 [SCF 云函数控制台](https://console.cloud.tencent.com/scf) 和 [SLS 控制台](https://console.cloud.tencent.com/sls) 开通相关服务，确保账户下已开通服务并创建相应[服务角色](https://console.cloud.tencent.com/cam/role)**SCF_QcsRole、SLS_QcsRole**

> 注意！为了确保权限足够，获取这两个参数时不要使用子账户！此外，腾讯云账户需要[实名认证](https://console.cloud.tencent.com/developer/auth)。

### 配置环境变量

创建github账号, **fork此仓库**或以**此仓库为模板创建仓库**, 仓库建立完成, 在自己账号的项目内依次点击**settings->secrets->Actions**

* 通过点击New repository secret, 分别添加:
  1. TENCENT_SECRET_ID: 进入[腾讯云密钥](https://console.cloud.tencent.com/cam/capi), 点击新建密钥后就会生成**SecretId**和**SecretKey**
  2. TENCENT_SECRET_KEY
  3. PT_KEY和PT_PIN: 登录移动版京东后可从cookie中得到**PT_KEY**和**PT_PIN**, [获取教程](./wiki/GetJdCookie.md)

![](image/README/1644421369528.png)

### 部署

点击Actions->云函数部署, 点击Run workflow, 等待运行完成, 没报错就是部署成功, 访问[腾讯云函数](https://console.cloud.tencent.com/scf/list), 即可查看最新部署的函数

![image](https://user-images.githubusercontent.com/6993269/99513289-6a152980-29c5-11eb-9266-3f56ba13d3b2.png)

### 日志和测试

在左侧栏的日志查询中，可以查看到触发的日志，包括是否打卡成功等。

测试流程:

1. 等待定时任务执行, 之后在触发日志查看运行结果
2. 自己参照图内填写测试脚本名称,不带后缀,测什么,填什么
   ![测试函数](https://user-images.githubusercontent.com/6993269/99628053-5a9eea80-2a70-11eb-906f-f1d5ea2bfa3a.png)

## 本地部署

需要熟悉Docker的使用方式

1. 安装Docker
2. 安装青龙面板(用于定时执行刷京东脚本):

   1. 运行青龙面板Docker镜像: `docker run -dit -v $PWD/ql/config:/ql/config -v $PWD/ql/log:/ql/log -v $PWD/ql/db:/ql/db -p 5600:5600 --name qinglong --hostname qinglong --restart always whyour/qinglong:latest`
   2. 在浏览器访问127.0.0.1:5600, 按照提示完成初始化
3. 在青龙面板**右上角点击新建任务**, 配置:

   - 命令: ql repo https://github.com/cweijan/JD_tencent_scf.git "src"  "icon" "^jd[^_]|USER|sendNotify|sign_graphics_validate|JDJR|JDSign|ql"
   - 定时规则: 50 */2 * * *
     ![img](image/README/1644410122098.png)
4. 配置青龙面板

   - 添加: export PT_KEY=""和export PT_PIN="", [获取方式点这里](./wiki/GetJdCookie.md)
   - 修改GithubProxyUrl为GithubProxyUrl=""
     ![img](image/README/1644421618420.png)
5. 回到定时任务面板, 点击任务的运行按钮, 就会拉取所有的脚本, 并定时执行这些脚本, 也可手动点击脚本旁边的按钮执行.

## 其他文档

- [获取京东cookie](./wiki/GetJdCookie.md)
- [环境变量集合](./wiki/githubAction.md)
- [配置TG机器人](./wiki/TG_PUSH.md)
- [同步代码仓库](./wiki/reposync.md)

## 特别声明

* 本仓库发布的Script项目中涉及的任何解锁和解密分析脚本，仅用于测试和学习研究，禁止用于商业用途，不能保证其合法性，准确性，完整性和有效性，请根据情况自行判断.
* 本项目内所有资源文件，禁止任何公众号、自媒体进行任何形式的转载、发布。
* lxk0301对任何脚本问题概不负责，包括但不限于由任何脚本错误导致的任何损失或损害.
* 间接使用脚本的任何用户，包括但不限于建立VPS或在某些行为违反国家/地区法律或相关法规的情况下进行传播, lxk0301 对于由此引起的任何隐私泄漏或其他后果概不负责.
* 请勿将Script项目的任何内容用于商业或非法目的，否则后果自负.
* 如果任何单位或个人认为该项目的脚本可能涉嫌侵犯其权利，则应及时通知并提供身份证明，所有权证明，我们将在收到认证文件后删除相关脚本.
* 任何以任何方式查看此项目的人或直接或间接使用该Script项目的任何脚本的使用者都应仔细阅读此声明。lxk0301 保留随时更改或补充此免责声明的权利。一旦使用并复制了任何相关脚本或Script项目的规则，则视为您已接受此免责声明.

 **您必须在下载后的24小时内从计算机或手机中完全删除以上内容.**  `</br>`

> ***您使用或者复制了本仓库且本人制作的任何脚本，则视为 `已接受`此声明，请仔细阅读***

## 特别感谢(排名不分先后)：

* [@NobyDa](https://github.com/NobyDa)
* [@chavyleung](https://github.com/chavyleung)
* [@liuxiaoyucc](https://github.com/liuxiaoyucc)
* [@Zero-S1](https://github.com/Zero-S1)
* [@uniqueque](https://github.com/uniqueque)
* [@nzw9314](https://github.com/nzw9314)
* [@JDHelloWorld](https://github.com/JDHelloWorld)
* [@smiek2221](https://github.com/smiek2221)
* [@star261](https://github.com/star261)
* [@Wenmoux](https://github.com/Wenmoux)
* [@Tsukasa007](https://github.com/Tsukasa007)
* [@Aaron](https://github.com/Aaron)
