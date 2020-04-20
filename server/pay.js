const express = require('express')
const router = express.Router()
const consola = require('consola')
const { v4: uuidv4 } = require('uuid')
const Obniz = require('obniz')

// obniz setting values
const obnizDeviceId = process.env.OBNIZ_DEVICE_ID
const obnizApiToken = process.env.OBNIZ_API_TOKEN

// firebase instance
let database

router.post('/request', async (req, res) => {
  if (!database) {
    database = req.app.locals.database
  }
  const data = req.body
  consola.log('Passed data', data)
  const item = data.item
  const userId = data.userId
  // set Order info before Pay Request
  const order = await generateOrder(userId, item)
  const payOptions = setupPayOption(req, item)
  const payApi = req.app.locals.payApi
  await payApi
    .request(payOptions)
    .then(async (response) => {
      consola.log(`LINE Pay Request API result`, response)
      order.transactionId = response.info.transactionId
      order.payStatus = 'REQUESTED'
      // API Result
      consola.log(`Return code: ${response.returnCode}`)
      consola.log(`Return message: ${response.returnMessage}`)
      consola.log(`Reservation was made. Detail is following.`)
      consola.log(`Order: ${order}`)
      // Update requested order
      await setOrder(order)
      // return LINE Pay payment URL to front
      res.send({
        paymentUrl: response.info.paymentUrl.web
      })
    })
    .catch((error) => {
      // error
      consola.log(`Error at LINE Pay Request API...: ${error}`)
    })
})

async function generateOrder(userId, item) {
  const order = {
    id: uuidv4(),
    userId,
    item,
    quantity: 1,
    title: item.name,
    payStatus: 'ORDERED',
    amount: item.unitPrice,
    currency: 'JPY',
    orderedAt: new Date(),
    lotteryResult: ''
  }
  return await setOrder(order)
}

function setupPayOption(req, item) {
  const quantity = 1
  const amount = item.unitPrice * quantity
  // for V3
  const product = {
    id: item.id,
    name: item.name,
    imageUrl: item.thumbnailUrl,
    quantity,
    price: amount
  }
  const packages = [
    {
      id: `PKG_${uuidv4()}`,
      amount,
      name: item.name,
      products: [product]
    }
  ]
  const options = {
    amount,
    currency: 'JPY',
    orderId: uuidv4(),
    packages,
    redirectUrls: {
      confirmUrl: `https://${req.hostname}${req.baseUrl}/paid`,
      confirmUrlType: 'CLIENT',
      cancelUrl: `https://${req.hostname}${req.baseUrl}/cancel`
    },
    options: {
      display: {
        locale: 'ja',
        checkConfirmUrlBrowser: false
      },
      payment: {
        capture: true
      }
    }
  }
  return options
}

router.get('/confirm', async (req, res) => {
  if (!database) {
    database = req.app.locals.database
  }
  await consola.log(`Pay Confirm called!`)
  const transactionId = req.query.transactionId
  const userId = req.query.userId
  consola.log('transactionId', transactionId)
  // Get order info by userId and transactionId
  const order = await getOrderByTransactionId(userId, transactionId)
  // Pay Confirm
  const payApi = req.app.locals.payApi
  const confirmedOrder = await confirmPayment(payApi, order)
  consola.log('Confirmed order', confirmedOrder)
  if (confirmedOrder) {
    consola.info('Payment completed!')
    // Dispense drink
    dispenseDrink(order.item.slot, order.item.dispenseTime)
    // Draw Losts
    order.payStatus = 'PAYMENT_COMPLETED'
    order.paidAt = new Date()
    order.lotteryResult = drawLots()
    order.drawLotsAt = new Date()
  } else {
    // Confirm failed
    consola.error('Payment failed...')
    order.payStatus = 'PAYMENT_ERROR'
  }
  // Update Order
  await setOrder(order)
  // return Order info
  res.json({
    order
  })
})

function confirmPayment(payApi, order) {
  return new Promise((resolve) => {
    if (!order) {
      // return null when Order is invalid
      resolve(null)
    }
    // Confirm payment options
    const options = {
      transactionId: order.transactionId,
      amount: order.amount,
      currency: order.currency
    }
    payApi
      .confirm(options)
      .then((response) => {
        consola.log('LINE Pay Confirm API Response', JSON.stringify(response))
        // Pay complete
        order.payStatus = 'PAYMENT_COMPLETED'
        resolve(order)
      })
      .catch((error) => {
        consola.error('Error at LINE Pay Confirm API', error)
        // Return null when Confirm API failed
        resolve(null)
      })
  })
}

// Set pin assign for DCMotors on your obniz Borad
const obnizSlotInfo = [
  { forward: 0, back: 1 },
  { forward: 2, back: 3 },
  { forward: 4, back: 5 }
]

function dispenseDrink(slot, dispenseTime) {
  return new Promise((resolve) => {
    console.log('Initializing obniz...')
    console.log('Slot', slot)
    console.log('Dispense time', dispenseTime)
    const obniz = new Obniz(obnizDeviceId, {
      auto_connect: false,
      access_token: obnizApiToken
    })
    obniz.connect()
    obniz.onconnect = function() {
      consola.info('Connected to your obniz device!! [', obnizDeviceId, ']')
      obniz.display.clear()
      obniz.display.print('LINE Pay Drink Bar')
      // Dispense setting
      const slotInfo = obnizSlotInfo[slot]
      const forwardPort = slotInfo.forward
      const backPort = slotInfo.back
      // Start dispense
      const motor = obniz.wired('DCMotor', {
        forward: forwardPort,
        back: backPort
      })
      obniz.display.clear()
      obniz.display.print(`Dispensing at [Slot: ${slot}]`)
      motor.power(100)
      motor.forward()
      setTimeout(function() {
        // Dispense finished
        motor.stop()
        // Close obniz connection
        obniz.close()
        resolve()
      }, dispenseTime)
    }
  })
}

function drawLots() {
  const max = 100
  const min = 1
  const draw = Math.floor(Math.random() * (max - min)) + min
  let result = 'LOSE'
  if (draw >= 33) {
    result = 'WIN'
  }
  return result
}

// ------------------------------------
// Firebase access functions
// ------------------------------------

function setOrder(order) {
  return new Promise((resolve) => {
    const ordersRef = database.collection('orders')
    console.log('Add order', order)
    ordersRef.doc(order.id).set(Object.assign({}, order))
    resolve(order)
  })
}

function getOrderByTransactionId(userId, transactionId) {
  return new Promise((resolve) => {
    const ordersRef = database.collection('orders')
    ordersRef
      .where('userId', '==', userId)
      .where('transactionId', '==', transactionId)
      .get()
      .then((snapshot) => {
        const orders = []
        snapshot.forEach((doc) => {
          orders.push(doc.data())
        })
        if (orders.length > 0) {
          resolve(orders[0])
        } else {
          resolve(null)
        }
      })
  })
}

module.exports = router
