import { Flex, Typography } from 'antd'
import React from 'react'
import { ReactElement } from 'types/components'

const { Text } = Typography

export default function BenchmarksTab(): ReactElement {
  return (
    <Flex vertical style={{ height: 1400, width: 950 }} align='center'>
      Benchmarks
    </Flex>
  )
}
