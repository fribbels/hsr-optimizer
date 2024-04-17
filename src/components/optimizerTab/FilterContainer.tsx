import { Flex } from 'antd'
import { ReactElement } from 'react'

const shadow = 'rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.15) 0px 0px 0px 1px inset'

export default function FilterContainer(props: { children: ReactElement | ReactElement[] }) {
  return (
    <Flex
      vertical
      style={{
        overflow: 'hidden',
        borderRadius: '10px',
        paddingBottom: 10,

        background: '#e5cbe74d',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
      }}
    >
      {props.children}
    </Flex>
  )
}
