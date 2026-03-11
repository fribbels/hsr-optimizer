import { Text, TextProps } from '@mantine/core'
import classes from './StatText.module.css'

type StatTextProps = TextProps & React.ComponentPropsWithoutRef<'div'>

const StatText = (props: StatTextProps) => (
  <Text component="div" className={classes.statText} {...props} />
)

export const StatTextEllipses = (props: StatTextProps) => (
  <Text component="div" className={classes.statTextEllipses} {...props} />
)

export const StatTextSm = (props: StatTextProps) => (
  <Text component="div" className={classes.statTextSm} {...props} />
)

export default StatText
