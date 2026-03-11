import { Flex } from '@mantine/core'
import { ReactElement } from 'react'

export default function FilterContainer(props: { children: ReactElement | ReactElement[] }) {
  return (
    <Flex
      direction="column"
      style={{
        overflow: 'hidden',
        borderRadius: 5,
        paddingBottom: 10,
        background: 'var(--bg-translucent)',
        boxShadow: 'var(--card-shadow-flat)',
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        WebkitBackdropFilter: 'blur(5px)',
        width: 1227,
      }}
    >
      {props.children}
    </Flex>
  )
}
