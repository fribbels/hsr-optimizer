import { Text, TextProps } from '@mantine/core'
import classes from './StatText.module.css'

type StatTextProps = TextProps & React.ComponentPropsWithoutRef<'div'>

export function StatText(props: StatTextProps) {
  return <Text component='div' className={classes.statText} {...props} />
}

export function StatTextEllipses(props: StatTextProps) {
  return <Text component='div' className={classes.statTextEllipses} {...props} />
}

export function StatTextSm(props: StatTextProps) {
  return <Text component='div' className={classes.statTextSm} {...props} />
}
