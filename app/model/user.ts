import { Application } from 'egg';
import AutoIncrementFactory from 'mongoose-sequence';

export interface UserProps {
  username: string;
  password?: string;
  age?: number;
  email?: string;
  nickName?: string;
  picture?: string;
  phoneNumber?: string;
  type: 'email' | 'cellphone' | 'oauth';
  provider?: 'gitee';
  oauthID?: string;
  role?: 'admin' | 'normal';
}

function initUserModel(app: Application) {
  const AutoIncrement = AutoIncrementFactory(app.mongoose);
  const UserSchema = new app.mongoose.Schema<UserProps>({
    username: { type: String, unique: true, required: true },
    password: { type: String },
    age: { type: Number },
    nickName: { type: String },
    picture: { type: String },
    phoneNumber: { type: String },
    type: { type: String, default: 'email' },
    provider: { type: String },
    oauthID: { type: String },
    role: { type: String, default: 'normal' },
  }, {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
      },
    },
  });
  UserSchema.plugin(AutoIncrement, {
    inc_field: 'id',
    id: 'users_id_counter',
  });
  return app.mongoose.model<UserProps>('User', UserSchema);
}

export default initUserModel;
