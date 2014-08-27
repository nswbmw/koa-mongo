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
  pass: 123456,
  max: 100,
  min: 1,
  timeout: 30000,
  log: false
}));
```

or

```
app.use(mongo({
  uri: 'mongodb://admin:123456@localhost:27017'
  max: 100,
  min: 1,
  timeout: 30000,
  log: false
}));
```

### Example

```
var koa = require('koa');
var mongo = require('koa-mongo');

var app = koa();

app.use(mongo());
app.use(function* (next) {
  this.mongo.db('test').collection('data').findOne({}, function (err, doc) {
    console.log(doc);
  });
});
app.listen(3000);
```

### License

MIT