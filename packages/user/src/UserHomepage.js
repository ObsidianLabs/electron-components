import React, { PureComponent } from 'react'

import {
  ButtonGroup,
  Button,
  LoadingScreen,
  CenterScreen,
} from '@obsidians/ui-components'

import platform from '@obsidians/platform'
import redux, { connect } from '@obsidians/redux'
import { IpcChannel } from '@obsidians/ipc'
import { BaseProjectManager, actions } from '@obsidians/workspace'
import UserProfile from './UserProfile'
import ProjectList from './ProjectList'

const userChannel = new IpcChannel('user')

class UserHomepage extends PureComponent {
  state = {
    notfound: false,
    loading: true,
    user: null,
    projects: [],
  }

  componentDidMount () {
    const { username } = this.props.match.params
    this.getProjectList(username)
  }

  componentDidUpdate (props) {
    const { username } = this.props.match.params
    const { username: prev } = props.match.params
    if (username !== prev) {
      this.getProjectList(username)
    }
  }

  getProjectList = async username => {
    if (platform.isDesktop) {
      this.setState({ loading: false, notfound: false, user: null })
      return
    }

    if (username === 'local') {
      this.setState({ loading: false, notfound: false, user: null, projects: [] })
      return
    }

    this.setState({ loading: true, notfound: false })

    let user
    if (!this.isSelf()) {
      try {
        user = await userChannel.invoke(username)
      } catch (e) {
        this.setState({ loading: false, notfound: true, user: username })
        return
      }
    }
    const res = await BaseProjectManager.channel.invoke('get', username)
    const projectFormatter = this.projectFormatter.bind(this, username) || (p => ({
      id: p.name,
      name: p.name,
      author: username,
      path: `${username}/${p.name}`,
    }))
    const projects = res.map(projectFormatter)

    this.setState({
      loading: false,
      user,
      projects,
    })
    if (this.isSelf()) {
      redux.dispatch('UPDATE_PROJECT_LIST', projects)
    }
  }

  isSelf = () => {
    const { profile, match } = this.props
    return platform.isDesktop || match.params.username === profile.get('username')
  }

  renderCreateNewProjectButton = () => {
    if (!this.isSelf()) {
      return null
    }
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
    if (!this.isSelf() || platform.isWeb) {
      return null
    }
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

  renderProjectList = (projects) => {
    const List = this.props.ProjectList || ProjectList
    return <List projects={projects} />
  }

  render () {
    const { profile } = this.props
    const { loading, notfound, user } = this.state

    let projects
    if (platform.isDesktop) {
      projects = this.props.projects.get('local').toJS().map(p => {
        delete p.author
        return p
      })
    } else {
      projects = this.state.projects
    }

    if (loading) {
      return <LoadingScreen />
    } else if (notfound) {
      return <CenterScreen>User <kbd>{user}</kbd> Not Found</CenterScreen>
    }

    return (
      <div className='d-flex w-100 h-100' style={{ overflow: 'auto' }}>
        <div className='container py-5'>
          <UserProfile
            profile={this.isSelf() ? profile.toJS() : user}
          />
          <div className='d-flex flex-row justify-content-between my-3'>
            <ButtonGroup>
              <h4 color='primary'>
                <i className='fas fa-th-list mr-2' />Projects
              </h4>
            </ButtonGroup>
            <ButtonGroup>
              {this.renderCreateNewProjectButton()}
              {this.renderOpenProjectButton()}
            </ButtonGroup>
          </div>

          {this.renderProjectList(projects)}
        </div>
      </div>
    )
  }
}

export default connect(['profile', 'projects'])(UserHomepage)
export {
  UserHomepage as BaseUserHomepage,
}
