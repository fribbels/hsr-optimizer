import {
  IconArrowsExchange,
  IconRefresh,
  IconSettings,
} from '@tabler/icons-react'
import { Button, Flex, SegmentedControl } from '@mantine/core'
import { CharacterCardCombatStats } from 'lib/characterPreview/CharacterCardCombatStats'
import {
  OverlayText,
  ShowcaseSource,
} from 'lib/characterPreview/CharacterPreviewComponents'
import styles from 'lib/characterPreview/ShowcaseDpsScore.module.css'
import teammateClasses from 'style/teammateCard.module.css'
import { StatText } from 'lib/characterPreview/StatText'
import {
  CUSTOM_TEAM,
  DEFAULT_TEAM,
  SETTINGS_TEAM,
} from 'lib/constants/constants'
import { defaultGap } from 'lib/constants/constantsUi'
import { type SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { getConfirmModal } from 'lib/interactions/confirmModal'
import { Message } from 'lib/interactions/message'
import { useCharacterModalStore } from 'lib/overlays/modals/characterModalStore'
import { Assets } from 'lib/rendering/assets'
import {
  getSimScoreGrade,
} from 'lib/scoring/dpsScore'
import { type SimulationScore } from 'lib/scoring/simScoringUtils'
import { SaveState } from 'lib/state/saveState'
import { getCharacterById } from 'lib/stores/characterStore'
import { getScoringMetadata, useScoringStore } from 'lib/stores/scoringStore'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { HeaderText } from 'lib/ui/HeaderText'
import { localeNumber_0 } from 'lib/utils/i18nUtils'
import i18next from 'i18next'
import {
  memo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  type Character,
  type CharacterId,
} from 'types/character'
import { type Form } from 'types/form'
import { type PreparedState } from 'lib/scoring/scoringService'
import { type SimulationMetadata } from 'types/metadata'
import { truncate10ths } from 'lib/utils/mathUtils'

export const ShowcaseDpsScorePanel = memo(function ShowcaseDpsScorePanel({
  characterId,
  simulationMetadata,
  teamSelection: teamSelectionProp,
  source,
}: {
  characterId: CharacterId
  simulationMetadata: SimulationMetadata
  teamSelection: string
  source: ShowcaseSource
}) {
  const readonly = source === ShowcaseSource.BUILDS_MODAL
  const teamSelection = readonly ? CUSTOM_TEAM : teamSelectionProp

  const [selectedTeammateIndex, setSelectedTeammateIndex] = useState<number | undefined>()

  return (
    <Flex direction="column">
      <Flex justify='space-around' className={styles.teammatesPadding}>
        {[0, 1, 2].map((index) => (
          <CharacterPreviewScoringTeammate
            key={index}
            index={index}
            simulationMetadata={simulationMetadata}
            characterId={characterId}
            teamSelection={teamSelection}
            setSelectedTeammateIndex={setSelectedTeammateIndex}
            readonly={readonly}
          />
        ))}
      </Flex>

      <ShowcaseTeamSelectPanel
        characterId={characterId}
        teamSelection={teamSelection}
        readonly={readonly}
      />
    </Flex>
  )
})

export const ShowcaseCombatScoreDetailsFooter = memo(function ShowcaseCombatScoreDetailsFooter({ preview }: {
  preview: PreparedState | null
}) {
  if (!preview) {
    return (
      <span className={styles.loadingBlurSmall}>
      </span>
    )
  }

  return (
    <Flex direction="column" gap={defaultGap}>
      <CharacterCardCombatStats
        characterMetadata={preview.characterMetadata}
        originalSimResult={preview.originalSimResult}
        deprioritizeBuffs={preview.deprioritizeBuffs}
      />
    </Flex>
  )
})

function CharacterPreviewScoringTeammate({
  index,
  simulationMetadata,
  characterId,
  teamSelection,
  setSelectedTeammateIndex,
  readonly,
}: {
  index: number
  simulationMetadata: SimulationMetadata
  characterId: CharacterId
  teamSelection: string
  setSelectedTeammateIndex: (i: number | undefined) => void
  readonly?: boolean
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const teammate = simulationMetadata.teammates[index] as SimulationMetadata['teammates'][number] | undefined
  const iconSize = 64

  return (
    <div
      style={{ cursor: readonly ? 'default' : 'pointer' }}
      onClick={() => {
        if (readonly) return
        setSelectedTeammateIndex(index)
        useCharacterModalStore.getState().openOverlay({
          initialCharacter: { form: teammate } as Character,
          onOk: createOnCharacterModalOk(characterId, index, teamSelection),
        })
      }}
      className={`${teammateClasses.teammateCard} ${readonly ? 'readonly-custom-grid' : 'custom-grid'}`}
    >
      <Flex direction="column" align='center'>
        <div className={teammateClasses.iconWrapper}>
          <img
            src={Assets.getCharacterAvatarById(teammate?.characterId)}
            className={teammateClasses.teammateAvatar}
          />

          <OverlayText text={t('common:EidolonNShort', { eidolon: teammate?.characterEidolon })} top={-12} />
        </div>

        <div className={teammateClasses.iconWrapper}>
          <img src={Assets.getLightConeIconById(teammate?.lightCone)} style={{ height: iconSize, marginTop: 0 }} />

          {teammate?.teamRelicSet && (
            <img
              className={teammateClasses.relicBadge}
              src={Assets.getSetImage(teammate.teamRelicSet)}
            />
          )}

          {teammate?.teamOrnamentSet && (
            <img
              className={teammateClasses.ornamentBadge}
              src={Assets.getSetImage(teammate.teamOrnamentSet)}
            />
          )}

          <OverlayText
            text={t('common:SuperimpositionNShort', { superimposition: teammate?.lightConeSuperimposition })}
            top={-18}
          />
        </div>
      </Flex>
    </div>
  )
}

export const ShowcaseDpsScoreHeader = memo(function ShowcaseDpsScoreHeader({ relics, scoringDone, scoringResult }: {
  relics: SingleRelicByPart
  scoringDone: boolean
  scoringResult: SimulationScore | null
}) {
  const { t } = useTranslation(['charactersTab'])

  const verified = Object.values(relics).filter((x) => x?.verified).length === 6
  const numRelics = Object.values(relics).filter((x) => !!x).length

  const lightCone = !!scoringResult?.simulationForm.lightCone

  const titleRender = scoringResult?.spdBenchmark == null
    ? t('CharacterPreview.ScoreHeader.Title') // Combat Sim
    : t('CharacterPreview.ScoreHeader.TitleBenchmark', { spd: formatSpd(scoringResult?.spdBenchmark ?? 0) }) // Benchmark vs {{spd}} SPD

  return (
    <Flex align='center' direction="column" className={styles.scoreHeaderWrapper}>
      <StatText className={styles.scoreHeaderText}>
        {titleRender}
      </StatText>
      <StatText className={styles.scoreHeaderText} style={{ filter: !scoringDone ? 'blur(2px)' : 'none' }}>
        {
          !scoringDone
            ? 'DPS Score Loading...'
            : t(
              'CharacterPreview.ScoreHeader.Score',
              {
                score: localeNumber_0(truncate10ths(Math.max(0, (scoringResult?.percent ?? 0) * 100))),
                grade: getSimScoreGrade(scoringResult?.percent ?? 0, verified, numRelics, lightCone),
              },
            )
          /* DPS Score {{score}}% {{grade}} */
        }
      </StatText>
    </Flex>
  )
})

function formatSpd(n: number) {
  return truncate10ths(n).toFixed(1)
}

function createOnCharacterModalOk(
  characterId: CharacterId,
  selectedTeammateIndex: number,
  teamSelection: string,
) {
  return (form: Form) => {
    const t = i18next.getFixedT(null, 'charactersTab', 'CharacterPreview.Messages')
    if (!form.characterId) {
      return Message.error(t('NoSelectedCharacter') /* No selected character */)
    }
    if (!form.lightCone) {
      return Message.error(t('NoSelectedLightCone') /* No Selected light cone */)
    }

    const simulation = getScoringMetadata(characterId).simulation

    const update = { teammates: simulation?.teammates.map((tm, idx) => idx === selectedTeammateIndex ? form : tm) }

    const setTeamSelectionByCharacter = useShowcaseTabStore.getState().setShowcaseTeamPreference
    useScoringStore.getState().updateSimulationOverrides(characterId, update)
    SaveState.delayedSave()
    setTeamSelectionByCharacter(characterId, CUSTOM_TEAM)
  }
}

function ShowcaseTeamSelectPanel({
  characterId,
  teamSelection,
  readonly,
}: {
  characterId: CharacterId
  teamSelection: string
  readonly?: boolean
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const setTeamSelectionByCharacter = useShowcaseTabStore((s) => s.setShowcaseTeamPreference)

  const tabsDisplay = (
    <SegmentedControl
      disabled={readonly}
      className={styles.teamSelectPanel}
      styles={{ root: { background: 'rgba(0, 0, 0, 0.15)' } }}
      onChange={(selection) => {
        if (selection === SETTINGS_TEAM) {
          getConfirmModal()?.info({
            width: 'fit-content',
            closeOnClickOutside: true,
            content: (
              <div className={styles.settingsModalContent}>
                <Flex direction="column" gap={10}>
                  <HeaderText>{t('modals:ScoreFooter.ModalTitle') /* Combat sim scoring settings */}</HeaderText>
                  <Button
                    leftSection={<IconRefresh size={16} />}
                    onClick={() => {
                      useScoringStore.getState().clearSimulationOverrides(characterId)
                      SaveState.delayedSave()
                      if (teamSelection !== DEFAULT_TEAM) setTeamSelectionByCharacter(characterId, DEFAULT_TEAM)

                      Message.success(t('modals:ScoreFooter.ResetSuccessMsg') /* Reset to default teams */)
                    }}
                  >
                    {t('modals:ScoreFooter.ResetButtonText') /* Reset custom team to default */}
                  </Button>
                  <Button
                    leftSection={<IconArrowsExchange size={16} />}
                    onClick={() => {
                      const characterMetadata = getScoringMetadata(characterId)

                      const update = {
                        teammates: characterMetadata.simulation?.teammates.map((t) => {
                          const form = getCharacterById(t.characterId)?.form
                          if (!form) return t
                          return {
                            ...t,
                            characterEidolon: form.characterEidolon,
                            lightCone: form.lightCone ?? t.lightCone,
                            lightConeSuperimposition: form.lightCone ? form.lightConeSuperimposition : t.lightConeSuperimposition,
                          }
                        }),
                      }

                      useScoringStore.getState().updateSimulationOverrides(characterId, update)
                      SaveState.delayedSave()
                      if (teamSelection !== CUSTOM_TEAM) setTeamSelectionByCharacter(characterId, CUSTOM_TEAM)

                      Message.success(t('modals:ScoreFooter.SyncSuccessMsg') /* Synced teammates */)
                    }}
                  >
                    {t('modals:ScoreFooter.SyncButtonText') /* Sync imported eidolons / light cones */}
                  </Button>
                </Flex>
              </div>
            ),
          })
        } else {
          setTeamSelectionByCharacter(characterId, selection as typeof DEFAULT_TEAM | typeof CUSTOM_TEAM)
        }
      }}
      value={teamSelection}
      fullWidth
      data={[
        {
          value: DEFAULT_TEAM,
          label: (
            <Flex justify='center' align='center'>
              {t('modals:ScoreFooter.TeamOptions.Default') /* Default */}
            </Flex>
          ),
        },
        {
          label: <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconSettings size={18} /></div>,
          value: SETTINGS_TEAM,
        },
        {
          value: CUSTOM_TEAM,
          label: (
            <Flex justify='center' align='center'>
              {t('modals:ScoreFooter.TeamOptions.Custom') /* Custom */}
            </Flex>
          ),
        },
      ]}
    />
  )

  return (
    <Flex direction="column" gap={2}>
      {tabsDisplay}
    </Flex>
  )
}
