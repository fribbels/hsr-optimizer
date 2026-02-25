import {
  SettingOutlined,
  SwapOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  ConfigProvider,
  Flex,
  Segmented,
} from 'antd'
import type { GlobalToken } from 'antd/es/theme/interface'
import { CharacterCardCombatStats } from 'lib/characterPreview/CharacterCardCombatStats'
import {
  OverlayText,
  showcaseOutline,
  ShowcaseSource,
} from 'lib/characterPreview/CharacterPreviewComponents'
import StatText from 'lib/characterPreview/StatText'
import { useAsyncSimScoringExecution } from 'lib/characterPreview/useAsyncSimScoringExecution'
import {
  CUSTOM_TEAM,
  DEFAULT_TEAM,
  SETTINGS_TEAM,
} from 'lib/constants/constants'
import { defaultGap } from 'lib/constants/constantsUi'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { Message } from 'lib/interactions/message'
import CharacterModal from 'lib/overlays/modals/CharacterModal'
import { Assets } from 'lib/rendering/assets'
import {
  AsyncSimScoringExecution,
  getSimScoreGrade,
} from 'lib/scoring/dpsScore'
import { SimulationScore } from 'lib/scoring/simScoringUtils'
import DB from 'lib/state/db'
import { HeaderText } from 'lib/ui/HeaderText'
import { localeNumber_0 } from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import React, {
  CSSProperties,
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

export function ShowcaseDpsScorePanel(props: {
  characterId: CharacterId,
  token: GlobalToken,
  asyncSimScoringExecution: AsyncSimScoringExecution,
  teamSelection: string,
  displayRelics: SingleRelicByPart,
  setRedrawTeammates: (n: number) => void,
  source: ShowcaseSource,
}) {
  let {
    characterId,
    token,
    asyncSimScoringExecution,
    teamSelection,
    displayRelics,
    setRedrawTeammates,
    source,
  } = props

  const readonly = source === ShowcaseSource.BUILDS_MODAL

  if (readonly) {
    teamSelection = CUSTOM_TEAM
  }

  const [isCharacterModalOpen, setCharacterModalOpen] = useState(false)
  const [selectedTeammateIndex, setSelectedTeammateIndex] = useState<number | undefined>()
  const [characterModalInitialCharacter, setCharacterModalInitialCharacter] = useState<Character | undefined>()
  const simScoringExecution = useAsyncSimScoringExecution(props.asyncSimScoringExecution)

  if (!simScoringExecution?.done) {
    return (
      <span
        style={{
          filter: 'blur(20px)',
          minHeight: 157,
        }}
      >
      </span>
    )
  }

  const result = simScoringExecution.result!

  return (
    <Flex
      vertical
    >
      <Flex justify='space-around' style={{ padding: '0 5px' }}>
        <CharacterPreviewScoringTeammate
          index={0}
          result={result}
          token={token}
          setCharacterModalOpen={setCharacterModalOpen}
          setSelectedTeammateIndex={setSelectedTeammateIndex}
          setCharacterModalInitialCharacter={setCharacterModalInitialCharacter}
          readonly={readonly}
        />
        <CharacterPreviewScoringTeammate
          index={1}
          result={result}
          token={token}
          setCharacterModalOpen={setCharacterModalOpen}
          setSelectedTeammateIndex={setSelectedTeammateIndex}
          setCharacterModalInitialCharacter={setCharacterModalInitialCharacter}
          readonly={readonly}
        />
        <CharacterPreviewScoringTeammate
          index={2}
          result={result}
          token={token}
          setCharacterModalOpen={setCharacterModalOpen}
          setSelectedTeammateIndex={setSelectedTeammateIndex}
          setCharacterModalInitialCharacter={setCharacterModalInitialCharacter}
          readonly={readonly}
        />
      </Flex>

      <ShowcaseTeamSelectPanel
        characterId={characterId}
        teamSelection={teamSelection}
        selectedTeammateIndex={selectedTeammateIndex!}
        characterModalInitialCharacter={characterModalInitialCharacter}
        isCharacterModalOpen={isCharacterModalOpen}
        setCharacterModalOpen={setCharacterModalOpen}
        setRedrawTeammates={setRedrawTeammates}
        readonly={readonly}
      />
    </Flex>
  )
}

export function ShowcaseCombatScoreDetailsFooter(props: {
  asyncSimScoringExecution: AsyncSimScoringExecution | null,
}) {
  const {
    asyncSimScoringExecution,
  } = props

  const simScoringExecution = useAsyncSimScoringExecution(asyncSimScoringExecution)

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
    <Flex vertical gap={defaultGap}>
      <CharacterCardCombatStats result={result} />
    </Flex>
  )
}

