import { Flex } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { BenchmarkForm } from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'
import { ReactElement } from 'types/components'

interface BenchmarkSettingProps {
  label: 'SPD' | 'ERR' | 'SubDPS'
  itemName: keyof BenchmarkForm
  form: UseFormReturnType<BenchmarkForm>
  children: ReactElement
}

export function BenchmarkSetting({ label, itemName, form, children }: BenchmarkSettingProps) {
  const { t } = useTranslation('benchmarksTab', { keyPrefix: 'RightPanel.Settings' })

  // Boolean fields (ERR, SubDPS) need string<->boolean conversion for SegmentedControl
  const isBooleanField = itemName === 'errRope' || itemName === 'subDps'

  const rawValue = form.getValues()[itemName]

  const injectedProps = isBooleanField
    ? {
      value: String(rawValue ?? false),
      onChange: (val: string) => form.setFieldValue(itemName, (val === 'true') as never),
    }
    : {
      ...form.getInputProps(itemName),
    }

  return (
    <Flex align='center' gap={10} justify='space-between'>
      {t(label)}
      {React.cloneElement(children, injectedProps)}
    </Flex>
  )
}
