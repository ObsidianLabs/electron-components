import Auth from '@obsidians/auth'
import fileOps from '@obsidians/file-ops'
import redux from '@obsidians/redux'
import notification from '@obsidians/notification'

export class ProjectActions {
  constructor() {
    this.history = null
    this.newProjectModal = null
  }

  async newProject () {
    const { _id, projectRoot, name } = await this.newProjectModal.openModal()
    const author = Auth.username || 'local'
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
      const projectId = btoa(projectRoot)
      redux.dispatch('ADD_PROJECT', {
        type: 'local',
        project: {
          id: projectId,
          path: projectRoot,
          name: base,
        }
      })
      this.history.replace(`/local/${projectId}`)
    } catch (e) {}
  }

  async removeProject ({ id, name }) {
    const selected = redux.getState().projects.get('selected')
    if (selected && selected.get('id') === id) {
      redux.dispatch('SELECT_PROJECT', { project: undefined })
      this.history.replace(`/local`)
    }
    redux.dispatch('REMOVE_PROJECT', { id, type: 'local' })
    notification.info('Remove Project Successful', `Project <b>${name}</b> is removed`)
  }
}

export default new ProjectActions()
