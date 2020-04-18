<template lang="pug">
  v-layout(
    column
    justify-center
    align-center
  )
    v-flex(
      xs12
      sm12
      md12
      lg12
      xl12
    )
      div
        | PAY_STATUS: {{ payStatus }}
      div
        | ORDER_ID: {{ orderId }}
      div
        | LINE_USER_ID: {{ lineUserId }}
      div
        | TRANSACTION_ID: {{ transactionId }}
</template>

<script>
import consola from 'consola'
import getLineUserId from '~/plugins/liff'

export default {
  components: {
    // ItemList
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
      lineUserId: null,
      transactionId: '',
      payStatus: '',
      orderId: ''
    }
  },
  async mounted() {
    const lineUserId = await getLineUserId()
    if (!lineUserId) {
      consola.log('Need to login!')
      // eslint-disable-next-line no-undef
      liff.login()
    } else {
      this.lineUserId = lineUserId
      // finalize payment
      const result = await this.$axios.$get(
        `/pay/confirm?userId=${this.lineUserId}&transactionId=${this.transactionId}`
      )
      this.payStatus = result.payStatus
      this.orderId = result.orderId
    }
  },
  methods: {}
}
</script>
