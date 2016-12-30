export default {
  methods: {
    getCurPath () {
      return this.$route.path.split('?')[0]
    }
  }
}
