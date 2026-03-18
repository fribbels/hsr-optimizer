import { NumberInput, type NumberInputProps } from '@mantine/core'
import type { CSSProperties, Ref } from 'react'
import inputClasses from 'style/inputs.module.css'

export function InputNumberStyled({ ref, ...props }: NumberInputProps & { ref?: Ref<HTMLInputElement> }) {
  const inputStyle: CSSProperties | undefined = typeof props.styles === 'object' ? props.styles?.input as CSSProperties | undefined : undefined
  return (
    <NumberInput
      ref={ref}
      {...props}
      className={inputClasses.compactPadding}
      style={{ width: 60, ...props.style }}
      styles={{ input: { height: 24, minHeight: 24, ...inputStyle } }}
    />
  )
}
