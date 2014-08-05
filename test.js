var koa = require('koa');
var mongo = require('./');

var app = koa();

app.use(mongo());
app.use(function* (next) {
  this.mongo.db('test').collection('data').findOne({}, function (err, doc) {
    console.log(doc);
  });
});
app.listen(3000);