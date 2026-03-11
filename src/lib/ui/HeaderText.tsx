import { Text, TextProps } from '@mantine/core'
import classes from './HeaderText.module.css'

export const HeaderText = (props: TextProps & React.ComponentPropsWithoutRef<'p'>) => (
  <Text className={classes.headerText} {...props} />
)
