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
import { useAsyncSimScoringExecution } from 'lib/characterPreview/useAsyncSimScoringExecution'
import {
  CUSTOM_TEAM,
  DEFAULT_TEAM,
  SETTINGS_TEAM,
} from 'lib/constants/constants'
import { defaultGap } from 'lib/constants/constantsUi'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { getConfirmModal } from 'lib/interactions/confirmModal'
import { Message } from 'lib/interactions/message'
import { useCharacterModalStore } from 'lib/overlays/modals/characterModalStore'
import { Assets } from 'lib/rendering/assets'
import {
  AsyncSimScoringExecution,
  getSimScoreGrade,
} from 'lib/scoring/dpsScore'
import { SimulationScore } from 'lib/scoring/simScoringUtils'
import { SaveState } from 'lib/state/saveState'
import { getCharacterById } from 'lib/stores/characterStore'
import { getScoringMetadata, useScoringStore } from 'lib/stores/scoringStore'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { HeaderText } from 'lib/ui/HeaderText'
import { localeNumber_0 } from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import i18next from 'i18next'
import {
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  Character,
  CharacterId,
} from 'types/character'
import {
  Form,
  OptimizerForm,
} from 'types/form'
import { SimulationMetadata } from 'types/metadata'

export function ShowcaseDpsScorePanel({
  characterId,
  asyncSimScoringExecution,
  teamSelection: teamSelectionProp,
  displayRelics,
  setRedrawTeammates,
  source,
}: {
  characterId: CharacterId
  asyncSimScoringExecution: AsyncSimScoringExecution
  teamSelection: string
  displayRelics: SingleRelicByPart
  setRedrawTeammates: (n: number) => void
  source: ShowcaseSource
}) {
  const readonly = source === ShowcaseSource.BUILDS_MODAL
  const teamSelection = readonly ? CUSTOM_TEAM : teamSelectionProp

  const [selectedTeammateIndex, setSelectedTeammateIndex] = useState<number | undefined>()
  const simScoringExecution = useAsyncSimScoringExecution(asyncSimScoringExecution)

  if (!simScoringExecution?.done) {
    return (
      <span className={styles.loadingBlur}>
      </span>
    )
  }

  const result = simScoringExecution.result!

  return (
    <Flex
      direction="column"
    >
      <Flex justify='space-around' className={styles.teammatesPadding}>
        {[0, 1, 2].map((index) => (
          <CharacterPreviewScoringTeammate
            key={index}
            index={index}
            result={result}
            characterId={characterId}
            teamSelection={teamSelection}
            setSelectedTeammateIndex={setSelectedTeammateIndex}
            setRedrawTeammates={setRedrawTeammates}
            readonly={readonly}
          />
        ))}
      </Flex>

      <ShowcaseTeamSelectPanel
        characterId={characterId}
        teamSelection={teamSelection}
        selectedTeammateIndex={selectedTeammateIndex!}
        setRedrawTeammates={setRedrawTeammates}
        readonly={readonly}
      />
    </Flex>
  )
}

export function ShowcaseCombatScoreDetailsFooter({ asyncSimScoringExecution }: {
  asyncSimScoringExecution: AsyncSimScoringExecution | null
}) {

  const simScoringExecution = useAsyncSimScoringExecution(asyncSimScoringExecution)

  if (!simScoringExecution?.done) {
    return (
      <span className={styles.loadingBlurSmall}>
      </span>
    )
  }

  const result = simScoringExecution.result!

  return (
    <Flex direction="column" gap={defaultGap}>
      <CharacterCardCombatStats result={result} />
    </Flex>
  )
}

function getTeammate(index: number, form: OptimizerForm) {
  if (index === 0) return form.teammate0
  if (index === 1) return form.teammate1
  return form.teammate2
}

