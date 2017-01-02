<template>
  <a href="javascript:;" @click="handleSort">
    <i class="fa" :class="`fa-sort-${order}` | trimTailBar"></i>
  </a>
</template>
<script>
import updateQuery from 'vue-update-query-mixin'
/**
 * Sorting arrows inside <th>
 * Notice: this component must work along with ./mixin.js
 *
 * e.g. <url>?order=desc&sort=id
 */
export default {
  mixins: [updateQuery],
  props: {
    field: { type: String, required: true }
  },
  data: () => ({ order: '' }),
  ready () {
    // sync with query manually at the beginning
    const { sortBy: field, order } = this.$route.query
    if (field === this.field) this.order = order
  },
  methods: {
    handleSort () {
      let { order, field } = this
      order = order === 'desc' ? 'asc' : 'desc'

      this.updateQuery({
        order: this.order = order,
        sortBy: field
      })
      this.$dispatch('RESET_OTHER_SORTS', field)
    }
  },
  filters: {
    trimTailBar: s => s.replace(/-$/, '')
  },
  events: {
    // if an other field is sorting, reset myself
    RESET_SORT (sortField) {
      if (sortField !== this.field) this.order = ''
    }
  }
}
</script>
