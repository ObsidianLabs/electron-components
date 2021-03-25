const translation = {
  loading: 'Loading...',
  loggingIn: 'Logging in...',
  button: {
    save: 'Save',
    cancel: 'Cancel',
    dontSave: `Don't Save`,
    close: 'Close',
  },
  welcome: {
    welcome: 'Welcome to {{projectName}}',
    message: '{{projectName}} is a graphic IDE for developing smart contracts on the {{chainName}} blockchain. To get started, please install the prerequisite tools for {{projectName}}.',
    start: 'Get Started',
    skip: 'Skip',
  },
  editor: {
    lost: 'Your changes will be lost if you close this item without saving.',
    project: {
      setting: 'Project Settings',
      invalid: 'Invalid Project',
      cantReadSetting: 'Cannot read project settings for',
      makeSurePermission: 'Make sure you have the read/write permission for',
    },
    error: {
      emptyPath: 'Empty path for "newModelSession"',
      fileNotOpen: 'File "{{path}}" is not open in the current workspace.',
      noFile: 'No current file open.',
      saveFailed: 'Save Failed',
    },
  },
  docker: {
    need: 'Need Docker',
    required: 'Docker is required to start a local node.',
    install: 'Install',
    installing: 'Installing',
    installed: 'Installed',
    start: 'Start Docker',
    starting: 'Starting Docker',
    started: 'Started',
    privileges: 'Need Privileges',
    image: {
      select: 'Select a version of {{name}}',
      noInstall:'(No {{name}} installed)',
      versions: 'Versions',
      manager: '{{name}} Manager',
      downloading: 'Downloading {{name}}',
      uninstallConfirm: 'Click again to uninstall',
      none: 'None',
      availableVersions: 'Available Versions',
    },
    badge: {
      noSelect: 'not selected',
      noInstall: 'not installed',
    },
    table: {
      version: 'version',
      created: 'created',
      size: 'size',
    },
    error: {
      fail: 'Fail to run docker',
      linuxPrivileges: 'Make sure the non-root user has privileges to run docker',
      unknown: 'Something went wrong when starting Docker, please try again'
    }
  },
  file: {
    open: 'Open',
    error: {
      createFolder: 'Fail to create the folder',
    },
  },
  global: {
    about: {
      title: 'About',
      contact: 'Contact us',
      website: 'Website',
    },
    update: {
      available: '{{project}} v{{version}} is now available',
      confirm: 'Restart and Update',
      cancel: 'Later',
    }
  }
}

export default {
  translation
}
