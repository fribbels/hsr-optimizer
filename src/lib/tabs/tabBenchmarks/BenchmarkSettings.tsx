import { Flex, Form as AntDForm } from 'antd'
import React from 'react'
import { ReactElement } from 'types/components'

interface BenchmarkSettingProps {
  label: string
  itemName: string
  children: ReactElement
}

export function BenchmarkSetting({ label, itemName, children }: BenchmarkSettingProps) {
  return (
    <Flex align='center' gap={10} justify='space-between'>
      {label}
      <AntDForm.Item name={itemName} noStyle>
        {children}
      </AntDForm.Item>
    </Flex>
  )
}
