import { Text, TextProps } from '@mantine/core'
import { type ComponentPropsWithoutRef } from 'react'

const FormStatTextStyled = (props: TextProps & ComponentPropsWithoutRef<'p'>) => (
  <Text ta="center" display="block" {...props} />
)

export default FormStatTextStyled
