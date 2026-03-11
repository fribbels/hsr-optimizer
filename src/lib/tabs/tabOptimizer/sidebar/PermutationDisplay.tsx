import { Divider, Flex, Text } from '@mantine/core'
import { localeNumberComma } from 'lib/utils/i18nUtils'
import React from 'react'

export const PermutationDisplay = React.memo(function PermutationDisplay(props: { total?: number, right: number, left: string }) {
  const rightText = props.total
    ? `${localeNumberComma(props.right)} / ${localeNumberComma(props.total)} - (${localeNumberComma(Math.ceil(props.right / props.total * 100))}%)`
    : `${localeNumberComma(props.right)}`
  return (
    <Flex justify='space-between'>
      <Text style={{ lineHeight: '24px' }}>
        {props.left}
      </Text>
      <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} variant="dashed" />
      <Text style={{ lineHeight: '24px' }}>
        {rightText}
      </Text>
    </Flex>
  )
})
