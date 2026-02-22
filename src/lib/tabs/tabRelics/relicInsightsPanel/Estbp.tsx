import { Flex } from 'antd'
import { RelicContainer } from 'lib/characterPreview/summary/EstimatedTbpRelicsDisplay'
import { enrichSingleRelicAnalysis } from 'lib/characterPreview/summary/statScoringSummaryController'
import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import DB from 'lib/state/db'
import useRelicsTabStore from 'lib/tabs/tabRelics/useRelicsTabStore'
import {
  EstTbpWorkerOutput,
  handleWork,
} from 'lib/worker/estTbpWorkerRunner'
import {
  memo,
  useEffect,
  useState,
} from 'react'
import { ScoringMetadata } from 'types/metadata'
import { Relic } from 'types/relic'

function useEstbpWorker(relic: Relic | null, weights: ScoringMetadata['stats'] | undefined) {
  const [ready, setReady] = useState(false)

  const [output, setOutput] = useState<null | EstTbpWorkerOutput>(null)

  useEffect(() => {
    let cancelled = false
    setOutput(null)
    setReady(false)
    if (!relic || !weights) {
      setOutput(null)
      setReady(true)
      return
    }
    handleWork(relic, weights).then((output) => {
      if (cancelled) return
      setOutput(output)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [relic, weights])

  return { ready, output }
}

export const EstbpCard = memo(() => {
  const { selectedRelic, focusCharacter } = useRelicsTabStore()

  const weights = useScoringMetadata(focusCharacter)

  const { ready, output } = useEstbpWorker(selectedRelic, weights?.stats)

  const needsAnalysis = selectedRelic && weights && focusCharacter

  const analysis = output && needsAnalysis ? enrichSingleRelicAnalysis(selectedRelic, output.days, weights, focusCharacter) : undefined

  return (
    <Flex style={{ width: 297, height: '100%' }}>
      <RelicContainer ready={ready} relicAnalysis={analysis} withoutPreview />
    </Flex>
  )
})
