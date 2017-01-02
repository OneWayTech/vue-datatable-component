<template>
  <label>
    show&nbsp;
    <select class="form-control input-sm inline-select" v-model="limit$">
      <option value="10">10</option>
      <option value="20">20</option>
      <option value="40">40</option>
      <option value="80">80</option>
      <option value="100">100</option>
    </select>
    &nbsp;records per page
  </label>
</template>
<script>
import syncQuery from 'vue-sync-query-mixin'

export default {
  mixins: [syncQuery],
  data: () => ({ limit$: 10 }),
  ready () {
    this.syncQuery()
  }
}
</script>
<style scoped>
.inline-select {
  display: inline-block;
  width: 30%;
}
</style>
