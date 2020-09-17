export default class RemoteFs {
  constructor () {
    this.promises = {
      readFile: () => '',
      writeFile: () => {},
    }
  }
}