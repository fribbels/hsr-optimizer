import { Flex, SegmentedControl, useMantineTheme } from '@mantine/core'
import { ShowcaseMetadata } from 'lib/characterPreview/characterPreviewController'
import { CharacterScoringSummary } from 'lib/characterPreview/CharacterScoringSummary'
import { EstimatedTbpRelicsDisplay } from 'lib/characterPreview/summary/EstimatedTbpRelicsDisplay'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'

import {
  ScoringType,
  SimulationScore,
} from 'lib/scoring/simScoringUtils'
import { SaveState } from 'lib/state/saveState'
import { ColorizedTitleWithInfo } from 'lib/ui/ColorizedLink'
import { memo, useDeferredValue } from 'react'
import { useTranslation } from 'react-i18next'
import { useGlobalStore } from 'lib/stores/appStore'

interface ShowcaseBuildAnalysisProps {
  scoringType: ScoringType
  scoringDone: boolean
  scoringResult: SimulationScore | null
  showcaseMetadata: ShowcaseMetadata
  displayRelics: SingleRelicByPart
  setScoringType: (s: ScoringType) => void
}

export const ShowcaseBuildAnalysis = memo(function ShowcaseBuildAnalysis({
  scoringType,
  scoringDone,
  scoringResult,
  showcaseMetadata,
  displayRelics,
  setScoringType,
}: ShowcaseBuildAnalysisProps) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const mantineTheme = useMantineTheme()

  const { characterMetadata } = showcaseMetadata

  if (!scoringDone) {
    return (
      <span
        style={{
          filter: 'blur(2px)',
          minHeight: 182,
        }}
      >
      </span>
    )
  }

  return (
    <Flex direction="column" style={{ minHeight: 1000 }}>
      <Flex justify='center' gap={10}>
        <Flex
          justify='center'
          style={{
            paddingLeft: 20,
            paddingRight: 5,
            borderRadius: 7,
            height: 40,
            marginTop: 10,
            backgroundColor: mantineTheme.colors.dark[7] + '85',
          }}
          align='center'
        >
          <div style={{ width: 150 }}>
            {t('CharacterPreview.AlgorithmSlider.Title') /* Scoring algorithm: */}
          </div>
          <SegmentedControl
            style={{ width: 354, height: 30 }}
            onChange={(selection) => {
              const value = Number(selection) as ScoringType
              setScoringType(value)
              useGlobalStore.getState().setSavedSessionKey(SavedSessionKeys.scoringType, value)
              SaveState.delayedSave()
            }}
            value={String(scoringType)}
            fullWidth
            data={[
              {
                label: characterMetadata.scoringMetadata.simulation == null
                  ? t('CharacterPreview.AlgorithmSlider.Labels.CombatScoreTBD') /* Combat Score (TBD) */
                  : t('CharacterPreview.AlgorithmSlider.Labels.CombatScore'), /* Combat Score */
                value: String(ScoringType.COMBAT_SCORE),
                disabled: characterMetadata.scoringMetadata.simulation == null,
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
            ]}
          />
        </Flex>
      </Flex>
      {scoringType === ScoringType.COMBAT_SCORE && (
        <DeferredCharacterScoringSummary
          simScoringResult={scoringResult ?? undefined}
          displayRelics={displayRelics}
          showcaseMetadata={showcaseMetadata}
        />
      )}
      <StatScoringSummary
        scoringType={scoringResult ? scoringType : ScoringType.SUBSTAT_SCORE}
        displayRelics={displayRelics}
        showcaseMetadata={showcaseMetadata}
      />
    </Flex>
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
    <Flex direction="column" align='center'>
      <ColorizedTitleWithInfo
        text={t('Header') /* Stat Score Analysis */}
        url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/stat-score.md'
      />
      <EstimatedTbpRelicsDisplay
        scoringType={scoringType}
        displayRelics={displayRelics}
        showcaseMetadata={showcaseMetadata}
      />
    </Flex>
  )
}

function DeferredCharacterScoringSummary(props: {
  simScoringResult?: SimulationScore
  displayRelics: SingleRelicByPart
  showcaseMetadata: ShowcaseMetadata
}) {
  const deferredProps = useDeferredValue(props)

  return (
    <CharacterScoringSummary
      simScoringResult={deferredProps.simScoringResult}
      displayRelics={deferredProps.displayRelics}
      showcaseMetadata={deferredProps.showcaseMetadata}
    />
  )
}
