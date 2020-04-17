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
      item-list(
        :items="items"
        @purchaseItem="purchaseItem"
      )
</template>

<script>
import consola from 'consola'
import ItemList from '~/components/ItemList.vue'

export default {
  components: {
    ItemList
  },
  asyncData(context) {
    return { items: context.req.items }
  },
  methods: {
    async purchaseItem(item) {
      consola.log('purchaseItem called!', Object.assign({}, item))
      // TODO get userId from LIFF
      const data = {
        userId: 'DUMMY_USER9999',
        item
      }
      const result = await this.$axios.$post(`/pay/request`, data)
      consola.log('result', result)
      // Move to LINE Pay payment page
      window.location.href = result.paymentUrl
    }
  }
}
</script>
