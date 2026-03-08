import {
  Form as AntDForm,
} from 'antd'
import { Flex } from '@mantine/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ReactElement } from 'types/components'

interface BenchmarkSettingProps {
  label: 'SPD' | 'ERR' | 'SubDPS'
  itemName: string
  children: ReactElement
}

export function BenchmarkSetting({ label, itemName, children }: BenchmarkSettingProps) {
  const { t } = useTranslation('benchmarksTab', { keyPrefix: 'RightPanel.Settings' })

  // Boolean fields (ERR, SubDPS) need string<->boolean conversion for SegmentedControl
  const isBooleanField = itemName === 'errRope' || itemName === 'subDps'

  return (
    <Flex align='center' gap={10} justify='space-between'>
      {t(label)}
      <AntDForm.Item
        name={itemName}
        noStyle
        {...(isBooleanField
          ? {
            getValueFromEvent: (val: string) => val === 'true',
            getValueProps: (val: unknown) => ({ value: String(val ?? false) }),
          }
          : {})}
      >
        {children}
      </AntDForm.Item>
    </Flex>
  )
}
