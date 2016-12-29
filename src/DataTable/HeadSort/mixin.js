export default {
  events: {
    RESET_OTHER_SORTS (field) {
      this.$broadcast('RESET_SORT', field)
    }
  }
}
