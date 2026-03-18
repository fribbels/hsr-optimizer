import { SegmentedControl } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import { useTranslation } from 'react-i18next'
import { type BenchmarkForm } from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'

export function CharacterEidolonFormRadio(props: { form: UseFormReturnType<BenchmarkForm> }) {
  const { t } = useTranslation('modals', { keyPrefix: 'EditCharacter' })

  return (
    <SegmentedControl
      fullWidth
      data={[
        { label: t('EidolonButton', { eidolon: 0 }), value: '0' },
        { label: t('EidolonButton', { eidolon: 1 }), value: '1' },
        { label: t('EidolonButton', { eidolon: 2 }), value: '2' },
        { label: t('EidolonButton', { eidolon: 3 }), value: '3' },
        { label: t('EidolonButton', { eidolon: 4 }), value: '4' },
        { label: t('EidolonButton', { eidolon: 5 }), value: '5' },
        { label: t('EidolonButton', { eidolon: 6 }), value: '6' },
      ]}
      value={String(props.form.values.characterEidolon ?? 0)}
      onChange={(val) => props.form.setFieldValue('characterEidolon', Number(val))}
    />
  )
}
