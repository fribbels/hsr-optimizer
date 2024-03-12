import { Divider, Flex } from 'antd'
import styled from 'styled-components'

export function VerticalDivider() {
  return (
    <Flex vertical>
      <Divider type="vertical" style={{ flexGrow: 1, margin: '10px 10px' }} />
    </Flex>
  )
}

export const HorizontalDivider = styled(Divider)`
  margin: 5px 0px;
`
