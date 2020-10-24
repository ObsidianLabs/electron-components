import React, { PureComponent } from 'react'

import {
  ButtonGroup,
  Button,
  LoadingScreen,
} from '@obsidians/ui-components'

import redux, { connect } from '@obsidians/redux'
import { BaseProjectManager } from '@obsidians/workspace'
import { ProjectList, actions } from '@obsidians/project'
import UserProfile from './UserProfile'

class UserHomepage extends PureComponent {
  componentDidMount () {
    // this.getProjectList(this.props.profile.get('username'))
  }

  getProjectList = async username => {
    const projects = await BaseProjectManager.channel.invoke('get', username)
    redux.dispatch('UPDATE_PROJECT_LIST', projects.map(p => ({
      id: p.name,
      name: p.name,
      path: `${username}/${p.name}`,
    })))
  }

  renderCreateNewProjectButton = () => {
    return (
      <Button
        color='success'
        onClick={() => actions.newProject()}
      >
        <i className='fas fa-plus mr-1' />New
      </Button>
    )
  }

  renderOpenProjectButton = () => {
    return (
      <Button
        color='success'
        className='border-left-gray'
        onClick={() => actions.openProject()}
      >
        <i className='fas fa-folder-plus mr-1' />
        Open
      </Button>
    )
  }

  render () {
    const { profile, projects } = this.props

    if (projects.get('loading')) {
      return <LoadingScreen />
    }

    return (
      <div className='d-flex w-100 h-100' style={{ overflow: 'auto' }}>
        <div className='container py-5'>
          <UserProfile profile={profile} />

          <div className='d-flex flex-row justify-content-between my-3'>
            <ButtonGroup>
              <h4 color='primary'>
                <i className='fas fa-th-list mr-2' />My Projects
              </h4>
            </ButtonGroup>
            <ButtonGroup>
              {this.renderCreateNewProjectButton()}
              {this.renderOpenProjectButton()}
            </ButtonGroup>
          </div>

          <ProjectList
            projects={this.props.projects.get('local').toJS()}
          />
        </div>
      </div>
    )
  }
}

export default connect(['profile', 'projects'])(UserHomepage)
