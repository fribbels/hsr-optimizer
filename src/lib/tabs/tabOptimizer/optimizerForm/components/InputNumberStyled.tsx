import { NumberInput, NumberInputProps } from '@mantine/core'
import { type CSSProperties, type Ref } from 'react'

function InputNumberStyled({ ref, ...props }: NumberInputProps & { ref?: Ref<HTMLInputElement> }) {
  const inputStyle: CSSProperties | undefined = typeof props.styles === 'object' ? props.styles?.input as CSSProperties | undefined : undefined
  return (
    <NumberInput
      ref={ref}
      {...props}
      style={{ width: 60, ...props.style }}
      styles={{ input: { height: 24, minHeight: 24, ...inputStyle } }}
    />
  )
}

export default InputNumberStyled
