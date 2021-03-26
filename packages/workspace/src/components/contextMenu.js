import platform from '@obsidians/platform'
import fileOps from '@obsidians/file-ops'
import { t } from '@obsidians/i18n'

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
    { text: t('workspace.new.file'), onClick: node => handlers.newFile(node) },
    { text: t('workspace.new.folder'), onClick: node => handlers.newFolder(node) },
    null,
    { text: t('workspace.open.title') },
    null,
    { text: t('workspace.open.folder'), onClick: showInFinder },
    { text: t('workspace.open.terminal') , onClick: openInTerminal },
    null,
    { text: t('button.delete'), onClick: node => handlers.deleteFile(node) },
  ]
} else {
  contextMenu = [
    { text: t('workspace.new.file'), onClick: node => handlers.newFile(node) },
    { text: t('workspace.new.folder'), onClick: node => handlers.newFolder(node) },
    // null,
    // { text: 'Download' },
    null,
    { text: t('button.delete'), onClick: node => handlers.deleteFile(node) },
  ]
}

export default contextMenu