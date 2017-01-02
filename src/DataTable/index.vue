<template>
  <div class="container" data-table>
    <div class="row m-b-10 clearfix">
      <div :class="'col-sm-' + (conf.searchInput ? 6 : 10)">
        <slot name="opt"><!-- operation bar slot --></slot>
      </div>
      <div class="pull-right" :class="'col-sm-' + (conf.searchInput ? 6 : 2)">
        <div class="pull-right">
          <header-settings v-if="conf.headerSettings"
            :columns.sync="columns">
          </header-settings>
        </div>
        <div v-if="conf.searchInput" class="pull-right" style="width:75%">
          <search-input :placeholder="conf.searchInput"></search-input>
        </div>
      </div>
    </div><!-- .row -->
    <div class="row">
      <div class="col-sm-12">
        <table v-show="data.length" class="table table-striped table-bordered">
          <thead>
            <tr>
              <th v-if="conf.multiSelect" width="1em">
                <multi-select :total="data.length"></multi-select>
              </th>
              <th v-for="column in columns" v-show="!column.defaultHidden" transition="fade">
                {{ column.title }}
                <head-sort v-if="column.sort" :field="column.field" class="pull-right"></head-sort>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data">
              <td v-if="conf.multiSelect" width="1em">
                <multi-select :id="item[conf.idField]"></multi-select>
              </td>
              <td v-for="column in columns" v-show="!column.defaultHidden" transition="fade">
                <component v-if="column.component"
                  :is="column.component"
                  :row.sync="item"
                  :field="column.field"
                  :value="item[column.field]">
                </component>
                <template v-else>
                  {{ item[column.field]  }}
                </template>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-show="!data.length" class="alert">
          <p class="text-center text-muted">( No Data )</p>
        </div>
      </div>
    </div><!-- .row -->
    <div class="row clearfix">
      <div class="col-sm-6 nowrap">
        <strong>Total</strong> <span class="badge">{{ total }}</span>,&nbsp;
        <limit-select class="dsp-inl-b" v-if="conf.limitSelect" :total="total"></limit-select>
      </div>
      <div class="col-sm-6">
        <pagination class="pull-right" v-if="conf.pagination" :total="total"></pagination>
      </div>
    </div><!-- .row -->
  </div><!-- .container -->
</template>
<script>
import HeadSort from './HeadSort/index.vue'
import HeadSortMixin from './HeadSort/mixin'
import MultiSelect from './MultiSelect/index.vue'
import MultiSelectMixin from './MultiSelect/mixin'
import HeaderSettings from './HeaderSettings.vue'
import LimitSelect from './LimitSelect.vue'
import Pagination from './Pagination.vue'
import SearchInput from './SearchInput.vue'
import _assignIn from 'lodash/assignIn'

export default {
  mixins: [HeadSortMixin, MultiSelectMixin],
  components: {
    HeadSort, MultiSelect, HeaderSettings,
    LimitSelect, Pagination, SearchInput
  },
  props: {
    columns: { type: Array, required: true },
    data: { type: Array, required: true },
    total: { type: Number, required: true },
    checkedIds: { type: Array, twoWay: true },
    config: { type: Object, default: () => ({}) }
  },
  computed: {
    conf () {
      return {
        multiSelect: true, headerSettings: true,
        limitSelect: true, pagination: true,
        searchInput: true, idField: 'id',
        // default config shown as above
        ...this.config
      }
    }
  },
  init () {
    _assignIn(
      this.$options.components,
      this.$parent.$options.components.__proto__
    )
  },
  attached () {
    $('[data-toggle=tooltip]').tooltip()
  }
}
</script>
<style scoped>
.fade-transition {
  transition: opacity .1s ease;
}
.fade-enter, .fade-leave {
  opacity: 0;
}
.m-b-10 {
  margin-bottom: 10px;
}
.dsp-inl-b {
  display: inline-block;
}
.nowrap {
  white-space: nowrap;
}
</style>
