import { Service } from 'egg';
import { Types } from 'mongoose';
import { nanoid } from 'nanoid';
import { WorkProps } from '../model/work';
import { IndexCondition } from '../controller/work';

const defaultIndexCondition: Required<IndexCondition> = {
  pageIndex: 0,
  pageSize: 10,
  select: '',
  populate: [ '' ],
  customSort: { createAt: -1 },
  find: {},
};

export default class WorkService extends Service {
  public async createEmptyWork(payload: WorkProps) {
    const { ctx } = this;
    // 获取到当前用户的 id
    const { username, _id } = ctx.state.user;
    // 生成一个独一无二的 URL id
    const uuid = nanoid(6);
    const workCreatedData: Partial<WorkProps> = {
      ...payload,
      user: new Types.ObjectId(_id),
      author: username,
      uuid,
    };
    return await ctx.model.Work.create(workCreatedData);
  }
  public async getList(condition: IndexCondition) {
    const mergedCondition = { ...defaultIndexCondition, ...condition };
    const { pageIndex, pageSize, find, select, populate, customSort } = mergedCondition;
    const skip = pageSize * pageIndex;
    const res = await this.ctx.model.Work
      .find(find)
      .select(select)
      .populate(populate)
      .skip(skip)
      .limit(pageSize)
      .sort(customSort)
      .lean();
    const count = await this.ctx.model.Work.find(find).count();
    return { count, pageIndex, pageSize, list: res };
  }
  async publish(id: number, isTemplate = false) {
    const { ctx, app } = this;
    const { h5BaseUrl } = app.config;
    const payload: Partial<WorkProps> = {
      status: 2,
      latestPublishAt: new Date(),
      ...(isTemplate && { isTemplate: true }),
    };
    const res = await ctx.model.Work.findOneAndUpdate({ id }, payload, { new: true }).lean();
    if (res) {
      const { uuid } = res;
      return `${h5BaseUrl}/p/${id}-${uuid}`;
    }
    return `${h5BaseUrl}/p/404`;
  }
}
