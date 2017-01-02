import isUndefined from '../../utils/isUndefined'

export default {
  events: {
    TOGGLE (id) {
      const { checkedIds } = this
      if (isUndefined(checkedIds)) {
        return console.error('checkedIds should be passed for multi-select')
      }

      const targetIdx = checkedIds.indexOf(id)
      checkedIds[targetIdx === -1 ? 'push' : '$remove'](id)
      this.$broadcast('TOGGLE', checkedIds.length)
    },
    TOGGLE_ALL (headCheckboxStatus) {
      // clear all, they will dispatch their ids back if status is true
      this.checkedIds = []
      this.$broadcast('TOGGLE_ALL', headCheckboxStatus)
    }
  }
}
