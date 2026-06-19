import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { CharacterPreviewScoringProvider } from 'lib/characterPreview/CharacterPreviewScoringContext'
import type {
  InjectedScoreData,
  InjectedScoringInput,
} from 'lib/characterPreview/characterPreviewTypes'
import {
  cardTotalW,
  parentH,
} from 'lib/constants/constantsUi'
import type { LeaderboardTeammate } from 'lib/tabs/tabLeaderboard/leaderboardTabTypes'
import { useLeaderboardTabStore } from 'lib/tabs/tabLeaderboard/useLeaderboardTabStore'
import {
  useDeferredValue,
  useMemo,
} from 'react'
import { publicToConfigType } from 'scripts/leaderboard/shared/configTypeMapping'
import { ScoringConfigType } from 'types/metadata'

export function LeaderboardCharacterPreview() {
  const selectedEntry = useLeaderboardTabStore((s) => s.selectedEntry)
  const expandedCharacter = useLeaderboardTabStore((s) => s.expandedCharacter)
  const activeConfigType = useLeaderboardTabStore((s) => s.activeConfigType)
  const leaderboardScoreData = useLeaderboardTabStore((s) => s.leaderboardScoreData)
  const selectedCharacterId = useLeaderboardTabStore((s) => s.selectedCharacterId)

  const deferredCharacter = useDeferredValue(expandedCharacter)
  const deferredEntry = useDeferredValue(selectedEntry)
  const deferredScoreData = useDeferredValue(leaderboardScoreData)
  const deferredConfigType = useDeferredValue(activeConfigType)

  const scoringInput = useMemo<InjectedScoringInput | undefined>(() => {
    if (!deferredScoreData) return undefined
    const ct = deferredConfigType ? publicToConfigType(deferredConfigType) : ScoringConfigType.DPS
    return buildScoringInput(deferredScoreData, ct, deferredEntry?.team, deferredEntry?.deprioritizeBuffs)
  }, [deferredScoreData, deferredConfigType, deferredEntry?.team, deferredEntry?.deprioritizeBuffs])

  if (!deferredCharacter || !selectedCharacterId || !scoringInput) {
    return <div style={{ borderRadius: 6, width: cardTotalW, height: parentH, border: '1px solid rgba(255, 255, 255, 0.1)' }} />
  }

  return (
    <CharacterPreviewScoringProvider value={scoringInput}>
      <CharacterPreview
        id={`leaderboard-${selectedCharacterId}`}
        character={deferredCharacter}
        source={ShowcaseSource.LEADERBOARD}
      />
    </CharacterPreviewScoringProvider>
  )
}

function buildScoringInput(
  scoreData: InjectedScoreData,
  configType: ScoringConfigType,
  team?: LeaderboardTeammate[],
  deprioritizeBuffs?: boolean,
): InjectedScoringInput {
  return {
    configType,
    score: scoreData,
    simulationMetadataOverride: team
      ? {
        teammates: team.map((tm) => ({
          characterId: tm.characterId,
          lightCone: tm.lightCone,
          characterEidolon: tm.characterEidolon,
          lightConeSuperimposition: tm.lightConeSuperimposition,
        })),
        deprioritizeBuffs,
      }
      : undefined,
  }
}
