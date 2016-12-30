export default {
  events: {
    TOGGLE (id) {
      const targetIdx = this.checkedIds.indexOf(id)
      this.checkedIds[targetIdx === -1 ? 'push' : '$remove'](id)
      this.$broadcast('TOGGLE', this.checkedIds.length)
    },
    TOGGLE_ALL (headCheckboxStatus) {
      // clear all, they will dispatch their ids back if status is true
      this.checkedIds = []
      this.$broadcast('TOGGLE_ALL', headCheckboxStatus)
    }
  }
}
