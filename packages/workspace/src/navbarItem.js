import platform from '@obsidians/platform'
import fileOps from '@obsidians/file-ops'
import { t } from '@obsidians/i18n'
import actions from './actions'

const projectContextMenus = id => {
  if (id === 'new-project' || id === 'open-project') {
    return
  }

  if (platform.isWeb) {
    return
  }

  return [
    {
      text: t('workspace.open.folder'),
      onClick: project => fileOps.current.openItem(project.path),
    },
    {
      text: t('workspace.open.terminal'),
      onClick: project => fileOps.current.openInTerminal(project.path),
    },
    null,
    {
      text: t('workspace.remove.title'),
      onClick: project => actions.removeProject(project),
    },
  ]
}

export default function navbarItem (projects, selected, username) {
  const projectDropdown = [
    { divider: true },
    { header: 'projects' },
    ...(projects.length ? projects.map(p => ({ ...p, route: p.author })) : [{ none: true }]),
  ]

  if (platform.isDesktop) {
    projectDropdown.unshift({
      id: 'open-project',
      name: `${t('workspace.open.project')}...`,
      icon: 'fas fa-folder-plus',
      onClick: () => actions.openProject(),
    })
  }
  projectDropdown.unshift({
    id: 'new-project',
    name: `${t('workspace.new.project')}...`,
    icon: 'fas fa-plus',
    onClick: () => actions.newProject(),
  })

  return {
    route: selected.author || username,
    title: 'Project',
    icon: 'fas fa-file-code',
    selected,
    dropdown: projectDropdown,
    contextMenu: projectContextMenus,
  }
}