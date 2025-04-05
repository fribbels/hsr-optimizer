import { SettingOutlined, SwapOutlined, SyncOutlined } from '@ant-design/icons'
import { Button, Card, ConfigProvider, Flex, Segmented } from 'antd'
import type { GlobalToken } from 'antd/es/theme/interface'
import { OverlayText, showcaseOutline } from 'lib/characterPreview/CharacterPreviewComponents'
import { CharacterCardCombatStats, CharacterCardScoringStatUpgrades } from 'lib/characterPreview/CharacterScoringSummary'
import StatText from 'lib/characterPreview/StatText'
import { COMBAT_STATS, CUSTOM_TEAM, DAMAGE_UPGRADES, DEFAULT_TEAM, SETTINGS_TEAM } from 'lib/constants/constants'
import { defaultGap } from 'lib/constants/constantsUi'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { Message } from 'lib/interactions/message'
import CharacterModal from 'lib/overlays/modals/CharacterModal'
import { Assets } from 'lib/rendering/assets'
import { getSimScoreGrade } from 'lib/scoring/characterScorer'
import { SimulationScore } from 'lib/scoring/simScoringUtils'
import DB from 'lib/state/db'
import { HeaderText } from 'lib/ui/HeaderText'
import { localeNumber_0 } from 'lib/utils/i18nUtils'
import { Utils } from 'lib/utils/utils'
import React, { CSSProperties, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Character } from 'types/character'
import { Form } from 'types/form'

export function ShowcaseDpsScorePanel(props: {
  characterId: string
  token: GlobalToken
  simScoringResult: SimulationScore
  teamSelection: string
  combatScoreDetails: string
  displayRelics: SingleRelicByPart
  setTeamSelectionByCharacter: (t: Record<string, string>) => void
  setRedrawTeammates: (n: number) => void
}) {
  const {
    characterId,
    token,
    simScoringResult,
    teamSelection,
    combatScoreDetails,
    displayRelics,
    setTeamSelectionByCharacter,
    setRedrawTeammates,
  } = props

  const [isCharacterModalOpen, setCharacterModalOpen] = useState(false)
  const [selectedTeammateIndex, setSelectedTeammateIndex] = useState<number | undefined>()
  const [characterModalInitialCharacter, setCharacterModalInitialCharacter] = useState<Character | undefined>()

  return (
    <Flex
      vertical
    >
      <Flex justify='space-around' style={{ padding: '0 5px' }}>
        <CharacterPreviewScoringTeammate
          index={0}
          result={simScoringResult}
          token={token}
          setCharacterModalOpen={setCharacterModalOpen}
          setSelectedTeammateIndex={setSelectedTeammateIndex}
          setCharacterModalInitialCharacter={setCharacterModalInitialCharacter}
        />
        <CharacterPreviewScoringTeammate
          index={1}
          result={simScoringResult}
          token={token}
          setCharacterModalOpen={setCharacterModalOpen}
          setSelectedTeammateIndex={setSelectedTeammateIndex}
          setCharacterModalInitialCharacter={setCharacterModalInitialCharacter}
        />
        <CharacterPreviewScoringTeammate
          index={2}
          result={simScoringResult}
          token={token}
          setCharacterModalOpen={setCharacterModalOpen}
          setSelectedTeammateIndex={setSelectedTeammateIndex}
          setCharacterModalInitialCharacter={setCharacterModalInitialCharacter}
        />
      </Flex>

      <ShowcaseTeamSelectPanel
        characterId={characterId}
        teamSelection={teamSelection}
        selectedTeammateIndex={selectedTeammateIndex!}
        characterModalInitialCharacter={characterModalInitialCharacter}
        isCharacterModalOpen={isCharacterModalOpen}
        setCharacterModalOpen={setCharacterModalOpen}
        setTeamSelectionByCharacter={setTeamSelectionByCharacter}
        setRedrawTeammates={setRedrawTeammates}
      />
    </Flex>
  )
}

