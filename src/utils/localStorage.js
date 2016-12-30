const LS = localStorage

class LocalStorage {
  get (key) {
    const origVal = LS.getItem(key)
    if (!origVal) return

    let val
    try {
      val = JSON.parse(origVal)
    } catch (e) {
      console.warn('invalid local settings')
    }
    return val
  }

  save (key, val) {
    LS.setItem(key, JSON.stringify(val))
  }

  remove (key) {
    LS.removeItem(key)
  }
}

export default new LocalStorage()
