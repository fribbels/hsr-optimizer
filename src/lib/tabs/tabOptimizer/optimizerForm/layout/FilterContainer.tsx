import { Flex } from '@mantine/core'
import classes from 'lib/tabs/tabOptimizer/optimizerForm/layout/FilterContainer.module.css'
import type { ReactElement } from 'react'

export function FilterContainer({ children }: { children: ReactElement | ReactElement[] }) {
  return (
    <Flex direction='column' className={classes.container}>
      {children}
    </Flex>
  )
}
