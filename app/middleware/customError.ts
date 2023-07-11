import { Context } from 'egg';

export default () => {
  return async (ctx: Context, next: () => Promise<any>) => {
    try {
      await next();
    } catch (err) {
      const error = err as any;
      if (error?.status === 401) {
        return ctx.helper.error({ ctx, errorType: 'loginValidateFail', error: error.message });
      } else if (ctx.path === '/api/utils/upload') {
        if (error?.status === 400) {
          return ctx.helper.error({ ctx, errorType: 'imageUploadFileFormatFail', error: error.message });
        }
      }
      throw error;
    }
  };
};
