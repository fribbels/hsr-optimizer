import { Flex } from '@mantine/core'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { calculateProgressText } from 'lib/tabs/tabOptimizer/sidebar/sidebarUtils'
import { HeaderText } from 'lib/ui/HeaderText'
import React from 'react'
import { useShallow } from 'zustand/react/shallow'

const SEGMENT_COUNT = 20

export const ProgressDisplay = React.memo(function ProgressDisplay() {
  const { permutations, permutationsSearched, optimizerStartTime, optimizerEndTime, optimizerRunningEngine, optimizationInProgress, optimizerProgress } = useOptimizerDisplayStore(
    useShallow((s) => ({
      permutations: s.permutations,
      permutationsSearched: s.permutationsSearched,
      optimizerStartTime: s.optimizerStartTime,
      optimizerEndTime: s.optimizerEndTime,
      optimizerRunningEngine: s.optimizerRunningEngine,
      optimizationInProgress: s.optimizationInProgress,
      optimizerProgress: s.optimizerProgress,
    })),
  )

  const progressText = calculateProgressText(
    optimizerStartTime,
    optimizerEndTime,
    permutations,
    permutationsSearched,
    optimizationInProgress,
    optimizerRunningEngine,
    optimizerProgress,
  )
  const progress = optimizerProgress
  const filledSegments = Math.round(progress * SEGMENT_COUNT)

  return (
    <Flex direction='column' gap={4}>
      <HeaderText>
        {progressText}
      </HeaderText>
      <Flex gap={2}>
        {Array.from({ length: SEGMENT_COUNT }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 2,
              backgroundColor: i < filledSegments ? 'var(--mantine-color-primary-3)' : 'var(--border-default)',
            }}
          />
        ))}
      </Flex>
    </Flex>
  )
})
