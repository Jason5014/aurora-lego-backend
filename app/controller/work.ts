import { Controller } from 'egg';
import inputValidate from '../decorator/inputValidate';
import { PopulateOptions } from 'mongoose';
import checkPermission, { ModelMapping } from '../decorator/checkPermission';
import { ChannelProps } from '../model/work';
import { nanoid } from 'nanoid';

const workCreateRules = {
  title: 'string',
};

const channelCreateRules = {
  name: 'string',
};

const channelModalName: ModelMapping = { mongoose: 'Work', casl: 'Channel' };

export interface IndexCondition {
  pageIndex?: number;
  pageSize?: number;
  select?: string | string[];
  populate?: PopulateOptions | (PopulateOptions | string)[];
  customSort?: Record<string, any>;
  find?: Record<string, any>;
}

export default class WorkController extends Controller {
  @inputValidate(workCreateRules, 'workValidateError')
  @checkPermission('Work', 'workNoPermissionFail')
  async createWork() {
    const { ctx, service } = this;
    const workData = await service.work.createEmptyWork(ctx.request.body);
    return ctx.helper.success({ ctx, res: workData, msg: '作品初始化成功' });
  }
  async myList() {
    const { ctx, service } = this;
    const { _id: userId } = ctx.state.user;
    const { title, pageIndex, pageSize, isTemplate } = ctx.request.query;
    const listCondition: IndexCondition = {
      select: 'id author copiedCount coverImg desc title user isHot createAt',
      populate: { path: 'user', select: 'username nickName picture' },
      find: {
        user: userId,
        ...(title && { title: { $regex: title, options: 'i' } }),
        ...(isTemplate && { isTemplate: !!parseInt(isTemplate) }),
      },
      ...(pageIndex && { pageIndex: parseInt(pageIndex) }),
      ...(pageSize && { pageSize: parseInt(pageSize) }),
    };
    const list = await service.work.getList(listCondition);
    ctx.helper.success({ ctx, res: list });
  }
  async templateList() {
    const { ctx, service } = this;
    const { pageIndex, pageSize } = ctx.request.query;
    const listCondition: IndexCondition = {
      select: 'id author copiedCount coverImg desc title user isHot createAt',
      populate: { path: 'user', select: 'username nickName picture' },
      find: { isPublic: true, isTemplate: true },
      ...(pageIndex && { pageIndex: parseInt(pageIndex) }),
      ...(pageSize && { pageSize: parseInt(pageSize) }),
    };
    const list = await service.work.getList(listCondition);
    ctx.helper.success({ ctx, res: list });
  }
  @checkPermission('Work', 'workNoPermissionFail')
  async getWorkById() {
    const { ctx } = this;
    const { id } = ctx.params;
    const work = await ctx.model.Work.findOne({ id }).lean();
    if (work) {
      ctx.helper.success({ ctx, res: work });
    } else {
      ctx.helper.error({ ctx, errorType: 'workNotFoundFail' });
    }
  }
  @checkPermission('Work', 'workNoPermissionFail')
  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const payload = ctx.request.body;
    const res = await ctx.model.Work.findOneAndUpdate({ id }, payload, { new: true }).lean();
    ctx.helper.success({ ctx, res });
  }
  @checkPermission('Work', 'workNoPermissionFail')
  async delete() {
    const { ctx } = this;
    const { id } = ctx.params;
    const res = await ctx.model.Work.findOneAndDelete({ id }).select('_id id title').lean();
    ctx.helper.success({ ctx, res });
  }
  @checkPermission('Work', 'workNoPermissionFail', { action: 'publish' })
  async publish(isTemplate: boolean) {
    const { ctx, service } = this;
    const { id } = ctx.params;
    const url = await service.work.publish(id, isTemplate);
    ctx.helper.success({ ctx, res: { url } });
  }
  async publishWork() {
    await this.publish(false);
  }
  async publishTemplate() {
    await this.publish(true);
  }
  @inputValidate(channelCreateRules, 'channelCreateFail')
  @checkPermission(channelModalName, 'workNoPermissionFail',
    { value: { type: 'body', key: 'workId' } },
  )
  async createChannel() {
    const { ctx } = this;
    const { name, workId } = ctx.request.body;
    const newChannel: ChannelProps = {
      name, id: nanoid(6),
    };
    try {
      const res = await ctx.model.Work.findOneAndUpdate({ id: workId }, { $push: { channels: newChannel } });
      if (!res) throw new Error('work is not found');
      ctx.helper.success({ ctx, res: newChannel });
    } catch (err) {
      ctx.helper.error({ ctx, errorType: 'channelCreateFail', error: err });
    }
  }
  @checkPermission(channelModalName, 'workNoPermissionFail')
  async getWorkChannel() {
    const { ctx } = this;
    const { id } = ctx.params;
    const work = await ctx.model.Work.findOne({ id }).lean();
    if (work) {
      const channels = work.channels || [];
      ctx.helper.success({ ctx, res: { count: channels.length, list: channels } });
    } else {
      return ctx.helper.error({ ctx, errorType: 'workNotFoundFail' });
    }
  }
  @checkPermission(channelModalName, 'workNoPermissionFail', { key: 'channels.id' })
  async updateChannelName() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { name } = ctx.request.body;
    const res = await ctx.model.Work.findOneAndUpdate({ 'channels.id': id }, { $set: { 'channels.$.name': name } });
    if (res) {
      ctx.helper.success({ ctx, res: { name } });
    } else {
      ctx.helper.error({ ctx, errorType: 'channelUpdateFail' });
    }
  }
  @checkPermission(channelModalName, 'workNoPermissionFail', { key: 'channels.id' })
  async deleteChannel() {
    const { ctx } = this;
    const { id } = ctx.params;
    const res = await ctx.model.Work.findOneAndUpdate({ 'channels.id': id }, { $pull: { channels: { id } } }, { new: true });
    if (res) {
      ctx.helper.success({ ctx, res });
    } else {
      ctx.helper.error({ ctx, errorType: 'channelUpdateFail' });
    }
  }
}
