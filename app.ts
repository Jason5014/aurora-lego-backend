import { Application, IBoot } from 'egg';

export default class AppBoot implements IBoot {
  private readonly app: Application;
  constructor(app: Application) {
    this.app = app;
    // const { url } = this.app.config.mongoose;
    // assert(url, '[egg-mongoose] mmongoose url is required on config');
    // const db = createConnection(url as string);
    // db.on('connected', () => {
    //   app.logger.info(`[egg-mongoose] ${url} connected successfully`);
    // });
    // app.mongoose = db;
    // app.sessionMap = {};
    // app.sessionStore = {
    //   async get(key) {
    //     // const value = app.sessionMap[key];
    //     const session = await app.model.Session.findOne({ key });
    //     app.logger.info('get session:', key, session?.value);
    //     return session?.value;
    //   },
    //   async set(key, value) {
    //     app.logger.info('set session:', key, value);
    //     // app.sessionMap[key] = value;
    //     await app.model.Session.create({
    //       key, value,
    //     });
    //   },
    //   async destroy(key) {
    //     app.logger.info('destroy session:', key);
    //     // delete app.sessionMap[key];
    //     await app.model.Session.deleteOne({ key });
    //   },
    // };
  }
  configWillLoad(): void {
    // 此时 config 文件已经被读取并合并，但是还未生效
    // 这是应用层修改配置的最后时机
    // console.log('config.baseUrl', this.app.config.baseUrl);
    // this.app.config.coreMiddleware.unshift('myLogger');
    // 添加 customError 中间件到最前面，保证能够捕获到内层所有的报错
    this.app.config.coreMiddleware.push('customError');
  }
  async willReady(): Promise<void> {
    // loader 加载 model 到 app 上
    // 示例：app/model/user.js => app.model.User
    // const modelDir = join(this.app.config.baseDir, 'app/model');
    // this.app.loader.loadToApp(modelDir, 'model', {
    //   caseStyle: 'upper',
    // });
  }
  async didReady(): Promise<void> {
    console.log('middleware', this.app.middleware);
  }
}
