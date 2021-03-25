const translation = {
  loading: '加载中',
  loggingIn: '登陆中...',
  none: '空',
  pending: '等待中',
  creating: '创建中',
  deleting: '删除中',
  noOptions: '无选项',
  button: {
    save: '保存',
    cancel: '取消',
    dontSave: '不保存',
    close: '关闭',
    confirm: '确认',
    confirmDelete: '再次点击删除',
    delete: '删除',
    create: '创建',
    choose: '选择',
    trash: '移除至垃圾桶',
  },
  welcome: {
    welcome: '欢迎使用 {{projectName}}',
    message: '{{projectName}} 是一个在 {{chainName}} 链上的集成开发环境，提供图形界面帮助开发者进行开发。请安装以下依赖工具来使用 {{projectName}}。',
    start: '开始使用',
    skip: '跳过',
  },
  editor: {
    lost: '如果你关闭此页面，未保存的内容将会丢失。',
    project: {
      setting: '项目设置',
      invalid: '无效项目',
      cantReadSetting: '无法读取此项目设置',
      makeSurePermission: '请确认当前用户有读/写权限',
    },
    error: {
      emptyPath: 'Empty path for "newModelSession"',
      fileNotOpen: '文件 "{{path}}" 无法在当前工作区打开。',
      noFile: '没有打开文件.',
      saveFailed: '保存失败',
    },
  },
  docker: {
    need: '需要 Docker',
    required: '需要 Docker 来启动本地节点。',
    install: '安装',
    installing: '正在安装',
    installed: '已安装',
    start: '启动 Docker',
    starting: '正在启动 Docker',
    started: '已启动',
    privileges: '需要权限',
    image: {
      select: '选择 {{name}} 的版本',
      noInstall:'({{name}} 没有安装)',
      versions: '版本',
      manager: '{{name}} 管理器',
      downloading: '正在下载 {{name}}',
      uninstallConfirm: '再次点击卸载',
      availableVersions: '可选版本',
    },
    badge: {
      noSelect: '未选择',
      noInstall: '未安装',
    },
    table: {
      version: '版本',
      created: '创建于',
      size: '大小',
    },
    error: {
      fail: '启动 docker 失败',
      linuxPrivileges: '请确保非 root 用户拥有运行 docker 的权限',
      unknown: '启动 Docker 时遇到来一些问题，请再次尝试'
    }
  },
  global: {
    about: {
      title: '关于',
      contact: '联系我们',
      website: '网站',
    },
    update: {
      available: '{{project}} 发现新版本 v{{version}}',
      confirm: '重启并更新',
      cancel: '稍后更新',
      message: '你可以重启并更新到新版本，是否现在更新？',
    }
  },
  ipc: {
    needLogin: '需要登陆来进行此操作。'
  },
  keypair: {
    title: '密钥对',
    name: '名称',
    address: '地址',
    private: '私钥',
    no: '无',
    noKeypair: '没有密钥对',
    reveal: '展示 {{name}}',
    view: '查看',
    create: {
      title: '创建密钥对',
      confirm: '创建',
      creating: '正在创建...',
      regenerate: '重新生成',
      success: '成功创建 {{name}}',
      successMessage: '新的密钥对 {{name}} 已创建并保存在 {{project}}。'
    },
    import: {
      title: '导入密钥对',
      confirm: '导入',
      importing: '正在导入...',
      label: '输入 {{name}}',
      success: '成功导入 {{name}}',
      successMessage: '{{name}} 已导入至 {{project}}。'
    },
    delete: {
      success: '成功删除 {{name}}',
      successMessage: '{{name}} 已从 {{project}} 移除。'
    },
    modify: {
      title: '修改密钥对名称',
      saving: '保存中...',
    },
    manager: {
      title: '密钥管理器',
      doNot: '请勿',
      useOnMainnet: '在主网中使用！',
      forDevOnly: '仅用于开发。',
      saveUnencrypted: '为了方便开发，私钥未加密保存。'
    },
    input: {
      name: '名称',
      placeholder: '请输入密钥对的名称',
    },
    error: {
      create: '创建密钥对失败',
      import: '创建密钥对失败',
      duplicateName: '此密钥对名称 <b>{{name}}</b> 已存在。',
      duplicateKey: '此密钥对 <b>{{address}}</b> 已存在。',
      notValid: '不合法 {{secret}}',
      noKeypair: '没有密钥对 <b>{{address}}</b>',
      noSecret: '此 <b>{{address}}</b> 没有 {{key}}',
    },
  },
  user: {
    myProjects: '我的项目',
    noProject: '没有项目',
    login: '登陆',
    loginAs: '登陆身份',
    loginProvider: '登陆至 {{provider}}',
    logout: '登出',
    notLogin: '未登陆',
    user: '用户',
    notFound: '未找到',
    projects: '项目',
    noDescription: '无简介',
  },
  queue: {
    transaction: {
      transaction: '交易',
      transactions: '交易',
      all: '所有交易',
      recent: '最近交易',
    },
  },
  terminal: {
    copied: '已复制',
    copiedMesage: '选中的内容将复制到剪贴板。'
  },
  workspace: {
    others: '其他',
    fileName: '文件名称',
    folderName: '文件夹名称',
    projectName: '项目名称',
    projectPath: '项目路径',
    projectLocation: '项目路径',
    projectLoading: '项目读取中',
    template: '模版',
    new: {
      title: '创建',
      file: '创建文件',
      folder: '创建文件夹',
      project: '创建项目呢',
      projectTitle: '创建新项目',
      success: '成功',
      successMessage: '新项目 <b>{{name}}</b> 已创建。',
    },
    open: {
      title: '打开',
      folder: '打开文件夹',
      project: '打开项目',
      terminal: '在终端中打开',
    },
    delete: {
      project: '删除项目',
      projectTitle: '是否确定删除当前项目？',
      fileConfirm: '是否确定删除文件 {{file}} ？',
    },
    remove: {
      title: '移除',
      success: '成功移除项目',
      successMessage: '项目 <b>{{name}}</b> 已移除'
    },
    error: {
      createFile: '无法创建文件',
      createFolder: '无法创建文件夹',
      createProject: '无法创建项目',
      projectNotFound: '项目未找到',
      projectNotFoundDetail: '无法找到该项目',
      noMainFile: '项目设置中没有指定主文件',
      noProject: '没有项目',
      noProjectMessage: '请首先打开项目。',
      fileExists: '文件 <b>{{file}}</b> 已存在。',
      folderExists: '文件夹 <b>{{folder}}</b> 已存在。',
      createFileFailed: '创建文件 <b>{{file}}</b> 失败。',
      createFolderFailed: '创建文件夹 <b>{{folder}}</b> 失败。',
    },
  },
}

export default {
  translation
}
