import { Flex } from '@mantine/core'
import { RelicContainer } from 'lib/characterPreview/summary/EstimatedTbpRelicsDisplay'
import { enrichSingleRelicAnalysis } from 'lib/characterPreview/summary/statScoringSummaryController'
import { ScoringCache } from 'lib/relics/scoring/relicScorer'
import { useAsyncComputation } from 'lib/hooks/useAsyncComputation'
import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import useRelicsTabStore from 'lib/tabs/tabRelics/useRelicsTabStore'
import {
  EstTbpWorkerOutput,
  handleWork,
} from 'lib/worker/estTbpWorkerRunner'
import { memo, useMemo } from 'react'

export const EstbpCard = memo(() => {
  const { selectedRelic, focusCharacter } = useRelicsTabStore()

  const weights = useScoringMetadata(focusCharacter)

  const computeFn = useMemo(() => {
    if (!selectedRelic || !weights?.stats) return null
    return () => handleWork(selectedRelic, weights.stats)
  }, [selectedRelic, weights?.stats])

  const { ready, output } = useAsyncComputation<EstTbpWorkerOutput>(computeFn, [computeFn])

  const needsAnalysis = selectedRelic && weights && focusCharacter

  const analysis = output && needsAnalysis ? enrichSingleRelicAnalysis(selectedRelic, output.days, weights, focusCharacter, new ScoringCache()) : undefined

  return (
    <Flex style={{ width: 297, height: '100%' }}>
      <RelicContainer ready={ready} relicAnalysis={analysis} withoutPreview />
    </Flex>
  )
})
