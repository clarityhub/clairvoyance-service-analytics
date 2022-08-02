const path = require('path');

const settings = require(path.join(process.cwd(), 'settings.json'));
const { MongoClient } = require('mongodb');

const env = settings[process.env.NODE_ENV || 'development'].mongo;

let prefix = '';

if (env.user) {
  prefix += encodeURIComponent(env.user);
}

if (env.password) {
  prefix += `:${encodeURIComponent(env.password)}`;
}

if (env.password || env.user) {
  prefix += '@';
}

const url = `mongodb://${prefix}${env.host}:${env.port}/${env.db}`;

module.exports = MongoClient.connect(url);
