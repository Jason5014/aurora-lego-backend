import { Application } from 'egg';
import { Schema, Types } from 'mongoose';
import AutoIncrementFactory from 'mongoose-sequence';

export interface ChannelProps {
  name: string;
  id: string;
}

export interface WorkProps {
  id?: number;
  uuid: string;
  title: string;
  desc: string;
  coverImg?: string;
  content?: { [key: string]: any },
  isTemplate?: boolean;
  isPublic?: boolean;
  isHot?: boolean;
  author: string;
  copiedCount: number;
  status: 0 | 1 | 2;
  user: Types.ObjectId;
  latestPublishAt?: Date;
  channels?: ChannelProps[];
}

function initWorkModel(app: Application) {
  const AutoIncrement = AutoIncrementFactory(app.mongoose);

  const WorkSchema = new app.mongoose.Schema<WorkProps>({
    uuid: { type: String, unique: true },
    title: { type: String },
    desc: { type: String },
    coverImg: { type: String },
    content: { type: Object },
    isTemplate: { type: Boolean },
    isPublic: { type: Boolean },
    isHot: { type: Boolean },
    author: { type: String },
    copiedCount: { type: Number, default: 0 },
    status: { type: Number, default: 1 },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    latestPublishAt: { type: Date },
    channels: { type: Array },
  }, { timestamps: true });

  WorkSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'works_id_counter' });

  return app.mongoose.model<WorkProps>('Work', WorkSchema);
}

export default initWorkModel;
