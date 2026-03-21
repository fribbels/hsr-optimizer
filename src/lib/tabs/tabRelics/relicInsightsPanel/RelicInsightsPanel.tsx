import { buffedCharacters } from 'lib/importer/kelzFormatParser'
import { RelicScorer } from 'lib/relics/scoring/relicScorer'
import { sortAlphabeticEmojiLast } from 'lib/rendering/displayUtils'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { getCharacterById } from 'lib/stores/characterStore'
import { getRelicById } from 'lib/stores/relicStore'
import { useScoringStore } from 'lib/stores/scoringStore'
import { BucketsPanel } from 'lib/tabs/tabRelics/relicInsightsPanel/BucketsPanel'
import { EstbpCard } from 'lib/tabs/tabRelics/relicInsightsPanel/Estbp'
import { Top10Panel } from 'lib/tabs/tabRelics/relicInsightsPanel/Top10Panel'
import {
  InsightCharacters,
  RelicInsights,
  useRelicsTabStore,
} from 'lib/tabs/tabRelics/useRelicsTabStore'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import type { CharacterId } from 'types/character'

export function RelicInsightsPanel({ containerWidth, containerHeight }: {
  containerWidth?: number
  containerHeight?: number
} = {}) {
  const { insightsCharacters, insightsMode, selectedRelicId, excludedRelicPotentialCharacters } = useRelicsTabStore(
    useShallow((s) => ({
      insightsCharacters: s.insightsCharacters,
      insightsMode: s.insightsMode,
      selectedRelicId: s.selectedRelicId,
      excludedRelicPotentialCharacters: s.excludedRelicPotentialCharacters,
    })),
  )
  const scoringMetadataOverrides = useScoringStore((s) => s.scoringMetadataOverrides)
  const { t } = useTranslation('gameData', { keyPrefix: 'Characters' })
  const selectedRelic = getRelicById(selectedRelicId ?? '') ?? null

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
      .sort((a, b) => {
        if (b.score.bestPct === a.score.bestPct) {
          return sortAlphabeticEmojiLast('name')(a, b)
        } else return b.score.bestPct - a.score.bestPct
      })
    // relic scores implicitly depend on scoringMetadataOverrides
    // eslint-disable-next-line exhaustive-deps
  }, [insightsCharacters, selectedRelic, excludedRelicPotentialCharacters, t, scoringMetadataOverrides])

  if (!selectedRelic) return <></>

  switch (insightsMode) {
    case RelicInsights.Buckets:
      return <BucketsPanel scores={scores} width={containerWidth} height={containerHeight} />
    case RelicInsights.Top10:
      return <Top10Panel scores={scores} width={containerWidth} height={containerHeight} />
    case RelicInsights.ESTBP:
      return <EstbpCard width={containerWidth} />
  }
}

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
