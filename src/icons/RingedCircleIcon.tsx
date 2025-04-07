import Icon from '@ant-design/icons'
import React from 'react'

const IconSVG = (props: { color?: string }) => {
  const { color } = props

  return (
    <svg viewBox='64 64 896 896' focusable='false' data-icon='circle' width='20' height='20' fill={color ?? 'transparent'}>
      <path
        d='M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 100c192.5 0 348 155.5 348 348s-155.5 348-348 348S164 704.5 164 512 319.5 164 512 164z'
        fillRule='evenodd'
      />

      <path d='M512 240C362.2 240 240 362.2 240 512s122.2 272 272 272 272-122.2 272-272S661.8 240 512 240z' fillRule='evenodd'/>
    </svg>
  )
}

export const RingedCircleIcon = (props: React.ComponentProps<typeof Icon> & { color?: string }) => {
  return <IconSVG {...props}/>
}
