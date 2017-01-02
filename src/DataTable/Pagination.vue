<template>
  <ul class="pagination m-t-0">
    <li :class="{ 'disabled': isFirstPage }"
      @click="turnPage(-1)">
      <a href="javascript:;">
        <i class="fa fa-arrow-left"></i>
      </a>
    </li>
    <li v-for="i in displayPageBtns" track-by="$index"
      :class="{ 'active': i === curPageIdx + 1 }">
      <a v-if="i" href="javascript:;" @click="handleClick(i)">
        {{ i }}
      </a>
      <a v-else>
        <i class="fa fa-ellipsis-h"></i>
      </a>
    </li>
    <li :class="{ 'disabled': isLastPage }"
      @click="turnPage(1)">
      <a href="javascript:;">
        <i class="fa fa-arrow-right"></i>
      </a>
    </li>
  </ul>
</template>
<script>
import syncQuery from 'vue-sync-query-mixin'

export default {
  mixins: [syncQuery],
  props: {
    total: { type: Number, required: true }
  },
  ready () {
    this.syncQuery()
  },
  data: () => ({ offset$: 0 }),
  computed: {
    limit () {
      return +this.$route.query.limit || 10
    },
    isFirstPage () {
      return +this.offset$ === 0 || this.limit >= this.total
    },
    isLastPage () {
      return +this.offset$ + this.limit >= this.total
    },
    totalPageIdx () {
      return Math.ceil(this.total / this.limit) - 1
    },
    curPageIdx () {
      return Math.ceil(+this.offset$ / this.limit)
    },
    displayPageBtns () {
      const n = this.totalPageIdx + 1 // total pages
      const i = this.curPageIdx + 1 // current pages

      // 0 represents '···'
      if (n <= 7) return (n => {
        const arr = []
        while (n) { arr.unshift(n--) }
        return arr
      })(n)

      if (i <= 3 || n - i < 3)
        return [1, 2, 3, 0, n - 2, n - 1, n]

      if (i === 4)
        return [1, 2, 3, 4, 0, n - 1, n]

      if (i === n - 3)
        return [1, 2, 0, i, n - 2, n - 1, n]

      return [1, 0, i - 1, i, i + 1, 0, n]
    }
  },
  methods: {
    handleClick (n) {
      this.offset$ = (n - 1) * this.limit
    },
    turnPage (i) {
      if (i < 0 && this.isFirstPage || i > 0 && this.isLastPage) return
      this.offset$ = +this.offset$ + i * this.limit
    }
  }
}
</script>
<style scoped>
.m-t-0 {
  margin-top: 0;
}
</style>
