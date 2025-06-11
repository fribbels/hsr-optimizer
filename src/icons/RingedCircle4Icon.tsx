import { Flex } from 'antd'
import React from 'react'
import { IconExtractedProps } from 'types/components'

const IconSVG = (props: { color?: string }) => {
  const { color } = props

  return (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='64 64 896 896' focusable='false' data-icon='circle' width='20' height='20' fill={color ?? 'transparent'}>
      <path d='M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 100c192.5 0 348 155.5 348 348s-155.5 348-348 348S164 704.5 164 512 319.5 164 512 164z' />

      <path
        d='M512 240C362.2 240 240 362.2 240 512s122.2 272 272 272 272-122.2 272-272S661.8 240 512 240z

    M510.9 550.5v-140l-95 140h95z
    M630 615h-50v75h-70v-75h-160v-65l175-245h55v240h50v70z'
        fillRule='evenodd'
      />
    </svg>
  )
}

// eslint-disable-next-line react/display-name
export const RingedCircle4Icon = React.forwardRef<HTMLDivElement, IconExtractedProps>((props, ref) => {
  const { color, className, style, ...restProps } = props

  return (
    <Flex ref={ref} className={className} style={style} {...restProps}>
      <IconSVG color={color} />
    </Flex>
  )
})
