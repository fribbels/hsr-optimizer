import {
  Divider,
  Flex,
} from 'antd'
import styled from 'styled-components'

export function VerticalDivider(props: { width?: number }) {
  const width = props.width ?? 10
  return (
    <Flex vertical>
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
    <Flex vertical>
      <Divider type='horizontal' style={{ flexGrow: 1, margin: `${height}px 10px` }} />
    </Flex>
  )
}
