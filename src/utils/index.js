module.exports = {
  get Touchable() {
    return require('react-native-platform-touchable').default
  },
  get SafeAreaView() {
    return require('react-native-safe-area-view').default
  },
  get Icon() {
    return require('react-native-vector-icons/MaterialCommunityIcons').default
  },
  get Utils() {
    return require('rn-apps-utils').default
  }
}