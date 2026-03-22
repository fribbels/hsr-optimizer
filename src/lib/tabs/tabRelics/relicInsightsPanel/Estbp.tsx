import { Flex } from '@mantine/core'
import { RelicContainer } from 'lib/characterPreview/summary/EstimatedTbpRelicsDisplay'
import { enrichSingleRelicAnalysis } from 'lib/characterPreview/summary/statScoringSummaryController'
import { ScoringCache } from 'lib/relics/scoring/relicScorer'
import { useAsyncComputation } from 'lib/hooks/useAsyncComputation'
import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import { getRelicById } from 'lib/stores/relicStore'
import { useRelicsTabStore } from 'lib/tabs/tabRelics/useRelicsTabStore'
import {
  type EstTbpWorkerOutput,
  handleWork,
} from 'lib/worker/estTbpWorkerRunner'
import { memo, useMemo, useRef } from 'react'

export const EstbpCard = memo(({ width }: { width?: number }) => {
  const selectedRelicId = useRelicsTabStore((s) => s.selectedRelicId)
  const focusCharacter = useRelicsTabStore((s) => s.focusCharacter)
  const selectedRelic = getRelicById(selectedRelicId ?? '') ?? null

  const weights = useScoringMetadata(focusCharacter)

  const computeFn = useMemo(() => {
    if (!selectedRelic || !weights?.stats) return null
    return () => handleWork(selectedRelic, weights.stats)
  }, [selectedRelicId, weights?.stats])

  const { ready, output } = useAsyncComputation<EstTbpWorkerOutput>(computeFn, [computeFn])

  const needsAnalysis = selectedRelic && weights && focusCharacter

  const analysis = output && needsAnalysis ? enrichSingleRelicAnalysis(selectedRelic, output.days, weights, focusCharacter, new ScoringCache()) : undefined

  // Keep previous analysis visible while worker recomputes to avoid flash
  const prevAnalysis = useRef(analysis)
  if (analysis) prevAnalysis.current = analysis
  const displayAnalysis = analysis ?? prevAnalysis.current

  const horizontal = (width ?? 297) > 600

  return (
    <Flex style={{ width: width ?? 297, height: '100%' }}>
      <RelicContainer ready={ready || !!displayAnalysis} relicAnalysis={displayAnalysis} withoutPreview horizontal={horizontal} />
    </Flex>
  )
})
