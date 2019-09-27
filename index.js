'use strict'

const MongoDB = require('mongodb')
const MongoClient = MongoDB.MongoClient
const debug = require('debug')('koa-mongo')
const genericPool = require('generic-pool')
const muri = require('muri')

const defaultOptions = {
  host: 'localhost',
  port: 27017,
  db: 'test',
  authSource: 'admin',
  max: 100,
  min: 1,
  acquireTimeoutMillis: 100
}

function mongo (options) {
  options = Object.assign({}, defaultOptions, options)
  let mongoUrl = options.uri || options.url
  let dbName = options.db
  if (!mongoUrl) {
    if (options.user && options.pass) {
      mongoUrl = `mongodb://${options.user}:${options.pass}@${options.host}:${options.port}/${options.db}?authSource=${options.authSource}`
    } else {
      mongoUrl = `mongodb://${options.host}:${options.port}/${options.db}`
    }
  } else {
    dbName = muri(mongoUrl.replace('+srv', '')).db
  }

  const mongoPool = genericPool.createPool({
    create: () => MongoClient.connect(mongoUrl, { useNewUrlParser: true, reconnectTries: 1 })
      .then(client => {
        debug('Successfully connected to: ' + mongoUrl)
        return client
      })
      .catch(err => {
        debug('Failed to connect to: ' + mongoUrl)
        throw err
      }),
    destroy: client => client.close()
  }, options)

  async function acquire () {
    const resource = await mongoPool.acquire()
    debug('Acquire one connection (min: %s, max: %s, poolSize: %s)', options.min, options.max, mongoPool.size)

    return resource
  }

  async function release (resource) {
    if (resource && !resource.isConnected()) {
      await mongoPool.destroy(resource)
    } else {
      await mongoPool.release(resource)
    }
    debug('Release one connection (min: %s, max: %s, poolSize: %s)', options.min, options.max, mongoPool.size)
  }

  return async function koaMongo (ctx, next) {
    ctx.mongo = await acquire()
    ctx.db = ctx.mongo.db(dbName)
    try {
      await next()
    } finally {
      await release(ctx.mongo)
    }
  }
}

module.exports = mongo
Object.assign(module.exports, MongoDB)
