const express = require('express')
const bodyParser = require('body-parser')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const config = require('../nuxt.config.js')
const payRouter = require('./pay')

// Show environment values
console.log('BASE_URL', process.env.BASE_URL)
console.log('API_BASE_URL', process.env.API_BASE_URL)
console.log('USE_VCONSOLE', process.env.USE_VCONSOLE)
console.log('SKIP_LOGIN', process.env.SKIP_LOGIN)
console.log('LIFF_ID', process.env.LIFF_ID)
console.log('FIREBASE_API_KEY', process.env.FIREBASE_API_KEY)
console.log('FIREBASE_AUTH_DOMAIN', process.env.FIREBASE_AUTH_DOMAIN)
console.log('FIREBASE_DATABASE_URL', process.env.FIREBASE_DATABASE_URL)
console.log('FIREBASE_PROJECT_ID', process.env.FIREBASE_PROJECT_ID)
console.log('FIREBASE_STORAGE_BUCKET', process.env.FIREBASE_STORAGE_BUCKET)
console.log(
  'FIREBASE_MESSAGING_SENDER_ID',
  process.env.FIREBASE_MESSAGING_SENDER_ID
)
console.log('FIREBASE_APP_ID', process.env.FIREBASE_APP_ID)
console.log('FIREBASE_MEASUREMENT_ID', process.env.FIREBASE_MEASUREMENT_ID)
console.log('LINE_PAY_CHANNEL_ID', process.env.LINE_PAY_CHANNEL_ID)
console.log('LINE_PAY_CHANNEL_SECRET', process.env.LINE_PAY_CHANNEL_SECRET)
console.log('OBNIZ_DEVICE_ID', process.env.OBNIZ_DEVICE_ID)
console.log('OBNIZ_API_TOKEN', process.env.OBNIZ_API_TOKEN)

// Express
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/pay', payRouter)

// Import and Set Nuxt.js options
config.dev = process.env.NODE_ENV !== 'production'
// Init Nuxt.js
const nuxt = new Nuxt(config)
app.locals.nuxt = nuxt

app.get('/', (req, res) => {
  ;(async () => {
    const items = getItems()
    req.items = items
    try {
      const result = await nuxt.renderRoute('/', { req })
      res.send(result.html)
    } catch (error) {
      consola.error('Error in nuxt.renderRoute', error)
      Promise.reject(error)
    }
  })()
})

const itemsJson = require('./items.json')
function getItems() {
  consola.log('Loaded item list json', JSON.stringify(itemsJson))
  return itemsJson
}

// Start Express with Nuxt.js
async function start() {
  const { host, port } = nuxt.options.server

  await nuxt.ready()
  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()
