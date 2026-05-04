import { SegmentedControl } from '@mantine/core'
import { CharacterScoringSummary } from 'lib/characterPreview/buildAnalysis/CharacterScoringSummary'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import type {
  PreviewRelics,
  ShowcaseMetadata,
} from 'lib/characterPreview/characterPreviewController'
import { EstimatedTbpRelicsDisplay } from 'lib/characterPreview/summary/EstimatedTbpRelicsDisplay'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { CONFIG_DISPLAY_ORDER, hasConfig } from 'lib/scoring/scoringConfig'
import { isSimScoreMode, ScoringType } from 'lib/scoring/simScoringUtils'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { ColorizedTitleWithInfo } from 'lib/ui/ColorizedLink'
import {
  memo,
  useCallback,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'

import type { ScoringConfigType } from 'types/metadata'

const SCORING_CONFIG_LABELS: Record<ScoringConfigType, string> = {
  dps: 'DPS Score',
  buffer: 'Support Score',
  heal: 'Heal Score',
  shield: 'Shield Score',
}

const SCORING_TYPE_FOR_CONFIG: Record<ScoringConfigType, ScoringType> = {
  dps: ScoringType.DPS_SCORE,
  buffer: ScoringType.BUFFER_SCORE,
  heal: ScoringType.HEAL_SCORE,
  shield: ScoringType.SHIELD_SCORE,
}

interface ShowcaseBuildAnalysisProps {
  scoringType: ScoringType
  showcaseMetadata: ShowcaseMetadata
  displayRelics: PreviewRelics
  source: ShowcaseSource
  activeConfigType: ScoringConfigType | undefined
}

export const ShowcaseBuildAnalysis = memo(function ShowcaseBuildAnalysis({
  scoringType,
  showcaseMetadata,
  displayRelics,
  source,
  activeConfigType,
}: ShowcaseBuildAnalysisProps) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const { characterMetadata } = showcaseMetadata
  const scoringMeta = characterMetadata.scoringMetadata

  const hasAnySimulation = CONFIG_DISPLAY_ORDER.some((ct) => hasConfig(scoringMeta, ct))

  const segmentData = useMemo(() => {
    const segments: { label: string, value: string, disabled: boolean }[] = []
    for (const configType of CONFIG_DISPLAY_ORDER) {
      const available = hasConfig(scoringMeta, configType)
      segments.push({
        label: available
          ? SCORING_CONFIG_LABELS[configType]
          : `${SCORING_CONFIG_LABELS[configType]} (TBD)`,
        value: String(SCORING_TYPE_FOR_CONFIG[configType]),
        disabled: !available,
      })
    }
    segments.push({
      label: t('CharacterPreview.AlgorithmSlider.Labels.StatScore'), /* Stat Score */
      value: String(ScoringType.SUBSTAT_SCORE),
      disabled: false,
    })
    segments.push({
      label: t('CharacterPreview.AlgorithmSlider.Labels.NoneScore'), /* None Score */
      value: String(ScoringType.NONE),
      disabled: false,
    })
    return segments
  }, [scoringMeta, t])

  const handleScoringTypeChange = useCallback((selection: string) => {
    const value = Number(selection) as ScoringType
    useGlobalStore.getState().setSavedSessionKey(SavedSessionKeys.scoringType, value)
    SaveState.delayedSave()
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            borderRadius: 6,
            height: 40,
            marginTop: 10,
            marginBottom: 10,
            backgroundColor: 'color-mix(in srgb, var(--layer-0) 52%, transparent)',
            alignItems: 'center',
          }}
        >
          <SegmentedControl
            size='sm'
            style={{ width: 400 }}
            onChange={handleScoringTypeChange}
            value={String(scoringType)}
            fullWidth
            data={segmentData}
          />
        </div>
      </div>
      {isSimScoreMode(scoringType) && activeConfigType && hasConfig(scoringMeta, activeConfigType) && (
        <CharacterScoringSummary
          displayRelics={displayRelics}
          showcaseMetadata={showcaseMetadata}
          source={source}
          configType={activeConfigType}
        />
      )}
      {(scoringType === ScoringType.SUBSTAT_SCORE || !hasAnySimulation)
        && (
          <StatScoringSummary
            displayRelics={displayRelics}
            showcaseMetadata={showcaseMetadata}
          />
        )}
    </div>
  )
})

function StatScoringSummary({ displayRelics, showcaseMetadata }: {
  displayRelics: PreviewRelics,
  showcaseMetadata: ShowcaseMetadata,
}) {
  const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.EST-TBP' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <ColorizedTitleWithInfo
        text={t('Header') /* Stat Score Analysis */}
        url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/stat-score.md'
      />
      <EstimatedTbpRelicsDisplay
        displayRelics={displayRelics}
        showcaseMetadata={showcaseMetadata}
      />
    </div>
  )
}
