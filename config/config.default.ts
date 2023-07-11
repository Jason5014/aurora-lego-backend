import path from 'path';
import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
import * as dotenv from 'dotenv';

dotenv.config();

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1660061303558_2294';

  // add your egg config in here
  config.middleware = [ 'myLogger' ];

  config.logger = {
    consoleLevel: 'DEBUG',
  };

  config.mongoose = {
    url: 'mongodb://localhost:27017/aurora-lego-backend',
  };

  config.redis = {
    client: {
      port: 6379,
      host: '127.0.0.1',
      password: '',
      db: 0,
    },
  };

  config.multipart = {
    // mode: 'file', // 默认为 stream 模式
    // tmpdir: path.join(appInfo.baseDir, 'uploads'),
    whitelist: [ '.png', '.jpg', '.jpeg', '.gif', '.webp' ],
    fileSize: '50kb',
  };

  config.static = {
    dir: [
      { prefix: '/public', dir: path.join(appInfo.baseDir, 'app/public') },
      { prefix: '/uploads', dir: path.join(appInfo.baseDir, 'uploads') },
    ],
  };

  // config.cors = {
  //   origin: 'http://backend.aurora.cn',
  //   allowMethods: 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
  // };

  config.bcrypt = {
    saltRounds: 10,
  };

  console.log(process.env.AL_ACCESS_KEY_ID);
  config.oss = {
    client: {
      accessKeyId: process.env.AL_ACCESS_KEY_ID || '',
      accessKeySecret: process.env.AL_ACCESS_KEY_SECRET || '',
      bucket: 'aurora-backend',
      endpoint: 'oss-cn-shanghai.aliyuncs.cn',
    },
  };

  // config.session = {
  //   encrypt: false,
  // };

  config.jwt = {
    secret: process.env.JWT_SECRET || '',
    enable: true,
    match: [ '/api/user/getUserInfo', '/api/works', '/api/utils/upload', '/api/channel' ],
  };

  config.security = {
    csrf: {
      enable: false,
    },
    domainWhiteList: [ 'http://backend.aurora.cn' ],
  };

  config.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.nj': 'nunjucks',
    },
  };

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
    myLogger: {
      allowMethods: [ 'POST' ],
    },
    baseUrl: 'default.url',
    // JWT_secret: '0123456789',
    jwtExpires: '1h',
    aliCloudConfig: {
      accessKeyId: process.env.AL_ACCESS_KEY_ID,
      accessKeySecret: process.env.AL_ACCESS_KEY_SECRET,
      endpoint: 'dysmsapi.aliyuncs.com',
    },
    // 三方应用授权配置
    oauth: {
      gitee: {
        clientid: process.env.GITEE_CLIENT_ID,
        secret: process.env.GITEE_CLIENT_SECRET,
        redirectURL: 'http://backend.aurora.cn/api/user/passport/gitee/callback',
        authURL: 'https://gitee.com/oauth/token?grant_type=authorization_code',
        userAPI: 'https://gitee.com/api/v5/user',
      },
    },
    h5BaseUrl: 'http://backend.aurora.cn/api/pages',
    useOss: false,
  };

  // the return config will combines to EggAppConfig
  return {
    ...config as {},
    ...bizConfig,
  };
};
