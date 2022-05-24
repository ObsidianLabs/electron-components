import React, { Component } from 'react'
import fileOps from '@obsidians/file-ops'
import { Modal, Button } from '@obsidians/ui-components'
import notification from '@obsidians/notification'
import { t } from '@obsidians/i18n'
import './styles.scss'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import slug from 'remark-slug'
import Highlight from 'react-highlight'
import modelSessionManager from '../../MonacoEditor/modelSessionManager'

export default class Markdown extends Component {
  state = {
    isPublic: false,
    togglePublicModal: React.createRef(),
    togglePublicSaved: true,
    togglePublicToggling: false
  }

  componentDidMount () {
    this.setState({
      isPublic: modelSessionManager.projectManager.prefix === 'public'
    })
    // this.getAvatar(this.props)
  }

  // getAvatar = async (props) => {
  //   this.setState({ avatar: '' })

  //   const projectAuthor = props.eosProject.projectAuthor
  //   if (projectAuthor) {
  //     const user = await api.server.loadUser(projectAuthor)
  //     if (user) {
  //       this.setState({ avatar: user.avatar })
  //     }
  //   } else {
  //     this.setState({ avatar: props.profile.get('avatar') })
  //   }
  // }

  get filePath () {
    return this.props.modelSession.filePath
  }

  get display () {
    return this.props.modelSession.showCustomTab
  }

  onEditButton = () => {
    this.props.modelSession.toggleCustomTab()
    this.display && modelSessionManager.saveCurrentFile()
    this.forceUpdate()
  }

  renderSwitchToEditorBtn = () => {
    return (
      <Button
        color='primary'
        size='sm'
        className='ml-2'
        onClick={this.onEditButton}
      >
        {
          this.display
            ? <span key='mode-edit'><i className='fas fa-pencil-alt' /></span>
            : <span key='mode-render'><i className='fas fa-check' /></span>
        }
      </Button>
    )
  }

  async togglePublic() {
    let saved = true
    for (let key in modelSessionManager.sessions) {
      const session = modelSessionManager.sessions[key]
      if (!session || session.saved) continue
      saved = false
      break
    }
    this.setState({togglePublicSaved: saved}, () => {
      this.state.togglePublicModal.current.openModal()
    })
  }

  async confirmTogglePublic() {
    if (!this.state.togglePublicSaved) return this.state.togglePublicModal.current.closeModal()

    await this.setState({
      togglePublicToggling: true
    })
    // if (save) await modelSessionManager.projectManager.project.saveAll()
    const isPublic = await modelSessionManager.projectManager.togglePublic(this.state.isPublic ? 'private' : 'public')
    modelSessionManager.currentModelSession._public = isPublic
    this.setState({
      isPublic,
      togglePublicToggling: false
    })
    this.state.togglePublicModal.current.closeModal()
    notification.success(t('project.features.changeSuccess'),
    `${t('project.features.nowFeatures')}<b>${isPublic ? t('project.features.public') : t('project.features.private')}</b> ${isPublic ? t('project.features.publicDescription') : t('project.features.privateDescription')}`)
  }

  renderTogglePublicButton = () => {
    if (!modelSessionManager.projectManager.remote) return false
    if (!modelSessionManager.projectManager.userOwnProject) return false
    if (!this.display) return false
    return (
      <Button
        color='primary'
        size='sm'
        className='ml-2'
        onClick={this.togglePublic.bind(this)}
        style={this.state.togglePublicToggling ? {background: 'var(--color-secondary)'} : this.state.isPublic ? {} : {background: 'var(--color-danger)'}}
    >
        { this.state.togglePublicToggling && <span key='mode-toggling'><i className='fas fa-spinner fa-pulse' /> {t('project.features.Toggling')}</span> }
        { !this.state.togglePublicToggling && this.state.isPublic && <span key='mode-public'><i className='fas fa-eye' /> {t('project.features.Public')}</span> }
        { !this.state.togglePublicToggling && !this.state.isPublic && <span key='mode-private'><i className='fas fa-eye-slash' /> {t('project.features.Private')}</span> }
      </Button>
    )
  }

