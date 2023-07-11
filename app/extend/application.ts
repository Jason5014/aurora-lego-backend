import { Application } from 'egg';
import axios, { AxiosInstance } from 'axios';
import Dysmsapi from '@alicloud/dysmsapi20170525';
import * as $OpenApi from '@alicloud/openapi-client';
const AXIOS = Symbol('Application#axios');
const ALClient = Symbol('Application#alclient');

export default {
  echo(msg: string) {
    const that = this as Application;
    console.log(`hello ${msg} ${that.config.name}`);
  },
  get axiosInstance(): AxiosInstance {
    if (!this[AXIOS]) {
      this[AXIOS] = axios.create({
        baseURL: 'http://dog.ceo/',
        timeout: 2000,
      });
    }
    return this[AXIOS];
  },
  get ALClient(): Dysmsapi {
    const app = this as Application;
    const { accessKeyId, accessKeySecret, endpoint } = app.config.aliCloudConfig;
    if (!app[ALClient]) {
      const config = new $OpenApi.Config({
        accessKeyId, accessKeySecret,
      });
      config.endpoint = endpoint;
      app[ALClient] = new Dysmsapi(config);
    }
    return app[ALClient];
  },
};
