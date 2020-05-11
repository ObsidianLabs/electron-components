import React, { PureComponent } from 'react'
import ReactDOM from 'react-dom'
import Terminal from '@obsidians/terminal'

class App extends PureComponent {
  render () {
    return (
      <div className='h-100'>
        <Terminal active input logId='test' height='100%' />
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))

