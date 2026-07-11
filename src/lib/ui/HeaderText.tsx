import classes from 'lib/ui/HeaderText.module.css'
import type React from 'react'

export const HeaderText = (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} className={`${classes.headerText} ${props.className ?? ''}`} />
