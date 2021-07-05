import platform from '@obsidians/platform'
import fileOps from '@obsidians/file-ops'
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
      text: `Open Containing Folder`,
      onClick: project => fileOps.current.openItem(project.path),
    },
    {
      text: `Open in Terminal`,
      onClick: project => fileOps.current.openInTerminal(project.path),
    },
    null,
    {
      text: `Remove`,
      onClick: project => actions.removeProject(project),
    },
  ]
}

export default function navbarItem (projects, selected, username) {
  if (platform.isWeb && username === 'local') {
    return {
      route: 'local',
      title: 'Project',
      icon: 'fas fa-file-code',
      selected,
      dropdown: [{ none: true }],
      contextMenu: projectContextMenus,
    }
  }

  const projectDropdown = [
    { divider: true },
    { header: 'projects' },
    ...(projects.length ? projects.map(p => ({ ...p, route: p.author })) : [{ none: true }]),
  ]

  if (platform.isDesktop) {
    projectDropdown.unshift({
      id: 'open-project',
      name: 'Open Project...',
      icon: 'fas fa-folder-plus',
      onClick: () => actions.openProject(),
    })
  }
  projectDropdown.unshift({
    id: 'new-project',
    name: 'Create Project...',
    icon: 'fas fa-plus',
    onClick: () => actions.newProject(platform.isWeb),
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