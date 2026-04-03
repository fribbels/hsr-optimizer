import { buffedCharacters } from 'lib/importer/kelzFormatParser'
import { RelicScorer } from 'lib/relics/scoring/relicScorer'
import { sortAlphabeticEmojiLast } from 'lib/rendering/displayUtils'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { getCharacterById, useCharacterStore } from 'lib/stores/character/characterStore'
import { useRelicById } from 'lib/stores/relic/relicStore'
import { useScoringStore } from 'lib/stores/scoring/scoringStore'
import { BucketsPanel } from 'lib/tabs/tabRelics/relicInsightsPanel/BucketsPanel'
import { EstbpCard } from 'lib/tabs/tabRelics/relicInsightsPanel/Estbp'
import { Top10Panel } from 'lib/tabs/tabRelics/relicInsightsPanel/Top10Panel'
import {
  InsightCharacters,
  RelicInsights,
  useRelicsTabStore,
} from 'lib/tabs/tabRelics/useRelicsTabStore'
import { memo, useMemo } from 'react'
import { useElementSize } from '@mantine/hooks'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import type { CharacterId } from 'types/character'

export const RelicInsightsPanel = memo(function RelicInsightsPanel() {
  const { insightsCharacters, insightsMode, selectedRelicId, excludedRelicPotentialCharacters } = useRelicsTabStore(
    useShallow((s) => ({
      insightsCharacters: s.insightsCharacters,
      insightsMode: s.insightsMode,
      selectedRelicId: s.selectedRelicId,
      excludedRelicPotentialCharacters: s.excludedRelicPotentialCharacters,
    })),
  )
  const scoringVersion = useScoringStore((s) => s.scoringVersion)
  const characterCount = useCharacterStore((s) => s.characters.length)
  const { t } = useTranslation('gameData', { keyPrefix: 'Characters' })
  const selectedRelic = useRelicById(selectedRelicId)
  const { ref: containerRef, width: containerWidth } = useElementSize()

  const scores: Score[] = useMemo(() => {
    if (!selectedRelic) return []
    return Object.values(getGameMetadata().characters)
      .filter((x) => {
        if (buffedCharacters[x.id]) return false

        switch (insightsCharacters) {
          case InsightCharacters.All:
            return true
          case InsightCharacters.Custom:
            return !excludedRelicPotentialCharacters.includes(x.id)
          case InsightCharacters.Owned:
            return getCharacterById(x.id) != undefined
        }
      })
      .map((char) => ({
        id: char.id,
        name: t(`${char.id}.Name`),
        score: RelicScorer.scoreRelicPotential(selectedRelic, char.id, true),
        owned: getCharacterById(char.id) != undefined,
      }))
      .filter((x) => x.score.bestPct > 0)
      .sort((a, b) => {
        if (b.score.bestPct === a.score.bestPct) {
          return sortAlphabeticEmojiLast('name')(a, b)
        } else return b.score.bestPct - a.score.bestPct
      })
  }, [insightsCharacters, selectedRelic, excludedRelicPotentialCharacters, t, scoringVersion, characterCount])

  const chartWidth = containerWidth || undefined

  return (
    <div ref={containerRef} style={{ width: '100%', overflow: 'hidden' }}>
      {selectedRelic && (() => {
        switch (insightsMode) {
          case RelicInsights.Buckets:
            return <BucketsPanel scores={scores} width={chartWidth} />
          case RelicInsights.Top10:
            return <Top10Panel scores={scores} width={chartWidth} />
          case RelicInsights.ESTBP:
            return <EstbpCard />
        }
      })()}
    </div>
  )
})

type Score = {
  id: CharacterId,
  name: string,
  score: ReturnType<typeof RelicScorer.scoreRelicPotential>,
  owned: boolean,
}

export type PanelProps = {
  scores: Score[]
  width?: number
  height?: number
}
