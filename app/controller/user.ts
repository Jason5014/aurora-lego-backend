import { Controller } from 'egg';
import inputValidate from '../decorator/inputValidate';

const userEmailCreateRule = {
  username: 'email',
  password: { type: 'password', min: 8 },
};

const userPhoneCreateRule = {
  phoneNumber: { type: 'string', format: /^1[3-9]\d{9}$/, message: '手机号码格式错误' },
};

export default class UserController extends Controller {
  /**
   * 发送验证码
   */
  @inputValidate(userPhoneCreateRule, 'userInfoValidateFail')
  async sendVeriCode() {
    const { ctx, app } = this;
    const { phoneNumber } = ctx.request.body;
    // 获取 redis 的数据
    const preVeriCode = await app.redis.get(`phoneVeriCode-${phoneNumber}`);
    if (preVeriCode) {
      return ctx.helper.error({
        ctx, errorType: 'sendVeriCodeFrequentlyInfoFail',
      });
    }
    // 生成 veriCode 并记录到 redis 中
    const veriCode = Math.floor((Math.random() * 9000) + 1000).toString();
    if (app.config.env === 'prod') {
      const resp = await this.service.user.sendSMS(phoneNumber, veriCode);
      if (resp.body.code !== 'OK') {
        return ctx.helper.error({ ctx, errorType: 'sendVeriCodeError', error: resp });
      }
    }
    await app.redis.set(`phoneVeriCode-${phoneNumber}`, veriCode, 'EX', 60);
    ctx.helper.success({ ctx, res: veriCode, msg: '验证码创建成功' });
  }
  /**
   * 通过邮箱创建用户
   */
  @inputValidate(userEmailCreateRule, 'userInfoValidateFail')
  async createByEmail() {
    const { ctx, service } = this;
    const { username } = ctx.request.body;
    const existUser = await service.user.findByUsername(username);
    if (existUser) {
      return ctx.helper.error({ ctx, errorType: 'createUserAlreadyExistsFail', error: existUser });
    }
    const userData = await service.user.createByEmail(ctx.request.body);
    ctx.helper.success({
      ctx, res: userData,
    });
  }
  /**
   * 通过邮箱登录
   */
  @inputValidate(userEmailCreateRule, 'userInfoValidateFail')
  async loginByEmail() {
    const { ctx, service } = this;
    const { username, password } = ctx.request.body;
    const existUser = await service.user.findByUsername(username);
    if (existUser) {
      const verifyPwd = await ctx.compare(password, existUser.password || '');
      if (verifyPwd) {
        // ctx.cookies.set('username', existUser.username, { encrypt: true });
        // ctx.session.username = existUser.username;
        // Registered claims 注册相关的信息
        // Public claims 公共信息：should be unique like email, address or phone_number
        // const token = sign({ username: existUser.username }, app.config.jwt.secret, {
        //   expiresIn: 60 * 60,
        // });
        const token = await service.user.genToken(existUser);
        return ctx.helper.success({ ctx, res: token, msg: '登录成功' });
      }
    }
    return ctx.helper.error({ ctx, errorType: 'loginCheckFail' });
  }
  /**
   * 通过手机号登录
   */
  @inputValidate(userPhoneCreateRule, 'userInfoValidateFail')
  async loginByCellphone() {
    const { ctx, service, app } = this;
    const { phoneNumber, veriCode } = ctx.request.body;
    const preVeriCode = await app.redis.get(`phoneVeriCode-${phoneNumber}`);
    if (veriCode !== preVeriCode) {
      return ctx.helper.error({ ctx, errorType: 'loginVeriCodeIncorrectFail' });
    }
    try {
      const token = await service.user.loginByCellphone(phoneNumber);
      ctx.helper.success({ ctx, res: token, msg: '授权登录成功' });
    } catch (err) {
      ctx.helper.error({ ctx, errorType: 'oauthGiteeError', error: err });
    }
  }
  /**
   * 通过 Gitee 授权登录
   */
  async oauthByGitee() {
    const { ctx, service } = this;
    const { code } = ctx.request.query;
    const token = await service.user.loginByGitee(code);
    ctx.helper.success({ ctx, res: token });
  }
  /**
   * 根据用户id查找用户
   */
  async show() {
    const { ctx, service } = this;
    let error;
    try {
      const userData = await service.user.findById(ctx.params.id);
      if (userData) {
        return ctx.helper.success({
          ctx, res: userData,
        });
      }
    } catch (err) {
      ctx.logger.error(err);
      error = err;
    }
    return ctx.helper.error({
      ctx, errorType: 'userNotExistsFail', error,
    });
  }
  /**
   * 获取当前登录的用户
   */
  async current() {
    const { ctx, service } = this;
    // const username = ctx.cookies.get('username', { encrypt: true });
    // const { username } = ctx.session;
    const userData = await service.user.findByUsername(ctx.state.user.username);
    return ctx.helper.success({ ctx, res: userData });
  }
}
