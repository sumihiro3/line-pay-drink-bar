# line-pay-drink-bar

## Setup environment

### linting

```bash
yarn add -D eslint-loader
```

edit the lint script of your package.json:

```json
"lint-fix": "eslint --fix --ext .js,.vue --ignore-path .gitignore ."
```

run eslint auto
ホットリロードモードで ESLint を有効にする

```js
extend(config, ctx) {
    // Run ESLint on save
    if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
            enforce: 'pre',
            test: /\.(js|vue)$/,
            loader: 'eslint-loader',
            exclude: /(node_modules)/
        })
    }
}
```

## add pug and stylus

install loader packages to dev

```bash
yarn add -D pug pug-plain-loader stylus stylus-loader
```

and change template and style codes


## Setup GCP/Firebase

### install firebase CLI

```bash
npm install -g firebase-tools
```

### Create firebase project

visit and create project

https://console.firebase.google.com

Create app.
Set to use Firestore and locale to same location of Google analistics (ex. asia-northeast1)

### enable Google App Engine

visit and enable Google App Engine(GAE)
https://console.cloud.google.com/appengine/

### add envs in .env and gae-envs.yaml, nuxt.config.js

```
FIREBASE_API_KEY=XXXXXXXXXXX
FIREBASE_AUTH_DOMAIN=XXXXXXXXXXX.firebaseapp.com
FIREBASE_DATABASE_URL=https://XXXXXXXXXXX.firebaseio.com
FIREBASE_PROJECT_ID=XXXXXXXXXXX
FIREBASE_STORAGE_BUCKET=XXXXXXXXXXX.appspot.com
FIREBASE_MESSAGING_SENDER_ID=XXXXXXXXXXX
FIREBASE_APP_ID=XXXXXXXXXXX
FIREBASE_MEASUREMENT_ID=X-XXXXXXXXXXX
```

### install firebase module

```bash
yarn add firebase
```

### deploy to GAE

create [app.yaml](app.yaml).

build project

```bash
yarn build
> line-pay-drink-bar@1.0.0 build 
> nuxt build

✔ Client
  Compiled successfully in 25.91s

✔ Server
  Compiled successfully in 8.88s

Entrypoint app = server.js
```

deploy to GAE/SE

```bash
gcloud app deploy app.yaml --project [YOUR_PROJECT_ID]
```

browse app

```bash
gcloud app browse
```

## LINE Pay

### Create Sandbox for develop

https://pay.line.me/jp/developers/techsupport/sandbox/testflow?locale=ja_JP

### install dependencies

```bash
yarn add line-pay uuid consola
```

### add Chanel info to .evn and gae-envs.yaml

```
LINE_PAY_CHANNEL_ID=XXXXXXXXXXX
LINE_PAY_CHANNEL_SECRET=XXXXXXXXXXX
```

## LIFF

LINE Front-end Framework

See official document
[LINE Front-end Framework](https://developers.line.biz/ja/docs/liff/)

### add script link to nuxt.config.js

```js
script: [
  { src: 'https://static.line-scdn.net/liff/edge/2.1/sdk.js' },
],
```

### implement liff initialize logic in plugin

See [plugins/liff.js](plugins/liff.js)

implement but do not set plugin in nuxt.config.js.
Because liff cannot use before load window object...

### call liff plugin method in page/component

call liff plugin method on mounted.

cannot use in asyncData ...

```js
  async mounted() {
    const lineUserId = await getLineUserId()
    ...
```

## vConsole

Useful debug tool for LIFF development

### add script link to nuxt.config.js

```js
script: [
  {
    src:
      'https://cdnjs.cloudflare.com/ajax/libs/vConsole/3.3.4/vconsole.min.js'
  }
],
```

### Initialize vConsole in default layout

initialize vConsole in mounted

```js
  mounted() {
    consola.log('USE_VCONSOLE', process.env.USE_VCONSOLE)
    if (process.env.USE_VCONSOLE) {
      consola.log('Initializing vConsole')
      this.initVconsole()
    }
  },
  methods: {
    initVconsole() {
      // vConsoleをイニシャライズ
      /* eslint no-unused-vars: 0 */
      const vconsole = new window.VConsole({
        defaultPlugins: ['system', 'network', 'element', 'storage'],
        maxLogNumber: 1000,
        onReady() {
          console.log('vConsole is ready.')
        },
        onClearLog() {
          console.log('on clearLog')
        }
      })
    }
  }
```

### Set use vConsole flag as environment value in to .evn and gae-envs.yaml

```
USE_VCONSOLE=true
```

## Animation for lottery

### Install animate.css

```bash
yarn add animate.css
```

### Set CSS in nuxt.config.js

```js
css: ['animate.css/animate.min.css'],
```

### Create lottery component use vue transition and animate.css

See [components/LotteryBox.vue](components/LotteryBox.vue)


## Obniz

### install obniz sdk

```bash
yarn add obniz
```
### implement dispense drink by DCMotor via obniz

```js
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
      obniz.display.print('Dispensing at Slot', slot)
      motor.power(100)
      motor.forward()
      setTimeout(function() {
        // Dispense finished
        motor.stop()
        obniz.close()
        resolve()
      }, dispenseTime)
    }
  })
}
```


