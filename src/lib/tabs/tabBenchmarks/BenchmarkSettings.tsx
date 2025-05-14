import { Flex, Form as AntDForm } from 'antd'
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
  return (
    <Flex align='center' gap={10} justify='space-between'>
      {t(label)}
      <AntDForm.Item name={itemName} noStyle>
        {children}
      </AntDForm.Item>
    </Flex>
  )
}
