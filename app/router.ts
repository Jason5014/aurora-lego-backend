import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;
  router.get('/', controller.home.index);
  // router.get('/test/:id', controller.test.index);
  // router.post('/test/:id', controller.test.index);
  // router.get('/dog', controller.test.getDog);
  // router.get('/persons', controller.test.getPersons);
  router.prefix('/api');
  router.get('/test/oauth/gitee', controller.test.oauth);

  // user 用户相关路由
  router.post('/user/create', controller.user.createByEmail);
  router.get('/user/getUserInfo', controller.user.current);
  router.post('/user/loginByEmail', controller.user.loginByEmail);
  router.post('/user/loginByPhoneNumber', controller.user.loginByCellphone);
  router.post('/user/genVeriCode', controller.user.sendVeriCode);
  router.get('/user/passport/gitee/callback', controller.user.oauthByGitee);
  router.get('/user/:id', controller.user.show);

  // works 作品相关路由
  router.post('/works/create', controller.work.createWork);
  router.get('/works/list', controller.work.myList);
  router.get('/works/templates', controller.work.templateList);
  router.get('/works/:id', controller.work.getWorkById);
  router.patch('/works/:id', controller.work.update);
  router.delete('/works/:id', controller.work.delete);
  router.post('/works/publish/:id', controller.work.publishWork);
  router.post('/works/publish-template/:id', controller.work.publishTemplate);

  // channel 频道相关路由
  router.post('/channel/create', controller.work.createChannel);
  router.get('/channel/work/:id', controller.work.getWorkChannel);
  router.patch('/channel/update/:id', controller.work.updateChannelName);
  router.delete('/channel/delete/:id', controller.work.deleteChannel);

  // 其他路由
  router.post('/utils/upload', controller.utils.uploadMutipleFiles);
  router.get('/pages/:idAndUuid', controller.utils.renderH5Page);
};
