import { Flex, Progress, useMantineTheme } from '@mantine/core'
import { useOptimizerUIStore } from 'lib/stores/optimizerUI/useOptimizerUIStore'
import { calculateProgressText } from 'lib/tabs/tabOptimizer/sidebar/sidebarUtils'
import { HeaderText } from 'lib/ui/HeaderText'
import React, { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

export const ProgressDisplay = React.memo(function ProgressDisplay() {
  const { permutations, permutationsSearched, optimizerStartTime, optimizerEndTime, optimizerRunningEngine, optimizationInProgress } = useOptimizerUIStore(
    useShallow((s) => ({
      permutations: s.permutations,
      permutationsSearched: s.permutationsSearched,
      optimizerStartTime: s.optimizerStartTime,
      optimizerEndTime: s.optimizerEndTime,
      optimizerRunningEngine: s.optimizerRunningEngine,
      optimizationInProgress: s.optimizationInProgress,
    })),
  )
  const theme = useMantineTheme()

  const progressText = useMemo(
    () => calculateProgressText(optimizerStartTime, optimizerEndTime, permutations, permutationsSearched, optimizationInProgress, optimizerRunningEngine),
    [optimizerStartTime, optimizerEndTime, permutations, permutationsSearched, optimizationInProgress, optimizerRunningEngine],
  )

  return (
    <Flex direction="column">
      <HeaderText>
        {progressText}
      </HeaderText>
      <Progress
        color={theme.colors.blue[6]}
        size={5}
        value={Math.floor(permutationsSearched / permutations * 100)}
      />
    </Flex>
  )
})
