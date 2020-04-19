<template lang="pug">
  v-container(
    fluid
    justify-center
    align-center
  )
    //- Show dispense progress bar
    v-card(
      v-if="order && !dispenseDone"
    )
      v-card-title.title
        v-layout(justify-center)
          | ありがとうございました！！
      v-card-subtitle.subtitle-2
        v-layout(justify-center)
          | ドリンクを抽出しています...
      v-card-text
        v-layout(justify-center)
          v-avatar(
            size="128"
            tile
          )
            v-img(
              :src="order.item.thumbnailUrl"
            )
        dispense-progress-bar.mt-4(
          :progressLimit="progressLimit"
          @dispenseProgressDone="dispenseProgressDone"
        )
    //- Show lottery box after dispense finished
    v-card(
      v-if="dispenseDone"
    )
      v-card-text
        v-layout(justify-center)
          lottery-box.mt-4(
            :lotteryResult="lotteryResult"
            v-show="dispenseDone"
          )
    //- Show debug info
    div.mt-10(
      v-if="useVConsole === true"
    )
      h1.headline
        | Debug info
      div
        | LINE_USER_ID: {{ lineUserId }}
      div
        | TRANSACTION_ID: {{ transactionId }}
      div
        | ORDER: {{ order }}
      div(v-if="order")
        | ORDER_ID: {{ order.id }}
      div(v-if="order")
        | PAY_STATUS: {{ order.payStatus }}
</template>

<script>
import consola from 'consola'
import DispenseProgressBar from '~/components/DispenseProgressBar.vue'
import LotteryBox from '~/components/LotteryBox.vue'
import getLineUserId from '~/plugins/liff'

export default {
  components: {
    DispenseProgressBar,
    LotteryBox
  },
  asyncData(context) {
    consola.log('transactionId', context.query.transactionId)
    let transactionId = context.query.transactionId
    if (Array.isArray(transactionId)) {
      transactionId = transactionId[0]
    }
    return {
      transactionId
    }
  },
  data() {
    return {
      useVConsole: false,
      lineUserId: null,
      order: null,
      transactionId: '',
      progressLimit: 3000,
      dispenseDone: false,
      lotteryResult: false
    }
  },
  async mounted() {
    this.$store.dispatch('progressCircleOn')
    this.useVConsole = process.env.USE_VCONSOLE === 'true'
    const lineUserId = await getLineUserId()
    if (!lineUserId) {
      if (process.env.SKIP_LOGIN === 'true') {
        consola.warn('Skip LINE Login because of SKIP_LOGIN is set.')
        this.order = this.getDummyOrder()
      } else {
        consola.log('Need to login!')
        // eslint-disable-next-line no-undef
        liff.login()
      }
    } else {
      this.lineUserId = lineUserId
      // finalize payment
      const result = await this.$axios.$get(
        `/pay/confirm?userId=${this.lineUserId}&transactionId=${this.transactionId}`
      )
      this.order = result.order
    }
    this.progressLimit = this.order.item.dispenseTime
    if (this.order.lotteryResult === 'WIN') {
      this.lotteryResult = true
    }
    this.$store.dispatch('progressCircleOff')
  },
  methods: {
    dispenseProgressDone() {
      consola.info('Dispense Progress done!!!')
      this.dispenseDone = true
    },
    getDummyOrder() {
      // for Debug
      const order = {
        lotteryResult: 'LOSE',
        payStatus: 'PAYMENT_COMPLETED',
        userId: 'DUMMY_USER',
        transactionId: '20200418000000000000',
        item: {
          imageUrl:
            'https://my-qiita-images.s3-ap-northeast-1.amazonaws.com/line_things_drink_bar/orange_juice.jpg',
          slot: 1,
          id: 'item-0002',
          description: 'みんな大好きオレンジジュース',
          dispenseTime: 4000,
          unitPrice: 100,
          active: true,
          name: 'オレンジジュース',
          thumbnailUrl:
            'https://my-qiita-images.s3-ap-northeast-1.amazonaws.com/line_things_drink_bar/orange_juice.jpg'
        },
        amount: 100,
        id: 'ORDER-99999999999999',
        currency: 'JPY',
        quantity: 1,
        title: 'オレンジジュース'
      }
      return order
    }
  }
}
</script>

<style>
.v-card {
  box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0),
    0px 0px 0px 0px rgba(0, 0, 0, 0);
}
</style>
