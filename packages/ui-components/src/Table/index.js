import React from 'react'

export default function Table ({ tableSm, TableHead, children }) {
  return (
    <table
      className={`table table-hover table-fixed table-striped overflow-hidden ${tableSm ? 'table-sm' : ''}`}
    >
      <thead>{TableHead}</thead>
      <tbody>
        {children}
      </tbody>
    </table>
  )
}