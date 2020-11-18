import platform from '@obsidians/platform'
import fileOps from '@obsidians/file-ops'

const handlers = {}

const showInFinder = node => {
  if (node.root) {
    fileOps.current.openItem(node.path)
  } else {
    fileOps.current.showItemInFolder(node.path)
  }
}

const openInTerminal = node => {
  const basePath = node.children ? node.path : fileOps.current.path.dirname(node.path)
  fileOps.current.openInTerminal(basePath)
}

export const registerHandlers = ({ newFile, newFolder, deleteFile }) => {
  handlers.newFile = newFile
  handlers.newFolder = newFolder
  handlers.deleteFile = deleteFile
}

let contextMenu
if (platform.isDesktop) {
  contextMenu = [
    { text: 'New File', onClick: node => handlers.newFile(node) },
    { text: 'New Folder', onClick: node => handlers.newFolder(node) },
    null,
    { text: 'Open' },
    null,
    { text: 'Open Containing Folder', onClick: showInFinder },
    { text: 'Open in Terminal', onClick: openInTerminal },
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