export function ShowcaseCombatScoreDetailsFooter(props: {
  combatScoreDetails: string
  simScoringResult: SimulationScore
}) {
  const {
    combatScoreDetails,
    simScoringResult,
  } = props

  return (
    <>
      {
        combatScoreDetails == DAMAGE_UPGRADES
        && (
          <Flex vertical gap={defaultGap}>
            <CharacterCardScoringStatUpgrades result={simScoringResult}/>
          </Flex>
        )
      }

      {
        combatScoreDetails == COMBAT_STATS
        && (
          <Flex vertical gap={defaultGap}>
            <CharacterCardCombatStats result={simScoringResult}/>
          </Flex>
        )
      }
    </>
  )
}

function CharacterPreviewScoringTeammate(props: {
  index: number
  result: SimulationScore
  token: GlobalToken
  setCharacterModalOpen: (b: boolean) => void
  setSelectedTeammateIndex: (i: number | undefined) => void
  setCharacterModalInitialCharacter: (character: Character) => void
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])
  const { result, index, token, setCharacterModalOpen, setSelectedTeammateIndex, setCharacterModalInitialCharacter } = props

  const teammate = result.simulationMetadata.teammates[index]
  const iconSize = 64

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
        setCharacterModalInitialCharacter({ form: teammate } as Character)
        setCharacterModalOpen(true)

        setSelectedTeammateIndex(index)
      }}
      className='custom-grid'
    >
      <Flex vertical align='center' gap={0}>
        <img
          src={Assets.getCharacterAvatarById(teammate.characterId)}
          style={{
            height: iconSize,
            width: iconSize,
            borderRadius: iconSize,
            backgroundColor: 'rgba(124, 124, 124, 0.1)',
            border: showcaseOutline,
          }}
        />
        <OverlayText text={t('common:EidolonNShort', { eidolon: teammate.characterEidolon })} top={-12}/>
        <img src={Assets.getLightConeIconById(teammate.lightCone)} style={{ height: iconSize, marginTop: -3 }}/>
        <OverlayText
          text={t('common:SuperimpositionNShort', { superimposition: teammate.lightConeSuperimposition })}
          top={-18}
        />
      </Flex>
    </Card.Grid>
  )
}

export function ShowcaseDpsScoreHeader(props: {
  relics: SingleRelicByPart
  result: SimulationScore
}) {
  const { t } = useTranslation(['charactersTab'])

  const result = props.result
  const verified = Object.values(props.relics).filter((x) => x?.verified).length == 6
  const numRelics = Object.values(props.relics).filter((x) => !!x).length

  const textStyle: CSSProperties = {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    color: 'rgb(225, 165, 100)',
    height: 23,
    whiteSpace: 'nowrap',
  }

  const lightCone = !!result.simulationForm.lightCone

  const titleRender = result.spdBenchmark == null
    ? t('CharacterPreview.ScoreHeader.Title') // Combat Sim
    : t('CharacterPreview.ScoreHeader.TitleBenchmark', { spd: formatSpd(result.spdBenchmark) }) // Benchmark vs {{spd}} SPD

  const textDisplay = (
    <Flex align='center' vertical style={{ marginBottom: 6, paddingTop: 3, paddingBottom: 3 }}>
      <StatText style={textStyle}>
        {titleRender}
      </StatText>
      <StatText style={textStyle}>
        {
          t(
            'CharacterPreview.ScoreHeader.Score',
            {
              score: localeNumber_0(Utils.truncate10ths(Math.max(0, result.percent * 100))),
              grade: getSimScoreGrade(result.percent, verified, numRelics, lightCone),
            },
          )
          /* DPS Score {{score}}% {{grade}} */
        }
      </StatText>
    </Flex>
  )

  return (
    <Flex vertical>
      {textDisplay}
    </Flex>
  )
}

function formatSpd(n: number) {
  return Utils.truncate10ths(n).toFixed(1)
}

