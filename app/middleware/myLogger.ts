import { appendFileSync } from 'fs';
import { Context, EggAppConfig } from 'egg';

export default (options: EggAppConfig['myLogger']) => async (ctx: Context, next: () => Promise<any>) => {
  const startTime = Date.now();
  const requestTime = new Date();
  await next();
  const duringTime = Date.now() - startTime;
  if (options.allowMethods.includes(ctx.method)) {
    const logInfo = `${requestTime} - [${ctx.method}]${ctx.request.URL} - ${duringTime}ms\n`;
    appendFileSync('./log.txt', logInfo);
  }
};
