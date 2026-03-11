import { Text as MantineText } from '@mantine/core'

export const conditionalJustify = 'flex-start'
export const conditionalAlign = 'center'

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
export const ConditionalText = (props: React.PropsWithChildren<{ style?: React.CSSProperties }>) => (
  <MantineText style={{ whiteSpace: 'pre-line', ...props.style }} {...props} />
)
