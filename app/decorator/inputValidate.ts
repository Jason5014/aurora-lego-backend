import { Controller } from 'egg';
import { GlobalErrorMessageType } from '../error';

/**
 * 校验用户输入内容 装饰器
 * @param rules 校验规则
 * @param errorType 错误类型
 */
export default function inputValidate(rules: any, errorType: GlobalErrorMessageType) {
  return function(prototype, key: string, descriptor: PropertyDescriptor) {
    console.log(prototype, key);
    const originalMethod = descriptor.value;
    descriptor.value = function(...args: any[]) {
      const ctrl = this as Controller;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { ctx, app } = ctrl;
      const errors = app.validator.validate(rules, ctx.request.body);
      if (errors) {
        return ctx.helper.error({ ctx, errorType, error: errors });
      }
      return originalMethod.apply(this, args);
    };
  };
}