function getTeammate(index: number, form: OptimizerForm) {
  if (index == 0) return form.teammate0
  if (index == 1) return form.teammate1
  return form.teammate2
}

function CharacterPreviewScoringTeammate(props: {
  index: number,
  result: SimulationScore,
  token: GlobalToken,
  setCharacterModalOpen: (b: boolean) => void,
  setSelectedTeammateIndex: (i: number | undefined) => void,
  setCharacterModalInitialCharacter: (character: Character) => void,
  readonly?: boolean,
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])
  const {
    result,
    index,
    token,
    setCharacterModalOpen,
    setSelectedTeammateIndex,
    setCharacterModalInitialCharacter,
    readonly,
  } = props

  const teammate = result.simulationMetadata.teammates[index] as SimulationMetadata['teammates'][number] | undefined
  const iconSize = 64
  const setSize = 24

  const simForm = result.simulationForm
  const formTeammate = getTeammate(index, simForm)

  return (
    <Card.Grid
      style={{
        width: '33.3333%',
        textAlign: 'center',
        padding: 1,
        boxShadow: 'none',
        // background: token.colorBgLayout,
      }}
      hoverable={true}
      onClick={() => {
        if (readonly) return
        setCharacterModalInitialCharacter({ form: teammate } as Character)
        setCharacterModalOpen(true)

        setSelectedTeammateIndex(index)
      }}
      className={readonly ? 'readonly-custom-grid' : 'custom-grid'}
    >
      <Flex vertical align='center' gap={0}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={Assets.getCharacterAvatarById(teammate?.characterId)}
            style={{
              height: iconSize,
              width: iconSize,
              borderRadius: iconSize,
              backgroundColor: 'rgba(124, 124, 124, 0.1)',
              border: showcaseOutline,
            }}
          />

          <OverlayText text={t('common:EidolonNShort', { eidolon: teammate?.characterEidolon })} top={-12} />
        </div>

        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img src={Assets.getLightConeIconById(teammate?.lightCone)} style={{ height: iconSize, marginTop: 0 }} />

          {formTeammate.teamRelicSet && (
            <img
              style={{
                position: 'absolute',
                top: 3,
                right: -4,
                width: setSize,
                height: setSize,
                borderRadius: '50%',
                backgroundColor: 'rgba(50, 50, 50, 0.5)',
                border: showcaseOutline,
              }}
              src={Assets.getSetImage(formTeammate.teamRelicSet)}
            />
          )}

          {formTeammate.teamOrnamentSet && (
            <img
              style={{
                position: 'absolute',
                top: 27,
                right: -4,
                width: setSize,
                height: setSize,
                borderRadius: '50%',
                backgroundColor: 'rgba(50, 50, 50, 0.5)',
                border: showcaseOutline,
              }}
              src={Assets.getSetImage(formTeammate.teamOrnamentSet)}
            />
          )}

          <OverlayText
            text={t('common:SuperimpositionNShort', { superimposition: teammate?.lightConeSuperimposition })}
            top={-18}
          />
        </div>
      </Flex>
    </Card.Grid>
  )
}

export function ShowcaseDpsScoreHeader(props: {
  relics: SingleRelicByPart,
  asyncSimScoringExecution: AsyncSimScoringExecution,
}) {
  const { relics, asyncSimScoringExecution } = props
  const { t } = useTranslation(['charactersTab'])
  const simScoringExecution = useAsyncSimScoringExecution(props.asyncSimScoringExecution)

  const verified = Object.values(relics).filter((x) => x?.verified).length == 6
  const numRelics = Object.values(relics).filter((x) => !!x).length

  const textStyle: CSSProperties = {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    color: 'rgb(225, 165, 100)',
    height: 23,
    whiteSpace: 'nowrap',
  }

  const lightCone = !!simScoringExecution?.result?.simulationForm.lightCone

  const titleRender = simScoringExecution?.result?.spdBenchmark == null
    ? t('CharacterPreview.ScoreHeader.Title') // Combat Sim
    : t('CharacterPreview.ScoreHeader.TitleBenchmark', { spd: formatSpd(simScoringExecution?.result?.spdBenchmark ?? 0) }) // Benchmark vs {{spd}} SPD

  const textDisplay = (
    <Flex align='center' vertical style={{ marginBottom: 6, paddingTop: 3, paddingBottom: 3 }}>
      <StatText style={textStyle}>
        {titleRender}
      </StatText>
      <StatText style={textStyle}>
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
    <Flex vertical style={{ filter: !simScoringExecution?.done ? 'blur(2px)' : 'none' }}>
      {textDisplay}
    </Flex>
  )
}

