import classes from 'lib/characterPreview/StatText.module.css'
import React from 'react'

type StatTextProps = React.HTMLAttributes<HTMLDivElement>

export function StatText(props: StatTextProps) {
  return <div {...props} className={`${classes.statText} ${props.className ?? ''}`} />
}

export function StatTextSm(props: StatTextProps) {
  return <div {...props} className={`${classes.statTextSm} ${props.className ?? ''}`} />
}
