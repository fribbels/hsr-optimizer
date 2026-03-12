import { Divider, Flex, Text } from '@mantine/core'
import { localeNumberComma } from 'lib/utils/i18nUtils'
import React from 'react'

export const PermutationDisplay = React.memo(function PermutationDisplay({ total, right, left }: { total?: number; right: number; left: string }) {
  const rightText = total
    ? `${localeNumberComma(right)} / ${localeNumberComma(total)} - (${localeNumberComma(Math.ceil(right / total * 100))}%)`
    : `${localeNumberComma(right)}`
  return (
    <Flex justify='space-between'>
      <Text style={{ lineHeight: '24px' }}>
        {left}
      </Text>
      <Divider style={{ margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset' }} variant="dashed" />
      <Text style={{ lineHeight: '24px' }}>
        {rightText}
      </Text>
    </Flex>
  )
})
