import React from 'react'
import AutoUpdateModal from './AutoUpdateModal'
import AboutModal from './AboutModal'

export default function GlobalModals (props) {
  return (
    <React.Fragment>
      <AutoUpdateModal />
      <AboutModal icon={props.icon}>
        {props.children}
      </AboutModal>
    </React.Fragment>
  )
}