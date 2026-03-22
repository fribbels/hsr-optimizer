import { Flex } from '@mantine/core'
import { RelicContainer } from 'lib/characterPreview/summary/EstimatedTbpRelicsDisplay'
import { enrichSingleRelicAnalysis } from 'lib/characterPreview/summary/statScoringSummaryController'
import { ScoringCache } from 'lib/relics/scoring/relicScorer'
import { useAsyncComputation } from 'lib/hooks/useAsyncComputation'
import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import { useRelicsTabStore } from 'lib/tabs/tabRelics/useRelicsTabStore'
import { useShallow } from 'zustand/react/shallow'
import {
  type EstTbpWorkerOutput,
  handleWork,
} from 'lib/worker/estTbpWorkerRunner'
import { memo, useMemo } from 'react'

export const EstbpCard = memo(({ width }: { width?: number }) => {
  const { selectedRelic, focusCharacter } = useRelicsTabStore(
    useShallow((s) => ({
      selectedRelic: s.selectedRelic,
      focusCharacter: s.focusCharacter,
    })),
  )

  console.log('[P9] EstbpCard RENDER — subscribes to s.selectedRelic (full object in store)')

  const weights = useScoringMetadata(focusCharacter)

  const computeFn = useMemo(() => {
    if (!selectedRelic || !weights?.stats) return null
    return () => handleWork(selectedRelic, weights.stats)
  }, [selectedRelic, weights?.stats])

  const { ready, output } = useAsyncComputation<EstTbpWorkerOutput>(computeFn, [computeFn])

  const needsAnalysis = selectedRelic && weights && focusCharacter

  const analysis = output && needsAnalysis ? enrichSingleRelicAnalysis(selectedRelic, output.days, weights, focusCharacter, new ScoringCache()) : undefined

  const horizontal = (width ?? 297) > 600

  return (
    <Flex style={{ width: width ?? 297, height: '100%' }}>
      <RelicContainer ready={ready} relicAnalysis={analysis} withoutPreview horizontal={horizontal} />
    </Flex>
  )
})
