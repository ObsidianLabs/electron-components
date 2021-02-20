import platform from '@obsidians/platform'
import actions from '../actions'

const handlers = {}

actions.channel.on('ready', (action) => {
  handlers[action] = actions[action]
})

let contextMenu
if (platform.isDesktop) {
  contextMenu = [
    { text: 'New File', onClick: node => handlers.newFile(node) },
    { text: 'New Folder', onClick: node => handlers.newFolder(node) },
    null,
    { text: 'Open' },
    null,
    { text: 'Open Containing Folder', onClick: node => handlers.showInFinder(node) },
    { text: 'Open in Terminal', onClick: node => handlers.openInTerminal(node) },
    null,
    { text: 'Delete', onClick: node => handlers.deleteFile(node) },
  ]
} else {
  contextMenu = [
    { text: 'New File', onClick: node => handlers.newFile(node) },
    { text: 'New Folder', onClick: node => handlers.newFolder(node) },
    // null,
    // { text: 'Download' },
    null,
    { text: 'Delete', onClick: node => handlers.deleteFile(node) },
  ]
}

export default contextMenu