<template>
  <div class="btn-group dropdown-btn-group"
    data-toggle="tooltip" data-placement="top"
    title="设置表头（可拖动排序，支持保存设置到本地）">
    <button class="btn btn-default dropdown-toggle" data-toggle="dropdown">
      <i class="fa fa-cog"></i> <span class="caret"></span>
    </button>
    <ul class="dropdown-menu overflow-auto p-l-10 l--65" v-el:dropdown-menu>
      <li class="checkbox-row"
        v-for="column in columns_"
        :class="{ 'empty-checkbox': !column.field  }"
        :draggable="!!column.field"
        @dragover.prevent
        @dragstart.stop="handleDragStart($index)"
        @drop.stop="handleDrop($index)"
        @dragenter.stop="handleDragEnter($index)"
        @dragleave.stop="handleDragLeave($index)"
        @dragend.prevent="handleDragEnd($index)">
        <span v-if="column.field">
          <input type="checkbox"
            :id="'_chkbox_' + column.field" :value="column.field"
            @change="handleChange(($index - 1) / 2, $event.target.checked)" 
            :checked="!column.defaultHidden" />
          <label :for="'_chkbox_' + column.field">{{ column.title }}</label>
        </span>
      </li>
      <li class="m-t-5" v-if="$root.isSupportLS">
        <button class="btn btn-xs btn-block btn-primary waves-effect waves-light"
          @click="saveConfig" :disabled="!hasChanged">
          保存设置到本地
        </button>
        <button class="btn btn-xs btn-block btn-warning waves-effect waves-light"
          v-if="hasLS" @click="delConfig">
          删除本地设置
        </button>
      </li>
    </ul>
  </div>
</template>
<script>
// BUG：由于 Vue 的 bug，因此须设置相关元素类为 -display-settings-[field]
// TODO：在数据报表中调整表头的时候，每次调整都会请求列表
import getCurPath from 'MIXIN/getCurPath'
import LS from 'UTIL/localStorage'
import _map from 'lodash/map'
import _omit from 'lodash/omit'
import _xorWith from 'lodash/xorWith'
import _intersectionBy from 'lodash/intersectionBy'
import _intersectionWith from 'lodash/intersectionWith'
import _pullAllBy from 'lodash/pullAllBy'
import _isEqual from 'lodash/isEqual'
import _throttle from 'lodash/throttle'
/**
 * @props {Array > Object} columns
 * e.g.
 *   [{
 *     field: 'email',
 *     title: '邮箱',
 *     sort: false,
 *     defaultHidden: true
 *   }]
 */
