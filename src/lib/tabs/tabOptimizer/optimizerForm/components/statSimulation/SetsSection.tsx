import type { UseFormReturnType } from '@mantine/form'
import {
  Constants,
  UnreleasedSets,
} from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import {
  SetsOrnaments,
  SetsRelics,
  setToId,
} from 'lib/sets/setConfigRegistry'
import type { StatSimType } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import type { BenchmarkForm } from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'
import { useStatSimField } from 'lib/tabs/tabOptimizer/optimizerForm/components/statSimulation/statSimConstants'
import {
  SearchableCombobox,
  type SearchableComboboxOption,
} from 'lib/ui/SearchableCombobox'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

function useRelicSetOptions(): SearchableComboboxOption[] {
  const { t, i18n } = useTranslation('gameData', { keyPrefix: 'RelicSets' })
  return useMemo(() =>
    Object.values(SetsRelics)
      .filter((x) => !UnreleasedSets[x])
      .map((x) => ({
        value: x,
        label: t(`${setToId[x]}.Name`),
        icon: Assets.getSetImage(x, Constants.Parts.Head),
      })), [t, i18n.resolvedLanguage])
}

function useOrnamentSetOptions(): SearchableComboboxOption[] {
  const { t, i18n } = useTranslation('gameData', { keyPrefix: 'RelicSets' })
  return useMemo(() =>
    Object.values(SetsOrnaments)
      .filter((x) => !UnreleasedSets[x])
      .map((x) => ({
        value: x,
        label: t(`${setToId[x]}.Name`),
        icon: Assets.getSetImage(x, Constants.Parts.PlanarSphere),
      })), [t, i18n.resolvedLanguage])
}

// Optimizer-tab version: reads/writes from Zustand store (no AntD Form context needed)
export function OptimizerSetsSection({ simType }: { simType: StatSimType }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'StatSimulation' })

  const simRelicSet1 = useStatSimField<string>(simType, 'simRelicSet1')
  const simRelicSet2 = useStatSimField<string>(simType, 'simRelicSet2')
  const simOrnamentSet = useStatSimField<string>(simType, 'simOrnamentSet')

  const updateField = useOptimizerRequestStore.getState().updateStatSimField

  const relicSetData = useRelicSetOptions()
  const ornamentSetData = useOrnamentSetOptions()

  // Save a click by assuming the first relic set is a 4p
  const handleRelicSet1Change = (value: string | null) => {
    updateField(simType, 'simRelicSet1', value ?? '')
    updateField(simType, 'simRelicSet2', value ?? '')
  }

  return (
    <>
      <SearchableCombobox
        options={relicSetData}
        value={simRelicSet1}
        onChange={handleRelicSet1Change}
        placeholder={t('SetSelection.RelicPlaceholder')}
        clearable
      />
      <SearchableCombobox
        options={relicSetData}
        value={simRelicSet2}
        onChange={(value) => updateField(simType, 'simRelicSet2', value ?? '')}
        placeholder={t('SetSelection.RelicPlaceholder')}
        clearable
      />
      <SearchableCombobox
        options={ornamentSetData}
        value={simOrnamentSet}
        onChange={(value) => updateField(simType, 'simOrnamentSet', value ?? '')}
        placeholder={t('SetSelection.OrnamentPlaceholder')}
        dropdownMaxHeight={600}
        clearable
      />
    </>
  )
}

// BenchmarksTab version: uses Mantine form instance passed as prop
export function SetsSection({ simType, form }: { simType: StatSimType, form: UseFormReturnType<BenchmarkForm> }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'StatSimulation' })

  const relicSetData = useRelicSetOptions()
  const ornamentSetData = useOrnamentSetOptions()

  // Save a click by assuming the first relic set is a 4p
  const handleRelicSet1Change = (value: string | null) => {
    form.setFieldValue('simRelicSet1', (value ?? undefined) as never)
    form.setFieldValue('simRelicSet2', (value ?? undefined) as never)
  }

  return (
    <>
      <SearchableCombobox
        options={relicSetData}
        value={form.getValues().simRelicSet1 ?? null}
        onChange={handleRelicSet1Change}
        placeholder={t('SetSelection.RelicPlaceholder')}
        clearable
      />
      <SearchableCombobox
        options={relicSetData}
        value={form.getValues().simRelicSet2 ?? null}
        onChange={(value) => form.setFieldValue('simRelicSet2', (value ?? undefined) as never)}
        placeholder={t('SetSelection.RelicPlaceholder')}
        clearable
      />
      <SearchableCombobox
        options={ornamentSetData}
        value={form.getValues().simOrnamentSet ?? null}
        onChange={(value) => form.setFieldValue('simOrnamentSet', (value ?? undefined) as never)}
        placeholder={t('SetSelection.OrnamentPlaceholder')}
        dropdownMaxHeight={600}
        clearable
      />
    </>
  )
}
