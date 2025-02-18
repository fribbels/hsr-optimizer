import { Flex } from 'antd'
import { ReactElement } from 'react'

export default function FilterContainer(props: { bottomPadding?: boolean; children: ReactElement | ReactElement[] }) {
  return (
    <Flex
      vertical
      style={{
        overflow: 'hidden',
        borderRadius: 5,
        paddingBottom: props.bottomPadding ? 10 : 0,
        background: 'rgb(29 42 81 / 73%)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
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