function ShowcaseTeamSelectPanel(props: {
  characterId: string
  teamSelection: string
  selectedTeammateIndex: number
  characterModalInitialCharacter: Character | undefined
  setTeamSelectionByCharacter: (t: Record<string, string>) => void
  setRedrawTeammates: (random: number) => void
  isCharacterModalOpen: boolean
  setCharacterModalOpen: (open: boolean) => void
}) {
  const { t } = useTranslation(['charactersTab', 'modals', 'common'])
  const globalThemeConfig = window.store((s) => s.globalThemeConfig)

  const {
    characterId,
    teamSelection,
    selectedTeammateIndex,
    characterModalInitialCharacter,
    setTeamSelectionByCharacter,
    setRedrawTeammates,
    isCharacterModalOpen,
    setCharacterModalOpen,
  } = props

  // Teammate character modal OK
  function onCharacterModalOk(form: Form) {
    if (!form.characterId) {
      return Message.error(t('CharacterPreview.Messages.NoSelectedCharacter')/* No selected character */)
    }
    if (!form.lightCone) {
      return Message.error(t('CharacterPreview.Messages.NoSelectedCharacter')/* No selected character */)
    }

    const scoringMetadata = Utils.clone(DB.getScoringMetadata(characterId))
    const simulation = scoringMetadata.simulation

    simulation.teammates[selectedTeammateIndex] = form

    DB.updateSimulationScoreOverrides(characterId, simulation)
    setTeamSelectionByCharacter({ [characterId]: CUSTOM_TEAM })
    setRedrawTeammates(Math.random())
  }

  const tabsDisplay = (
    <Segmented
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
                  <HeaderText>{t('modals:ScoreFooter.ModalTitle')/* Combat sim scoring settings */}</HeaderText>
                  <Button
                    icon={<SyncOutlined/>}
                    onClick={() => {
                      const characterMetadata = Utils.clone(DB.getMetadata().characters[characterId])
                      const simulation = characterMetadata.scoringMetadata.simulation

                      DB.updateSimulationScoreOverrides(characterId, simulation)

                      if (teamSelection != DEFAULT_TEAM) setTeamSelectionByCharacter({ [characterId]: DEFAULT_TEAM })
                      setRedrawTeammates(Math.random())

                      Message.success(t('modals:ScoreFooter.ResetSuccessMsg')/* Reset to default teams */)
                    }}
                  >
                    {t('modals:ScoreFooter.ResetButtonText')/* Reset custom team to default */}
                  </Button>
                  <Button
                    icon={<SwapOutlined/>}
                    onClick={() => {
                      const characterMetadata = Utils.clone(DB.getScoringMetadata(characterId))
                      const simulation = characterMetadata.simulation

                      for (const teammate of simulation.teammates) {
                        const form = DB.getCharacterById(teammate.characterId)?.form
                        if (form == null) continue

                        teammate.characterEidolon = form.characterEidolon
                        if (form.lightCone) {
                          teammate.lightCone = form.lightCone
                          teammate.lightConeSuperimposition = form.lightConeSuperimposition || 1
                        }
                      }

                      DB.updateSimulationScoreOverrides(characterId, simulation)
                      if (teamSelection != CUSTOM_TEAM) setTeamSelectionByCharacter({ [characterId]: CUSTOM_TEAM })
                      setRedrawTeammates(Math.random())

                      Message.success(t('modals:ScoreFooter.SyncSuccessMsg')/* Synced teammates */)
                    }}
                  >
                    {t('modals:ScoreFooter.SyncButtonText')/* Sync imported eidolons / light cones */}
                  </Button>
                </Flex>
              </div>
            ),
          })
        } else {
          setTeamSelectionByCharacter({ [characterId]: selection })
        }
      }}
      value={teamSelection}
      block
      options={[
        {
          value: DEFAULT_TEAM,
          label: (
            <Flex justify='center' align='center'>
              {t('modals:ScoreFooter.TeamOptions.Default')/* Default */}
            </Flex>
          ),
        },
        {
          label: (
            <SettingOutlined/>
          ),
          value: SETTINGS_TEAM,
          className: 'short-segmented',
        },
        {
          value: CUSTOM_TEAM,
          label: (
            <Flex justify='center' align='center'>
              {t('modals:ScoreFooter.TeamOptions.Custom')/* Custom */}
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
