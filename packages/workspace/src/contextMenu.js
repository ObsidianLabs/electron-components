import fileOps from '@obsidians/file-ops'

const { remote } = window.require('electron')

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

const deleteFile = async node => {
  const { response } = await remote.dialog.showMessageBox({
    message: `Are you sure you want to delete ${node.path}?`,
    buttons: ['Move to Trash', 'Cancel']
  })
  if (response === 0) {
    await fileOps.current.trash([ node.path ])
  }
}

export const registerHandlers = ({ newFile, newFolder }) => {
  handlers.newFile = newFile
  handlers.newFolder = newFolder
}

export default [
  { text: 'New File', onClick: node => handlers.newFile(node) },
  { text: 'New Folder', onClick: node => handlers.newFolder(node) },
  null,
  { text: 'Open' },
  null,
  { text: 'Open Containing Folder', onClick: showInFinder },
  { text: 'Open in Terminal', onClick: openInTerminal },
  null,
  { text: 'Delete', onClick: deleteFile },
]