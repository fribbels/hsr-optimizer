import { Text as MantineText } from '@mantine/core'
import { type CSSProperties, type PropsWithChildren } from 'react'

export const conditionalJustify = 'flex-start'
export const conditionalAlign = 'center'

export const ConditionalText = ({ style, ...rest }: PropsWithChildren<{ style?: CSSProperties }>) => (
  <MantineText {...rest} style={{ whiteSpace: 'pre-line', ...style }} />
)
