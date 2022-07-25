import React, { PureComponent } from 'react'

import { Button } from '@obsidians/ui-components'

import debounce from 'lodash/debounce'
import Auth from '@obsidians/auth'
import { t } from '@obsidians/i18n'

import DeleteProjectModal from './DeleteProjectModal'

class DeleteButton extends PureComponent {
  constructor (props) {
    super(props)
    this.modal = React.createRef()
  }

  openDeleteProjectModal = () => this.modal.current.openDeleteModal()

  render () {
    const { projectManager, projectRoot } = this.props.context

    if (!projectManager.remote) {
      return null
    }

    if (!projectRoot.startsWith(`${Auth.username}/`)) {
      return null
    }

    return <>
      <h4 className='mt-4'>{t('project.del.others')}</h4>
      <Button color='danger' onClick={this.openDeleteProjectModal}>{t('project.del.title')}</Button>
      <DeleteProjectModal ref={this.modal} project={{remote: true}} projectManager={projectManager} />
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
