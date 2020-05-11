import { IpcChannel } from '@obsidians/ipc'

export default function initTerminalChannel (logId) {
  const terminalCreator = new IpcChannel('terminal-creator')
  terminalCreator.invoke('create', logId)
  return new IpcChannel('terminal', logId)
}

