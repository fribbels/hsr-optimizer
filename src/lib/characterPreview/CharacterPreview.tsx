import { Button, ConfigProvider, Flex, theme, ThemeConfig } from 'antd'
import getDesignToken from 'antd/lib/theme/getDesignToken'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import {
  getArtistName,
  getPreviewRelics,
  getShowcaseDisplayDimensions,
  getShowcaseMetadata,
  getShowcaseSimScoringResult,
  getShowcaseStats,
  handleTeamSelection,
  presetTeamSelectionDisplay,
  ShowcaseDisplayDimensions,
  showcaseIsInactive,
  showcaseOnAddOk,
  showcaseOnEditOk,
  showcaseOnEditPortraitOk,
} from 'lib/characterPreview/characterPreviewController'
import { CharacterStatSummary } from 'lib/characterPreview/CharacterStatSummary'
import { ShowcaseBuildAnalysis } from 'lib/characterPreview/ShowcaseBuildAnalysis'
import { ShowcaseCharacterHeader } from 'lib/characterPreview/ShowcaseCharacterHeader'
import { ShowcaseCombatScoreDetailsFooter, ShowcaseDpsScoreHeader, ShowcaseDpsScorePanel } from 'lib/characterPreview/ShowcaseDpsScore'
import { ShowcaseLightConeLarge, ShowcaseLightConeSmall } from 'lib/characterPreview/ShowcaseLightCone'
import { ShowcasePortrait } from 'lib/characterPreview/ShowcasePortrait'
import { ShowcaseRelicsPanel } from 'lib/characterPreview/ShowcaseRelicsPanel'
import { ShowcaseStatScore } from 'lib/characterPreview/ShowcaseStatScore'
import { COMBAT_STATS, DEFAULT_TEAM, SIMULATION_SCORE } from 'lib/constants/constants'
import { defaultGap, middleColumnWidth, parentH } from 'lib/constants/constantsUi'
import RelicModal from 'lib/overlays/modals/RelicModal'
import { Assets } from 'lib/rendering/assets'
import { SimulationScore } from 'lib/scoring/characterScorer'
import { ShowcaseTheme } from 'lib/tabs/tabRelics/RelicPreview'
import { addColorTransparency } from 'lib/utils/colorUtils'
import Vibrant from 'node-vibrant'
import React, { useEffect, useRef, useState } from 'react'
import { Character } from 'types/character'
import { CustomImageConfig, CustomImagePayload } from 'types/customImage'
import { Relic } from 'types/relic'

const { useToken } = theme

// @ts-ignore
window.Vibrant = Vibrant

