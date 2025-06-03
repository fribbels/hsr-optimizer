import Icon from '@ant-design/icons'
import React from 'react'

const IconSVG = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24'>
    <g transform='translate(24 1) scale(-1 1)'>
      <path fill='none' stroke='currentColor' strokeLinecap='round' strokeWidth='3' d='M8 12L15 5M8 12L15 19' />
    </g>
  </svg>
)

export const RightIcon = (props: React.ComponentProps<typeof Icon>) => {
  return <Icon component={IconSVG} {...props} />
}
