'use strict';

const _ = require('lodash');
const MongoClient = require('mongodb').MongoClient;
const debug = require('debug')('koa-mongo');
const genericPool = require('generic-pool');

const defaulfOptions = {
  host: 'localhost',
  port: 27017,
  db: 'test',
  max: 100,
  min: 1
};

function mongo(options) {
  options = _.assign({}, defaulfOptions, options);
  let mongoUrl = options.uri || options.url;
  if (!mongoUrl) {
    if (options.user && options.pass) {
      mongoUrl = `mongodb://${options.user}:${options.pass}@${options.host}:${options.port}/${options.db}`;
    } else {
      mongoUrl = `mongodb://${options.host}:${options.port}/${options.db}`;
    }
  }

  const mongoPool = genericPool.createPool({
    create: () => MongoClient.connect(mongoUrl, {
      server: { poolSize: 1 },
      native_parser: true,
      uri_decode_auth: true
    }),
    destroy: client => client.close()
  }, options);

  return function koaMongo(ctx, next) {
    return mongoPool.acquire()
      .then(mongo => {
        ctx.mongo = mongo;
        debug('Acquire one connection (min: %s, max: %s, poolSize: %s)', options.min, options.max, mongoPool.size);
        return next();
      })
      .then(() => {
        mongoPool.release(ctx.mongo);
        debug('Release one connection (min: %s, max: %s, poolSize: %s)', options.min, options.max, mongoPool.size);
      })
      .catch(e => {
        if (ctx.mongo) {
          mongoPool.release(ctx.mongo);
          debug('Release one connection (min: %s, max: %s, poolSize: %s)', options.min, options.max, mongoPool.size);   
        }
        throw e;
      });
  };
}

module.exports = mongo;
