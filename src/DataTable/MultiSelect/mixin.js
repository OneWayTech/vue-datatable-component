export default {
  events: {
    TOGGLE (id) {
      const targetIdx = this.checkedIds.indexOf(id)
      if (targetIdx === -1) {
        this.checkedIds.push(id)
      } else {
        this.checkedIds.$remove(id)
      }
      this.$broadcast('TOGGLE', this.checkedIds.length)
    },
    TOGGLE_ALL (headCheckboxStatus) {
      this.checkedIds = [] // 先清空，若是全勾选则随后会逐个 dispatch 回来
      this.$broadcast('TOGGLE_ALL', headCheckboxStatus)
    }
  }
}
