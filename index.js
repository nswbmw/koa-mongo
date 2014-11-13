
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
  var mongoUrl = '';
  if(options.uri) {
    mongoUrl = options.uri;
  } else {
    if (options.user && options.pass) {
      mongoUrl = 'mongodb://' + options.user + ':' + options.pass + '@' + host + ':' + port;
    } else {
      mongoUrl = 'mongodb://' + host + ':' + port;
    }
  }
  return function* (next) {
    if (!this.app._mongoPool) {
      debug('Connect: ' + mongoUrl);
      this.app._mongoPool = poolModule.Pool({
        name     : 'koa-mongo',
        create   : function(callback) {
          MongoClient.connect(mongoUrl, {
            server: {poolSize: 1},
            native_parser: true
          }, callback);
        },
        destroy  : function(client) {client.close();},
        max      : max,
        min      : min, 
        idleTimeoutMillis : timeout,
        log : log 
      });
    }
    this.mongo = yield this.app._mongoPool.acquire;
    if (!this.mongo) this.throw('Fail to acquire one mongo connection')
    debug('Acquire one connection');

    try {
      yield* next;
    } catch (e) {
      throw e;
    } finally {
      this.app._mongoPool.release(this.mongo);
      debug('Release one connection');
    }
  }
} 