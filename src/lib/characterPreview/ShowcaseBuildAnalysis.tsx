import {
  Flex,
  Segmented,
  Typography,
} from 'antd'
import type { GlobalToken } from 'antd/es/theme/interface'
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

const { Text } = Typography

interface ShowcaseBuildAnalysisProps {
  token: GlobalToken
  scoringType: ScoringType
  asyncSimScoringExecution: AsyncSimScoringExecution | null
  showcaseMetadata: ShowcaseMetadata
  displayRelics: SingleRelicByPart
  setScoringType: (s: ScoringType) => void
}

export function ShowcaseBuildAnalysis(props: ShowcaseBuildAnalysisProps) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  console.log('======================================================================= RENDER ShowcaseBuildAnalysis')

  const {
    token,
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
    <Flex vertical style={{ minHeight: 1000 }}>
      <Flex justify='center' gap={10}>
        <Flex
          justify='center'
          style={{
            paddingLeft: 20,
            paddingRight: 5,
            borderRadius: 7,
            height: 40,
            marginTop: 10,
            backgroundColor: token.colorBgContainer + '85',
          }}
          align='center'
        >
          <Text style={{ width: 150 }}>
            {t('CharacterPreview.AlgorithmSlider.Title') /* Scoring algorithm: */}
          </Text>
          <Segmented
            style={{ width: 354, height: 30 }}
            onChange={(selection) => {
              setScoringType(selection)
              window.store.getState().setSavedSessionKey(SavedSessionKeys.scoringType, selection)
              SaveState.delayedSave()
            }}
            value={scoringType}
            block
            options={[
              {
                label: characterMetadata.scoringMetadata.simulation == null
                  ? t('CharacterPreview.AlgorithmSlider.Labels.CombatScoreTBD') /* Combat Score (TBD) */
                  : t('CharacterPreview.AlgorithmSlider.Labels.CombatScore'), /* Combat Score */
                value: ScoringType.COMBAT_SCORE,
                disabled: characterMetadata.scoringMetadata.simulation == null,
              },
              {
                label: t('CharacterPreview.AlgorithmSlider.Labels.StatScore'), /* Stat Score */
                value: ScoringType.SUBSTAT_SCORE,
                disabled: false,
              },
              {
                label: t('CharacterPreview.AlgorithmSlider.Labels.NoneScore'), /* None Score */
                value: ScoringType.NONE,
                disabled: false,
                className: 'noneScoreLabel',
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
    <Flex vertical align='center'>
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
