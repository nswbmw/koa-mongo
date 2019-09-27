const Koa = require('koa')
const mongo = require('./')

const app = new Koa()

app.use(mongo())
app.use(async (ctx, next) => {
  await ctx.mongo.db('test').collection('users').insertOne({ name: 'example' })
  ctx.body = await ctx.db.collection('users').find().toArray()
  await ctx.db.collection('users').removeMany({ name: 'example' })
})

app.listen(3000, () => {
  console.log('listening on port 3000')
})
