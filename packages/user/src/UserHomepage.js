import React, { PureComponent } from 'react'

import {
  ButtonGroup,
  Button,
  ButtonOptions,
  LoadingScreen,
  CenterScreen
} from '@obsidians/ui-components'

import PropTypes from 'prop-types'
import platform from '@obsidians/platform'
import redux, { connect } from '@obsidians/redux'
import { HttpIpcChannel } from '@obsidians/ipc'
import { actions, TutorialModal, WorkspaceSettingModal } from '@obsidians/workspace'
import UserProfile from './UserProfile'
import ProjectList from './ProjectList'
import { t } from '@obsidians/i18n'
import { withRouter } from 'react-router'

const userChannel = new HttpIpcChannel('user')
const projectChannel = new HttpIpcChannel('project')
const {
  PROJECT_GITHUB_REPO
} = process.env

const tutorialModalInfo = {
  header: 'Welcome to Black IDE',
  description: `Black IDE is a graphic IDE for developing smart contracts on the Ethereum blockchian. New here ? Don't worry.
  Here is an instruction for a quick scan and details of each features.`,
  nextPage: `${PROJECT_GITHUB_REPO}/blob/master/README.md`
}

class UserHomepage extends PureComponent {
  state = {
    notfound: false,
    loading: true,
    user: null,
    remote: platform.isWeb,
    projects: null
  }

  constructor(props) {
    super(props)
    this.modal = React.createRef()
    this.workspaceSettingModal = React.createRef()
  }

  componentDidMount() {
    const { username } = this.props.match.params
    this.getProjectList(username)
    this.state.remote && this.checkIsNewUser()
  }

  componentDidUpdate (props) {
    const { location, history, profile } = this.props
    const { username } = this.props.match.params
    const { username: prev } = props.match.params
    if (username !== prev) {
      this.getProjectList(username)
    } else if (!this.state.remote && profile?.get('username') && location?.pathname == '/local') {
      history.push('/')
    }
  }

  checkIsNewUser() {
    if (!localStorage.getItem('hasMark') && this.isSelf() && this.props.enableTutorial) {
      localStorage.setItem('hasMark', 'true')
      this.modal.current.showModal()
    }
  }

  projectListUpdate () {
    this.getProjectList(this.props.match?.params?.username)
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

    let projects
    try {
      const res = await projectChannel.invoke('get', username)
      projects = res.map(p => ({
        remote: true,
        id: p.name,
        name: p.name,
        author: username,
        path: `${username}/${p.name}`
      }))

      if (this.isSelf()) {
        redux.dispatch('UPDATE_REMOTE_PROJECT_LIST', projects)
      }
    } catch (error) {
      console.warn(error)
    }

    this.setState({ loading: false, user, projects })
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
        <i className='fas fa-plus mr-1' />{t('header.title.new')}
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
        className='border-left-gray mr-2'
        onClick={() => actions.openProject()}
      >
        <i className='fas fa-folder-plus mr-1' />{t('header.title.open')}
      </Button>
    )
  }

  renderSettingButton = () => {
    if (!this.isSelf()) {
      return null
    }
    return (
      <Button
        className='bg-hover'
        onClick={() => this.workspaceSettingModal.current.showModal()}
      >
        <i className='fas fa-cog' />
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
            { key: 'cloud', text: 'Cloud', icon: 'far fa-cloud mr-1' }
          ]}
          selected={this.state.remote ? 'cloud' : 'local'}
          onSelect={key => this.setState({ remote: key === 'cloud' })}
        />
      )
    } else {
      return (
        <ButtonGroup>
          <h4 color='primary'>
            <i className='fas fa-th-list mr-2' />{t('header.title.projects')}
          </h4>
        </ButtonGroup>
      )
    }
  }

  renderActionButtons = () => {
    if (platform.isDesktop) {
      if (!this.state.remote) {
        return (
          <div>
            <ButtonGroup>
              {this.renderCreateButton()}
              {this.renderOpenButton()}
            </ButtonGroup>
            {this.renderSettingButton()}
          </div>
        )
      } else {
        return this.renderCreateButton()
      }
    } else {
      return this.renderCreateButton()
    }
  }

  render () {
    const { profile, ProjectListItem } = this.props
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
        return <CenterScreen>用户 <kbd>{user}</kbd> 未找到</CenterScreen>
      }
    }

    return (
      <div className='d-flex w-100 h-100' style={{ overflow: 'auto' }}>
        <div className='container py-5'>
          {
            !this.props.noUser && <UserProfile profile={this.isSelf() ? profile.toJS() : user} />
          }
          <div className='d-flex flex-row justify-content-between my-3'>
            {this.renderProjectListOptions()}
            {this.renderActionButtons()}
          </div>
          <ProjectList
            projects={projects}
            loading={loading}
            ListItem={ProjectListItem}
            projectListUpdate={() => this.projectListUpdate()}
          />
        </div>

        <TutorialModal
          ref={this.modal}
          header={tutorialModalInfo.header}
          nextPage={tutorialModalInfo.nextPage}
          description={tutorialModalInfo.description} />
        <WorkspaceSettingModal ref={this.workspaceSettingModal}/>
      </div>
    )
  }
}

export default connect(['profile', 'projects'])(withRouter(UserHomepage))
export {
  UserHomepage as BaseUserHomepage
}

UserHomepage.propTypes = {
  enableTutorial: PropTypes.boolean
}

UserHomepage.defaultProps = {
  enableTutorial: false,
  noUser: false
}
