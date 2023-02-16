import React, { PureComponent } from 'react'

import {
	Modal,
	DebouncedFormGroup,
} from '@obsidians/ui-components'

import platform from '@obsidians/platform'
import { t } from '@obsidians/i18n'
import actions from '../actions'

export default class DeleteProjectModal extends PureComponent {
	constructor(props) {
		super(props)
		this.state = {
			deleting: false,
			inputPlaceholder: '',
			name: '',
			projectName: '',
			projectRoot: '',
		}
		this.modal = React.createRef()
		this.input = React.createRef()
	}

	openDeleteModal = async () => {
		const { projectManager, project } = this.props
		this.setState({ name: '' })
		console.log(projectManager)
		if (projectManager) {
			const projectName = project?.name ? project.name : projectManager.projectName
			const inputPlaceholder = `请输入 ${platform.isWeb ? projectManager.projectRoot : projectName} 以确认`
			await this.setState({ projectRoot: projectManager.projectRoot, projectName, deleting: false, inputPlaceholder, projectManager })
			setTimeout(() => this.input.current?.focus(), 100)
			this.modal.current?.openModal()
		}
	}

	deleteSureProject = async () => {
		this.setState({ deleting: true })
		const { projectManager, project, projectsReload = false } = this.props
		const name = projectManager?.projectName
		if (projectManager) await projectManager.deleteProject()
		await actions.removeProject(project?.remote ? { id: name, name, type: 'delete' } : project)
		this.setState({ deleting: false })
		this.modal.current?.closeModal()
		if (projectsReload) this.props.projectListUpdate()
	}

	labelStr = () => {
		const cloudLabel = (
			<div>
				您的操作将永久删除此项目，此操作不能被撤销！
				<div style={{ 'userSelect': 'text' }}>{t('project.del.type')} <kbd>{platform.isWeb ? this.state.projectRoot : this.state.projectName}</kbd> {t('project.del.toConf')}</div>
			</div>
		)
		const desktopLabel = (
			<div>{t('project.del.desktopDelText')}</div>
		)
		return this.props.project?.remote ? cloudLabel : desktopLabel
	}

	render() {
		const { name, inputPlaceholder, deleting, projectName, projectRoot } = this.state
		const currentName = platform.isWeb ? projectRoot : projectName

		return (
			<Modal
				ref={this.modal}
				title={this.props.project?.remote ? '删除项目' : '移除项目'}
				textConfirm={this.props.project?.remote ? t('delete') : t('remove')}
				colorConfirm='danger'
				pending={deleting && t('deleting')}
				noCancel={true}
				headerCancelIcon={deleting}
				footerCancelIcon={deleting}
				confirmDisabled={this.props.project?.remote && (currentName !== name)}
				onConfirm={this.deleteSureProject}
			>
				{
					this.props.project?.remote ?
						<DebouncedFormGroup
							ref={this.input}
							label={this.labelStr()}
							placeholder={inputPlaceholder}
							maxLength='100'
							value={name}
							onChange={name => this.setState({ name })}
							validator={v => (currentName !== v) && t('project.del.tips')}
						/>
						:
						<div>{this.labelStr()}</div>
				}

			</Modal>
		)
	}
}