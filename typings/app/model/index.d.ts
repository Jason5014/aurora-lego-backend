// This file is created by egg-ts-helper@1.33.0
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportSession from '../../../app/model/session';
import ExportUser from '../../../app/model/user';
import ExportWork from '../../../app/model/work';

declare module 'egg' {
  interface IModel {
    Session: ReturnType<typeof ExportSession>;
    User: ReturnType<typeof ExportUser>;
    Work: ReturnType<typeof ExportWork>;
  }
}
