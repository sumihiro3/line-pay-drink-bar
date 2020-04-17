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
        | {{ payStatus }}
      div
        | {{ orderId }}
</template>

<script>
import consola from 'consola'

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
      // TODO get userId from LIFF
      userId: 'DUMMY_USER9999',
      transactionId: '',
      payStatus: '',
      orderId: ''
    }
  },
  async mounted() {
    // finalize payment
    const result = await this.$axios.$get(
      `/pay/confirm?userId=${this.userId}&transactionId=${this.transactionId}`
    )
    this.payStatus = result.payStatus
    this.orderId = result.orderId
  },
  methods: {}
}
</script>
