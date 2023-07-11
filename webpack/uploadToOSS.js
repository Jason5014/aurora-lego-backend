/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');
const OSS = require('ali-oss');
const dotenv = require('dotenv');

dotenv.config({
  path: path.join(__dirname, '../.env'),
});

const publicPath = path.join(__dirname, '../app/public');

const client = OSS({
  accessKeyId: process.env.AL_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.AL_ACCESS_KEY_SECRET || '',
  bucket: 'aurora-backend',
  endpoint: 'oss-cn-shanghai.aliyuncs.cn',
});

async function run() {
  const publicFiles = fs.readFileSync(publicPath);
  const files = publicFiles.filter(f => f !== 'page.nj');
  const res = await Promise.all(files.map(async filename => {
    const savedOSSPath = path.join('h5-assets', filename);
    const filePath = path.join(publicPath, filename);
    const { url } = await client.put(savedOSSPath, filePath);
    return url;
  }));
  console.log('上传成功', res);
}

run();
