const express = require('express')
const bodyParser = require('body-parser')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const config = require('../nuxt.config.js')
const payRouter = require('./pay')


// Show environment values
consola.log('BASE_URL', process.env.BASE_URL)
consola.log('API_BASE_URL', process.env.API_BASE_URL)
consola.log('USE_VCONSOLE', process.env.USE_VCONSOLE)
consola.log('SKIP_LOGIN', process.env.SKIP_LOGIN)
consola.log('LIFF_ID', process.env.LIFF_ID)
consola.log('LIFF_CHANNEL_ID', process.env.LIFF_CHANNEL_ID)
consola.log('FIREBASE_PROJECT_ID', process.env.FIREBASE_PROJECT_ID)
consola.log('FIREBASE_DATABASE_URL', process.env.FIREBASE_DATABASE_URL)
consola.log('FIREBASE_PRIVATE_KEY', process.env.FIREBASE_PRIVATE_KEY)
consola.log('FIREBASE_CLIENT_EMAIL', process.env.FIREBASE_CLIENT_EMAIL)
consola.log('LINE_PAY_CHANNEL_ID', process.env.LINE_PAY_CHANNEL_ID)
consola.log('LINE_PAY_CHANNEL_SECRET', process.env.LINE_PAY_CHANNEL_SECRET)
consola.log('OBNIZ_DEVICE_ID', process.env.OBNIZ_DEVICE_ID)
consola.log('OBNIZ_API_TOKEN', process.env.OBNIZ_API_TOKEN)

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
  if (process.env.NODE_ENV === 'dev-local') {
    // enable HTTPS on localhost when development mode
    const fs = require('fs')
    const https = require('https')
    // https config
    const httpsOptions = {
      key: fs.readFileSync(`${__dirname}/localhost-key.pem`),
      cert: fs.readFileSync(`${__dirname}/localhost.pem`)
    }
    https.createServer(httpsOptions, app).listen(port, host)
    consola.ready({
      message: `Server listening on https://${host}:${port}`,
      badge: true
    })
  } else {
    app.listen(port, host)
    consola.ready({
      message: `Server listening on http://${host}:${port}`,
      badge: true
    })
  }
}
start()
