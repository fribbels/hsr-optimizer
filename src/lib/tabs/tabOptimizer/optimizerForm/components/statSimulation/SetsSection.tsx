import { Select } from '@mantine/core'
import { UseFormReturnType } from '@mantine/form'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { BenchmarkForm } from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'
import { GenerateBasicSetsOptions } from 'lib/tabs/tabOptimizer/optimizerForm/components/SetsOptions'
import { useOrnamentsOptions } from 'lib/tabs/tabOptimizer/optimizerForm/components/OrnamentsOptions'
import { useStatSimField } from 'lib/tabs/tabOptimizer/optimizerForm/components/statSimulation/statSimConstants'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

// Optimizer-tab version: reads/writes from Zustand store (no AntD Form context needed)
export function OptimizerSetsSection({ simType }: { simType: string }) {
  const { t, i18n } = useTranslation('optimizerTab', { keyPrefix: 'StatSimulation' })

  const simRelicSet1 = useStatSimField<string>(simType, 'simRelicSet1')
  const simRelicSet2 = useStatSimField<string>(simType, 'simRelicSet2')
  const simOrnamentSet = useStatSimField<string>(simType, 'simOrnamentSet')
  const ornamentOptions = useOrnamentsOptions()

  const updateField = useOptimizerRequestStore.getState().updateStatSimField

  const relicSetData = useMemo(() => GenerateBasicSetsOptions().map((opt) => ({ value: opt.value, label: typeof opt.label === 'string' ? opt.label : opt.value })), [i18n.resolvedLanguage])

  // Save a click by assuming the first relic set is a 4p
  const handleRelicSet1Change = (value: string) => {
    updateField(simType, 'simRelicSet1', value)
    updateField(simType, 'simRelicSet2', value)
  }

  return (
    <>
      <Select
        comboboxProps={{ styles: { dropdown: { width: 250 } } }}
        style={{ maxHeight: 32 }}
        maxDropdownHeight={700}
        clearable
        data={relicSetData}
        value={simRelicSet1}
        onChange={(value) => handleRelicSet1Change(value ?? '')}
        placeholder={t('SetSelection.RelicPlaceholder')}
        searchable
      />
      <Select
        comboboxProps={{ styles: { dropdown: { width: 250 } } }}
        style={{ maxHeight: 32 }}
        maxDropdownHeight={700}
        clearable
        data={relicSetData}
        value={simRelicSet2}
        onChange={(value) => updateField(simType, 'simRelicSet2', value ?? '')}
        placeholder={t('SetSelection.RelicPlaceholder')}
        searchable
      />
      <Select
        comboboxProps={{ styles: { dropdown: { width: 250 } } }}
        style={{ maxHeight: 32 }}
        maxDropdownHeight={600}
        clearable
        data={ornamentOptions.map((opt) => ({ value: opt.value, label: opt.value }))}
        value={simOrnamentSet}
        onChange={(value) => updateField(simType, 'simOrnamentSet', value ?? '')}
        placeholder={t('SetSelection.OrnamentPlaceholder')}
        searchable
      />
    </>
  )
}

// BenchmarksTab version: uses Mantine form instance passed as prop
export function SetsSection({ simType, form }: { simType: string; form: UseFormReturnType<BenchmarkForm> }) {
  const { t, i18n } = useTranslation('optimizerTab', { keyPrefix: 'StatSimulation' })
  const ornamentOptions = useOrnamentsOptions()

  const relicSetData = useMemo(() => GenerateBasicSetsOptions().map((opt) => ({ value: opt.value, label: typeof opt.label === 'string' ? opt.label : opt.value })), [i18n.resolvedLanguage])

  // Save a click by assuming the first relic set is a 4p
  const handleRelicSet1Change = (value: string | null) => {
    form.setFieldValue('simRelicSet1', (value ?? undefined) as never)
    form.setFieldValue('simRelicSet2', (value ?? undefined) as never)
  }

  return (
    <>
      <Select
        comboboxProps={{ styles: { dropdown: { width: 250 } } }}
        style={{ maxHeight: 32 }}
        maxDropdownHeight={700}
        clearable
        data={relicSetData}
        value={form.getValues().simRelicSet1 ?? null}
        onChange={handleRelicSet1Change}
        placeholder={t('SetSelection.RelicPlaceholder')}
        searchable
      />
      <Select
        comboboxProps={{ styles: { dropdown: { width: 250 } } }}
        style={{ maxHeight: 32 }}
        maxDropdownHeight={700}
        clearable
        data={relicSetData}
        value={form.getValues().simRelicSet2 ?? null}
        onChange={(value) => form.setFieldValue('simRelicSet2', (value ?? undefined) as never)}
        placeholder={t('SetSelection.RelicPlaceholder')}
        searchable
      />
      <Select
        comboboxProps={{ styles: { dropdown: { width: 250 } } }}
        style={{ maxHeight: 32 }}
        maxDropdownHeight={600}
        clearable
        data={ornamentOptions.map((opt) => ({ value: opt.value, label: opt.value }))}
        value={form.getValues().simOrnamentSet ?? null}
        onChange={(value) => form.setFieldValue('simOrnamentSet', (value ?? undefined) as never)}
        placeholder={t('SetSelection.OrnamentPlaceholder')}
        searchable
      />
    </>
  )
}
