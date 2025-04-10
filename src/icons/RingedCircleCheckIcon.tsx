import { Flex } from 'antd'
import React from 'react'
import { IconExtractedProps } from 'types/components'

const IconSVG = (props: { color?: string }) => {
  const { color } = props

  return (
    <svg viewBox='64 64 896 896' focusable='false' data-icon='circle' width='20' height='20' fill={color ?? 'transparent'}>
      <path
        d='M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 100c192.5 0 348 155.5 348 348s-155.5 348-348 348S164 704.5 164 512 319.5 164 512 164z'
        fillRule='evenodd'
      />

      <path
        d='M512 240C362.2 240 240 362.2 240 512s122.2 272 272 272 272-122.2 272-272S661.8 240 512 240zm193.5 125.7l-210.6 292a31.8 31.8 0 01-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z'
        fillRule='evenodd'
      />
    </svg>
  )
}

export const RingedCircleCheckIcon = React.forwardRef<HTMLDivElement, IconExtractedProps>((props, ref) => {
  const { color, className, style, ...restProps } = props

  return (
    <Flex ref={ref} className={className} style={style} {...restProps}>
      <IconSVG color={color}/>
    </Flex>
  )
})
