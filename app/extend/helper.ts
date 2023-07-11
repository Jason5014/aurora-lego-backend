import { Context } from 'egg';
import globalErrorMessage, { GlobalErrorMessageType } from '../error';

interface RespType {
  ctx: Context;
  res?: any;
  msg?: string;
}

interface ErrorRespType {
  ctx: Context;
  errorType: GlobalErrorMessageType;
  error?: any;
}

export default {
  success({ ctx, res, msg }: RespType) {
    ctx.body = {
      errno: 0,
      data: res || null,
      message: msg || '请求成功',
    };
    ctx.status = 200;
  },
  error({ ctx, errorType, error }: ErrorRespType) {
    const { errno, message } = globalErrorMessage[errorType];
    ctx.body = {
      errno, message,
      ...(error && { error }),
    };
    ctx.status = 200;
  },
};
