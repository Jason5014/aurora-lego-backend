import { Application } from 'egg';

interface SessionProps {
  key: string;
  value: object;
}

function initSessionModel(app: Application) {
  const SessionSchema = new app.mongoose.Schema<SessionProps>({
    key: { type: String, unique: true, required: true },
    value: { type: Object, unique: true, required: true },
  });
  return app.mongoose.model<SessionProps>('Session', SessionSchema);
}

export default initSessionModel;
