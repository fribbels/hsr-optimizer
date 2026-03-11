import { Text, TextProps } from '@mantine/core'

const FormStatTextStyled = (props: TextProps & React.ComponentPropsWithoutRef<'p'>) => (
  <Text ta="center" display="block" {...props} />
)

export default FormStatTextStyled
