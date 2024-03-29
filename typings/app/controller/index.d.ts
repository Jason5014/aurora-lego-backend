// This file is created by egg-ts-helper@1.33.0
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportTest from '../../../app/controller/Test';
import ExportHome from '../../../app/controller/home';
import ExportUser from '../../../app/controller/user';
import ExportUtils from '../../../app/controller/utils';
import ExportWork from '../../../app/controller/work';

declare module 'egg' {
  interface IController {
    test: ExportTest;
    home: ExportHome;
    user: ExportUser;
    utils: ExportUtils;
    work: ExportWork;
  }
}
