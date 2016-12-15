'use strict';

const koa = require('koa');
const mongo = require('./');

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