import { SegmentedControl } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import { useTranslation } from 'react-i18next'
import { type BenchmarkForm } from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'

export function LightConeSuperimpositionFormRadio(props: { form: UseFormReturnType<BenchmarkForm> }) {
  const { t } = useTranslation('modals', { keyPrefix: 'EditCharacter' })

  return (
    <SegmentedControl
      fullWidth
      data={[
        { label: t('SuperimpositionButton', { superimposition: 1 }), value: '1' },
        { label: t('SuperimpositionButton', { superimposition: 2 }), value: '2' },
        { label: t('SuperimpositionButton', { superimposition: 3 }), value: '3' },
        { label: t('SuperimpositionButton', { superimposition: 4 }), value: '4' },
        { label: t('SuperimpositionButton', { superimposition: 5 }), value: '5' },
      ]}
      value={String(props.form.values.lightConeSuperimposition ?? 1)}
      onChange={(val) => props.form.setFieldValue('lightConeSuperimposition', Number(val))}
    />
  )
}
