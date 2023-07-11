import { Controller } from 'egg';
import { version as appVersion } from '../../package.json';

export default class HomeController extends Controller {
  public async index() {
    const { ctx } = this;
    const { status: redisStatus } = ctx.app.redis;
    const { version: dbVersion } = await ctx.app.mongoose.connection.db.command({ buildInfo: 1 });
    ctx.helper.success({ ctx, res: {
      appVersion,
      dbVersion,
      redisStatus,
      env: process.env,
    } });
  }
}
