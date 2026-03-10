import { Flex } from '@mantine/core'
import { useDelayedProps } from 'hooks/useDelayedProps'
import { BuffsAnalysisDisplay } from 'lib/characterPreview/BuffsAnalysisDisplay'
import DB, { AppPages } from 'lib/state/db'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import {
  generateAnalysisData,
  getCachedForm,
  getPinnedRowData,
  mismatchedCharacter,
  OptimizerResultAnalysis,
} from 'lib/tabs/tabOptimizer/analysis/expandedDataPanelController'
import { StatsDiffCard } from 'lib/tabs/tabOptimizer/analysis/StatsDiffCard'
import { DamageUpgrades } from 'lib/tabs/tabOptimizer/analysis/SubstatUpgrades'
import FilterContainer from 'lib/tabs/tabOptimizer/optimizerForm/layout/FilterContainer'
import {
  FormRow,
  OptimizerMenuIds,
} from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormRow'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { useOptimizerUIStore } from 'lib/stores/optimizerUI/useOptimizerUIStore'
import React, { useMemo } from 'react'

export function ExpandedDataPanel() {
  const selectedRowData = useOptimizerUIStore((s) => s.optimizerSelectedRowData)
  const optimizerTabFocusCharacter = useOptimizerUIStore((s) => s.focusCharacterId)

  // For triggering updates
  const characterId = useOptimizerFormStore((s) => s.characterId)
  const lightConeId = useOptimizerFormStore((s) => s.lightCone)

  if (window.store.getState().activeKey != AppPages.OPTIMIZER) {
    return <></>
  }

  let form = getCachedForm() ?? OptimizerTabController.getForm()
  const pinnedRowData = getPinnedRowData()

  // Check the cached form first, otherwise try the current form
  if (mismatchedCharacter(optimizerTabFocusCharacter, form)) {
    form = OptimizerTabController.getForm()
    if (mismatchedCharacter(optimizerTabFocusCharacter, form)) {
      return <></>
    }
  }
  if (selectedRowData == null || pinnedRowData == null || form == null || DB.getCharacterById(form.characterId) == null) {
    return <></>
  }
  if (selectedRowData.statSim) {
    return <></>
  }

  const analysis = generateAnalysisData(pinnedRowData, selectedRowData, form)
  console.log('Optimizer result', analysis)

  if (!analysis) return null

  return <MemoizedExpandedDataPanel analysis={analysis} />
}

function MemoizedExpandedDataPanel(props: { analysis: OptimizerResultAnalysis }) {
  const delayedProps = useDelayedProps(props, 50)

  const memoized = useMemo(() => {
    return delayedProps
      ? <AnalysisRender analysis={delayedProps.analysis} />
      : null
  }, [delayedProps])

  if (!delayedProps) return null
  return memoized
}

function AnalysisRender(props: { analysis: OptimizerResultAnalysis }) {
  const { analysis } = props

  return (
    <FilterContainer>
      <FormRow id={OptimizerMenuIds.analysis}>
        <Flex justify='space-between' style={{ width: '100%', paddingTop: 4 }} gap={10}>
          <Flex direction="column" gap={10}>
            <StatsDiffCard analysis={analysis} />
            <DamageUpgrades analysis={analysis} />
          </Flex>

          <BuffsAnalysisDisplay buffGroups={analysis.buffGroups} singleColumn={true} />
        </Flex>
      </FormRow>
    </FilterContainer>
  )
}
