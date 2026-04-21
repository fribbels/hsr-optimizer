import {
  Button,
  SegmentedControl,
} from '@mantine/core'
import {
  IconArrowsExchange,
  IconRefresh,
  IconSettings,
} from '@tabler/icons-react'
import i18next, { type TFunction } from 'i18next'
import {
  OverlayText,
  ShowcaseSource,
} from 'lib/characterPreview/CharacterPreviewComponents'
import { CharacterCardCombatStats } from 'lib/characterPreview/scoring/CharacterCardCombatStats'
import {
  ScoringSelector,
  useSimScoringContext,
} from 'lib/characterPreview/SimScoringContext'
import { StatText } from 'lib/characterPreview/StatText'
import {
  CUSTOM_TEAM,
  DEFAULT_TEAM,
  SETTINGS_TEAM,
} from 'lib/constants/constants'
import { type SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { getConfirmModal } from 'lib/interactions/confirmModal'
import { Message } from 'lib/interactions/message'
import { useCharacterModalStore } from 'lib/overlays/modals/characterModalStore'
import type { CharacterModalForm } from 'lib/overlays/modals/characterModalStore'
import { Assets } from 'lib/rendering/assets'
import {
  getSimScoreGrade,
} from 'lib/scoring/dpsScore'
import { type PreparedState } from 'lib/scoring/scoringService'
import { SaveState } from 'lib/state/saveState'
import { getCharacterById } from 'lib/stores/character/characterStore'
import {
  getScoringMetadata,
  useScoringStore,
} from 'lib/stores/scoring/scoringStore'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { HeaderText } from 'lib/ui/HeaderText'
import { localeNumber_0 } from 'lib/utils/i18nUtils'
import { truncate10ths } from 'lib/utils/mathUtils'
import {
  memo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import teammateClasses from 'style/teammateCard.module.css'
import {
  type CharacterId,
} from 'types/character'
import {
  type ShowcaseTemporaryOptions,
  type SimulationMetadata,
} from 'types/metadata'
import { type PreviewRelics } from '../characterPreviewController'
import styles from './ShowcaseDpsScore.module.css'

export const ShowcaseDpsScorePanel = memo(function ShowcaseDpsScorePanel({
  characterId,
  simulationMetadata,
  teamSelection: teamSelectionProp,
  source,
}: {
  characterId: CharacterId,
  simulationMetadata: SimulationMetadata,
  teamSelection: string,
  source: ShowcaseSource,
}) {
  const readonly = source === ShowcaseSource.BUILDS_MODAL
  const teamSelection = readonly ? CUSTOM_TEAM : teamSelectionProp

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around' }} className={styles.teammatesPadding}>
        {[0, 1, 2].map((index) => (
          <CharacterPreviewScoringTeammate
            key={index}
            index={index}
            simulationMetadata={simulationMetadata}
            characterId={characterId}
            readonly={readonly}
          />
        ))}
      </div>

      <ShowcaseTeamSelectPanel
        characterId={characterId}
        teamSelection={teamSelection}
        readonly={readonly}
      />
    </div>
  )
})

export const ShowcaseCombatScoreDetailsFooter = memo(function ShowcaseCombatScoreDetailsFooter() {
  const preview = useSimScoringContext(ScoringSelector.Preview)
  if (!preview) {
    return (
      <span className={styles.loadingBlurSmall}>
      </span>
    )
  }

  return (
    <div>
      <CharacterCardCombatStats
        characterMetadata={preview.characterMetadata}
        originalSimResult={preview.originalSimResult}
        deprioritizeBuffs={preview.deprioritizeBuffs}
      />
    </div>
  )
})

const CharacterPreviewScoringTeammate = memo(function CharacterPreviewScoringTeammate({
  index,
  simulationMetadata,
  characterId,
  readonly,
}: {
  index: number,
  simulationMetadata: SimulationMetadata,
  characterId: CharacterId,
  readonly?: boolean,
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const teammate = simulationMetadata.teammates[index] as SimulationMetadata['teammates'][number] | undefined
  const iconSize = 64

  return (
    <div
      style={{ cursor: readonly ? 'default' : 'pointer' }}
      onClick={() => {
        if (readonly) return
        useCharacterModalStore.getState().openOverlay({
          initialCharacter: teammate ? { form: teammate } : null,
          onOk: createOnCharacterModalOk(characterId, index),
          showSetSelection: true,
        })
      }}
      className={`${teammateClasses.teammateCard} ${readonly ? 'readonly-custom-grid' : 'custom-grid'}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className={teammateClasses.iconWrapper}>
          <img
            src={Assets.getCharacterAvatarById(teammate?.characterId)}
            className={teammateClasses.teammateAvatar}
          />

          <OverlayText text={t('common:EidolonNShort', { eidolon: teammate?.characterEidolon ?? 0 })} top={-12} />
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
            text={t('common:SuperimpositionNShort', { superimposition: teammate?.lightConeSuperimposition ?? 0 })}
            top={-18}
          />
        </div>
      </div>
    </div>
  )
})

export const ShowcaseDpsScoreHeader = memo(function ShowcaseDpsScoreHeader(props: {
  relics: PreviewRelics,
  tempOptions: ShowcaseTemporaryOptions,
}) {
  const { t } = useTranslation(['charactersTab'])

  const titleRender = props?.tempOptions?.spdBenchmark == null
    ? t('CharacterPreview.ScoreHeader.Title') // Combat Sim
    : t('CharacterPreview.ScoreHeader.TitleBenchmark', { spd: formatSpd(props?.tempOptions?.spdBenchmark ?? 0) }) // Benchmark vs {{spd}} SPD

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }} className={styles.scoreHeaderWrapper}>
      <StatText className={styles.scoreHeaderText}>
        {titleRender}
      </StatText>
      <ShowcaseDpsScoreHeaderReady {...props} t={t} />
    </div>
  )
})

function ShowcaseDpsScoreHeaderReady({ relics, t }: {
  relics: PreviewRelics,
  t: TFunction<'charactersTab', undefined>,
}) {
  const result = useSimScoringContext(ScoringSelector.Score)

  // Return loading state while result is null
  if (result === null) {
    return <ShowcaseDpsScoreHeaderPending t={t} />
  }

  const verified = Object.values(relics).filter((x) => x?.verified).length === 6
  const numRelics = Object.values(relics).filter((x) => !!x).length
  const lightCone = !!result.simulationForm.lightCone

  return (
    <StatText className={styles.scoreHeaderText}>
      {
        t(
          'CharacterPreview.ScoreHeader.Score',
          {
            score: localeNumber_0(truncate10ths(Math.max(0, result.percent * 100))),
            grade: getSimScoreGrade(result.percent, verified, numRelics, lightCone),
          },
        )
        /* DPS Score {{score}}% {{grade}} */
      }
    </StatText>
  )
}

function ShowcaseDpsScoreHeaderPending({ t }: { t: TFunction<'charactersTab', undefined> }) {
  return (
    <StatText className={styles.scoreHeaderText} style={{ filter: 'blur(2px)' }}>
      {/* t('DpsScoreLoading') */} DPS Score Loading...
    </StatText>
  )
}

function formatSpd(n: number) {
  return truncate10ths(n).toFixed(1)
}

function createOnCharacterModalOk(
  characterId: CharacterId,
  selectedTeammateIndex: number,
) {
  return (form: CharacterModalForm): boolean => {
    const t = i18next.getFixedT(null, 'charactersTab', 'CharacterPreview.Messages')
    if (!form.characterId) {
      Message.error(t('NoSelectedCharacter'))
      return false
    }
    if (!form.lightCone) {
      Message.error(t('NoSelectedLightCone'))
      return false
    }

    const simulation = getScoringMetadata(characterId).simulation

    // Safe cast: after guards above, characterId and lightCone are known non-null, matching the teammate shape
    const update = { teammates: simulation?.teammates.map((tm, idx) => idx === selectedTeammateIndex ? form as typeof tm : tm) }

    const setTeamSelectionByCharacter = useShowcaseTabStore.getState().setShowcaseTeamPreference
    useScoringStore.getState().updateSimulationOverrides(characterId, update)
    SaveState.delayedSave()
    setTeamSelectionByCharacter(characterId, CUSTOM_TEAM)
    return true
  }
}

const ShowcaseTeamSelectPanel = memo(function ShowcaseTeamSelectPanel({
  characterId,
  teamSelection,
  readonly,
}: {
  characterId: CharacterId,
  teamSelection: string,
  readonly?: boolean,
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])

  const setTeamSelectionByCharacter = useShowcaseTabStore((s) => s.setShowcaseTeamPreference)

  const tabsDisplay = (
    <SegmentedControl
      disabled={readonly}
      className={styles.teamSelectPanel}
      styles={{ root: { background: 'transparent' } }}
      onChange={(selection) => {
        if (selection === SETTINGS_TEAM) {
          getConfirmModal()?.info({
            width: 'fit-content',
            closeOnClickOutside: true,
            content: (
              <div className={styles.settingsModalContent}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
                </div>
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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {t('modals:ScoreFooter.TeamOptions.Default') /* Default */}
            </div>
          ),
        },
        {
          label: (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconSettings size={18} />
            </div>
          ),
          value: SETTINGS_TEAM,
        },
        {
          value: CUSTOM_TEAM,
          label: (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {t('modals:ScoreFooter.TeamOptions.Custom') /* Custom */}
            </div>
          ),
        },
      ]}
    />
  )

  return (
    <div>
      {tabsDisplay}
    </div>
  )
})
