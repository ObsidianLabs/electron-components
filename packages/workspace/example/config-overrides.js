const {
  override,
  addWebpackExternals,
  addWebpackPlugin
} = require('customize-cra')

const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

let monacoPlugin
if (process.env.CDN) {
  monacoPlugin = addWebpackExternals({
    'monaco-editor': 'monaco'
  })
} else {
  monacoPlugin = addWebpackPlugin(
    new MonacoWebpackPlugin({
      languages: ['json', 'javascript', 'markdown']
    })
  )
}

module.exports = {
  webpack: override([monacoPlugin])
}
