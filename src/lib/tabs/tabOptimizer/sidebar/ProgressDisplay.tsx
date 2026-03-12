import { Flex, Progress } from '@mantine/core'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { calculateProgressText } from 'lib/tabs/tabOptimizer/sidebar/sidebarUtils'
import { HeaderText } from 'lib/ui/HeaderText'
import React from 'react'
import { useShallow } from 'zustand/react/shallow'

export const ProgressDisplay = React.memo(function ProgressDisplay() {
  const { permutations, permutationsSearched, optimizerStartTime, optimizerEndTime, optimizerRunningEngine, optimizationInProgress } = useOptimizerDisplayStore(
    useShallow((s) => ({
      permutations: s.permutations,
      permutationsSearched: s.permutationsSearched,
      optimizerStartTime: s.optimizerStartTime,
      optimizerEndTime: s.optimizerEndTime,
      optimizerRunningEngine: s.optimizerRunningEngine,
      optimizationInProgress: s.optimizationInProgress,
    })),
  )

  const progressText = calculateProgressText(optimizerStartTime, optimizerEndTime, permutations, permutationsSearched, optimizationInProgress, optimizerRunningEngine)

  return (
    <Flex direction="column">
      <HeaderText>
        {progressText}
      </HeaderText>
      <Progress
        color="blue"
        size={5}
        value={permutations ? Math.floor(permutationsSearched / permutations * 100) : 0}
      />
    </Flex>
  )
})
