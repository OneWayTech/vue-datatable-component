<template>

  <div class="input-group">
    <span class="input-group-btn">
      <button v-show="search"
        class="btn btn-default waves-effect"
        @click="clear">
        <i class="fa fa-times"></i>
      </button>
    </span>
    <input
      type="search"
      class="form-control"
      :placeholder="placeholder"
      @keyup.enter="syncQs"
      v-model="search" />
    <span class="input-group-btn">
      <button
        class="btn waves-effect"
        @click="syncQs">
        <i class="fa fa-search"></i>
      </button>
    </span>
  </div>

</template>
<script>
import updateQuery from 'MIXIN/updateQuery'
/**
 * 表格搜索框
 * @props {String} placeholder（可选）
 */
export default {
  mixins: [updateQuery],
  created () {
    // 同步 query string 中的 search
    let search = $.trim(this.$route.query.search)
    if (search) {
      // TODO：有效性处理
      this.search = search
    }
  },
  props: {
    placeholder: {
      coerce (v) {
        return v ? (typeof v === 'boolean' ? '快速搜索...' : v) : v
      }
    }
  },
  data () {
    return {
      search: ''
    }
  },
  methods: {
    syncQs () {
      let search = $.trim(this.search)
      // if (!search) return
      
      // 更新 URL 的 query（该函数来自 mixin）
      this.updateQuery({ search })
    },
    clear () {
      this.search = ''
      this.syncQs()
    }
  }
}
</script>
