import { Controller } from 'egg';
import { subject } from '@casl/ability';
import { permittedFieldsOf } from '@casl/ability/extra';
import difference from 'lodash/difference';
import assign from 'lodash/fp/assign';
import { GlobalErrorMessageType } from '../error';
import defineRoles from '../roles/roles';

export type ModelMapping = {
  mongoose: string;
  casl: string;
};

export interface IOptions {
  // 自定义 actions
  action?: string;
  // 自定义查询字段的 key，默认是 id
  key?: string;
  // 自定义查询字段的取值
  value?: {
    // 取值的来源，从 ctx.params 上还是从 ctx.request.body
    type?: 'params' | 'body';
    // 取值的字段
    key?: string;
  }
}

const defaultOptions = {
  key: 'id',
  value: { type: 'params', key: 'id' },
};

const caslMethodMapping: Record<string, string> = {
  GET: 'read',
  POST: 'create',
  PATCH: 'update',
  DELETE: 'delete',
};

/**
 * 构造装饰器：用于检查当前用户是否有权限
 * @param modelName model 名称，可以是 mongoose 的 Model 名称，也可以从 casl 和 mongoose 名称的映射
 * @param errorType 错误类型
 * @param options 其他配置选项，如自定义 action 等，具体可以查看上面 IOptions 的类型定义
 */
export default function checkPermission(
  modelName: string | ModelMapping,
  errorType: GlobalErrorMessageType,
  opt?: IOptions,
) {
  const mongoModelName = typeof modelName === 'string' ? modelName : modelName.mongoose;
  const caslModelName = typeof modelName === 'string' ? modelName : modelName.casl;
  const options = assign(defaultOptions, opt || {});
  return function(prototype, key: string, descriptor: PropertyDescriptor) {
    console.log(prototype, key);
    const originalMethod = descriptor.value;
    descriptor.value = async function(...args: any[]) {
      const ctrl = this as Controller;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { ctx } = ctrl;
      // const { id } = ctx.params;
      // const { _id: userId } = ctx.state.user;
      // const certianRecord = await ctx.model[modelName].findOne({ id });
      // if (!certianRecord || certianRecord[userKey].toString() !== userId) {
      //   return ctx.helper.error({ ctx, errorType });
      // }
      const { method } = ctx.request;
      const action = options?.action || caslMethodMapping[method];
      if (!ctx.state?.user) {
        return ctx.helper.error({ ctx, errorType });
      }
      const ability = defineRoles(ctx.state.user);
      const rule = ability.relevantRuleFor(action, caslModelName);
      // 判断规则上是否有对应的查询条件
      let permission = false;
      if (rule?.conditions) {
        const { key, value } = options;
        const query = {
          [key]: (value.type === 'params' ? ctx.params : ctx.request.body)[value.key],
        };
        ctx.logger.info(key, value, query);
        const certianRecord = await ctx.model[mongoModelName].findOne(query).lean();
        permission = ability.can(action, subject(caslModelName, certianRecord));
      } else {
        permission = ability.can(action, caslModelName);
      }
      // 判断规则上是否有对应的受限字段
      let keyPermission = false;
      if (rule?.fields) {
        const fields = permittedFieldsOf(ability, action, caslModelName, {
          fieldsFrom: rule => rule.fields || [],
        });
        if (fields.length) {
          const payloadKeys = Object.keys(ctx.request.body);
          const diffKeys = difference(payloadKeys, fields);
          ctx.logger.info(diffKeys);
          keyPermission = diffKeys.length === 0;
        }
      } else {
        keyPermission = true;
      }
      ctx.logger.info(rule, permission, keyPermission);
      if (!permission || !keyPermission) {
        return ctx.helper.error({ ctx, errorType });
      }
      await originalMethod.apply(this, args);
    };
  };
}
