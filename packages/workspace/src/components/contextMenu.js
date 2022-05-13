import platform from '@obsidians/platform'
import fileOps from '@obsidians/file-ops'
import { t } from '@obsidians/i18n'
import { ClipBoardService } from '@obsidians/filetree'
const handlers = {}

const showInFinder = node => {
  if (node.root) {
    fileOps.current.openItem(node.path)
  } else {
    fileOps.current.showItemInFolder(node.path)
  }
}

const copyPath = ({ path, pathInProject }) => {
  const filePath = pathInProject || path
  const clipboard = new ClipBoardService()

  clipboard.writeText(filePath)
}

const openInTerminal = node => {
  const basePath = node.children ? node.path : fileOps.current.path.dirname(node.path)
  fileOps.current.openInTerminal(basePath)
}

export const registerHandlers = ({ newFile, newFolder, rename, deleteFile, openFile, duplicateFile }) => {
  handlers.newFile = newFile
  handlers.newFolder = newFolder
  handlers.rename = rename
  handlers.deleteFile = deleteFile
  handlers.openFile = openFile
  handlers.duplicateFile = duplicateFile
}

let contextMenu
if (platform.isDesktop) {
  contextMenu = [
    { text: 'New File', bilingualText: t('project.newFile'), onClick: node => handlers.newFile(node) },
    { text: 'New Folder', bilingualText: t('project.newFolder'), onClick: node => handlers.newFolder(node) },
    null,
    { text: 'Open', bilingualText: t('open'), onClick: node => handlers.openFile(node) },
    null,
    { text: 'Open Containing Folder', bilingualText: t('project.openContainingFolder'), onClick: showInFinder },
    { text: 'Open in Terminal', bilingualText: t('project.openInTerminal'), onClick: openInTerminal },
    null,
    { text: 'Copy Path', bilingualText: t('project.copyPath'), onClick: copyPath },
    { text: 'Duplicate', bilingualText: t('duplicate'), onClick: node => handlers.duplicateFile(node) },
    null,
    { text: 'Rename', bilingualText: t('rename'), onClick: node => handlers.rename(node) },
    { text: 'Delete', bilingualText: t('delete'), onClick: node => handlers.deleteFile(node) }
  ]
} else {
  contextMenu = [
    { text: 'New File', bilingualText: t('project.newFile'), onClick: node => handlers.newFile(node) },
    { text: 'New Folder', bilingualText: t('project.newFolder'), onClick: node => handlers.newFolder(node) },
    // null,
    // { text: '', bilingualText: 'Download' },
    null,
    { text: 'Copy Path', bilingualText: t('project.copyPath'), onClick: copyPath },
    null,
    { text: 'Rename', bilingualText: t('rename'), onClick: node => handlers.rename(node) },
    { text: 'Delete', bilingualText: t('delete'), onClick: node => handlers.deleteFile(node) }
  ]
}

export default contextMenu
