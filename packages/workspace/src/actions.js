import Auth from '@obsidians/auth'
import fileOps from '@obsidians/file-ops'
import redux from '@obsidians/redux'
import notification from '@obsidians/notification'
import platform from '@obsidians/platform'
import { IpcChannel } from '@obsidians/ipc'

export class ProjectActions {
  constructor() {
    this.history = null
    this.newProjectModal = null
    this.channel = new IpcChannel('register-action')
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

  async removeProject ({ id, name }) {
    const selected = redux.getState().projects.get('selected')
    if (selected && selected.get('id') === id) {
      redux.dispatch('SELECT_PROJECT', { project: undefined })
      const author = platform.isDesktop ? 'local' : Auth.username
      this.history.replace(`/${author}`)
    }
    redux.dispatch('REMOVE_PROJECT', { id, type: 'local' })
    notification.info('Remove Project Successful', `Project <b>${name}</b> is removed`)
  }

  showInFinder = node => {
    if (node.root) {
      fileOps.current.openItem(node.path)
    } else {
      fileOps.current.showItemInFolder(node.path)
    }
  }

  openInTerminal = node => {
    const basePath = node.children ? node.path : fileOps.current.path.dirname(node.path)
    fileOps.current.openInTerminal(basePath)
  }

  register (actions) {
    Object.keys(actions).forEach(name => {
      this[name] = actions[name]
      this.ready(name)
    })
  }

  ready (names) {
    if (Array.isArray(names)) {
      names.forEach(name => this.channel.trigger('ready', name))
    } else {
      this.channel.trigger('ready', names)
    }
  }
}

export default new ProjectActions()
