import { Flex } from 'antd'
import { ReactElement } from 'react'

export default function FilterContainer(props: { children: ReactElement | ReactElement[] }) {
  return (
    <Flex
      vertical
      style={{
        overflow: 'hidden',
        borderRadius: '10px',
        paddingBottom: 10,

        background: 'rgb(29 42 81 / 73%)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(5px)',
        outline: '1px solid rgba(255, 255, 255, 0.10)',
        WebkitBackdropFilter: 'blur(5px)',
      }}
    >
      {props.children}
    </Flex>
  )
}
