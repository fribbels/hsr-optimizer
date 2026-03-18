import type { CSSProperties, PropsWithChildren } from 'react'

export const conditionalJustify = 'flex-start'
export const conditionalAlign = 'center'

export const ConditionalText = ({ style, children }: PropsWithChildren<{ style?: CSSProperties }>) => (
  <div style={{ whiteSpace: 'pre-line', ...style }}>{children}</div>
)
