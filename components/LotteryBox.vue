<template lang="pug">
  v-container(
    fluid
    justify-center
    align-center
  )
    h2.mx-auto.text-center(
      v-if="!showResult"
    )
      | 抽選してみよう！
    div.mt-4
      transition(
        enter-active-class="bounceInDown"
        )
        div.animated.display-1.font-weight-black.text-center(
          v-if="showResult"
        )
          | {{ resultTitle }}
      transition(
        enter-active-class="bounceInDown"
        )
        div.animated.headline.text-center.mt-2(
          v-if="showResult"
        )
          | {{ resultDescription }}
      div
        v-layout(justify-center)
          v-btn.mt-4(
            block
            color="success" 
            @click="showResult=true"
            dark
            v-if="!showResult"
          )
            | 抽選する
</template>

<script>
export default {
  props: {
    lotteryResult: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      showResult: false,
      resultTitle: 'はずれ…',
      resultDescription: 'また挑戦してね'
    }
  },
  mounted() {
    if (this.lotteryResult) {
      this.resultTitle = 'あたり！！！'
      this.resultDescription = 'おめでとうございます〜'
    }
  },
  methods: {}
}
</script>
