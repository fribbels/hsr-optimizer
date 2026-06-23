import type React from 'react'
import classes from './HeaderText.module.css'

export const HeaderText = (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} className={`${classes.headerText} ${props.className ?? ''}`} />
