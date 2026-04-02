import { useDelayedProps } from 'hooks/useDelayedProps'
import { BuffsAnalysisDisplay } from 'lib/characterPreview/buildAnalysis/BuffsAnalysisDisplay'
import { AppPages } from 'lib/constants/appPages'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { getCharacterById } from 'lib/stores/character/characterStore'
import {
  generateAnalysisData,
  getCachedForm,
  getPinnedRowData,
  mismatchedCharacter,
} from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import type { OptimizerResultAnalysis } from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { DamageSplits } from 'lib/tabs/tabOptimizer/analysis/DamageSplits'
import { DamageTagPieChart } from 'lib/tabs/tabOptimizer/analysis/DamageTagPieChart'
import { StatsDiffCard } from 'lib/tabs/tabOptimizer/analysis/StatsDiffCard'
import { DamageUpgrades } from 'lib/tabs/tabOptimizer/analysis/SubstatUpgrades'
import { FilterContainer } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FilterContainer'
import { FormRow } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormRow'
import { OptimizerMenuIds } from 'lib/tabs/tabOptimizer/optimizerForm/layout/optimizerMenuIds'
import { getForm } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { useMemo } from 'react'

export function ExpandedDataPanel() {
  const selectedRowData = useOptimizerDisplayStore((s) => s.optimizerSelectedRowData)
  const optimizerTabFocusCharacter = useOptimizerDisplayStore((s) => s.focusCharacterId)

  if (useGlobalStore.getState().activeKey !== AppPages.OPTIMIZER) {
    return null
  }

  let form = getCachedForm() ?? getForm()
  const pinnedRowData = getPinnedRowData()

  // Check the cached form first, otherwise try the current form
  if (mismatchedCharacter(optimizerTabFocusCharacter, form)) {
    form = getForm()
    if (mismatchedCharacter(optimizerTabFocusCharacter, form)) {
      return null
    }
  }
  if (selectedRowData == null || pinnedRowData == null || form == null || getCharacterById(form.characterId) == null) {
    return null
  }
  if (selectedRowData.statSim) {
    return null
  }

  const analysis = generateAnalysisData(pinnedRowData, selectedRowData, form)

  if (!analysis) return null

  return <MemoizedExpandedDataPanel analysis={analysis} />
}

function MemoizedExpandedDataPanel(props: { analysis: OptimizerResultAnalysis }) {
  const delayedAnalysis = useDelayedProps(props.analysis, 50)

  const memoized = useMemo(() => {
    return delayedAnalysis
      ? <AnalysisRender analysis={delayedAnalysis} />
      : null
  }, [delayedAnalysis])

  if (!delayedAnalysis) return null
  return memoized
}

function AnalysisRender({ analysis }: { analysis: OptimizerResultAnalysis }) {
  return (
    <FilterContainer>
      <FormRow id={OptimizerMenuIds.analysis}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', paddingTop: 4, gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            <StatsDiffCard analysis={analysis} />
            <DamageSplits analysis={analysis} />
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <DamageTagPieChart analysis={analysis} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <DamageUpgrades analysis={analysis} />
              </div>
            </div>
          </div>

          <BuffsAnalysisDisplay perActionBuffGroups={analysis.perActionBuffGroups} context={analysis.context} />
        </div>
      </FormRow>
    </FilterContainer>
  )
}
