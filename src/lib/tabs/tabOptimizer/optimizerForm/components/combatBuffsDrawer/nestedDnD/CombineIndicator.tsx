import { Box } from '@mantine/core'
import type { PropsWithChildren } from 'react'
import classes from './CombineIndicator.module.css'

export function CombineIndicator({ children, active }: CombineIndicator.Props) {
  return (
    <Box className={`${classes.root} ${active ? classes.active : ''}`}>
      {children}
    </Box>
  )
}

export namespace CombineIndicator {
  export interface Props extends PropsWithChildren {
    active: boolean
  }
}
