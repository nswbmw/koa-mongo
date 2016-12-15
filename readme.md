## koa-mongo

koa-mongo is a mongodb middleware for koa@2, support connection pool.

**NB**: If you use koa@1, use koa-mongo@0.6.0.

### Install

```
npm i koa-mongo --save
```

### Usage

```
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

```
app.use(mongo({
  uri: 'mongodb://admin:123456@localhost:27017/test', //or url
  max: 100,
  min: 1
  ...
}));
```

defaultOptions:

```
{
  host: 'localhost',
  port: 27017,
  db: 'test',
  max: 100,
  min: 1
}
```

More options see [generic-pool](https://github.com/coopernurse/node-pool).

### Example

```
'use strict';

const koa = require('koa');
const mongo = require('koa-mongo');

const app = new koa();

app.use(mongo());
app.use(async (ctx, next) => {
  await ctx.mongo.db('test').collection('users').insert({ name: 'haha' });
  ctx.body = await ctx.mongo.db('test').collection('users').find().toArray();
  ctx.mongo.db('test').collection('users').remove();
});
app.listen(3000, () => {
  console.log('listening on port 3000');
});
```

### License

MIT
