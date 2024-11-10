import Icon from '@ant-design/icons'
import React from 'react'

const IconSVG = () => (
  <svg className='w-6 h-6 text-gray-800 dark:text-white' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='none' viewBox='0 1 20 20'>
    <path stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 6v13m0-13 4 4m-4-4-4 4'/>
  </svg>
)

export const UpArrow = (props: React.ComponentProps<typeof Icon>) => {
  return <Icon component={IconSVG} {...props}/>
}
