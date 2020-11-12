import platform from '@obsidians/platform'
import fileOps from '@obsidians/file-ops'

import set from 'lodash/set'
import get from 'lodash/get'

export default class ProjectSettings {
  constructor (settingFilePath, channel) {
    this.settingFilePath = settingFilePath
    this.channel = channel

    this.invalid = false
    this.settings = {}
    this.path = fileOps.current.path
  }

  async readSettings () {
    if (platform.isDesktop) {
      await fileOps.current.ensureFile(this.settingFilePath)
    }
    const settingsJson = await fileOps.current.readFile(this.settingFilePath)

    this.update(settingsJson)
    return this.settings
  }

  async writeSettings(rawSettings) {
    const settings = this.trimSettings(rawSettings)
    
    const settingsJson = JSON.stringify(settings, null, 2)
    await fileOps.current.writeFile(this.settingFilePath, settingsJson)
  }

  update (settingsJson) {
    let rawSettings
    try {
      rawSettings = JSON.parse(settingsJson || '{}')
    } catch (e) {
      return
    }
    const oldSettings = this.settings
    this.settings = this.trimSettings(rawSettings)

    if (!this.channel) {
      return
    }
    
    for (let evt of this.channel.events) {
      const [prefix, key] = evt.split(':')
      if (prefix === 'settings' && key) {
        const oldValue = get(oldSettings, key)
        const newValue = get(this.settings, key)
        if (oldValue !== newValue) {
          this.channel.trigger(evt, newValue)
        }
      }
    }
  }

  trimSettings = (rawSettings = {}) => rawSettings

  get (key) {
    return get(this.settings, key)
  }

  async set (key, value) {
    const settings = this.settings
    const oldValue = get(settings, key)
    if (oldValue !== value) {
      set(settings, key, value)
      this.channel.trigger(`settings:${key}`, value)
      await this.writeSettings(settings)
    }
  }
}
