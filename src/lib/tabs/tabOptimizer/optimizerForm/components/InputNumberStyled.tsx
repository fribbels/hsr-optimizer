import { NumberInput, NumberInputProps } from '@mantine/core'
import React, { CSSProperties } from 'react'

const InputNumberStyled = React.forwardRef<HTMLInputElement, NumberInputProps>((props, ref) => {
  const inputStyle: CSSProperties | undefined = typeof props.styles === 'object' ? props.styles?.input as CSSProperties | undefined : undefined
  return (
    <NumberInput
      ref={ref}
      size="xs"
      {...props}
      style={{ width: 60, ...props.style }}
      styles={{ input: { height: 24, minHeight: 24, ...inputStyle } }}
    />
  )
})
InputNumberStyled.displayName = 'InputNumberStyled'

export default InputNumberStyled
