## koa-mongo

koa-mongo is a mongodb middleware for koa, support connection pool.

### Install

    npm i koa-mongo --save

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
  timeout: 30000,
  log: false
}));
```

or

```
app.use(mongo({
  uri: 'mongodb://admin:123456@localhost:27017/test', //or url
  max: 100,
  min: 1,
  timeout: 30000,
  log: false
}));
```

### Example

```
'use strict';

var koa = require('koa');
var mongo = require('koa-mongo');

var app = koa();

app.use(mongo());
app.use(function* (next) {
  yield this.mongo.db('test').collection('users').insert({ name: 'haha' });
  this.body = yield this.mongo.db('test').collection('users').findOne();
  this.mongo.db('test').collection('users').remove().then(function (res) {
    console.log(res.result);
  });
});
app.listen(3000);
```

### License

MIT
