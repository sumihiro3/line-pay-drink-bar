const express = require('express')
const router = express.Router()
const consola = require('consola')
const { v4: uuidv4 } = require('uuid')

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
    prizeStatus: ''
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
  let payStatus = 'PAYMENT_COMPLETED'
  // get and update order info
  const order = await getOrderByTransactionId(userId, transactionId)
  consola.log('Update order to complete', order)
  if (order) {
    order.payStatus = payStatus
    order.paidAt = new Date()
    await setOrder(order)
  } else {
    // Order info not found
    payStatus = 'PAYMENT_ERROR'
  }
  // return payStatus
  res.json({
    payStatus,
    orderId: order.id
  })
})

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

// function getOrder(orderId) {
//   return new Promise((resolve) => {
//     const ordersRef = database.collection('orders')
//     const orderRef = ordersRef.doc(orderId)
//     orderRef.get().then((doc) => {
//       if (!doc.exists) {
//         const errorMessage = `Order[${orderId} does not exists]`
//         console.error(errorMessage)
//         throw new Error(errorMessage)
//       } else {
//         resolve(doc.data())
//       }
//     })
//   })
// }

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
