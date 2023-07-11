import { Controller } from 'egg';


export default class TestController extends Controller {
  async index() {
    const { ctx, app } = this;
    // ctx.body = 'Hi, this is a test controller!'
    const params = ctx.params;
    const query = ctx.query;
    const body = ctx.request.body;
    app.echo('jason');
    const dogRes = await app.axiosInstance({
      url: '/api/breeds/image/random',
    });
    ctx.logger.debug('debug info');
    ctx.logger.info('res data', dogRes.data);
    ctx.logger.warn('warning!');
    ctx.logger.error(new Error('whoops!'));
    ctx.helper.success({
      ctx, res: {
        params, query, body,
      },
    });
  }

  async getDog() {
    const { ctx, service } = this;
    const resp = await service.dog.show();
    // ctx.body = resp.message
    // ctx.status = 200
    // await ctx.render('test.nj', { url: resp.message })
    await ctx.render('test.ejs', { url: resp.message });
  }

  async getPersons() {
    const { ctx } = this;
    const { id } = ctx.params;
    const query = ctx.query;
    const body = ctx.request.body;
    const { baseUrl } = ctx.app.config;
    const persons = await ctx.service.dog.showPlayers();
    console.log('persons', persons);
    const resp = {
      query, id, body, baseUrl, persons,
      // mongooseId: ctx.app.mongoose.id,
    };
    ctx.helper.success({ ctx, res: resp });
  }

  async oauth() {
    const { ctx, app } = this;
    const { clientid, redirectURL } = app.config.oauth.gitee;
    ctx.redirect(`https://gitee.com/oauth/authorize?client_id=${clientid}&redirect_uri=${redirectURL}&response_type=code`);
  }
}
