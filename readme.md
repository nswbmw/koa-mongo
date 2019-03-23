## koa-mongo

koa-mongo is a mongodb middleware for koa@2, support connection pool.

### Install

```sh
npm i koa-mongo --save
```

### Usage

```js
app.use(mongo({
  host: 'localhost',
  port: 27017,
  user: 'admin',
  pass: '123456',
  db: 'test',
  authSource: 'admin',
  max: 100,
  min: 1,
  ...
}));
```

or

```js
app.use(mongo({
  uri: 'mongodb://admin:123456@localhost:27017/test?authSource=admin', //or url
  max: 100,
  min: 1
  ...
}));
```

defaultOptions:

```js
{
  host: 'localhost',
  port: 27017,
  db: 'test',
  authSource: 'admin',
  max: 100,
  min: 1,
  acquireTimeoutMillis: 100
}
```

More options see [generic-pool](https://github.com/coopernurse/node-pool).

### ctx.mongo & ctx.db

`ctx.mongo` is an instance of MongoClient.

```js
ctx.db === ctx.mongo.db(dbName)
```

### Example

```js
const Koa = require('koa')
const mongo = require('koa-mongo')

const app = new Koa()

app.use(mongo())
app.use(async (ctx, next) => {
  // ctx.db === ctx.mongo.db('test')
  const result = await ctx.db.collection('users').insert({ name: 'haha' })
  const userId = result.ops[0]._id.toString()
  ctx.body = await ctx.db.collection('users').find().toArray()
  ctx.db.collection('users').remove({
    _id: mongo.ObjectId(userId)
  })
})
app.listen(3000, () => {
  console.log('listening on port 3000')
})
```

### [Mongolass](https://github.com/mongolass/mongolass)

Mongolass is a elegant MongoDB driver for Node.js.

### License

MIT
