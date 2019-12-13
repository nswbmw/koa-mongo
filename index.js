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

function mongo (connOptions, confOptions = {}) {
  connOptions = Object.assign({}, defaultOptions, connOptions)
  let mongoUrl = connOptions.uri || connOptions.url
  let dbName = connOptions.db
  if (!mongoUrl) {
    if (connOptions.user && connOptions.pass) {
      mongoUrl = `mongodb://${connOptions.user}:${connOptions.pass}@${connOptions.host}:${connOptions.port}/${connOptions.db}?authSource=${connOptions.authSource}`
    } else {
      mongoUrl = `mongodb://${connOptions.host}:${connOptions.port}/${connOptions.db}`
    }
  } else {
    dbName = muri(mongoUrl.replace('+srv', '')).db
  }

  const mongoPool = genericPool.createPool({
    create: () => MongoClient.connect(mongoUrl, Object.assign({
      useNewUrlParser: true,
      useUnifiedTopology: true
    }, confOptions))
      .then(client => {
        debug('Successfully connected to: ' + mongoUrl)
        return client
      })
      .catch(err => {
        debug('Failed to connect to: ' + mongoUrl)
        throw err
      }),
    destroy: client => client.close()
  }, connOptions)

  async function acquire () {
    const resource = await mongoPool.acquire()
    debug('Acquire one connection (min: %s, max: %s, poolSize: %s)', connOptions.min, connOptions.max, mongoPool.size)

    return resource
  }

  async function release (resource) {
    if (resource && !resource.isConnected()) {
      await mongoPool.destroy(resource)
    } else {
      await mongoPool.release(resource)
    }
    debug('Release one connection (min: %s, max: %s, poolSize: %s)', connOptions.min, connOptions.max, mongoPool.size)
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
