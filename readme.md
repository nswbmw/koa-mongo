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
  max: 100,
  min: 1,
  ...
}));
```

or

```js
app.use(mongo({
  uri: 'mongodb://admin:123456@localhost:27017/test', //or url
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
  max: 100,
  min: 1,
  acquireTimeoutMillis: 100
}
```

More options see [generic-pool](https://github.com/coopernurse/node-pool).

### Example

```js
const Koa = require('koa')
const mongo = require('koa-mongo')

const app = new Koa()

app.use(mongo())
app.use(async (ctx, next) => {
  const result = await ctx.mongo.db('test').collection('users').insert({ name: 'haha' })
  const userId = result.ops[0]._id.toString()
  ctx.body = await ctx.mongo.db('test').collection('users').find().toArray()
  ctx.mongo.db('test').collection('users').remove({
    _id: mongo.ObjectId(userId)
  })
})
app.listen(3000, () => {
  console.log('listening on port 3000')
})
```

### License

MIT
