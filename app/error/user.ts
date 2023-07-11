/**
 * 用户相关的错误类型
 */
const userErrorMessage = {
  userInfoValidateFail: {
    errno: 101001,
    message: '用户信息验证失败',
  },
  createUserAlreadyExistsFail: {
    errno: 101002,
    message: '该邮箱已被注册，请直接登录',
  },
  loginCheckFail: {
    errno: 101003,
    message: '该用户不存在或者密码错误',
  },
  userNotExistsFail: {
    errno: 101004,
    message: '该用户ID不存在',
  },
  loginValidateFail: {
    errno: 101005,
    message: '登录校验失败',
  },
  sendVeriCodeFrequentlyInfoFail: {
    errno: 101006,
    message: '请勿频繁获取短信验证码',
  },
  loginVeriCodeIncorrectFail: {
    errno: 101007,
    message: '验证码不正确',
  },
  sendVeriCodeError: {
    errno: 101008,
    message: '验证码发送失败',
  },
  oauthGiteeError: {
    errno: 101009,
    message: 'Gitee 授权错误',
  },
};

export default userErrorMessage;
