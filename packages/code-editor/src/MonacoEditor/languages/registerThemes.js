import { getColor } from '@obsidians/ui-components'
import convert from 'color-convert'

import * as monaco from 'monaco-editor'

const hex = value => {
  const hexValue = Number(value || 0).toString(16)
  return hexValue.length === 1 ? `0${hex}` : hexValue
}

export default async function () {
  const primaryColorRgb = getColor('--color-primary')
  const rgb = primaryColorRgb.match(/\((\d+),\s*(\d+),\s*(\d+)\)/)
  const hsl = convert.rgb.hsl(+rgb[1], +rgb[2], +rgb[3])
  const primaryColor = convert.hsl.hex(hsl[0], hsl[1], hsl[2])
  const lightPrimaryColor = convert.hsl.hex(hsl[0], 100, 75)

  monaco.editor.defineTheme('obsidians', {
    base: 'vs-dark', // can also be vs-dark or hc-black
    inherit: true, // can also be false to completely replace the builtin rules
    colors: {
      "editor.foreground": "#F9FAF4",
      "editor.background": "#252527",
      "editor.selectionBackground": "#494950",
      "editor.lineHighlightBackground": "#2F2F32",
      "editorCursor.foreground": "#F9FAF4",
      "textLink.foreground": "#AD7AFF",
      "focusBorder": "#AD7AFF",
      // "inputOption.activeBackground": "#AD7AFF88",
      // "input.border": "#AD7AFF",
      "menu.foreground": "#FFFFFF",
      "menu.background": "#252527",
      "menu.selectionBackground": `#${primaryColor}`,
      "list.focusForeground": "#F9FAF4",
      "list.focusBackground": `#${primaryColor}`,
      // "list.highlightForeground": "#F9FAF4",
    },
    rules: [
      { token: '', foreground: 'F9FAF4', background: '252527' },
      { token: 'keyword', foreground: lightPrimaryColor },
      // { token: 'keyword.eosio', foreground: lightPrimaryColor, fontStyle: 'bold' },
      { token: 'keyword.operator', foreground: 'CCCCCC' },
      { token: 'type', foreground: '66D9EF', fontStyle: 'italic' },
      // { token: 'type.eosio', foreground: '66D9EF', fontStyle: 'bold' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'constant', foreground: 'E6DB74' },
      { token: 'function', foreground: lightPrimaryColor, fontStyle: 'italic' },
    ]
  })
}