function formatSpd(n: number) {
  return Utils.truncate10ths(n).toFixed(1)
}

function ShowcaseTeamSelectPanel(props: {
  characterId: CharacterId,
  teamSelection: string,
  selectedTeammateIndex: number,
  characterModalInitialCharacter: Character | undefined,
  setRedrawTeammates: (random: number) => void,
  isCharacterModalOpen: boolean,
  setCharacterModalOpen: (open: boolean) => void,
  readonly?: boolean,
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])
  const globalThemeConfig = window.store((s) => s.globalThemeConfig)

  const {
    characterId,
    teamSelection,
    selectedTeammateIndex,
    characterModalInitialCharacter,
    setRedrawTeammates,
    isCharacterModalOpen,
    setCharacterModalOpen,
    readonly,
  } = props

  const setTeamSelectionByCharacter = window.store((s) => s.setShowcaseTeamPreferenceById)

  // Teammate character modal OK
  function onCharacterModalOk(form: Form) {
    if (!form.characterId) {
      return Message.error(t('CharacterPreview.Messages.NoSelectedCharacter') /* No selected character */)
    }
    if (!form.lightCone) {
      return Message.error(t('CharacterPreview.Messages.NoSelectedLightCone') /* No Selected light cone */)
    }

    const simulation = DB.getScoringMetadata(characterId).simulation

    const update = { teammates: simulation?.teammates.map((t, idx) => idx === selectedTeammateIndex ? form : t) }

    DB.updateSimulationScoreOverrides(characterId, update)
    setTeamSelectionByCharacter([characterId, CUSTOM_TEAM])
    setRedrawTeammates(Math.random())
  }

  const tabsDisplay = (
    <Segmented
      disabled={readonly}
      style={{ marginLeft: 10, marginRight: 10, marginTop: 2, marginBottom: 0, alignItems: 'center' }}
      onChange={(selection) => {
        if (selection == SETTINGS_TEAM) {
          window.modalApi.info({
            icon: null,
            width: 'fit-content',
            okText: t('common:Ok'),
            maskClosable: true,
            content: (
              <div style={{ width: '100%' }}>
                <Flex vertical gap={10}>
                  <HeaderText>{t('modals:ScoreFooter.ModalTitle') /* Combat sim scoring settings */}</HeaderText>
                  <Button
                    icon={<SyncOutlined />}
                    onClick={() => {
                      DB.clearSimulationScoreOverrides(characterId)
                      if (teamSelection != DEFAULT_TEAM) setTeamSelectionByCharacter([characterId, DEFAULT_TEAM])
                      setRedrawTeammates(Math.random())

                      Message.success(t('modals:ScoreFooter.ResetSuccessMsg') /* Reset to default teams */)
                    }}
                  >
                    {t('modals:ScoreFooter.ResetButtonText') /* Reset custom team to default */}
                  </Button>
                  <Button
                    icon={<SwapOutlined />}
                    onClick={() => {
                      const characterMetadata = DB.getScoringMetadata(characterId)

                      const update = {
                        teammates: characterMetadata.simulation?.teammates.map((t) => {
                          const form = DB.getCharacterById(t.characterId)?.form
                          if (!form) return t
                          return {
                            ...t,
                            characterEidolon: form.characterEidolon,
                            lightCone: form.lightCone ?? t.lightCone,
                            lightConeSuperimposition: form.lightCone ? form.lightConeSuperimposition : t.lightConeSuperimposition,
                          }
                        }),
                      }

                      DB.updateSimulationScoreOverrides(characterId, update)
                      if (teamSelection != CUSTOM_TEAM) setTeamSelectionByCharacter([characterId, CUSTOM_TEAM])
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
          setTeamSelectionByCharacter([characterId, selection as typeof DEFAULT_TEAM | typeof CUSTOM_TEAM])
        }
      }}
      value={teamSelection}
      block
      options={[
        {
          value: DEFAULT_TEAM,
          label: (
            <Flex justify='center' align='center'>
              {t('modals:ScoreFooter.TeamOptions.Default') /* Default */}
            </Flex>
          ),
        },
        {
          label: <SettingOutlined />,
          value: SETTINGS_TEAM,
          className: 'short-segmented',
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
    <Flex vertical gap={2}>
      <ConfigProvider theme={globalThemeConfig}>
        <CharacterModal
          onOk={onCharacterModalOk}
          open={isCharacterModalOpen}
          setOpen={setCharacterModalOpen}
          initialCharacter={characterModalInitialCharacter}
        />
      </ConfigProvider>

      {tabsDisplay}
    </Flex>
  )
}
