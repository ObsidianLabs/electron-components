import React, { PureComponent } from 'react'

import {
  ButtonGroup,
  Button,
  ButtonOptions,
  LoadingScreen,
  CenterScreen,
} from '@obsidians/ui-components'

import platform from '@obsidians/platform'
import redux, { connect } from '@obsidians/redux'
import { HttpIpcChannel } from '@obsidians/ipc'
import { actions } from '@obsidians/workspace'
import UserProfile from './UserProfile'
import ProjectList from './ProjectList'

const userChannel = new HttpIpcChannel('user')
const projectChannel = new HttpIpcChannel('project')

class UserHomepage extends PureComponent {
  state = {
    notfound: false,
    loading: true,
    user: null,
    remote: platform.isWeb,
    projects: null,
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
    if (username === 'local') {
      this.setState({ loading: false, notfound: false, user: null, projects: null })
      return
    }

    this.setState({ loading: true, notfound: false, projects: null })

    let user
    if (!this.isSelf()) {
      try {
        user = await userChannel.invoke(username)
      } catch (e) {
        this.setState({ loading: false, notfound: true, user: username })
        return
      }
    }
    const res = await projectChannel.invoke('get', username)
    const projects = res.map(p => ({
      remote: true,
      id: p.name,
      name: p.name,
      author: username,
      path: `${username}/${p.name}`,
    }))

    this.setState({ loading: false, user, projects })
    if (this.isSelf()) {
      redux.dispatch('UPDATE_REMOTE_PROJECT_LIST', projects)
    }
  }

  isSelf = () => {
    const { profile, match } = this.props
    return platform.isDesktop || match.params.username === profile.get('username')
  }

  renderCreateButton = () => {
    if (!this.isSelf()) {
      return null
    }
    return (
      <Button
        color='success'
        onClick={() => actions.newProject(this.state.remote)}
      >
        <i className='fas fa-plus mr-1' />New
      </Button>
    )
  }

  renderOpenButton = () => {
    if (!this.isSelf()) {
      return null
    }
    return (
      <Button
        color='success'
        className='border-left-gray'
        onClick={() => actions.openProject()}
      >
        <i className='fas fa-folder-plus mr-1' />Open
      </Button>
    )
  }

  renderProjectListOptions = () => {
    if (platform.isDesktop && this.props.profile?.get('username')) {
      return (
        <ButtonOptions
          className='mb-0'
          options={[
            { key: 'local', text: 'Local', icon: 'far fa-desktop mr-1' },
            { key: 'cloud', text: 'Cloud', icon: 'far fa-cloud mr-1' },
          ]}
          selected={this.state.remote ? 'cloud' : 'local'}
          onSelect={key => this.setState({ remote: key === 'cloud' })}
        />
      )
    } else {
      return (
        <ButtonGroup>
          <h4 color='primary'>
            <i className='fas fa-th-list mr-2' />Projects
          </h4>
        </ButtonGroup>
      )
    }
  }

  renderActionButtons = () => {
    if (platform.isDesktop) {
      if (!this.state.remote) {
        return (
          <ButtonGroup>
            {this.renderCreateButton()}
            {this.renderOpenButton()}
          </ButtonGroup>
        )
      } else {
        return this.renderCreateButton()
      }
    } else {
      return this.renderCreateButton()
    }
  }

  render () {
    const { profile } = this.props
    const { loading, notfound, user, remote } = this.state

    let projects
    if (!remote) {
      projects = this.props.projects.get('local').toJS().map(p => {
        delete p.author
        return p
      })
    } else {
      projects = this.state.projects
    }

    if (!this.isSelf()) {
      if (loading) {
        return <LoadingScreen />
      } else if (notfound) {
        return <CenterScreen>User <kbd>{user}</kbd> Not Found</CenterScreen>
      }
    }

    return (
      <div className='d-flex w-100 h-100' style={{ overflow: 'auto' }}>
        <div className='container py-5'>
          <UserProfile profile={this.isSelf() ? profile.toJS() : user} />
          <div className='d-flex flex-row justify-content-between my-3'>
            {this.renderProjectListOptions()}
            {this.renderActionButtons()}
          </div>
          <ProjectList projects={projects} loading={loading} />
        </div>
      </div>
    )
  }
}

export default connect(['profile', 'projects'])(UserHomepage)
