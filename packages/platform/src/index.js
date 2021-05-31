let type
if (window.require) {
  type = 'desktop'
} else {
  type = 'web'
}

export default {
  get type () { return type },
  get isDesktop() { return type === 'desktop' },
  get isWeb() { return type === 'web' },
}