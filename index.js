'use strict';

var MongoDB = require('mongodb');
var MongoClient = MongoDB.MongoClient;
var debug = require('debug')('koa-mongo');
var poolModule = require('generic-pool');
var promiseRetry = require('promise-retry');

module.exports = mongo;
for (var key in MongoDB) {
  mongo[key] = MongoDB[key];
}

function mongo(options) {
  options = options || {};
  var host = options.host || 'localhost';
  var port = options.port || 27017;
  var max = options.max || 100;
  var min = options.min || 1;
  var timeout = options.timeout || 30000;
  var log = options.log || false;
  var db = options.db || 'test';
  var mongoUrl = options.uri || options.url;
  var reconnectTries = options.reconnectTries || 30;
  var reconnectInterval = options.reconnectInterval || 1000;
  if(!mongoUrl) {
    if (options.user && options.pass) {
      mongoUrl = 'mongodb://' + options.user + ':' + options.pass + '@' + host + ':' + port + '/' + db;
    } else {
      mongoUrl = 'mongodb://' + host + ':' + port + '/' + db;
    }
  }

  var createMongoPool = () => poolModule.Pool({
    name     : 'koa-mongo',
    create   : function(callback) {
      MongoClient.connect(mongoUrl, {
        reconnectTries: reconnectTries,
        reconnectInterval: reconnectInterval,
        server: {poolSize: 1},
        native_parser: true,
        uri_decode_auth: true
      }, callback);
    },
    destroy  : function(client) {client.close();},
    max      : max,
    min      : min, 
    idleTimeoutMillis : timeout,
    log : log 
  });

  let mongoPool = createMongoPool();

  return function* koaMongo(next) {

    try {
      this.mongo = yield mongoPool.acquire.bind(mongoPool);
    } catch(e) {
      mongoPool = createMongoPool();
      this.mongo = yield mongoPool.acquire.bind(mongoPool);
    }

    if (!this.mongo) this.throw('Fail to acquire one mongo connection');

    if (!(this.mongo).serverConfig.isConnected()) {

      mongoPool.drain();
      this.throw('Cannot connect to MongoDB')
    }

    debug('Acquire one connection (min: %s, max: %s, poolSize: %s)', min, max, mongoPool.getPoolSize());

    try {
      yield* next;
    } catch (e) {
      throw e;
    } finally {
      mongoPool.release(this.mongo);
      debug('Release one connection (min: %s, max: %s, poolSize: %s)', min, max, mongoPool.getPoolSize());
    }
  };
} 