/**
 * 其他类型报错
 */
const utilsErrorMessage = {
  imageUploadFail: {
    errno: 103001,
    message: '图片上传失败',
  },
  imageUploadFileFormatFail: {
    errno: 103002,
    message: '不能上传文件格式，请上传图片格式',
  },
  imageUploadFileSizeLimitFail: {
    errno: 103003,
    message: '上传图片大小超过限制',
  },
  renderH5PageFail: {
    errno: 103004,
    message: '作品不存在',
  },
};

export default utilsErrorMessage;
