import path from 'path';
import { createWriteStream } from 'fs';
import fs from 'fs/promises';
// import { pipeline } from 'stream/promises';
import { Controller, FileStream } from 'egg';
// import sharp from 'sharp';
import { nanoid } from 'nanoid';
import sendWormhole from 'stream-wormhole';
import Busboy from 'busboy';

export default class UtilsController extends Controller {
  pathToUrl(path: string) {
    const { app } = this;
    return path.replace(app.config.baseDir, app.config.baseUrl);
  }
  /**
   * 使用 busboy 上传多个文件
   */
  uploadFilesUseBusboy() {
    const { ctx, app } = this;
    return new Promise(res => {
      const busboy = Busboy({
        headers: ctx.req.headers,
      });
      const results: Record<string, any> = {};
      busboy.on('file', (fieldname, file, fileInfo) => {
        app.logger.info(fieldname, file, fileInfo);
        const uid = nanoid(6);
        const saveFilePath = path.join(app.config.baseDir, 'uploads', uid + path.extname(fileInfo.filename));
        file.pipe(createWriteStream(saveFilePath));
        file.on('end', () => {
          results[fieldname] = saveFilePath;
        });
      });
      busboy.on('field', (fieldname, val) => {
        app.logger.info(fieldname, val);
        results[fieldname] = val;
      });
      busboy.on('finish', () => {
        app.logger.info('finish');
        res(results);
      });
      ctx.req.pipe(busboy);
    });
  }
  /**
   * 测试 busboy 功能
   */
  async testBusboy() {
    const { ctx } = this;
    const results = await this.uploadFilesUseBusboy();
    ctx.helper.success({ ctx, res: results });
  }
  /**
   * 以文件的形式上传单个文件到服务器本地
   */
  // async fileLocalUpload() {
  //   const { ctx, app } = this;
  //   const { filepath } = ctx.request.files[0];
  //   const imageImpl = sharp(filepath);
  //   const metaData = await imageImpl.metadata();
  //   let url = filepath; // 原图片地址
  //   let thumbnailUrl = url; // 缩略图地址
  //   app.logger.debug(metaData);
  //   // 如果上传图片宽度超过300，将其转化为缩略图
  //   if (metaData.width && metaData.width > 300) {
  //     // 转换规则：/uploads/**/name.png -> /uploads/**/name-thumbnail.png
  //     const { name, ext, dir } = path.parse(filepath);
  //     const thumbnailFilePath = path.join(dir, `${name}-thumbnail${ext}`);
  //     app.logger.debug(thumbnailFilePath);
  //     await imageImpl.resize(300).toFile(thumbnailFilePath);
  //     thumbnailUrl = this.pathToUrl(thumbnailFilePath);
  //   }
  //   // 将服务器上的地址转换为前端访问地址
  //   url = this.pathToUrl(url);
  //   ctx.helper.success({ ctx, res: { url, thumbnailUrl } });
  // }
  /**
   * 以文件流的方式上传单个文件到服务器
   */
  // async fileUploadByStream() {
  //   const { ctx, app } = this;
  //   const stream = await ctx.getFileStream();
  //   const uid = nanoid(6);
  //   const saveFilePath = path.join(app.config.baseDir, 'uploads', uid + path.extname(stream.filename));
  //   const saveThumbnailFilePath = path.join(app.config.baseDir, 'uploads', uid + '_thumbnail' + path.extname(stream.filename));
  //   const writeFileStream = createWriteStream(saveFilePath);
  //   const writeThumbnailStream = createWriteStream(saveThumbnailFilePath);
  //   const saveFilePromise = pipeline(stream, writeFileStream);
  //   const transformer = sharp().resize({ width: 300 });
  //   const saveThumbnailFilePromise = pipeline(stream, transformer, writeThumbnailStream);
  //   try {
  //     await Promise.all([ saveFilePromise, saveThumbnailFilePromise ]);
  //     ctx.helper.success({ ctx, res: { url: this.pathToUrl(saveFilePath), thumbnail: this.pathToUrl(saveThumbnailFilePath) } });
  //   } catch (err) {
  //     return ctx.helper.error({ ctx, errorType: 'imageUploadFail', error: err });
  //   }
  // }
  /**
   * 上传文件到云服务OSS对象存储上
   */
  async uploadToOSS() {
    const { ctx, app } = this;
    const stream = await ctx.getFileStream();
    const uid = nanoid(6);
    const saveOSSPath = path.join('aurora-test', uid + path.extname(stream.filename));
    try {
      const result = await ctx.oss.put(saveOSSPath, stream);
      app.logger.info(result);
      const { name, url } = result;
      ctx.helper.success({ ctx, res: { name, url } });
    } catch (err) {
      await sendWormhole(stream);
      return ctx.helper.error({ ctx, errorType: 'imageUploadFail', error: err });
    }
  }
  /**
   * 上传文件限制大小
   * @param stream 文件流
   * @param filePath 文件路径
   */
  async uploadFileLimit(stream: FileStream, filePath: string) {
    const { ctx, app } = this;
    app.logger.info(stream.truncated, filePath);
    if (app.config.useOss) {
      await ctx.oss.delete(filePath);
    } else {
      await fs.rm(filePath);
    }
    ctx.helper.error({ ctx,
      errorType: 'imageUploadFileSizeLimitFail',
      error: `${stream.filename} reach file size limit ${app.config.multipart.fileSize}!`,
    });
  }
  /**
   * 上传多文件
   */
  async uploadMutipleFiles() {
    const { ctx, app } = this;
    const { fileSize } = app.config.multipart;
    const partIntr = ctx.multipart({
      limits: {
        fileSize: fileSize as number,
      },
    });
    const urls: string[] = [];
    let part: string | FileStream;
    while ((part = await partIntr())) {
      if (Array.isArray(part)) {
        app.logger.info(part);
      } else {
        try {
          const stream = part as FileStream;
          const uid = nanoid(6);
          let savePath;
          if (app.config.useOss) {
            savePath = path.join('aurora-test', uid + path.extname(stream.filename));
            if (stream.truncated) {
              return await this.uploadFileLimit(stream, savePath);
            }
            const result = await ctx.oss.put(savePath, stream);
            urls.push(result.url);
          } else {
            savePath = path.join(app.config.baseDir, 'uploads', uid + path.extname(stream.filename));
            app.logger.info(stream, fileSize);
            if (stream.truncated) {
              return await this.uploadFileLimit(stream, savePath);
            }
            stream.pipe(createWriteStream(savePath));
            urls.push(savePath);
          }
        } catch (err) {
          await sendWormhole(part);
          ctx.helper.error({ ctx, errorType: 'imageUploadFail', error: err });
        }
      }
    }
    ctx.helper.success({ ctx, res: { urls } });
  }
  async renderH5Page() {
    const { ctx } = this;
    const { idAndUuid } = ctx.params;
    this.app.logger.info(ctx.params);
    const [ id, ...rest ] = idAndUuid.split('-');
    const uuid = rest.join('-');
    try {
      const pageData = await this.service.utils.renderToPageData({ id, uuid });
      await ctx.render('page.nj', pageData);
    } catch (err) {
      return ctx.helper.error({ ctx, errorType: 'renderH5PageFail', error: err });
    }
  }
}
