import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {};
  // 1、给 mongoDB 和 redis 添加访问密码
  // config.mongoose = {
  //   client: {
  //     url: 'backend.aurora.cn',
  //     options: {
  //       dbName: 'aurora',
  //       user: 'jason',
  //       pass: 'pass',
  //     },
  //   },
  // };
  // config.redis = {
  //   client: {
  //     port: 6379,
  //     host: '127.0.0.1',
  //     password: 'pass',
  //     db: 0,
  //   },
  // };
  config.mongoose = {
    url: 'mongodb://aurora-mongo:27017/aurora-backend',
    options: {
      useUnifiedTopology: true,
      user: process.env.MONGO_DB_USERNAME,
      pass: process.env.MONGO_DB_PASSWORD,
    },
  };
  config.redis = {
    client: {
      port: 6379,
      host: 'aurora-redis',
      password: process.env.REDIS_DB_PASSWORD,
    },
  };
  // 2、配置 CORS 允许访问的域名
  config.security = {
    domainWhiteList: [ 'http://aurora.cn', 'http://www.aurora.cn', 'http://backend.aurora.cn' ],
  };
  // 3、配置 jwt token 的过期时间
  config.jwtExpires = '2 days';
  // 4、本地 url 替换
  config.oauth = {
    gitee: {
      redirectURL: 'http://api.aurora.cn/api/user/passport/gitee/callback',
    },
  };
  config.h5BaseUrl = 'http://h5.aurora.cn';
  return config;
};
