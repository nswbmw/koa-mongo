const Koa = require('koa')
const mongo = require('./')

const app = new Koa()

app.use(mongo())
app.use(async (ctx, next) => {
  const collection = ctx.mongo.db('test').collection('users')
  await collection.insertOne({ name: 'example' })
  ctx.body = await collection.find().toArray()
  await collection.removeMany({ name: 'example' })
})

app.listen(3000, () => {
  console.log('listening on port 3000')
})
