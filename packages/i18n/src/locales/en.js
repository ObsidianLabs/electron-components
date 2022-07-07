const translation = {
  loading: 'Loading',
  loggingIn: 'Logging in...',
  refresh: 'Refresh',
  delete: 'Delete',
  deleting: 'Deleting...',
  open: 'Open',
  remove: 'Remove',
  rename: 'Rename',
  renaming: 'Renaming',
  duplicate: 'Duplicate',
  create: 'Create',
  creating: 'Creating',
  save: 'Save',
  saving: 'Saving',
  import: 'Import',
  importing: 'Importing',
  changing: 'Changing...',
  edit: 'Edit',
  version: 'VERSIONS',
  delClickAgain: 'Click again to delete',
  rmClickAgain: 'Click again to remove',
  welcome: {
    welcome: 'Welcome to {{projectName}}',
    message: '{{projectName}} is a graphic IDE for developing smart contracts on the {{chainName}} blockchain. To get started, please install the prerequisite tools for {{projectName}}.',
    start: 'Get Started',
    skip: 'Skip'
  },
  contract: {
    deploy: {
      title: 'Deploy Contract',
      deploy: 'Deploy',
      fail: 'Deploy Failed',
      failText: 'No connected network. Please start a local network or switch to a remote network.',
      connot: 'Cannot Deploy',
      projectNotFound: 'Project not found, may have been deleted or unshared. Please refresh the page.',
      cannotTextFolder: 'Cannot locate the built folder. Please make sure you have built the project successfully.',
      connotTextProject: 'No built contracts found. Please make sure you have built the project successfully.',
      error: 'Deployment Error',
      errorText: 'No signer specified. Please select one to sign the deployment transaction.',
      success: 'Deploy Successful',
      parameters: 'Constructor Parameters',
      signer: 'Signer',
      compiled: 'Compiled contract (compiler output JSON)',
      maxFee: 'Max Fee',
      tip: 'Tip',
      gasLimit: 'Gas Limit',
      deploying: 'Deploying',
      deployingText: 'Deploying contract <b>{{name}}</b>...',
      pushTrans: 'Pushing transaction',
      pushTransText: 'Transaction hash <b>{{txHash}}</b>...',
      timeout: 'Transaction Timeout',
      failed: 'Transaction Failed',
      executed: 'Transaction Executed',
      executedText: 'Gas used {{gasUsed}}.',
      confirmed: 'Transaction Confirmed',
      aContract: 'Deploy a Contract',
    },
    estimate: {
      fail: 'Estimate Failed',
      deploy: 'Estimate & Deploy',
      re: 'Re-estimate',
      basic: 'Basic',
      receipt: 'Receipt',
      error: 'Error',
    },
    build: {
      build: 'Build',
      stopBuild: 'Stop Build',
      start: 'Building Project',
      building: 'Building',
      fail: 'Build Failed',
      success: 'Build Successful',
      successTextSmart: 'The smart contract is built.',
      downloadingSolcBin: 'Downloading Solc Bin',
      failText: 'Another build task is running now.',
      fileCodeErr: 'Code has errors.',
      noMainFile: 'No Main File',
      noMainFileText: 'Please specify the main file in project settings.',
      noVersion: 'No {{compilerName}} Version',
      noVersionText: 'Please select a version for {{compilerName}} in project settings.',
      notInstalled: '{{compilerName}} {{compilerVersion}} not Installed',
      notInstalledText: 'Please install the version in <b>{{compilerName}} Manager</b> or select another version in project settings.',
      solcNotInstall: 'Solc {{compilerSolc}} not Installed',
      solcNotInstallText: 'Please install the version in <b>Solc Manager</b> or select another version in project settings.',
      contractFile: 'Building Contract File',
      projectSuccess: 'Build Project Successful',
      fileSuccess: 'Build File Successful',
      fileSuccessText: 'Please find the generated ABI and bytecode in the <b>{{buildFolder}}</b> folder.',
      notFound: 'Built Contract Not Found',
      notFoundText: 'Cannot open the file <b>{{path}}</b>. Please make sure <i>smart contract to deploy</i> is pointting to a valid built contract in the Project Settings.',
      fileErr: 'Built Contract File Error',
      parametersErr: 'Error in Constructor Parameters',
    },
    transaction: {
      execute: 'Execute',
      getEventLogs: 'Get event logs',
      hash: 'Hash',
      status: 'Status',
      contract: 'Contract',
      function: 'Function',
      contractName: 'Contract Name',
      authorization: 'Authorization',
      parametersEmpty: 'Send transaction with empty parameters',
      parametersEmptyText: 'Press the execute button again to confirm.',
      executeFail: 'Execute Contract Failed',
      executeFailText: '{{symbol}} to send is invalid.',
      noSignerText: 'No signer is provided. Please make sure you have availabe keypairs to use in the keypair manager.',
      range: 'Range',
      clear: 'Clear',
      eventLogs: 'Event Logs',
    }
  },
  keypair: {
    manager: 'Keypair Manager',
    keypair: 'Keypair',
    create: 'Create',
    creating: 'Creating',
    save: 'Save',
    saving: 'Saving',
    import: 'Import',
    importing: 'Importing',
    modify: 'Modify Keypair Name',
    donot: 'DO NOT',
    warn: 'use on mainnet! For development purpose only.',
    description: 'For convenience in development, the private keys are saved unencrypted.',
    regenerate: 'Regenerate',
    fromPrivateKey: 'Regenerate from private key',
    fromMnemonic: 'Regenerate from mnemonic',
    info: 'Keypair info',
    createPlaceholder: 'Please enter a name for the keypair',
    inportLabel: 'Enter the {{secretName}} you want to import',
    used: 'The keypair can be used on',
    fail: 'Create Keypair Failed',
    failText: 'The keypair name <b>{{name}}</b> has already been used.',
    failImport: 'Import Keypair Failed',
    failImportText: 'Keypair for <b>{{address}}</b> already exists.',
    createSuccess: 'Create {{text}} Successful',
    createSuccessText: 'A new {{text}} is created and saved in {{projectName}}.',
    importedSuccess: 'Import {{text}} Successful',
    importedSuccessText: 'The {{text}} is imported to {{projectName}}.',
    deleteSuccess: 'Delete {{text}} Successful',
    deleteSuccessText: 'The {{text}} is removed from {{projectName}}.',
  },
  project: {
    projectSetting: 'Project Settings',
    general: 'General',
    compiler: 'Compiler',
    compilers: 'Compilers',
    editor: 'Editor',
    fontFamily: 'Font Family',
    fontSize: 'Font Size',
    fontLigatures: 'Font Ligatures',
    version: 'version',
    title: 'Create a New Project',
    textConfirm: 'Create Project',
    name: 'Project name',
    template: 'Template',
    location: 'Project location',
    choose: 'Choose',
    change: 'Change',
    setting: 'Settings',
    workspace: 'Workspace',
    client: 'client',
    success: 'Successful',
    successText: 'New project <b>{{name}}</b> is created.',
    cannotCreate: 'Cannot Create the Project',
    cannotCreateTextOne: 'Please select a version for {{name}}',
    cannotCreateTextTwo: 'Please make sure you have node.js installed.',
    fail: 'Fail to Install OpenZeppelin',
    newFile: 'New File',
    newFolder: 'New Folder',
    openContainingFolder: 'Open Containing Folder',
    openInTerminal: 'Open in Terminal',
    copyPath: 'Copy Path',
    cannotCreateFile: 'Cannot Create File',
    cannotCreateFolder: 'Cannot Create Folder',
    renameFile: 'Rename File',
    renameFolder: 'Rename Folder',
    cannotRenameFile: 'Cannot Rename File',
    deleteFile: 'Delete File',
    deleteFileText: 'Are you sure you want to delete {{fileName}} ？Once deleted, it cannot be restored.',
    deleteFolder: 'Delete Folder',
    deleteFolderText: 'Are you sure you want to delete {{fileName}} and its contents？Once deleted, they cannot be restored.',
    existedFile: 'File Existed',
    existedFileText: 'A file with the name {{fileName}} already exists in the destination folder. Do you want to replace it?',
    existedFolder: 'Folder Existed',
    existedFolderText: 'A folder with the name {{fileName}} already exists in the destination folder. Do you want to replace it?',
    donotAskAgain: 'Do not ask me again',
    formatSolidity: 'Auto format solidity files on save',
    features: {
      private: ' private',
      public: ' public',
      Toggling: 'Toggling',
      Public: 'Public',
      Private: 'Private',
      privateText: ' Private projects are only visible to your self.',
      publicText: ' Public projects are visible to anyone with the link.',
      remind: 'You have unsaved files in this project. Please save before changing the project visibility.',
      visibility: 'Change Project Visibility',
      notSaved: 'Some files are not saved',
      title: 'Are you sure to change this project to ',
      changeSuccess: 'Change Visibility Successful',
      nowFeatures: 'This project is now ',
      publicDescription: 'and visible to anyone with the link.',
      privateDescription: 'and only visible to yourself.',
      fail: 'File not exists',
      failText: 'There is no file at <b>{{openningPath}}</b>.',
    },
    del: {
      title: 'Delete Project',
      delText: 'You are about to permanently delete this project. This operation ',
      canont: 'CANNOT',
      delTextEnd: ' be undone!',
      type: 'Type',
      toConf: 'to confirm',
      tips: 'Project name does not match',
      others: 'Others',
      rmSuccess: 'Remove Project Successful',
      rmSuccessText: 'Project <b>{{name}}</b> is removed',
      delSuccess: 'Delete Project Successful',
      delSuccessText: 'You have permanently delete project <b>{{name}}</b>',
    },
    share: {
      share: 'Share',
      shareLink: 'Share Link',
      project: 'Share Project',
      code: 'Code',
      preview: 'Preview',
      descStart: 'You can ',
      descCopy: 'copy',
      descShare: ' share ',
      descText: ' the link of this project and',
      descEnd: 'it with anyone.',
      copyLink: 'Copy Link',
      copy: ' Copy ',
      copied: 'Copied!',
      copyFailure: 'Copy failure',
      copyFailureText: 'Place try again.'
    },
    save: {
      fail: 'Save Failed',
      failText: 'This Project Is Readonly!',
    },
    setting: {
      noMainFile: 'No main file in project settings',
      noProject: 'No Project',
      openProject: 'Please open a project first.',
    },
    fork: {
      desc: 'Forking will duplicate the current project just for your own, which allows you to modify freely without affecting the original project.',
      visibilityDesc: 'By default, new forked projects are public. You can customize to private later in README.md when forked successfully.',
    }
  },
  component: {
    text: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      close: 'Close',
    }
  }
}

export default {
  translation
}
