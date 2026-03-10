import { NumberInput, NumberInputProps } from '@mantine/core'
import React from 'react'

const InputNumberStyled = React.forwardRef<HTMLDivElement, NumberInputProps>((props, ref) => (
  <NumberInput
    ref={ref}
    size="xs"
    {...props}
    style={{ width: 60, ...props.style }}
    styles={{ input: { height: 24, minHeight: 24, ...props.styles?.input } }}
  />
))
InputNumberStyled.displayName = 'InputNumberStyled'

export default InputNumberStyled
