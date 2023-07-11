/**
 * 作品相关的错误类型
 */
const workErrorMessage = {
  workValidateError: {
    errno: 102001,
    message: '输入作品信息验证失败',
  },
  workNoPermissionFail: {
    errno: 102002,
    message: '没有权限操作该作品',
  },
  workNotFoundFail: {
    errno: 102003,
    message: '作品未找到',
  },
  channelCreateFail: {
    errno: 102004,
    message: '渠道创建失败',
  },
  channelUpdateFail: {
    errno: 102005,
    message: '渠道名称更新失败',
  },
};

export default workErrorMessage;
