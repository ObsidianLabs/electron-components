import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import external from 'rollup-plugin-peer-deps-external'
import resolve from '@rollup/plugin-node-resolve'
import url from '@rollup/plugin-url'

import pkg from './package.json'

export default {
  input: pkg.source,
  output: [
    {
      file: pkg.browser,
      format: 'es',
      sourcemap: true
    }
  ],
  plugins: [
    external(),
    url(),
    babel({ exclude: 'node_modules/**' }),
    resolve(),
    commonjs()
  ],
  watch: {
    include: 'src/**',
  }
}
