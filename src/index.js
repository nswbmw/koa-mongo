var MongoClient = require('mongodb').MongoClient;
var debug = require('debug')('koa-mongo');
var poolModule = require('generic-pool');

module.exports = mongo;

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
  if(!mongoUrl) {
    if (options.user && options.pass) {
      mongoUrl = 'mongodb://' + options.user + ':' + options.pass + '@' + host + ':' + port + '/' + db;
    } else {
      mongoUrl = 'mongodb://' + host + ':' + port + '/' + db;
    }
  }

  const factory = {
    create: () => new Promise((res, rej) => {
      MongoClient.connect(mongoUrl, {
        server: {poolSize: 1},
        native_parser: true,
        uri_decode_auth: true
      }, (err, db) => {
        if(err) return rej(err);
        return res(db);
      });
    }),
    destroy: client => client.close(),
  };

  const opts = {
    name: 'koa-mongo',
    max,
    min,
    idleTimeoutMillis : timeout,
    log
  };

  var mongoPool = poolModule.createPool(factory, opts);

  return async (ctx, next) => {
    ctx.mongo = await mongoPool.acquire();

    if (!ctx.mongo) throw new Error('Fail to acquire one mongo connection');
    debug('Acquire one connection (min: %s, max: %s, poolSize: %s)', min, max, mongoPool.size);

    try {
      await next();
    } catch (e) {
      throw e;
    } finally {
      mongoPool.release(ctx.mongo);
      debug('Release one connection (min: %s, max: %s, poolSize: %s)', min, max, mongoPool.size);
    }
  };
}
