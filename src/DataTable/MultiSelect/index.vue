<template>
  <input type="checkbox" v-model="status" @change="handleChange" />
</template>
<script>
/**
 * 表单行首的勾选框，可存在于 thead / tbody
 * 【注意】使用本组件的表单组件，必须引入同文件夹下的 mixin.js
 *
 * @props {Number}        total 当前表格元素总数（由 thead 的 checkbox 传入）
 * @props {String/Number} id    当前元素的 ID（由 tbody 的 checkbox 传入）
 */
export default {
  props: ['total', 'id'],
  created () {
    if (typeof this.total === 'undefined' && typeof this.id === 'undefined') {
      console.error('必须传入 total 或 id 二者其一')
    }
  },
  data () {
    return {
      status: false // 默认不勾选
    }
  },
  methods: {
    handleChange () {
      if (typeof this.id !== 'undefined') {
        this.$dispatch('TOGGLE', this.id)
      } else {
        this.$dispatch('TOGGLE_ALL', this.status)
      }
    }
  },
  events: {
    // for thead checkbox
    TOGGLE (lenOfCheckedIds) {
      if (this.total) {
        this.status = lenOfCheckedIds === this.total
      }
    },
    // for tbody checkbox
    TOGGLE_ALL (headCheckboxStatus) {
      this.status = headCheckboxStatus // for all checkbox
      if (typeof this.id !== 'undefined' && headCheckboxStatus) {
        // 逐个 dispatch 回去
        this.$dispatch('TOGGLE', this.id)
      }
    }
  }
}
</script>
