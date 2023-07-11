import 'egg';
import { Connection, Model } from 'mongoose';
import * as OSS from 'ali-oss';
import { Options as OSSOptions } from 'ali-oss';

declare module 'egg' {
	interface MongooseModels extends IModel {
		[key: string]: Model<any>;
	}
	interface Application {
		// mongoose: Connection;
		// model: MongooseModels;
		sessionMap: { [key: string]: any };
		sessionStore: any;
	}
	interface Context {
		genHash(plainText: string): Promise<string>;
		compare(plainText: string, hash: string): Promise<boolean>;
		oss: OSS,
	}
	interface EggAppConfig {
		bcrypt: {
			saltRounds: number;
		},
		oss: {
			client?: OSSOptions;
		}
	}
}
