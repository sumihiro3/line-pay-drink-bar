const firebase = require('firebase/app')
require('firebase/firestore')

const database = firebase.firestore()
const itemsRef = database.collection('items')

export function getItems() {
  return new Promise((resolve) => {
    const items = []
    itemsRef
      .where('active', '==', true)
      .get()
      .then((query) => {
        query.forEach((doc) => {
          items.push(doc.data())
        })
        resolve(items)
      })
  })
}
