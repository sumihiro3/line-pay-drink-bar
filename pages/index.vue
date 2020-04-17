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
      await this.callsample()
    },
    async callsample() {
      const usersJson = await this.$axios.$get(`/users`)
      console.log(usersJson)
    }
  }
}
</script>
