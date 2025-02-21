import { Flex } from 'antd'
import { cardShadowNonInset } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import { ReactElement } from 'react'

export default function FilterContainer(props: { children: ReactElement | ReactElement[] }) {
  return (
    <Flex
      vertical
      style={{
        overflow: 'hidden',
        borderRadius: 5,
        paddingBottom: 10,
        background: 'rgb(29 42 81 / 73%)',
        boxShadow: cardShadowNonInset,
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