export default {
  mixins: [getCurPath],
  props: { columns: { type: Array, required: true, twoWay: true } },
  data: () => ({
    fromIdx: 0,
    toIdx: 0,
    hasLS: false, // 是否存在 LS 备份设置
    hasChanged: false // 表头设置是否有变
  }),
  created () {
    if (!this.$root.isSupportLS) return

    let columns = LS.get(this.getCurPath()) // 检查是否有本地设置
    if (!columns) return

    this.hasLS = true
    $.Notification.notify('white', 'bottom left', '正在使用本地的表头设置')

    // 分析表单字段是否有变化，若有则更新本地存储（新增字段采用追加的形式），并提示用户
    // 判断是否相等（需要剔除 “是否默认隐藏” 字段后才进行对比）
    let propCols = _map(this.columns, col => _omit(col, 'defaultHidden'))
    let localCols = _map(columns, col => _omit(col, 'defaultHidden'))

    // 求异，无异则不往下执行
    if (!_xorWith(propCols, localCols, _isEqual).length) return (this.columns = columns)

    let commonCols = _intersectionWith(propCols, localCols, _isEqual) // 求交集
    let newCols = _xorWith(propCols, commonCols, _isEqual)
    let abandonedCols = _xorWith(localCols, commonCols, _isEqual)
    
    newCols = _intersectionBy(this.columns, newCols, 'field') // 补回 defaultHidden 字段
    _pullAllBy(columns, abandonedCols, 'field') // 清除废弃字段
    columns.push(...newCols)

    this.columns = columns
    LS.save(this.getCurPath(), columns) // 同步到 LS
    $.Notification.notify(
      'black', 'bottom left',
      '表头有更新',
      `更新的 ${newCols.length} 个字段已移到最后，${abandonedCols.length} 个无效字段已被移除`
    )
  },
  computed: {
    columns_ () { // 为每个节点左右都生成空节点，用于拖动排序
      let _columns = []
      if (!this.columns.length) return _columns

      this.columns.forEach(column => _columns.push({}, column))
      _columns.push({})
      return _columns
    },
    origFromIdx () {
      return (this.fromIdx - 1) / 2
    },
    origToIdx () {
      let { fromIdx, toIdx } = this
      let _origToIdx = toIdx / 2

      if (toIdx - fromIdx > 0) _origToIdx -= 1
      return _origToIdx
    },
    shouldRemain () { // 拖到相邻两个节点与自身都是保持原状
      return Math.abs(this.fromIdx - this.toIdx) <= 1
    },
    isDropToEmptyEle () { // 只能拖动到空节点（偶数索引）中
      return !(this.toIdx % 2)
    },
    isAllowToDrop () {
      return !this.shouldRemain && this.isDropToEmptyEle
    }
  },
  attached () {
    // 【问题】下拉选择框会截断，故需要调整 div.content 的最小高度
    $('div.content').css('min-height', $(this.$els.dropdownMenu).height() + 100 + 'px')

    $(this.$el).tooltip()

    $(window).on('resize', _throttle(this.resizeDropdown, 250))
    this.resizeDropdown()
  },
  methods: {
    resizeDropdown () {
      $(this.$els.dropdownMenu).css(
        'max-height', $(window).height() - 200 + 'px'
      )
    },
    $getEl (idx) { // 不能使用计算属性，皆因非 Observable
      return $($(this.$els.dropdownMenu).find('li.checkbox-row')[idx])
    },
    addAllowStyle (idx) {
      this.$getEl(idx).addClass('drop-ready')
    },
    rmAllowStyle (idx) {
      this.$getEl(idx).removeClass('drop-ready')
    },
    addDraggingStyle () {
      this.$getEl(this.fromIdx).addClass('dragging-el')
    },
    rmDraggingStyle () {
      this.$getEl(this.fromIdx).removeClass('dragging-el')
    },
    handleDragStart (idx) {
      this.fromIdx = idx
      this.addDraggingStyle()
    },
    handleDrop (idx) {
      this.toIdx = idx

      this.rmAllowStyle(idx)
      this.rmDraggingStyle()
      if (!this.isAllowToDrop) return

      this.columns.splice(this.origToIdx, 0,
        this.columns.splice(this.origFromIdx, 1)[0]
      )
      this.hasChanged = true
    },
    handleDragEnter (idx) {
      this.toIdx = idx
      if (!this.isAllowToDrop) return
      this.addAllowStyle(idx)
    },
    handleDragLeave (idx) {
      this.rmAllowStyle(idx)
    },
    handleDragEnd (idx) {
      this.rmAllowStyle(idx)
      this.rmDraggingStyle()
    },
    /* 往下是业务相关的 */
    handleChange (idx, isChecked) {
      let col = this.columns[idx]
      col.defaultHidden = !isChecked
      this.columns.$set(idx, col)

      // BUG：Vue 的 bug，导致还是需要 jQuery 显示/隐藏表格元素
      $(`.-display-settings-${col.field}`)[isChecked ? 'fadeIn' : 'fadeOut']()

      this.hasChanged = true // 设置表头设置有变的标识
    },
    saveConfig () {
      LS.save(this.getCurPath(), this.columns)
      $.Notification.notify('success', 'bottom left', '保存成功')
      
      this.hasLS = true
      this.hasChanged = false // 重置有无变化的标识
    },
    delConfig () {
      LS.remove(this.getCurPath())
      $.Notification.notify('success', 'bottom left', '已删除')

      this.hasLS = false
      this.hasChanged = true // 使能保存按钮
    }
  }
}
</script>
<style>
.p-l-10 {
  padding: 10px;
}
.empty-checkbox {
  height: .3em;
  transition: height .2s ease;
}
.dragging-el {
  opacity: 0.5;
}
.drop-ready {
  border: 1px dashed gray;
  height: 2.5em;
}
.dropdown-menu label {
  font-size: 12px;
}
.l--65 {
  left: -65px;
}
</style>
