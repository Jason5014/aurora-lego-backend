import { Service } from 'egg';
import { SendSmsRequest } from '@alicloud/dysmsapi20170525';
import { UserProps } from '../model/user';
import { Types } from 'mongoose';

interface GiteeUserData {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  email: string;
}

export default class UserService extends Service {
  public async genToken(user: UserProps & {
    _id: Types.ObjectId;
  }) {
    const { app } = this;
    return app.jwt.sign({ username: user.username, _id: user._id }, app.config.jwt.secret, {
      expiresIn: app.config.jwtExpires,
    });
  }
  /**
   * 通过邮箱创建用户
   * @param payload 待创建的用户
   */
  public async createByEmail(payload: UserProps) {
    const { ctx } = this;
    const { username, password } = payload;
    const hash = await ctx.genHash(password || '');
    const userCreatedData: Partial<UserProps> = {
      username,
      password: hash,
      email: username,
    };
    return ctx.model.User.create(userCreatedData);
  }
  /**
   * 通过用户id查询用户
   * @param id 用户id
   */
  public async findById(id: string) {
    return await this.ctx.model.User.findById(id);
  }
  /**
   * 根据用户名查找用户
   * @param username 用户名
   */
  public async findByUsername(username: string) {
    return await this.ctx.model.User.findOne({ username });
  }
  /**
   * 通过手机号登录
   * @param phoneNumber 手机号
   */
  public async loginByCellphone(phoneNumber: string) {
    const { ctx } = this;
    let user = await this.findByUsername(phoneNumber);
    if (!user) {
      const newUserData: Partial<UserProps> = {
        username: phoneNumber,
        phoneNumber,
        nickName: `lego_${phoneNumber.slice(-4)}`,
        type: 'cellphone',
      };
      user = await ctx.model.User.create(newUserData);
    }
    return this.genToken(user);
  }
  /**
   * 发送验证码短信
   * @param phoneNumber 手机号
   * @param veriCode 验证码
   */
  public async sendSMS(phoneNumber: string, veriCode: string) {
    const { app } = this;
    const sendSMSRequest = new SendSmsRequest({
      phoneNumber,
      signName: 'lego',
      templateCode: 'SMS_123',
      templateParam: JSON.stringify({ code: veriCode }),
    });
    return app.ALClient.sendSms(sendSMSRequest);
  }
  /**
   * 获取 gitee 访问授权的 token
   * @param code gitee 授权码
   */
  public async getGiteeAccessToken(code: string) {
    const { ctx, app } = this;
    const { clientid, secret, redirectURL, authURL } = app.config.oauth.gitee;
    const resp = await ctx.curl(authURL, {
      method: 'POST',
      contentType: 'json',
      dataType: 'json',
      data: {
        code, client_id: clientid, redirect_uri: redirectURL, client_secret: secret,
      },
    });
    return resp.data.access_token;
  }
  /**
   * 通过 token 从 gitee 获取到用户信息
   * @param access_token gitee token
   */
  public async getGiteeUserData(access_token: string) {
    const { ctx, app } = this;
    const { userAPI } = app.config.oauth.gitee;
    const resp = await ctx.curl(`${userAPI}?access_token=${access_token}`, {
      dataType: 'json',
    });
    return resp.data as GiteeUserData;
  }
  public async loginByGitee(code: string) {
    const { ctx } = this;
    // 获取 gitee token
    const access_token = await this.getGiteeAccessToken(code);
    // 获取 gitee 用户信息
    const giteeUserData = await this.getGiteeUserData(access_token);
    const { id, name, avatar_url, email } = giteeUserData;
    const username = `Gitee${id}`;
    let user = await this.findByUsername(username);
    if (!user) {
      const newUserData: Partial<UserProps> = {
        username,
        picture: avatar_url,
        email,
        nickName: name,
        type: 'oauth',
        provider: 'gitee',
        oauthID: String(id),
      };
      user = await ctx.model.User.create(newUserData);
    }
    return this.genToken(user);
  }
}
