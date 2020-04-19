// const consola = require('consola')
// const Obniz = require('obniz')

// const obnizDeviceId = '5211-8508'
// const obnizApiToken =
//   'TpjKJmhJ5mP2CxmNDCauVGiJhSxdO8loJeuXmq9HdL_dtCX6TL27S3GTfs1EtHO2'

// export default (context, inject) => {
//   const obniz = new Obniz(obnizDeviceId, {
//     access_token: obnizApiToken
//   })
//   obniz.onconnect = async function() {
//     consola.info('Your obniz device is online!! [ ', obnizDeviceId, ']')
//     await obniz.display.clear()
//     obniz.display.print('LINE Pay Drink Bar')
//   }
//   inject('obniz', obniz)
// }