  renderHovers = () => {
    if (!modelSessionManager.projectManager.userOwnProject) return
    if (!this.display || !this.filePath.endsWith(':/README.md')) {
      return (
        <div style={{
          position: 'absolute',
          right: '1.5rem',
          top: '1.25rem',
          zIndex: 10
        }}>
          {this.renderTogglePublicButton()}
          {this.renderSwitchToEditorBtn()}
        </div>
      )
    }

    const { projectAuthor, projectName } = this.props.eosProject
    return (
      <div className='breadcrumb' style={{
        position: 'absolute',
        top: '.75rem',
        right: '1rem',
        left: '1rem',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 0
      }}>
        <div className='flex-row-center mx-2'>
          {/* <div
            className='rounded bg-secondary'
            style={{ width: '24px', height: '24px', overflow: 'hidden' }}
          >
            <Link to={`/${projectAuthor}`}>
              <img
                style={{ display: 'block', width: '24px', height: '24px' }}
                src={this.state.avatar}
              />
            </Link>
          </div>
          <ol className='breadcrumb mb-0 ml-2 p-0'>
            <BreadcrumbItem><Link to={`/${projectAuthor}`}>{projectAuthor}</Link></BreadcrumbItem>
            <BreadcrumbItem active>{projectName}</BreadcrumbItem>
          </ol> */}
        </div>

        <div style={{
          padding: '0.5rem',
          display: 'flex',
          alignItems: 'center'
        }}>
          {/* <ShareButton eosProject={this.props.eosProject} />
          <StarButton eosProject={this.props.eosProject} />
          <ForkButton
            eosProject={this.props.eosProject}
            profile={this.props.profile}
          /> */}
          {this.renderSwitchToEditorBtn()}
        </div>
      </div>
    )
  }

  openLink = link => {
    fileOps.current.openLink(link)
  }

  scrollTo = id => {
    const el = window.document.querySelector(id)
    if (!el) {
      return
    }
    el.scrollIntoViewIfNeeded()
    el.style.background = 'var(--color-secondary)'
    setTimeout(() => {
      el.style.background = ''
    }, 1000)
  }

  openFile = async filePath => {
    const path = modelSessionManager.projectManager.path
    let openningPath
    if (path.isAbsolute(filePath)) {
      openningPath = filePath
    } else {
      const { dir } = path.parse(this.filePath)
      openningPath = path.join(dir, filePath)
    }

    if (await modelSessionManager.projectManager.isFile(openningPath)) {
      modelSessionManager.openFile(openningPath)
    } else {
      notification.error(t('project.features.fail'), t('project.features.failText', {openningPath}))
    }
  }

  render () {
    if (!this.display) {
      return this.renderHovers()
    }

    let value = this.props.modelSession.value
    if (this.filePath.endsWith('contracts.md') || this.filePath.endsWith('contracts.md.in')) {
      value = value.replace(/---/g, '```').replace(/\{\{(\S+)\}\}/g, '`$1`')
    }

    return (
      <div className='custom-tab bg2 markdown'>
        <div className='jumbotron bg-transparent break-all' style={{ overflowX: 'hidden' }}>
          <div className='container'>
            <ReactMarkdown
              className='user-select'
              remarkPlugins={[gfm, slug]}
              components={{
                a: props => {
                  if (props.href.startsWith('#')) {
                    return <span className='link' onClick={() => this.scrollTo(props.href)}>{props.children}</span>
                  }
                  if (props.href.startsWith('http://') || props.href.startsWith('https://')) {
                    return <span className='link' onClick={() => this.openLink(props.href)}>{props.children}</span>
                  }
                  return <span className='link' onClick={() => this.openFile(props.href)}>{props.children}</span>
                },
                code: props => {
                  if (props.inline) {
                    return <kbd>{props.children}</kbd>
                  }
                  return (
                    <Highlight
                      language={props.language}
                      className='pre-box pre-wrap break-all bg-secondary text-body'
                      element='pre'
                    >
                      {props.children}
                    </Highlight>
                  )
                },
                table: props => (
                  <table className='table table-sm table-hover table-striped mb-4'>
                    {props.children}
                  </table>
                )
              }}
            >
              {value}
            </ReactMarkdown>
            <Modal
              ref={this.state.togglePublicModal}
              size='md'
              title={this.state.togglePublicSaved ? t('project.features.visibility') : t('project.features.notSaved')}
              children={this.state.togglePublicSaved
                ? <span>{t('project.features.title')}
                  <b>{this.state.isPublic ? t('project.features.private') : t('project.features.public')}</b>
                ?
                {this.state.isPublic ? t('project.features.privateText') : t('project.features.publicText')}
                </span>
              : t('project.features.remind')}
              textConfirm={this.state.togglePublicSaved ? 'Confirm' : 'OK'}
              noCancel={this.state.togglePublicToggling || !this.state.togglePublicSaved}
              pending={this.state.togglePublicToggling ? t('changing') : false}
              onConfirm={this.confirmTogglePublic.bind(this)}
            />
          </div>
          {this.renderHovers()}
        </div>
      </div>
    )
  }
}
