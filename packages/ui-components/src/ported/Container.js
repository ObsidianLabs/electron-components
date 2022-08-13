import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const Container = ({ className, ...attributes }) => {
  return (
    <div
      {...attributes}
      className={classNames(
        className,
        'w-full px-[15px] mx-auto print:m-w-[992px]',
        'sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl',
      )}
    />
  )
}

Container.propTypes = {
  className: PropTypes.string
}

export default Container
