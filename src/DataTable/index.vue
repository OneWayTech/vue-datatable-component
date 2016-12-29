<template>
  <div class="container" data-table>

    <div class="row m-b-10">
      <div :class="conf.searchInput ? 'col-sm-6' : 'col-sm-9'">
        <slot name="opt"><!-- 父组件自定义操作栏 --></slot>
      </div>
      <div class="pull-right" :class="conf.searchInput ? 'col-sm-6' : 'col-sm-3'">
        <div class="input-group pull-right">
          <header-settings v-if="conf.headerSettings"
            :columns.sync="columns">
          </header-settings>
          <button v-if="conf.forceReloadBtn"
            data-toggle="tooltip" data-placement="top"
            class="btn" title="强制刷新页面" @click="forceReload">
            <i class="fa fa-refresh"></i>
          </button>
        </div>
        <div v-if="conf.searchInput" class="pull-right" style="width:75%">
          <search-input :placeholder="conf.searchInput"></search-input>
        </div>
        <div class="pull-right">
          <slot name="filter"></slot>
        </div>
      </div>
    </div>
    
    <div class="row">
      <div class="col-sm-12">
        <table class="table table-striped table-bordered">
          <thead>
            <tr>
              <th v-if="conf.multiSelect" width="1em">
                <multi-select :total="data.length"></multi-select>
              </th>
              <th v-for="column in columns" v-show="!column.defaultHidden"
                :class="'-display-settings-' + column.field">
                {{ column.title }}
                <head-sort v-if="column.sort" :field="column.field"></head-sort>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data">
              <td v-if="conf.multiSelect" width="1em">
                <multi-select :id="item[idField]"></multi-select>
              </td>
              <td v-for="column in columns" v-show="!column.defaultHidden"
                :class="'-display-settings-' + column.field">
                <!-- row 表示整条记录，field 表示键名，value 表示键值 -->
                <component v-if="column.component"
                  :is="column.component"
                  :row.sync="item"
                  :field="column.field"
                  :value="item[column.field]">
                </component>
                <span v-if="!column.component">
                  {{ item[column.field] | avoidEmpty  }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-show="!data.length" class="alert">
          <p class="text-center text-muted">Oops! No Data ...</p>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-sm-12">
        <limit-select class="display-inline" v-if="conf.limitSelect" :total="total"></limit-select>
        <pagination class="pull-right" v-if="conf.pagination" :total="total"></pagination>
      </div>
    </div>

  </div>
</template>
<script>
import HeaderSettings from './HeaderSettings'
import HeadSort from './HeadSort/'
import HeadSortMixin from './HeadSort/mixin'
import LimitSelect from './LimitSelect'
import MultiSelect from './MultiSelect/'
import MultiSelectMixin from './MultiSelect/mixin'
import Pagination from './Pagination'
import SearchInput from './SearchInput'
import forceReload from 'MIXIN/forceReload'
import _assignIn from 'lodash/assignIn'
/**
 * 数据表格
 * 
 * @props {Array > Object}    columns 表头（.sync）
 * @props {Array > Object}    data 表格数据
 * @props {Number} total      总记录数（并非每页显示数）
 * @props {String} idField    记录的主键名称（可选，默认为 'id'）
 * @props {Array}  checkedIds 选中的 ID（可选，当且仅当使用 MultiSelect 组件时有用）
 * @props {Object} config     自定义表格配置（可选，默认配置见下）
 */
// 默认表格配置：全显示
const DEFAULT_CONFIG = {
  headerSettings: true, limitSelect: true,
  multiSelect: false, pagination: true,
  forceReloadBtn: true,
  // 特别关照：若传入字符串则搜索框的 placeholder 显示该字符串
  // 详情请看上面模板中的 :placeholder="conf.searchInput"
  searchInput: true
}

export default {
  mixins: [HeadSortMixin, MultiSelectMixin, forceReload],
  components: {
    HeaderSettings, HeadSort, LimitSelect,
    MultiSelect, Pagination, SearchInput
  },
  props: {
    columns: { type: Array, required: true, twoWay: true },
    data: { type: Array, required: true },
    total: { type: Number, required: true, default: 0 },
    idField: { type: String, default: 'id' },
    checkedIds: { type: Array, twoWay: true },
    config: { type: Object, default: () => ({}) }
  },
  init () {
    // 为避免全局注册，这里直接获取父组件的内部注册组件
    const myComponent = this.$options.components
    const parentComp = this.$parent.$options.components // 这一般是一个空对象
    const parentCompProto = parentComp.__proto__ // 这才是存储着实例化的组件

    _assignIn(myComponent, parentComp)
    _assignIn(myComponent, parentCompProto)
  },
  computed: {
    conf () {
      return { ...DEFAULT_CONFIG, ...this.config }
    }
  },
  attached () {
    $('[data-toggle=tooltip]').tooltip()
  }
}
</script>
