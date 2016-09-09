'use strict';

var koa = require('koa');
var mongo = require('./');

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