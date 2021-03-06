import React, { PureComponent } from 'react'

import {
  Modal,
  Button,
} from '@obsidians/ui-components'

import debounce from 'lodash/debounce'

import platform from '@obsidians/platform'
import Auth from '@obsidians/auth'

import BaseProjectManager from '../ProjectManager/BaseProjectManager'
import actions from '../actions'

class DeleteButton extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      deleting: false,
    }
    this.modal = React.createRef()
  }

  deleteProject = async () => {
    this.setState({ deleting: true })
    const { projectRoot, projectManager } = this.props.context
    const name = projectManager.projectName
    await BaseProjectManager.channel.invoke('delete', projectRoot)
    await actions.removeProject({ id: name, name })
    this.setState({ deleting: false })
    this.modal.current.closeModal()
  }

  render () {
    if (platform.isDesktop) {
      return null
    }

    if (!this.props.context.projectRoot.startsWith(`${Auth.username}/`)) {
      return null
    }

    return <>
      <h4 className='mt-4'>Others</h4>
      <Button color='danger' onClick={() => this.modal.current.openModal()}>Delete Project</Button>
      <Modal
        ref={this.modal}
        title='Are you sure to delete this project?'
        textConfirm='Delete'
        colorConfirm='danger'
        pending={this.state.deleting && 'Deleting...'}
        onConfirm={this.deleteProject}
      />
    </>
  }
}

export default class AbstractProjectSettingsTab extends PureComponent {
  static DeleteButton = DeleteButton

  onChangeHandlers = {}
  debouncedUpdate = debounce(() => this.forceUpdate(), 500, { leading: true, trailing: false }).bind(this)

  onChange = key => {
    if (!this.onChangeHandlers[key]) {
      this.onChangeHandlers[key] = value => {
        this.context.projectSettings?.set(key, value)
      }
    }
    return this.onChangeHandlers[key]
  }
}
