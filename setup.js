#!/usr/bin/env node

const {
  MONGO_INITDB_ROOT_USERNAME,
  MONGO_INITDB_ROOT_PASSWORD,
  MONGO_DB_USERNAME,
  MONGO_DB_PASSWORD,
} = process.env;

// 链接数据库
/* eslint-disable no-undef */
let db = connect(`mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@localhost:27017/admin`);

db = db.getSiblingDB('aurora-backend');

db.createUser({
  user: MONGO_DB_USERNAME,
  pwd: MONGO_DB_PASSWORD,
  roles: [{ role: 'readWrite', db: 'aurora-backend' }],
});

db.createCollection('works');

db.works.insertOne({
  id: 19,
  title: '1024 程序员日',
  desc: '1024 程序员日',
  author: 'jason',
  coverImg: 'src',
  content: '内容',
});
