import React from 'react'
import Button from '../ported/Button'

export default function ErrorPage({ title, description, divider = true, btnStatus = false, btnSize='md', btnColor = 'primary', btnText, btnClick }) {

  return (
    <>
      <h4 className='display-4'>{title}</h4>
      <p className='lead'>{description}</p>
      <hr hidden={divider}/>
      <div hidden={btnStatus}>
        <Button size={btnSize} className='mt-4' color={btnColor} onClick={btnClick}>
          {btnText}
        </Button>
      </div>
    </>
  )
}