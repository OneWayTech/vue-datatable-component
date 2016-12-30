<template>
  <input type="search" class="form-control"
    :placeholder="placeholder"
    v-model="search$" debounce="500">
</template>
<script>
import syncQuery from 'vue-sync-query-mixin'

export default {
  mixins: [syncQuery],
  props: {
    placeholder: {
      coerce: v => v ? (typeof v === 'boolean' ? 'Search...' : v) : v
    }
  },
  data: () => ({ search$: '' }),
  ready () {
    this.syncQuery()
  }
}
</script>
