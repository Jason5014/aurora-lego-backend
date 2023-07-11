#!/bin/bash
set -e

mongosh <<EOF
use admin
db.auth('$MONGO_INITDB_ROOT_USERNAME', '$MONGO_INITDB_ROOT_PASSWORD')
use aurora-backend
db.createUser({
	user: '$MONGO_DB_USERNAME',
	pwd: '$MONGO_DB_PASSWORD',
  roles: [{
    role: 'readWrite',
    db: 'aurora-backend'
  }]
})
db.createCollection('works')
db.works.insertOne({
  id: 19,
  title: '1024 程序员日',
  desc: '1024 程序员日',
  author: 'jason',
  coverImg: 'src',
  content: '内容',
})
EOF
