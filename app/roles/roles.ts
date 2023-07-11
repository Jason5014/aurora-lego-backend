import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { Document } from 'mongoose';
import { UserProps } from '../model/user';


export default function defineRoles(user: UserProps & Document) {
  const { can, build } = new AbilityBuilder(createMongoAbility);
  if (user) {
    switch (user.role) {
      case 'admin':
        can('manage', 'all');
        break;
      case 'normal':
      default:
        // 普通用户
        // User: 只能读取自己的信息，以及更新特殊的字段
        can('read', 'User', { _id: user._id });
        can('update', 'User', [ 'nickName', 'picture' ], { _id: user._id });
        // Work: 可以创建，可以更新和删除自己的作品
        can('create', 'Work', [ 'title', 'desc', 'content', 'coverImg' ]);
        can('read', 'Work', { user: user._id });
        can('update', 'Work', [ 'title', 'desc', 'content', 'coverImg' ], { user: user._id });
        can('publish', 'Work', { user: user._id });
        can('delete', 'Work', { user: user._id });
        // Channel
        can('create', 'Channel', [ 'name', 'workId' ], { user: user._id });
        can('read', 'Channel', { user: user._id });
        can('update', 'Channel', [ 'name' ], { user: user._id });
        can('delete', 'Channel', [ 'name' ], { user: user._id });
        break;
    }
  }
  return build();
}
