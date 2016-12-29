<template>
  <div class="nowrap">
    <label>
      共 <span class="label label-default">{{ total }}</span> 条记录，
      每页显示
      <select
        class="form-control input-sm inline-select"
        v-model="limit"
        @change="syncQs">
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="40">40</option>
        <option value="80">80</option>
        <option value="100">100</option>
      </select>
    条</label>
  </div>
</template>
<script>
import updateQuery from 'MIXIN/updateQuery'
/**
 * 表格：每页显示多少条记录选择框
 * @props {Number} total 记录总数（可选）
 */
export default {
  mixins: [updateQuery],
  created () {
    // 同步 query string 中的 limit
    let limit = +this.$route.query.limit
    if (limit) {
      // TODO：有效性处理
      this.limit = limit
    }
  },
  props: {
    total: { type: Number, required: true }
  },
  data () {
    return {
      limit: 10
    }
  },
  methods: {
    // sync query string
    syncQs () {
      this.updateQuery({ limit: this.limit })
    }
  }
}
</script>
<style>
.nowrap {
  white-space: nowrap;
}
.inline-select {
  display: inline-block;
  width: 30%;
}
</style>