function CharacterPreviewScoringTeammate({
  index,
  result,
  characterId,
  teamSelection,
  setSelectedTeammateIndex,
  setRedrawTeammates,
  readonly,
}: {
  index: number
  result: SimulationScore
  characterId: CharacterId
  teamSelection: string
  setSelectedTeammateIndex: (i: number | undefined) => void
  setRedrawTeammates: (n: number) => void
  readonly?: boolean
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const teammate = result.simulationMetadata.teammates[index] as SimulationMetadata['teammates'][number] | undefined
  const iconSize = 64

  const simForm = result.simulationForm
  const formTeammate = getTeammate(index, simForm)

  return (
    <div
      style={{ cursor: readonly ? 'default' : 'pointer' }}
      onClick={() => {
        if (readonly) return
        setSelectedTeammateIndex(index)
        useCharacterModalStore.getState().openOverlay({
          initialCharacter: { form: teammate } as Character,
          onOk: createOnCharacterModalOk(characterId, index, teamSelection, setRedrawTeammates),
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

          {formTeammate.teamRelicSet && (
            <img
              className={teammateClasses.relicBadge}
              src={Assets.getSetImage(formTeammate.teamRelicSet)}
            />
          )}

          {formTeammate.teamOrnamentSet && (
            <img
              className={teammateClasses.ornamentBadge}
              src={Assets.getSetImage(formTeammate.teamOrnamentSet)}
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

export function ShowcaseDpsScoreHeader({ relics, asyncSimScoringExecution }: {
  relics: SingleRelicByPart
  asyncSimScoringExecution: AsyncSimScoringExecution
}) {
  const { t } = useTranslation(['charactersTab'])
  const simScoringExecution = useAsyncSimScoringExecution(asyncSimScoringExecution)

  const verified = Object.values(relics).filter((x) => x?.verified).length === 6
  const numRelics = Object.values(relics).filter((x) => !!x).length

  const lightCone = !!simScoringExecution?.result?.simulationForm.lightCone

  const titleRender = simScoringExecution?.result?.spdBenchmark == null
    ? t('CharacterPreview.ScoreHeader.Title') // Combat Sim
    : t('CharacterPreview.ScoreHeader.TitleBenchmark', { spd: formatSpd(simScoringExecution?.result?.spdBenchmark ?? 0) }) // Benchmark vs {{spd}} SPD

  const textDisplay = (
    <Flex align='center' direction="column" className={styles.scoreHeaderWrapper}>
      <StatText className={styles.scoreHeaderText}>
        {titleRender}
      </StatText>
      <StatText className={styles.scoreHeaderText}>
        {
          !simScoringExecution?.done
            ? 'DPS Score Loading...'
            : t(
              'CharacterPreview.ScoreHeader.Score',
              {
                score: localeNumber_0(Utils.truncate10ths(Math.max(0, (simScoringExecution?.result?.percent ?? 0) * 100))),
                grade: getSimScoreGrade(simScoringExecution?.result?.percent ?? 0, verified, numRelics, lightCone),
              },
            )
          /* DPS Score {{score}}% {{grade}} */
        }
      </StatText>
    </Flex>
  )

  return (
    <Flex direction="column" style={{ filter: !simScoringExecution?.done ? 'blur(2px)' : 'none' }}>
      {textDisplay}
    </Flex>
  )
}

function formatSpd(n: number) {
  return Utils.truncate10ths(n).toFixed(1)
}

function createOnCharacterModalOk(
  characterId: CharacterId,
  selectedTeammateIndex: number,
  teamSelection: string,
  setRedrawTeammates: (n: number) => void,
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

    const setTeamSelectionByCharacter = useShowcaseTabStore.getState().setShowcaseTeamPreferenceById
    useScoringStore.getState().updateSimulationOverrides(characterId, update)
    SaveState.delayedSave()
    setTeamSelectionByCharacter(characterId, CUSTOM_TEAM)
    setRedrawTeammates(Math.random())
  }
}

function ShowcaseTeamSelectPanel({
  characterId,
  teamSelection,
  selectedTeammateIndex,
  setRedrawTeammates,
  readonly,
}: {
  characterId: CharacterId
  teamSelection: string
  selectedTeammateIndex: number
  setRedrawTeammates: (random: number) => void
  readonly?: boolean
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const setTeamSelectionByCharacter = useShowcaseTabStore((s) => s.setShowcaseTeamPreferenceById)

  const tabsDisplay = (
    <SegmentedControl
      disabled={readonly}
      className={styles.teamSelectPanel}
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
                      setRedrawTeammates(Math.random())

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
                      setRedrawTeammates(Math.random())

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
