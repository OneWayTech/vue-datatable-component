<template>
  <input type="checkbox" v-model="status" @change="handleChange">
</template>
<script>
import isUndefined from '../../utils/isUndefined'
/**
 * checkbox for multiple select inside the leading <th>/<td>
 * Notice: this component must work along with ./mixin.js
 *
 * @props {Number}        total (must pass this prop while inside <th>)
 * @props {Number/String} id    (must pass this prop while inside <td>)
 */
export default {
  props: ['total', 'id'],
  data: () => ({ status: false }), // defaults to unchecked
  created () {
    if (isUndefined(this.total) && isUndefined(this.id)) {
      console.error('Neither total nor id is passed from the parent')
    }
  },
  methods: {
    handleChange () {
      this.id
        ? this.$dispatch('TOGGLE', this.id)
        : this.$dispatch('TOGGLE_ALL', this.status)
    }
  },
  events: {
    // for the <th> checkbox
    TOGGLE (lenOfCheckedIds) {
      if (this.total) {
        this.status = lenOfCheckedIds === this.total
      }
    },
    // for the <td> checkbox
    TOGGLE_ALL (headCheckboxStatus) {
      this.status = headCheckboxStatus
      // dispatch back
      this.id && headCheckboxStatus && this.$dispatch('TOGGLE', this.id)
    }
  }
}
</script>