export function CharacterPreview(props: {
  id: string
  source: ShowcaseSource
  character: Character
  setOriginalCharacterModalOpen: (open: boolean) => void
  setOriginalCharacterModalInitialCharacter: (character: Character) => void
  setCharacterModalAdd: (add: boolean) => void
}) {
  console.log('======================================================================= RENDER CharacterPreview')

  const {
    source,
    character,
    setOriginalCharacterModalOpen,
    setOriginalCharacterModalInitialCharacter,
    setCharacterModalAdd,
  } = props

  const { token } = useToken()
  const [overrideTheme, setOverrideTheme] = useState<ThemeConfig>()
  const [selectedRelic, setSelectedRelic] = useState<Relic | undefined>()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editPortraitModalOpen, setEditPortraitModalOpen] = useState(false)
  const [customPortrait, setCustomPortrait] = useState<CustomImageConfig | undefined>()
  const [teamSelection, setTeamSelection] = useState(DEFAULT_TEAM)
  const [scoringType, setScoringType] = useState(SIMULATION_SCORE)
  const [combatScoreDetails, setCombatScoreDetails] = useState(COMBAT_STATS)
  const activeKey = window.store((s) => s.activeKey)
  const prevCharId = useRef<string | undefined>()
  const relicsById = window.store((s) => s.relicsById)
  const [_redrawTeammates, setRedrawTeammates] = useState<number>(0)
  const [colors, setColors] = useState([])

  const backgroundColor = token.colorBgLayout
  const colorBgBase = token.colorBgBase
  const overrideToken = overrideTheme ? getDesignToken(overrideTheme) : token

  const showcaseTheme: ShowcaseTheme = {
    cardBackgroundColor: addColorTransparency(overrideToken.colorPrimaryActive, 0.90),
    cardBorderColor: '',
  }

  useEffect(() => {
    // Log whenever overrideTheme updates
    console.log('Updated theme tokens:', overrideTheme?.token)
  }, [overrideTheme])

  useEffect(() => {
    presetTeamSelectionDisplay(character, prevCharId, setTeamSelection, setCustomPortrait)
  }, [character])

  const portraitUrl = character ? (customPortrait?.imageUrl ?? Assets.getCharacterPortraitById(character.id)) : ''

  function closerToBlue(color1, color2) {
    const toBlueDistance = (hex) => {
      const [r, g, b] = hex.match(/\w\w/g).map(c => parseInt(c, 16))
      return (r ** 2) + (g ** 2) + ((b - 255) ** 2)
    }

    return toBlueDistance(color1) < toBlueDistance(color2) ? color1 : color2
  }

  function onPortraitLoad(img: HTMLImageElement) {
    const timerLabel = '!!!!!!!!!!!!!!!!!!!!!!!'
    console.time(timerLabel)
    let v = new Vibrant(img, {})
    v.getPalette((err, palette) => {
      console.log(err)
      console.log(palette)
      console.timeEnd(timerLabel)

      setColors([
        palette!.Vibrant!.hex,
        palette!.DarkVibrant!.hex,
        palette!.Muted!.hex,
        palette!.DarkMuted!.hex,
        palette!.LightMuted!.hex,
        palette!.LightVibrant!.hex,
      ])

      const color = palette!.DarkVibrant!.hex
      setOverrideTheme({
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgLayout: palette!.DarkMuted!.hex,
          colorBgBase: palette!.DarkMuted!.hex,
          colorPrimary: closerToBlue(palette!.DarkVibrant!.hex, palette!.DarkMuted!.hex),
        },
      })
    })
  }

  if (!character || showcaseIsInactive(source, activeKey)) {
    return (
      <div
        style={{
          height: parentH,
          backgroundColor: backgroundColor,
          width: 1066,
          borderRadius: 8,
          marginRight: 2,
          outline: `2px solid ${token.colorBgContainer}`,
        }}
      />
    )
  }

  const { scoringResults, displayRelics } = getPreviewRelics(source, character, relicsById)
  const scoredRelics = scoringResults.relics || []

  const showcaseMetadata = getShowcaseMetadata(character)

  const currentSelection = handleTeamSelection(character, prevCharId, teamSelection)
  const simScoringResult = getShowcaseSimScoringResult(
    character,
    displayRelics,
    scoringType,
    currentSelection,
    showcaseMetadata,
  )

  const displayDimensions: ShowcaseDisplayDimensions = getShowcaseDisplayDimensions(character, Boolean(simScoringResult))
  const artistName = getArtistName(character)
  const finalStats = getShowcaseStats(character, displayRelics, showcaseMetadata)

  console.log(customPortrait)
  console.log(character)

  return (
    <Flex vertical>
      <RelicModal
        selectedRelic={selectedRelic}
        type='edit'
        onOk={(relic: Relic) => showcaseOnEditOk(relic, selectedRelic, setSelectedRelic)}
        setOpen={setEditModalOpen}
        open={editModalOpen}
      />
      <RelicModal
        selectedRelic={selectedRelic}
        type='edit'
        onOk={(relic: Relic) => showcaseOnAddOk(relic, setSelectedRelic)}
        setOpen={setAddModalOpen}
        open={addModalOpen}
      />

      <ConfigProvider theme={overrideTheme}>
        <Flex
          style={{
            position: 'absolute',
            marginLeft: 1100,
            backgroundColor: token.colorBgLayout,
          }}
        >
          <Button
            onClick={() => {
              setOverrideTheme({
                algorithm: theme.darkAlgorithm,
                token: {
                  colorBgLayout: '#2a1c2e', // Custom layout background
                  colorBgBase: '#352863', // Custom base background
                  colorPrimary: '#352863', // Custom base background
                },
              })
            }}
          >
            Color
          </Button>

          <Flex vertical gap={5}>
            {
              colors.map(x => {
                  return (<div key={x} style={{ width: 30, height: 30, backgroundColor: x }}/>)
                },
              )
            }
          </Flex>
        </Flex>


        {/* Showcase full card */}
        <Flex
          id={props.id}
          style={{
            position: 'relative',
            display: character ? 'flex' : 'none',
            height: parentH,
            background: overrideToken.colorBgLayout,
            backgroundBlendMode: 'screen',
            overflow: 'hidden',
            borderRadius: 7,
          }}
          gap={defaultGap}
        >
          <div
            style={{
              backgroundImage: `url(${portraitUrl})`,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 0,
              filter: 'blur(15px)',
              WebkitFilter: 'blur(15px)',
            }}
          />
          {/* Portrait left panel */}
          {source != ShowcaseSource.BUILDS_MODAL &&
            <Flex vertical gap={12} className='character-build-portrait'>
              <ShowcasePortrait
                source={source}
                character={character}
                displayDimensions={displayDimensions}
                customPortrait={customPortrait}
                editPortraitModalOpen={editPortraitModalOpen}
                setEditPortraitModalOpen={setEditPortraitModalOpen}
                onEditPortraitOk={(payload: CustomImagePayload) => showcaseOnEditPortraitOk(character, payload, setCustomPortrait, setEditPortraitModalOpen)}
                simScoringResult={simScoringResult as SimulationScore}
                artistName={artistName}
                setOriginalCharacterModalInitialCharacter={setOriginalCharacterModalInitialCharacter}
                setOriginalCharacterModalOpen={setOriginalCharacterModalOpen}
                setCharacterModalAdd={setCharacterModalAdd}
                onPortraitLoad={onPortraitLoad}
              />

              {simScoringResult && (
                <ShowcaseLightConeSmall
                  source={source}
                  character={character}
                  showcaseMetadata={showcaseMetadata}
                  displayDimensions={displayDimensions}
                  setOriginalCharacterModalInitialCharacter={setOriginalCharacterModalInitialCharacter}
                  setOriginalCharacterModalOpen={setOriginalCharacterModalOpen}
                  setCharacterModalAdd={setCharacterModalAdd}
                />
              )}
            </Flex>
          }

          {/* Character details middle panel */}
          <Flex
            vertical
            style={{
              width: middleColumnWidth,
              height: '100%',
              border: `1px solid ${overrideToken.colorBorderSecondary}`,
              borderRadius: 8,
              zIndex: 1,
              backgroundColor: showcaseTheme.cardBackgroundColor,
            }}
            justify='space-between'
          >
            <ShowcaseCharacterHeader
              showcaseMetadata={showcaseMetadata}
            />

            <CharacterStatSummary
              finalStats={finalStats}
              elementalDmgValue={showcaseMetadata.elementalDmgType}
              cv={finalStats.CV}
              simScore={simScoringResult ? simScoringResult.originalSimResult.simScore : undefined}
            />

            {simScoringResult && <>
              <ShowcaseDpsScoreHeader result={simScoringResult} relics={displayRelics}/>

              <ShowcaseDpsScorePanel
                characterId={showcaseMetadata.characterId}
                token={token}
                simScoringResult={simScoringResult}
                teamSelection={teamSelection}
                combatScoreDetails={combatScoreDetails}
                displayRelics={displayRelics}
                setTeamSelection={setTeamSelection}
                setRedrawTeammates={setRedrawTeammates}
              />

              <ShowcaseCombatScoreDetailsFooter combatScoreDetails={combatScoreDetails} simScoringResult={simScoringResult}/>
            </>}

            {!simScoringResult && <>
              <ShowcaseStatScore
                scoringResults={scoringResults}
              />

              <ShowcaseLightConeLarge
                source={source}
                character={character}
                showcaseMetadata={showcaseMetadata}
                displayDimensions={displayDimensions}
                setOriginalCharacterModalInitialCharacter={setOriginalCharacterModalInitialCharacter}
                setOriginalCharacterModalOpen={setOriginalCharacterModalOpen}
                setCharacterModalAdd={setCharacterModalAdd}
              />
            </>}
          </Flex>

          {/* Relics right panel */}
          <ShowcaseRelicsPanel
            setSelectedRelic={setSelectedRelic}
            setEditModalOpen={setEditModalOpen}
            setAddModalOpen={setAddModalOpen}
            displayRelics={displayRelics}
            source={source}
            characterId={showcaseMetadata.characterId}
            scoredRelics={scoredRelics}
            showcaseColors={showcaseTheme}
          />
        </Flex>
      </ConfigProvider>

      {/* Showcase analysis footer */}
      {source != ShowcaseSource.BUILDS_MODAL &&
        <ShowcaseBuildAnalysis
          token={token}
          simScoringResult={simScoringResult as SimulationScore}
          combatScoreDetails={combatScoreDetails}
          showcaseMetadata={showcaseMetadata}
          scoringType={scoringType}
          setScoringType={setScoringType}
          setCombatScoreDetails={setCombatScoreDetails}
        />
      }
    </Flex>
  )
}
