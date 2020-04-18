<template lang="pug">
  v-app
    v-app-bar(fixed app color="success")
      v-toolbar-title.white--text.font-weight-black(v-text="title")
      v-spacer
    v-content
      v-container
        nuxt
    v-footer(:fixed="fixed" app)
      span
        | &copy; {{ new Date().getFullYear() }} LINE API Experts
</template>

<script>
import consola from 'consola'
export default {
  data() {
    return {
      fixed: false,
      title: 'LINE Pay Drink Bar'
    }
  },
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
}
</script>
