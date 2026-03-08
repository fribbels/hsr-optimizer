import { Flex, SegmentedControl, Text, useMantineTheme } from '@mantine/core'
import { useDelayedProps } from 'hooks/useDelayedProps'
import { ShowcaseMetadata } from 'lib/characterPreview/characterPreviewController'
import { CharacterScoringSummary } from 'lib/characterPreview/CharacterScoringSummary'
import { EstimatedTbpRelicsDisplay } from 'lib/characterPreview/summary/EstimatedTbpRelicsDisplay'
import { useAsyncSimScoringExecution } from 'lib/characterPreview/useAsyncSimScoringExecution'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'

import { AsyncSimScoringExecution } from 'lib/scoring/dpsScore'
import {
  ScoringType,
  SimulationScore,
} from 'lib/scoring/simScoringUtils'
import { SaveState } from 'lib/state/saveState'
import { ColorizedTitleWithInfo } from 'lib/ui/ColorizedLink'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

interface ShowcaseBuildAnalysisProps {
  scoringType: ScoringType
  asyncSimScoringExecution: AsyncSimScoringExecution | null
  showcaseMetadata: ShowcaseMetadata
  displayRelics: SingleRelicByPart
  setScoringType: (s: ScoringType) => void
}

export function ShowcaseBuildAnalysis(props: ShowcaseBuildAnalysisProps) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const mantineTheme = useMantineTheme()

  console.log('======================================================================= RENDER ShowcaseBuildAnalysis')

  const {
    asyncSimScoringExecution,
    showcaseMetadata,
    scoringType,
    setScoringType,
  } = props

  const {
    characterMetadata,
  } = showcaseMetadata

  const simScoringExecution = useAsyncSimScoringExecution(props.asyncSimScoringExecution)

  if (!simScoringExecution?.done) {
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

  const result = simScoringExecution.result!

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
          <Text style={{ width: 150 }}>
            {t('CharacterPreview.AlgorithmSlider.Title') /* Scoring algorithm: */}
          </Text>
          <SegmentedControl
            style={{ width: 354, height: 30 }}
            onChange={(selection) => {
              const value = Number(selection) as ScoringType
              setScoringType(value)
              window.store.getState().setSavedSessionKey(SavedSessionKeys.scoringType, value)
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
      {scoringType == ScoringType.COMBAT_SCORE && (
        <MemoizedCharacterScoringSummary
          simScoringResult={result}
          displayRelics={props.displayRelics}
          showcaseMetadata={props.showcaseMetadata}
        />
      )}
      <StatScoringSummary
        scoringType={result ? props.scoringType : ScoringType.SUBSTAT_SCORE}
        displayRelics={props.displayRelics}
        showcaseMetadata={props.showcaseMetadata}
      />
    </Flex>
  )
}

function StatScoringSummary(props: {
  scoringType: ScoringType,
  displayRelics: SingleRelicByPart,
  showcaseMetadata: ShowcaseMetadata,
}) {
  const { t } = useTranslation('charactersTab', { keyPrefix: 'CharacterPreview.EST-TBP' })

  if (props.scoringType != ScoringType.SUBSTAT_SCORE) {
    return <></>
  }

  return (
    <Flex direction="column" align='center'>
      <ColorizedTitleWithInfo
        text={t('Header') /* Stat Score Analysis */}
        url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/stat-score.md'
      />
      <EstimatedTbpRelicsDisplay
        scoringType={props.scoringType}
        displayRelics={props.displayRelics}
        showcaseMetadata={props.showcaseMetadata}
      />
    </Flex>
  )
}

function MemoizedCharacterScoringSummary(props: {
  simScoringResult?: SimulationScore,
  displayRelics: SingleRelicByPart,
  showcaseMetadata: ShowcaseMetadata,
}) {
  const delayedProps = useDelayedProps(props, 250)

  const memoizedCharacterScoringSummary = useMemo(() => {
    return delayedProps
      ? (
        <CharacterScoringSummary
          simScoringResult={delayedProps.simScoringResult}
          displayRelics={delayedProps.displayRelics}
          showcaseMetadata={delayedProps.showcaseMetadata}
        />
      )
      : null
  }, [delayedProps])

  if (!delayedProps) return null
  return memoizedCharacterScoringSummary
}
