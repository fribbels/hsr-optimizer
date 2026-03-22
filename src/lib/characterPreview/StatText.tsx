import React from 'react'
import classes from './StatText.module.css'

type StatTextProps = React.HTMLAttributes<HTMLDivElement>

export function StatText(props: StatTextProps) {
  return <div className={classes.statText} {...props} />
}


export function StatTextSm(props: StatTextProps) {
  return <div className={classes.statTextSm} {...props} />
}
