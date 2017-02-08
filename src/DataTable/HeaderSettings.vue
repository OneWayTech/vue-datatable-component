<template>
  <div class="btn-group" data-toggle="tooltip"
    title="Table header settings ( sortable and savable )">
    <button class="btn btn-default dropdown-toggle" data-toggle="dropdown">
      <i class="fa fa-cog"></i> <span class="caret"></span>
    </button>
    <ul class="dropdown-menu overflow-auto p-l-10 l--65" v-el:dropdown-menu>
      <li class="-checkbox-row"
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
            :id="'-chkbox-' + column.field" :value="column.field"
            @change="handleChange(($index - 1) / 2, $event.target.checked)" 
            :checked="!column.defaultHidden">&nbsp;
          <label class="small" :for="'-chkbox-' + column.field">
            {{ column.title }}
          </label>
        </span>
      </li>
      <li class="m-t-5">
        <button class="btn btn-xs btn-block btn-primary"
          @click="save" :disabled="!hasChanged">
          Save settings
        </button>
        <button class="btn btn-xs btn-block btn-warning"
          @click="del" :disabled="!hasBackup">
          Delete saved settings
        </button>
      </li>
    </ul>
  </div>
</template>
<script>
import LS from '../utils/localStorage'
import getCurPath from '../mixins/getCurPath'
import _map from 'lodash/map'
import _omit from 'lodash/omit'
import _xorWith from 'lodash/xorWith'
import _intersectionBy from 'lodash/intersectionBy'
import _intersectionWith from 'lodash/intersectionWith'
import _pullAllBy from 'lodash/pullAllBy'
import _isEqual from 'lodash/isEqual'
import _throttle from 'lodash/throttle'

export default {
  mixins: [getCurPath],
  props: {
    columns: { type: Array, twoWay: true, required: true }
  },
  data: () => ({
    fromIdx: 0,
    toIdx: 0,
    hasBackup: false, // local settings exists?
    hasChanged: false // settings changed?
  }),
  created () {
    const columns = LS.get(this.getCurPath())
    if (!columns) return

    this.hasBackup = true
    console.info('Using local backup settings')

    // Check for new fields (ignore `defaultHidden` field)
    const propCols = _map(this.columns, col => _omit(col, 'defaultHidden'))
    const localCols = _map(columns, col => _omit(col, 'defaultHidden'))

    // no new fields, abort
    if (!_xorWith(propCols, localCols, _isEqual).length) return (this.columns = columns)

    // new fields exist, replace the old ones with them
    const commonCols = _intersectionWith(propCols, localCols, _isEqual)
    const abandonedCols = _xorWith(localCols, commonCols, _isEqual)
    var newCols = _xorWith(propCols, commonCols, _isEqual)
    
    newCols = _intersectionBy(this.columns, newCols, 'field') // get `defaultHidden` back
    _pullAllBy(columns, abandonedCols, 'field') // clear the abandoned fields
    columns.push(...newCols)

    this.columns = columns
    LS.save(this.getCurPath(), columns) // keep local settings in sync

    console.info(`
      Added ${newCols.length} new field(s) to the end,
      removed ${abandonedCols.length} old field(s)
    `)
  },
  computed: {
    columns_ () { // generate empty node for each real node in both sides (for sortable)
      const _columns = []
      if (!this.columns.length) return _columns

      this.columns.forEach(column => _columns.push({}, column))
      _columns.push({})
      return _columns
    },
    origFromIdx () {
      return (this.fromIdx - 1) / 2
    },
    origToIdx () {
      const { fromIdx, toIdx } = this
      let _origToIdx = toIdx / 2

      if (toIdx - fromIdx > 0) _origToIdx -= 1
      return _origToIdx
    },
    shouldRemain () { // remain the same while drag to itself and neighbored empty nodes
      return Math.abs(this.fromIdx - this.toIdx) <= 1
    },
    isDropToEmptyNode () {
      return !(this.toIdx % 2)
    },
    isAllowToDrop () {
      return !this.shouldRemain && this.isDropToEmptyNode
    }
  },
  attached () {
    $(this.$el).tooltip()
    // prevent auto-hide
    $(this.$els.dropdownMenu).on('click', e => e.stopPropagation())

    $(window).on('resize', _throttle(this.resizeDropdown, 250))
    this.resizeDropdown()
  },
  methods: {
    handleChange (idx, isChecked) {
      const col = { ...this.columns[idx] }
      col.defaultHidden = !isChecked
      this.columns.$set(idx, col)

      this.hasChanged = true
    },
    save () {
      LS.save(this.getCurPath(), this.columns)
      console.info('Saved!')
      
      this.hasBackup = true
      this.hasChanged = false
    },
    del () {
      LS.remove(this.getCurPath())
      console.info('Deleted!')

      this.hasBackup = false
      this.hasChanged = true
    },
    resizeDropdown () {
      $(this.$els.dropdownMenu).css('max-height', $(window).height() - 200 + 'px')
    },
    /* the below methods are drag and drop related */
    $getEl (idx) { // DOM is not observable, get it at real time
      return $($(this.$els.dropdownMenu).find('li.-checkbox-row')[idx])
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
    }
  }
}
</script>
<style scoped>
.m-t-5 {
  margin-top: 5px;
}
.p-l-10 {
  padding: 10px;
}
.l--65 {
  left: -65px;
}
.overflow-auto {
  overflow: auto;
}
.small {
  font-size: 12px;
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
</style>
