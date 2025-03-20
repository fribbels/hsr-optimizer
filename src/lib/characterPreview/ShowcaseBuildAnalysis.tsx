import { Flex, Segmented, Typography } from 'antd'
import type { GlobalToken } from 'antd/es/theme/interface'
import { useDelayedProps } from 'hooks/useDelayedProps'
import { ShowcaseMetadata } from 'lib/characterPreview/characterPreviewController'
import { CharacterScoringSummary } from 'lib/characterPreview/CharacterScoringSummary'
import { CHARACTER_SCORE, COMBAT_STATS, DAMAGE_UPGRADES, NONE_SCORE, SIMULATION_SCORE } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { CharacterAnnouncement } from 'lib/interactions/CharacterAnnouncement'
import { SimulationScore } from 'lib/scoring/simScoringUtils'
import { SaveState } from 'lib/state/saveState'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

interface ShowcaseBuildAnalysisProps {
  token: GlobalToken
  scoringType: string
  combatScoreDetails: string
  simScoringResult: SimulationScore | undefined
  showcaseMetadata: ShowcaseMetadata
  setScoringType: (s: string) => void
  setCombatScoreDetails: (s: string) => void
}

export function ShowcaseBuildAnalysis(props: ShowcaseBuildAnalysisProps) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  console.log('======================================================================= RENDER ShowcaseBuildAnalysis')

  const {
    token,
    combatScoreDetails,
    showcaseMetadata,
    scoringType,
    setScoringType,
    setCombatScoreDetails,
  } = props

  const {
    characterMetadata,
  } = showcaseMetadata

  return (
    <Flex vertical>
      <CharacterAnnouncement characterId={characterMetadata.id}/>
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
            {t('CharacterPreview.AlgorithmSlider.Title')/* Scoring algorithm: */}
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
                  ? t('CharacterPreview.AlgorithmSlider.Labels.CombatScoreTBD')/* Combat Score (TBD) */
                  : t('CharacterPreview.AlgorithmSlider.Labels.CombatScore'), /* Combat Score */
                value: SIMULATION_SCORE,
                disabled: characterMetadata.scoringMetadata.simulation == null,
              },
              {
                label: t('CharacterPreview.AlgorithmSlider.Labels.StatScore'), /* Stat Score */
                value: CHARACTER_SCORE,
                disabled: false,
              },
              {
                label: t('CharacterPreview.AlgorithmSlider.Labels.NoneScore'), /* None Score */
                value: NONE_SCORE,
                disabled: false,
                className: 'noneScoreLabel',
              },
            ]}
          />
        </Flex>

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
            {t('CharacterPreview.DetailsSlider.Title')/* Combat score details: */}
          </Text>
          <Segmented
            style={{ width: 354, height: 30 }}
            onChange={(selection) => {
              setCombatScoreDetails(selection)
              window.store.getState().setSavedSessionKey(SavedSessionKeys.combatScoreDetails, selection)
              SaveState.delayedSave()
            }}
            value={combatScoreDetails}
            block
            options={[
              {
                label: t('CharacterPreview.DetailsSlider.Labels.CombatStats'), /* Combat Stats */
                value: COMBAT_STATS,
                disabled: characterMetadata.scoringMetadata.simulation == null || scoringType == CHARACTER_SCORE,
              },
              {
                label: t('CharacterPreview.DetailsSlider.Labels.DMGUpgrades'), /* Damage Upgrades */
                value: DAMAGE_UPGRADES,
                disabled: characterMetadata.scoringMetadata.simulation == null || scoringType == CHARACTER_SCORE,
              },
            ]}
          />
        </Flex>
      </Flex>
      <MemoizedCharacterScoringSummary simScoringResult={props.simScoringResult}/>
    </Flex>
  )
}

function MemoizedCharacterScoringSummary(props: { simScoringResult?: SimulationScore }) {
  const delayedProps = useDelayedProps(props, 150)

  const memoizedCharacterScoringSummary = useMemo(() => {
    return delayedProps ? <CharacterScoringSummary simScoringResult={delayedProps.simScoringResult}/> : null
  }, [delayedProps])

  if (!delayedProps) return null
  return memoizedCharacterScoringSummary
}
