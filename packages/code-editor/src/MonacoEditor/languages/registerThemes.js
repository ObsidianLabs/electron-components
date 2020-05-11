import * as monaco from 'monaco-editor'

export default async function () {
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
      "menu.selectionBackground": "#8F55EC",
      "list.focusForeground": "#F9FAF4",
      "list.focusBackground": "#8F55EC",
      // "list.highlightForeground": "#F9FAF4",
    },
    rules: [
      { token: '', foreground: 'F9FAF4', background: '252527' },
      { token: 'keyword', foreground: 'AD7AFF' },
      { token: 'keyword.eosio', foreground: 'AD7AFF', fontStyle: 'bold' },
      { token: 'keyword.operator', foreground: 'F92672' },
      { token: 'type', foreground: '66D9EF', fontStyle: 'italic' },
      { token: 'type.eosio', foreground: '66D9EF', fontStyle: 'bold' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'constant', foreground: 'E6DB74' },
      { token: 'function', foreground: 'AD7AFF' },
      // { token: 'comment.js', foreground: '008800', fontStyle: 'bold' },
      // { token: 'comment.css', foreground: '0000ff' } // will inherit fontStyle from `comment` above
    ]
  })
}