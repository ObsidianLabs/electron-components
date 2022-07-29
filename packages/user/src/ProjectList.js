import React, { PureComponent } from 'react'

import { IconButton } from '@obsidians/ui-components'

import { Link } from 'react-router-dom'

import platform from '@obsidians/platform'
import fileOps from '@obsidians/file-ops'
import { ProjectPath, ProjectManager, DeleteProjectModal } from '@obsidians/workspace'
import cloudDeleteImg from './assets/cloudDelete.png'

export default class ProjectList extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      projectManager: null,
      remote: false,
    }
    this.modal = React.createRef()
  }

  removeProject = async (project, remote) => {
    let projectManager = null
    if (remote) projectManager = new ProjectManager['Remote'](this, project.path)
    await this.setState({ projectManager, project })
    this.modal.current.openDeleteModal()
  }

  renderProjectRow = (project, index) => {
    return (
      <tr key={`project-row-${index}`}>
        {this.renderProjectListItem(project)}
      </tr>
    )
  }

  renderProjectListItem = (project) => {
    const { ListItem } = this.props
    if (ListItem) {
      return <ListItem project={project} />
    }

    const { remote, author = 'local', id, name, path } = project
    const url = `/${author}/${id}`

    return (
      <td className='d-flex flex-row justify-content-between hover-flex'>
        <div className='flex-colume'>
          <div className='mb-1 flex-row-center'>
            <Link to={url} className='text-white'>
              <h5 className='mb-0'>{name}</h5>
            </Link>
          </div>
          <div className='mt-2 hover-off'>
            <ProjectPath projectRoot={path} remote={remote} />
          </div>
        </div>
        <div className='d-flex flex-row align-items-start hover-show'>
          {this.renderRightButton(project)}
        </div>
      </td>
    )
  }

  renderRightButton = project => {
    return (
      <div className='d-flex'>
        {
          platform.isDesktop && project.remote &&
          <IconButton
            key={`open-in-browser-${project.id}`}
            color='transparent'
            className='text-muted'
            icon='fas fa-external-link'
            tooltip='Open in Browser'
            onClick={() => fileOps.current.openLink(`${process.env.PROJECT_WEB_URL}/${project.path}`)}
          />
        }
        <IconButton
          key={`cloud-delete-${project.id}`}
          color='transparent'
          className='text-muted'
          tooltip={project.remote ? 'Delete' : 'Remove'}
          icon={project.remote ? '' : 'far fa-trash-alt'}
          onClick={() => this.removeProject(project, project.remote)}
        >
          {
            project.remote &&
            <span style={{'width': '1rem'}}>
              <img src={cloudDeleteImg} className='w-100 h-100' />
            </span>
          }
        </IconButton>
      </div>
    )
  }

  render () {
    const { loading, projects } = this.props

    if (loading && !projects) {
      return (
        <table className='table table-hover table-striped'>
          <tbody>
            <tr key='no-project'>
              <td key='loading' align='middle' className='text-muted'>
                <i className='fas fa-pulse fa-spinner mr-1' />Loading...
              </td>
            </tr>
          </tbody>
        </table>
      )
    }

    if (!projects || !projects.length) {
      return (
        <table className='table table-hover table-striped'>
          <tbody>
            <tr key='no-project'>
              <td align='middle' className='text-muted'>(No Project)</td>
            </tr>
          </tbody>
        </table>
      )
    }

    return (
      <>
        <table className='table table-hover table-striped'>
          <tbody>
            {projects.map(this.renderProjectRow)}
          </tbody>
        </table>
        <DeleteProjectModal
          projectListUpdate={this.props.projectListUpdate}
          ref={this.modal}
          projectsReload={true}
          project={this.state.project}
          projectManager={this.state.projectManager}
        />
      </>
    )
  }
}
