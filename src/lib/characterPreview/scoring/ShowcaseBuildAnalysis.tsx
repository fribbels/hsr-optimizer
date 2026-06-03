import { SegmentedControl } from '@mantine/core'
import { CharacterScoringSummary } from 'lib/characterPreview/buildAnalysis/CharacterScoringSummary'
import type { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import type {
  PreviewRelics,
  ShowcaseMetadata,
} from 'lib/characterPreview/characterPreviewController'
import { EstimatedTbpRelicsDisplay } from 'lib/characterPreview/summary/EstimatedTbpRelicsDisplay'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import {
  CONFIG_DISPLAY_ORDER,
  hasConfig,
  isSimScoreMode,
  SCORING_CONFIG_REGISTRY,
  ScoringType,
} from 'lib/scoring/scoringConfig'
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

  const hasAnySimulation = CONFIG_DISPLAY_ORDER.some((configType) => hasConfig(scoringMeta, configType))

  const segmentData = useMemo(() => {
    const segments: { label: string, value: string }[] = []
    for (const configType of CONFIG_DISPLAY_ORDER) {
      if (!hasConfig(scoringMeta, configType)) continue
      const entry = SCORING_CONFIG_REGISTRY[configType]
      segments.push({
        label: entry.label,
        value: String(entry.scoringType),
      })
    }
    segments.push({
      label: 'Substat Rolls', // Hardcoded — label still in flux, skip i18n for now
      value: String(ScoringType.SUBSTAT_SCORE),
    })
    segments.push({
      label: t('CharacterPreview.AlgorithmSlider.Labels.NoneScore'),
      value: String(ScoringType.NONE),
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
            key={segmentData.map((d) => d.value).join(',')}
            size='sm'
            styles={{ control: { width: 165 } }}
            onChange={handleScoringTypeChange}
            value={String(scoringType)}
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
        text={'Substat Rolls Analysis' /* Hardcoded — label still in flux, skip i18n for now */}
        url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/stat-score.md'
      />
      <EstimatedTbpRelicsDisplay
        displayRelics={displayRelics}
        showcaseMetadata={showcaseMetadata}
      />
    </div>
  )
}
