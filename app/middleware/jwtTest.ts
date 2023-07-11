import { verify } from 'jsonwebtoken';
import { EggAppConfig } from '../../typings/app';
import { Context } from 'egg';

function getTokenValue(ctx: Context) {
  // JWT 格式：Authorization:Bearer tokenxxx
  const { authorization } = ctx.header || {};
  const jwtPatt = /^Bearer/i;
  if (typeof authorization === 'string') {
    const auth = authorization.trim();
    if (jwtPatt.test(auth)) {
      return auth.replace(jwtPatt, '').trim();
    }
  }
  return false;
}

export default (options: EggAppConfig['jwt']) => {
  return async (ctx: Context, next: () => Promise<any>) => {
    // 从 headers 中获取 token
    const token = getTokenValue(ctx);
    if (!token) {
      return ctx.helper.error({
        ctx, errorType: 'loginValidateFail',
      });
    }
    const { secret } = options;
    // 必须传入 secret
    if (!options.secret) {
      throw new Error('secret is not provided!');
    }
    try {
      // 将解析到的信息存储在 ctx.state.user 上
      const decoded = verify(token, secret);
      ctx.state.user = decoded;
      await next();
    } catch (err) {
      return ctx.helper.error({
        ctx, errorType: 'loginValidateFail', error: err,
      });
    }
  };
};
