import fileOps from '@obsidians/file-ops'
import redux from '@obsidians/redux'

export class ProjectActions {
  constructor() {
    this.history = null
    this.newProjectModal = null
  }

  async newProject () {
    const { id, projectRoot, name, author = 'local' } = await this.newProjectModal.openModal()
    const projectId = id || btoa(projectRoot)
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
          author: 'local',
          name: base,
        }
      })
      this.history.replace(`/local/${projectId}`)
    } catch (e) {}
  }
}

export default new ProjectActions()
