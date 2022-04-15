import React, { useRef, forwardRef, useState } from 'react'
import { Modal } from '@obsidians/ui-components'
import { FormGroup, Input, Label } from 'reactstrap'

const DEFAULT_CONTENT = {
  cancel: 'Cancel',
  confirm: 'Confirm',
  colorConfirm: 'primary'
}

const ActionConfirm = forwardRef(({}, ref) => {
  const [nextFunc, setNextFunc] = useState(() => () => {})
  const [textContent, setContent] = useState(DEFAULT_CONTENT)
  const [checkVal, setCheckVal] = useState(false)
  const [cacheKey, setCacheKey] = useState('')
  const modal = useRef(null)

  if (ref) {
    ref.current = {
      open: ({ content, next, key }) => {
        if (skipConfirm(key)) {
          next()
          return
        }
        setContent({...textContent, ...content})
        setNextFunc(() => next)
        setCacheKey(key)
        showModal()
      },
      close: () => {
        closeModal()
      }
    }
  }

  const showModal = () => {
    modal.current.openModal()
  }

  const closeModal = () => {
    modal.current.closeModal()
  }

  const handleConfirm = () => {
    checkVal && localStorage.setItem(cacheKey, 'true')
    nextFunc()
    closeModal()
  }

  const skipConfirm = (key) => {
    return localStorage.getItem(key) === 'true' || false
  }

  const handleInputChange = () => {
    setCheckVal(!checkVal)
  }

  const optionCheck = () => {
    return (
      <FormGroup check className={'actionConfirm__checkbox'}>
        <Input type='checkbox'
          onChange={handleInputChange}
          checked={checkVal} />
        <Label check>Do not ask me again</Label>
      </FormGroup>)
  }

  return (
    <Modal
      ref={modal}
      size={'md'}
      title={textContent.title}
      textConfirm={textContent.confirm}
      colorConfirm={textContent.colorConfirm}
      onConfirm={handleConfirm}
      ActionBtn={optionCheck()}>
      <p> { textContent.description } </p>
    </Modal>)
})

export default ActionConfirm
