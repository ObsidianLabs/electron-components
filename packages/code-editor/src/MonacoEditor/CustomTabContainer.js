import React from 'react'

export default function ({ modelSession }) {
  if (!modelSession.CustomTab) {
    return null
  }

  return (
    <modelSession.CustomTab modelSession={modelSession} />
  )
}
