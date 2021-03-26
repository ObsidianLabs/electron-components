const translation = {
  loading: 'Loading...',
  loggingIn: 'Logging in...',
  none: 'None',
  pending: 'Pending',
  creating: 'Creating',
  deleting: 'Deleting',
  noOptions: 'No options',
  error: 'Error',
  success: 'Success',
  button: {
    save: 'Save',
    cancel: 'Cancel',
    dontSave: `Don't Save`,
    close: 'Close',
    confirm: 'Confirm',
    confirmDelete: 'Click again to delete',
    delete: 'Delete',
    create: 'Create',
    choose: 'Choose',
    trash: 'Move To Trash',
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
      message: 'You can restart and update to the new version. Do you want to do it right now?',
    }
  },
  ipc: {
    needLogin: 'Need login to perform this operation.'
  },
  keypair: {
    title: 'Keypair',
    name: 'Name',
    address: 'Address',
    private: 'Private Key',
    no: 'No',
    noKeypair: 'No keypairs',
    reveal: 'Reveal {{name}}',
    view: 'View',
    create: {
      title: 'Create Keypair',
      confirm: 'Create',
      creating: 'Creating...',
      regenerate: 'Regenerate',
      success: 'Create {{name}} Successful',
      successMessage: 'A new {{name}} is created and saved in {{project}}.'
    },
    import: {
      title: 'Import Keypair',
      confirm: 'Import',
      importing: 'Importing...',
      label: 'Enter the {{name}} you want to import',
      success: 'Import {{name}} Successful',
      successMessage: 'The {{name}} is imported to {{project}}.'
    },
    delete: {
      success: 'Delete {{name}} Successful',
      successMessage: 'The {{name}} is removed from {{project}}.'
    },
    modify: {
      title: 'Modify Keypair Name',
      saving: 'Saving...',
    },
    manager: {
      title: 'Keypair Manager',
      doNot: 'DO NOT',
      useOnMainnet: 'use on mainnet!',
      forDevOnly: 'For development purpose only.',
      saveUnencrypted: 'For convenience in development, the private keys are saved unencrypted.'
    },
    input: {
      name: 'Name',
      placeholder: 'Please enter a name for the keypair',
    },
    error: {
      create: 'Create Keypair Failed',
      import: 'Import Keypair Failed',
      duplicateName: 'The keypair name <b>{{name}}</b> has already been used.',
      duplicateKey: 'Keypair for <b>{{address}}</b> already exists.',
      notValid: 'Not a valid {{secret}}',
      noKeypair: 'No keypair for <b>{{address}}</b>',
      noSecret: 'No {{key}} for <b>{{address}}</b>',
    },
  },
  user: {
    myProjects: 'My Projects',
    noProject: 'No Project',
    login: 'Login',
    loginAs: 'Logged in as',
    loginProvider: 'Login {{provider}}',
    logout: 'Log out',
    notLogin: 'not logged in',
    user: 'User',
    notFound: 'Not Found',
    projects: 'Projects',
    noDescription: 'No description',
  },
  queue: {
    transaction: {
      transaction: 'Transaction',
      transactions: 'Transactions',
      all: 'All Transactions',
      recent: 'Recent Transactions',
    },
  },
  terminal: {
    copied: 'Copied',
    copiedMesage: 'The selection content is copied to the clipboard.'
  },
  workspace: {
    others: 'Others',
    fileName: 'File name',
    folderName: 'Folder name',
    projectName: 'Project name',
    projectPath: 'project path',
    projectLocation: 'Project location',
    projectLoading: 'Loading Project',
    tempalte: 'Template',
    new: {
      title: 'New',
      file: 'New File',
      folder: 'New Folder',
      project: 'Create Project',
      projectTitle: 'Create a New Project',
      success: 'Successful',
      successMessage: 'New project <b>{{name}}</b> is created.',
    },
    open: {
      title: 'Open',
      folder: 'Open Containing Folder',
      project: 'Open Project',
      terminal: 'Open in Terminal',
    },
    delete: {
      project: 'Delete Project',
      projectTitle: 'Are you sure to delete this project?',
      fileConfirm: 'Are you sure you want to delete {{file}}?',
    },
    remove: {
      title: 'Remove',
      success: 'Remove Project Successful',
      successMessage: 'Project <b>{{name}}</b> is removed'
    },
    error: {
      createFile: 'Cannot Create File',
      createFolder: 'Cannot Create Folder',
      createProject: 'Cannot Create the Project',
      projectNotFound: 'Project Not Found',
      projectNotFoundDetail: 'Cannot find the project',
      noMainFile: 'No main file in project settings',
      noProject: 'No Project',
      noProjectMessage: 'Please open a project first.',
      fileExists: 'File <b>{{file}}</b> already exists.',
      folderExists: 'Folder <b>{{folder}}</b> already exists.',
      createFileFailed: 'Fail to create the file <b>{{file}}</b>.',
      createFolderFailed: 'Fail to create the folder <b>{{folder}}</b>.',
    },
  },
}

export default {
  translation
}
