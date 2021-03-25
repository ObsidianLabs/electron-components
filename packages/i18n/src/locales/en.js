const translation = {
  loading: 'Loading',
  loggingIn: 'Logging in...',
  welcome: {
    welcome: 'Welcome to {{projectName}}',
    message: '{{projectName}} is a graphic IDE for developing smart contracts on the {{chainName}} blockchain. To get started, please install the prerequisite tools for {{projectName}}.',
    start: 'Get Started',
    skip: 'Skip',
  },
  editor: {
    lost: 'Your changes will be lost if you close this item without saving.',
    project: {
      setting: 'Project Settings2',
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
  button: {
    save: 'Save',
    cancel: 'Cancel',
    dontSave: `Don't Save`,
  }
}

export default {
  translation
}
