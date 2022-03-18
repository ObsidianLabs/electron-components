import React from 'react'
import PropTypes from 'prop-types'

const TYPE_COLOR = {
  error: '#D1606C',
  warnig: '#D1AD60'
  // unsaved: '#FFF'
}

const StatusTitle = ({ title, isLeaf, showType, error, warnig }) => {
  const amount = showType === 'error' ? error : warnig
  return (
    <div className='center' style={{ 'color': `${TYPE_COLOR[showType]}` }} >
      <p > { title }</p>
      { isLeaf ? <p style={{ 'fontSize': '12px' }} >{ amount }</p>
        : <div className='circleBadge' style={{ 'backgroundColor': `${TYPE_COLOR[showType]}` }} />
      }
    </div>
  )
}

export default StatusTitle

StatusTitle.propTypes = {
  isLeaf: PropTypes.bool,
  title: PropTypes.string,
  showType: PropTypes.string,
  error: PropTypes.number,
  warnig: PropTypes.number
  // unsaved: PropTypes.number
}