import { SegmentedControl } from '@mantine/core'
import { type ShowcaseMetadata } from 'lib/characterPreview/characterPreviewController'
import { CharacterScoringSummary } from 'lib/characterPreview/buildAnalysis/CharacterScoringSummary'
import { EstimatedTbpRelicsDisplay } from 'lib/characterPreview/summary/EstimatedTbpRelicsDisplay'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { type SingleRelicByPart } from 'lib/gpu/webgpuTypes'

import {
  ScoringType,
  type SimulationScore,
} from 'lib/scoring/simScoringUtils'
import { SaveState } from 'lib/state/saveState'
import { ColorizedTitleWithInfo } from 'lib/ui/ColorizedLink'
import { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useGlobalStore } from 'lib/stores/app/appStore'

interface ShowcaseBuildAnalysisProps {
  scoringType: ScoringType
  scoringDone: boolean
  scoringResult: SimulationScore | null
  showcaseMetadata: ShowcaseMetadata
  displayRelics: SingleRelicByPart
}

export const ShowcaseBuildAnalysis = memo(function ShowcaseBuildAnalysis({
  scoringType,
  scoringDone,
  scoringResult,
  showcaseMetadata,
  displayRelics,
}: ShowcaseBuildAnalysisProps) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const { characterMetadata } = showcaseMetadata

  const simulationNull = characterMetadata.scoringMetadata.simulation == null
  const segmentData = useMemo(() => [
    {
      label: simulationNull
        ? t('CharacterPreview.AlgorithmSlider.Labels.CombatScoreTBD') /* Combat Score (TBD) */
        : t('CharacterPreview.AlgorithmSlider.Labels.CombatScore'), /* Combat Score */
      value: String(ScoringType.COMBAT_SCORE),
      disabled: simulationNull,
    },
    {
      label: t('CharacterPreview.AlgorithmSlider.Labels.StatScore'), /* Stat Score */
      value: String(ScoringType.SUBSTAT_SCORE),
      disabled: false,
    },
    {
      label: t('CharacterPreview.AlgorithmSlider.Labels.NoneScore'), /* None Score */
      value: String(ScoringType.NONE),
      disabled: false,
    },
  ], [simulationNull, t])

  const handleScoringTypeChange = useCallback((selection: string) => {
    const value = Number(selection) as ScoringType
    useGlobalStore.getState().setSavedSessionKey(SavedSessionKeys.scoringType, value)
    SaveState.delayedSave()
  }, [])

  if (!scoringDone) {
    return <div style={{ minHeight: 182 }} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingLeft: 20,
            paddingRight: 5,
            borderRadius: 6,
            height: 40,
            marginTop: 10,
            backgroundColor: 'color-mix(in srgb, var(--layer-0) 52%, transparent)',
            alignItems: 'center',
          }}
        >
          <div style={{ width: 150 }}>
            {t('CharacterPreview.AlgorithmSlider.Title') /* Scoring algorithm: */}
          </div>
          <SegmentedControl
            style={{ width: 354, height: 30 }}
            onChange={handleScoringTypeChange}
            value={String(scoringType)}
            fullWidth
            data={segmentData}
          />
        </div>
      </div>
      {scoringType === ScoringType.COMBAT_SCORE && (
        <CharacterScoringSummary
          simScoringResult={scoringResult ?? undefined}
          displayRelics={displayRelics}
          showcaseMetadata={showcaseMetadata}
        />
      )}
      <StatScoringSummary
        // Fall back to SUBSTAT_SCORE only when combat scoring has no result yet — never override NONE
        scoringType={scoringResult == null && scoringType === ScoringType.COMBAT_SCORE
          ? ScoringType.SUBSTAT_SCORE
          : scoringType}
        displayRelics={displayRelics}
        showcaseMetadata={showcaseMetadata}
      />
    </div>
  )
})

function StatScoringSummary({ scoringType, displayRelics, showcaseMetadata }: {
  scoringType: ScoringType
  displayRelics: SingleRelicByPart
  showcaseMetadata: ShowcaseMetadata
}) {
  const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.EST-TBP' })

  if (scoringType !== ScoringType.SUBSTAT_SCORE) {
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <ColorizedTitleWithInfo
        text={t('Header') /* Stat Score Analysis */}
        url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/stat-score.md'
      />
      <EstimatedTbpRelicsDisplay
        scoringType={scoringType}
        displayRelics={displayRelics}
        showcaseMetadata={showcaseMetadata}
      />
    </div>
  )
}
