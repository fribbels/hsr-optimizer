import { buffedCharacters } from 'lib/importer/kelzFormatParser'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import { sortAlphabeticEmojiLast } from 'lib/rendering/displayUtils'
import DB from 'lib/state/db'
import { BucketsPanel } from 'lib/tabs/tabRelics/relicPreview/relicInsightsPanel/BucketsPanel'
import { Top10Panel } from 'lib/tabs/tabRelics/relicPreview/relicInsightsPanel/Top10Panel'
import useRelicsTabStore, {
  InsightCharacters,
  RelicInsights,
} from 'lib/tabs/tabRelics/useRelicsTabStore'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterId } from 'types/character'

export function RelicInsightsPanel() {
  const { insightsCharacters, insightsMode, selectedRelicId, excludedRelicPotentialCharacters } = useRelicsTabStore()
  const scoringMetadataOverrides = window.store((s) => s.scoringMetadataOverrides)
  const { t } = useTranslation('gameData', { keyPrefix: 'Characters' })
  const selectedRelic = DB.getRelicById(selectedRelicId ?? '') ?? null

  const scores: Score[] = useMemo(() => {
    if (!selectedRelic) return []
    return Object.values(DB.getMetadata().characters)
      .filter((x) => {
        if (buffedCharacters[x.id]) return false

        switch (insightsCharacters) {
          case InsightCharacters.All:
            return true
          case InsightCharacters.Custom:
            return !excludedRelicPotentialCharacters.includes(x.id)
          case InsightCharacters.Owned:
            return DB.getCharacterById(x.id) != undefined
        }
      })
      .map((char) => ({
        id: char.id,
        name: t(`${char.id}.Name`),
        score: RelicScorer.scoreRelicPotential(selectedRelic, char.id, true),
        owned: DB.getCharacterById(char.id) != undefined,
      }))
      .sort((a, b) => {
        if (b.score.bestPct == a.score.bestPct) {
          return sortAlphabeticEmojiLast('name')(a, b)
        } else return b.score.bestPct - a.score.bestPct
      })
    // relic scores implicitly depend on scoringMetadataOverrides
    // eslint-disable-next-line exhaustive-deps
  }, [insightsCharacters, selectedRelic, excludedRelicPotentialCharacters, t, scoringMetadataOverrides])

  if (!selectedRelic) return <></>

  switch (insightsMode) {
    case RelicInsights.Buckets:
      return <BucketsPanel scores={scores} />
    case RelicInsights.Top10:
      return <Top10Panel scores={scores} />
  }
}

type Score = {
  id: CharacterId,
  name: string,
  score: ReturnType<typeof RelicScorer.scoreRelicPotential>,
  owned: boolean,
}

export type PanelProps = {
  scores: Score[],
}
