'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var MongoClient = require('mongodb').MongoClient;
var debug = require('debug')('koa-mongo');
var poolModule = require('generic-pool');

module.exports = mongo;

function mongo(options) {
  var _this = this;

  options = options || {};
  var host = options.host || 'localhost';
  var port = options.port || 27017;
  var max = options.max || 100;
  var min = options.min || 1;
  var timeout = options.timeout || 30000;
  var log = options.log || false;
  var db = options.db || 'test';
  var mongoUrl = options.uri || options.url;
  if (!mongoUrl) {
    if (options.user && options.pass) {
      mongoUrl = 'mongodb://' + options.user + ':' + options.pass + '@' + host + ':' + port + '/' + db;
    } else {
      mongoUrl = 'mongodb://' + host + ':' + port + '/' + db;
    }
  }

  var factory = {
    create: function create() {
      return new Promise(function (res, rej) {
        MongoClient.connect(mongoUrl, {
          server: { poolSize: 1 },
          native_parser: true,
          uri_decode_auth: true
        }, function (err, db) {
          if (err) return rej(err);
          return res(db);
        });
      });
    },
    destroy: function destroy(client) {
      return client.close();
    }
  };

  var opts = {
    name: 'koa-mongo',
    max: max,
    min: min,
    idleTimeoutMillis: timeout,
    log: log
  };

  var mongoPool = poolModule.createPool(factory, opts);

  return function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(ctx, next) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return mongoPool.acquire();

            case 2:
              ctx.mongo = _context.sent;

              if (ctx.mongo) {
                _context.next = 5;
                break;
              }

              throw new Error('Fail to acquire one mongo connection');

            case 5:
              debug('Acquire one connection (min: %s, max: %s, poolSize: %s)', min, max, mongoPool.size);

              _context.prev = 6;
              _context.next = 9;
              return next();

            case 9:
              _context.next = 14;
              break;

            case 11:
              _context.prev = 11;
              _context.t0 = _context['catch'](6);
              throw _context.t0;

            case 14:
              _context.prev = 14;

              mongoPool.release(ctx.mongo);
              debug('Release one connection (min: %s, max: %s, poolSize: %s)', min, max, mongoPool.size);
              return _context.finish(14);

            case 18:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this, [[6, 11, 14, 18]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
}