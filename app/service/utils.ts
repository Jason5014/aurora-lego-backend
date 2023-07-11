import { Service } from 'egg';
import LegoComponents from 'lego-components';
import { createSSRApp } from 'vue';
import { renderToString } from '@vue/server-renderer';

export default class UtilsService extends Service {
  propsToStyle(props = {}) {
    return Object.keys(props).map(key => {
      const formatedKey = key.replace(/[A-Z]/g, c => `-${c.toLocaleLowerCase()}`);
      return `${formatedKey}: ${props[key]}`;
    }).join(';');
  }
  pxTovw(components = []) {
    const pxReg = /^(\d+(\.\d+)?)px$/;
    components.forEach((comp: any) => {
      const { props } = comp;
      Object.keys(props || {}).forEach(key => {
        const value = props[key];
        if (typeof value !== 'string') {
          return;
        }
        const matched = value.match(pxReg);
        if (matched) {
          const px = parseFloat(matched[1]);
          const EditorWidth = 375;
          const vw = ((px / EditorWidth) * 100).toFixed(2);
          props[key] = `${vw}vw`;
        }
      });
    });
  }
  async renderToPageData(query: { id: string, uuid: string }) {
    const work = await this.ctx.model.Work.findOne(query).lean();
    if (!work) {
      throw new Error('work is not exist!');
    }
    const { title, desc, content } = work;
    this.pxTovw(content?.components || []);
    const vueApp = createSSRApp({
      data: () => ({ components: content?.components || [] }),
      template: '<final-page :components="components"></final-page>',
    });
    vueApp.use(LegoComponents);
    const html = await renderToString(vueApp);
    const style = this.propsToStyle(content?.props || {});
    return { title, desc, html, style };
  }
}
