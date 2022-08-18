import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const Jumbotron = ({ className, ...attributes }) => {
  return (
    <div
      {...attributes}
      className={classNames(className, 'tailwind py-8 sm:py-16 px-4 sm:px-8 mb-8 bg-jumbotron rounded-1.2')}
    />
  )
}

Jumbotron.propTypes = {
  className: PropTypes.string
}

export default Jumbotron
