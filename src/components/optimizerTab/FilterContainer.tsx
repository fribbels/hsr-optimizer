import { Flex } from 'antd'
import { ReactElement } from 'react'

const shadow = 'rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.15) 0px 0px 0px 1px inset'

export default function FilterContainer(props: { children: ReactElement | ReactElement[] }) {
  return (
    <Flex
      vertical
      style={{
        // outline: '2px solid #243356',
        overflow: 'hidden',
        borderRadius: '10px',
        boxShadow: shadow,
        paddingBottom: 10,
      }}
    >
      {props.children}
    </Flex>
  )
}
