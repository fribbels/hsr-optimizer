import {
  Divider,
} from 'antd'
import { Flex } from '@mantine/core'
import styled from 'styled-components'

export function VerticalDivider(props: { width?: number }) {
  const width = props.width ?? 10
  return (
    <Flex direction="column">
      <Divider type='vertical' style={{ flexGrow: 1, margin: `10px ${width}px` }} />
    </Flex>
  )
}

export const HorizontalDivider = styled(Divider)`
    margin: 5px 0px;
`

export function CustomHorizontalDivider(props: { height?: number }) {
  const height = props.height ?? 5
  return (
    <Flex direction="column">
      <Divider type='horizontal' style={{ flexGrow: 1, margin: `${height}px 10px` }} />
    </Flex>
  )
}
