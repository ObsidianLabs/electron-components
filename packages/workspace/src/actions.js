import Auth from '@obsidians/auth'
import fileOps from '@obsidians/file-ops'
import redux from '@obsidians/redux'
import notification from '@obsidians/notification'
import platform from '@obsidians/platform'
import { t } from '@obsidians/i18n'

import BaseProjectManager from './ProjectManager/BaseProjectManager'

export class ProjectActions {
  constructor() {
    this.history = null
    this.newProjectModal = null
    this.workspace = null
  }

  get codeEditor () {
    return this.workspace?.codeEditor?.current
  }

  async newProject () {
    const { _id, projectRoot, name } = await this.newProjectModal.openModal()
    const author = platform.isDesktop ? 'local' : Auth.username
    const projectId = _id ? name : btoa(projectRoot)
    redux.dispatch('ADD_PROJECT', {
      type: 'local',
      project: {
        id: projectId,
        author,
        name,
        path: projectRoot,
      }
    })
    this.history.push(`/${author}/${projectId}`)
  }

  async openProject () {
    try {
      const projectRoot = await fileOps.current.chooseFolder()
      const { base } = fileOps.current.path.parse(projectRoot)
      const author = 'local'
      const projectId = btoa(projectRoot)
      redux.dispatch('ADD_PROJECT', {
        type: 'local',
        project: {
          id: projectId,
          author,
          path: projectRoot,
          name: base,
        }
      })
      this.history.push(`/${author}/${projectId}`)
    } catch (e) {}
  }

  newFile () {
    this.workspace?.openCreateFileModal()
  }

  newFolder () {
    this.workspace?.openCreateFolderModal()
  }

  save () { this.codeEditor?.onCommand('save') }
  saveAll () { this.workspace.saveAll() }
  redo () { this.codeEditor?.onCommand('redo') }
  undo () { this.codeEditor?.onCommand('undo') }
  delete () { this.codeEditor?.onCommand('delete') }
  selectAll () { this.codeEditor?.onCommand('selectAll') }

  openTerminal () {
    BaseProjectManager.instance?.toggleTerminal(true)
  }

  async removeProject ({ id, name }) {
    const selected = redux.getState().projects.get('selected')
    if (selected && selected.get('id') === id) {
      redux.dispatch('SELECT_PROJECT', { project: undefined })
      const author = platform.isDesktop ? 'local' : Auth.username
      this.history.replace(`/${author}`)
    }
    redux.dispatch('REMOVE_PROJECT', { id, type: 'local' })
    notification.info(t('workspace.remove.success'), t('workspace.remove.successMessage', { name }))
  }
}

export default new ProjectActions()
