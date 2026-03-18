import { Flex } from '@mantine/core'
import type { ReactElement } from 'react'
import classes from './FilterContainer.module.css'

export function FilterContainer({ children }: { children: ReactElement | ReactElement[] }) {
  return (
    <Flex direction="column" className={classes.container}>
      {children}
    </Flex>
  )
}
