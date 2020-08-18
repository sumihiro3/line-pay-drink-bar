const express = require('express')
const bodyParser = require('body-parser')
const { Nuxt, Builder } = require('nuxt')
const config = require('../nuxt.config.js')
const payRouter = require('./pay')
const bunyan = require('bunyan')
const { LoggingBunyan } = require('@google-cloud/logging-bunyan')

//
const loggingBunyan = new LoggingBunyan()
const logger = bunyan.createLogger({
  name: 'LinePayDrinkBar',
  streams: [
    // Log to the console at 'info' and above
    {stream: process.stdout, level: 'info'},
    // And log to Stackdriver Logging, logging at 'info' and above
    loggingBunyan.stream('info'),
  ],
})

// Show environment values
logger.info('Show environment values')
logger.info('BASE_URL', process.env.BASE_URL)
logger.info('API_BASE_URL', process.env.API_BASE_URL)
logger.info('USE_VCONSOLE', process.env.USE_VCONSOLE)
logger.info('SKIP_LOGIN', process.env.SKIP_LOGIN)
logger.info('LIFF_ID', process.env.LIFF_ID)
logger.info('LIFF_CHANNEL_ID', process.env.LIFF_CHANNEL_ID)
logger.info('FIREBASE_PROJECT_ID', process.env.FIREBASE_PROJECT_ID)
logger.info('FIREBASE_DATABASE_URL', process.env.FIREBASE_DATABASE_URL)
logger.info('FIREBASE_PRIVATE_KEY', process.env.FIREBASE_PRIVATE_KEY)
logger.info('FIREBASE_CLIENT_EMAIL', process.env.FIREBASE_CLIENT_EMAIL)
logger.info('LINE_PAY_CHANNEL_ID', process.env.LINE_PAY_CHANNEL_ID)
logger.info('LINE_PAY_CHANNEL_SECRET', process.env.LINE_PAY_CHANNEL_SECRET)
logger.info('OBNIZ_DEVICE_ID', process.env.OBNIZ_DEVICE_ID)
logger.info('OBNIZ_API_TOKEN', process.env.OBNIZ_API_TOKEN)

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
      logger.error('Error in nuxt.renderRoute', error)
      Promise.reject(error)
    }
  })()
})

const itemsJson = require('./items.json')
function getItems() {
  logger.info('Loaded item list json', JSON.stringify(itemsJson))
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
    logger.info({
      message: `Server listening on https://${host}:${port}`,
      badge: true
    })
  } else {
    app.listen(port, host)
    logger.info({
      message: `Server listening on http://${host}:${port}`,
      badge: true
    })
  }
}
start()
