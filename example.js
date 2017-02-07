'use strict';

var koa = require('koa');
var mongo = require('./');

var app = koa();

app.use(mongo());
app.use(function* (next) {
  var result = yield this.mongo.db('test').collection('users').insert({ name: Date.now() });
  var userId = result.ops[0]._id.toString();
  this.body = yield this.mongo.db('test').collection('users').find().toArray();
  this.mongo.db('test').collection('users').remove({
    _id: mongo.ObjectId(userId)
  });
});
app.listen(3000, function() {
  console.log('listening on 3000.');
});