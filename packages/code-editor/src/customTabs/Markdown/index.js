import React, { Component } from 'react'

import fileOps from '@obsidians/file-ops'

import {
  Button,
} from '@obsidians/ui-components'

import ReactMarkdown from 'react-markdown'
import Highlight from 'react-highlight'
import { Link } from 'react-router-dom'

import './styles.scss'

// import ShareButton from './ShareButton'
// import StarButton from './StarButton'
// import ForkButton from './ForkButton'

export default class Markdown extends Component {
  // state = {
  //   avatar: ''
  // }

  componentDidMount () {
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

  renderHovers = () => {
    if (!this.display || !this.filePath.endsWith(':/README.md')) {
      return (
        <div style={{
          position: 'absolute',
          right: '1.5rem',
          top: '1.25rem',
          zIndex: 10
        }}>
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

  render () {
    if (!this.display) {
      return this.renderHovers()
    }

    let value = this.props.modelSession.value
    if (this.filePath.endsWith('contracts.md') || this.filePath.endsWith('contracts.md.in')) {
      value = value.replace(/---/g, '```').replace(/\{\{(\S+)\}\}/g, '`$1`');
    }

    return (
      <div className='custom-tab bg2 markdown'>
        <div className='jumbotron bg-transparent break-all' style={{ overflowX: 'hidden' }}>
          <div className='container'>
            <ReactMarkdown
              className='user-select'
              source={value}
              escapeHtml={false}
              renderers={{
                link: props => {
                  if (props.href.startsWith('http://') || props.href.startsWith('https://')) {
                    return (
                      <span className='link' onClick={() => fileOps.current.openLink(props.href)}>{props.children}</span>
                    )
                  }
                  return <Link className='link' to={props.href}>{props.children}</Link>
                },
                linkReference: props => {
                  try {
                    const { value, children } = props.children[0].props
                    if (value.startsWith('http://') || value.startsWith('https://')) {
                      return (
                        <span className='link' onClick={() => fileOps.current.openLink(value)}>{children}</span>
                      )
                    }
                  } catch (e) {}
                  return <Link className='link' to={props.href}>{props.children}</Link>
                },
                inlineCode: props => <kbd>{props.children}</kbd>,
                code: props => (
                  <Highlight
                    language={props.language}
                    className='pre-box pre-wrap break-all bg-secondary'
                    element='pre'
                  >
                    {props.value}
                  </Highlight>
                ),
                table: props => (
                  <table className='table table-sm table-striped bg-background'>
                    {props.children}
                  </table>
                )
              }}
            />
          </div>
          {this.renderHovers()}
        </div>
      </div>
    )
  }
}
