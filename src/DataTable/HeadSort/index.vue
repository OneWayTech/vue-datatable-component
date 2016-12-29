<template>
  <a href="javascript:;"
    class="fa pull-right"
    :class="icon"
    @click="syncQs">
  </a>
</template>
<script>
import updateQuery from 'vue-update-query-mixin'
/**
 * Sorting arrows inside <th>
 * Notice: this component must work along with ./mixin.js
 */
const baseIcon = 'fa-sort'
const ascIcon = 'fa-sort-asc'
const descIcon = 'fa-sort-desc'

export default {
  mixins: [updateQuery],
  props: {
    field: { type: String, required: true }
  },
  data: () => ({ icon: baseIcon }),
  methods: {
    syncQs () {
      let order
      switch (this.icon) {
        case baseIcon:
        case ascIcon:
          order = 'desc'
          this.icon = descIcon
          break
        default:
          order = 'asc'
          this.icon = ascIcon
          break
      }
      this.updateQuery({ order, sort: this.field })
      this.$dispatch('RESET_OTHER_SORTS', this.field)
    }
  },
  events: {
    // if an other field is sorting, reset myself
    RESET_SORT (curField) {
      if (curField === this.field) return
      this.icon = 'fa-sort'
    }
  }
}
</script>
