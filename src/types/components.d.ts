import React from 'react'

export type ReactElement = React.JSX.Element

export type IconExtractedProps = {
  className?: string
  style?: React.CSSProperties
  onClick?: React.MouseEventHandler
  color?: string
}
