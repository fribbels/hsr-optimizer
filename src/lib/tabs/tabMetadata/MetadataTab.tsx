import {
  Accordion,
  Flex,
} from '@mantine/core'
import gameData from 'data/game_data.json' with { type: 'json' }
import type { TFunction } from 'i18next'
import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { useDebugPanelConfig } from 'lib/characterPreview/debugPanelConfig'
import { DebugSliderPanel } from 'lib/characterPreview/DebugSliderPanel'
import { useDebugVisualConfigStore } from 'lib/characterPreview/debugVisualConfigStore'
import {
  type PathName,
  PathNames,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { cardTotalW } from 'lib/constants/constantsUi'
import {
  NULL_TURN_ABILITY_NAME,
  toTurnAbility,
  type TurnAbilityName,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { Assets } from 'lib/rendering/assets'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { ImageCenterEditorSection } from 'lib/tabs/tabMetadata/ImageCenterEditor'
import { SetBenchmarkAuditor } from 'lib/tabs/tabMetadata/setAuditor/SetBenchmarkAuditor'
import { toI18NVisual } from 'lib/utils/displayUtils'
import {
  Fragment,
  useCallback,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { Character } from 'types/character'
import type { StringToNumberMap } from 'types/common'
import type { ReactElement } from 'types/components'
import type { DBMetadataCharacter, SimulationMetadata } from 'types/metadata'

const iconSize = 40

const sets = gameData.relics.toReversed()
const setToIndex: StringToNumberMap = Object.fromEntries(sets.map((set, i) => [set.name, i]))

export function MetadataTab(): ReactElement {
  const [opened, setOpened] = useState<string[]>([])

  return (
    <Flex direction='column' style={{ width: '100%', height: 'fit-content' }}>
      <h1 style={{ marginLeft: 20 }}>
        Metadata viewer
      </h1>
      <Accordion multiple value={opened} onChange={setOpened}>
        <Accordion.Item value='set-auditor'>
          <Accordion.Control>Set benchmark auditor</Accordion.Control>
          <Accordion.Panel>
            {opened.includes('set-auditor') && <SetBenchmarkAuditor />}
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value='color-grid'>
          <Accordion.Control>Character color grid</Accordion.Control>
          <Accordion.Panel>
            {opened.includes('color-grid') && <CharacterColorGridDashboard />}
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value='image-center'>
          <Accordion.Control>Image center editor</Accordion.Control>
          <Accordion.Panel>
            {opened.includes('image-center') && <ImageCenterEditorSection />}
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value='1'>
          <Accordion.Control>Simulation sets</Accordion.Control>
          <Accordion.Panel>
            {opened.includes('1') && <SimulationEquivalentSetsDashboard />}
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value='2'>
          <Accordion.Control>Simulation teams</Accordion.Control>
          <Accordion.Panel>
            {opened.includes('2') && <SimulationTeamDashboard />}
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value='3'>
          <Accordion.Control>Simulation combo</Accordion.Control>
          <Accordion.Panel>
            {opened.includes('3') && <SimulationComboDashboard />}
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value='4'>
          <Accordion.Control>Conditional set presets</Accordion.Control>
          <Accordion.Panel>
            {opened.includes('4') && <ConditionalSetsPresetsDashboard />}
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value='5'>
          <Accordion.Control>Substat weight dashboard</Accordion.Control>
          <Accordion.Panel>
            {opened.includes('5') && <SubstatWeightDashboard />}
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value='leaderboard-teams'>
          <Accordion.Control>Leaderboard teams</Accordion.Control>
          <Accordion.Panel>
            {opened.includes('leaderboard-teams') && <LeaderboardTeamsDashboard />}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Flex>
  )
}

// =========================================== LeaderboardTeamsDashboard ===========================================

const CONFIG_SECTIONS: { label: string, key: keyof DBMetadataCharacter['scoringMetadata'], showSubDps: boolean }[] = [
  { label: 'DPS', key: 'simulation', showSubDps: false },
  { label: 'Support', key: 'supportSimulation', showSubDps: true },
  { label: 'Heal', key: 'healSimulation', showSubDps: true },
  { label: 'Shield', key: 'shieldSimulation', showSubDps: true },
]

function LeaderboardTeamsDashboard() {
  const characters = Object.values(getGameMetadata().characters)
    .filter((c) => c.rarity === 5)
    .sort((a, b) => a.id.localeCompare(b.id))

  const { t } = useTranslation('gameData')

  return (
    <Flex direction='column' gap={30}>
      {CONFIG_SECTIONS.map((section) => (
        <LeaderboardTeamsTable
          key={section.label}
          label={section.label}
          characters={characters}
          simKey={section.key}
          showSubDps={section.showSubDps}
          t={t}
        />
      ))}
    </Flex>
  )
}

function LeaderboardTeamsTable({ label, characters, simKey, showSubDps, t }: {
  label: string,
  characters: DBMetadataCharacter[],
  simKey: keyof DBMetadataCharacter['scoringMetadata'],
  showSubDps: boolean,
  t: TFunction<'gameData'>,
}) {
  const rows: ReactElement[] = []

  for (const character of characters) {
    const sim = character.scoringMetadata[simKey] as SimulationMetadata | undefined
    if (!sim) continue

    const teams = sim.leaderboardTeams
    const defaultTeam = sim.teammates
    const charName = t(`Characters.${character.id}.${character.id.startsWith('80') ? 'LongName' : 'Name'}`)

    if (teams && teams.length > 0) {
      for (let i = 0; i < teams.length; i++) {
        rows.push(
          <tr key={`${character.id}-${i}`}>
            <td style={cellStyle}><Icon src={Assets.getCharacterAvatarById(character.id)} /></td>
            <td style={{ ...cellStyle, whiteSpace: 'nowrap', paddingLeft: 8, paddingRight: 8, fontSize: 12 }}>{charName}</td>
            <td style={{ ...cellStyle, paddingLeft: 8, paddingRight: 8, fontSize: 12 }}>
              {i + 1}
            </td>
            {teams[i].teammates.map((tm, j) => (
              <td key={j} style={cellStyle}>
                <Flex align='center' justify='center' gap={2} style={{ minWidth: 110 }}>
                  <Icon src={Assets.getCharacterAvatarById(tm.characterId)} />
                  {tm.lightCones.map((lc, k) => (
                    <img key={k} src={Assets.getLightConeIconById(lc)} style={{ width: 30 }} />
                  ))}
                </Flex>
              </td>
            ))}
            {showSubDps && (
              <td style={{ ...cellStyle, paddingLeft: 8, paddingRight: 8, fontSize: 11, textAlign: 'center' }}>
                {teams[i].deprioritizeBuffs ? 'true' : ''}
              </td>
            )}
          </tr>,
        )
      }
    } else if (defaultTeam) {
      rows.push(
        <tr key={`${character.id}-default`} style={{ opacity: 0.5 }}>
          <td style={cellStyle}><Icon src={Assets.getCharacterAvatarById(character.id)} /></td>
          <td style={{ ...cellStyle, whiteSpace: 'nowrap', paddingLeft: 8, paddingRight: 8, fontSize: 12 }}>{charName}</td>
          <td style={{ ...cellStyle, paddingLeft: 8, paddingRight: 8, fontSize: 12, color: '#f5a623' }}>
            DEFAULT
          </td>
          {defaultTeam.map((tm, j) => (
            <td key={j} style={cellStyle}>
              <Flex align='center' justify='center' gap={2} style={{ minWidth: 110 }}>
                <Icon src={Assets.getCharacterAvatarById(tm.characterId)} />
                <img src={Assets.getLightConeIconById(tm.lightCone)} style={{ width: 30 }} />
              </Flex>
            </td>
          ))}
          {showSubDps && <td style={cellStyle} />}
        </tr>,
      )
    }
  }

  if (rows.length === 0) return null

  return (
    <div style={{ overflow: 'auto' }}>
      <h3 style={{ marginBottom: 8, fontSize: 14 }}>{label}</h3>
      <table style={{ borderCollapse: 'collapse', width: 'fit-content' }}>
        <thead>
          <tr>
            <th style={headerStyle} />
            <th style={headerStyle}>Character</th>
            <th style={headerStyle}>Team</th>
            <th style={headerStyle}>Teammate 1</th>
            <th style={headerStyle}>Teammate 2</th>
            <th style={headerStyle}>Teammate 3</th>
            {showSubDps && <th style={headerStyle}>SubDPS</th>}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  )
}

const cellStyle: React.CSSProperties = {
  border: '1px solid #464d6bc4',
  padding: 2,
  verticalAlign: 'middle',
}

const headerStyle: React.CSSProperties = {
  ...cellStyle,
  fontSize: 12,
  padding: '4px 8px',
  textAlign: 'left',
  color: 'rgba(255,255,255,0.7)',
}

// =========================================== SimulationEquivalentSetsDashboard ===========================================

function SimulationEquivalentSetsDashboard() {
  const characters = Object.values(getGameMetadata().characters)

  return (
    <Flex direction='column' gap={50}>
      <GridDisplay grid={generateEquivalentSetsGrid(filterByPath(characters, PathNames.Destruction))} />
      <GridDisplay grid={generateEquivalentSetsGrid(filterByPath(characters, PathNames.Hunt))} />
      <GridDisplay grid={generateEquivalentSetsGrid(filterByPath(characters, PathNames.Erudition))} />
      <GridDisplay grid={generateEquivalentSetsGrid(filterByPath(characters, PathNames.Nihility))} />
      <GridDisplay grid={generateEquivalentSetsGrid(filterByPath(characters, PathNames.Remembrance))} />
      <GridDisplay grid={generateEquivalentSetsGrid(filterByPath(characters, PathNames.Preservation))} />
      <GridDisplay grid={generateEquivalentSetsGrid(filterByPath(characters, PathNames.Harmony))} />
      <GridDisplay grid={generateEquivalentSetsGrid(filterByPath(characters, PathNames.Elation))} />
      <GridDisplay grid={generateEquivalentSetsGrid(filterByPath(characters, PathNames.Abundance))} />
    </Flex>
  )
}

function generateEquivalentSetsGrid(characters: DBMetadataCharacter[]) {
  const assetByCharacterThenSet: ReactElement[][] = [setsTopRow(characters[0].path)]

  characters = characters.filter((x) => x.scoringMetadata.simulation)

  for (const character of characters) {
    const rowAssets: ReactElement[] = Array(sets.length + 1).fill(<Icon src={Assets.getBlank()} />)
    rowAssets[0] = <Icon src={Assets.getCharacterAvatarById(character.id)} />

    for (const allowedSets of character.scoringMetadata.simulation!.relicSets) {
      if (allowedSets.length == 2) {
        // 4p
        const setIndex = setToIndex[allowedSets[0]]
        rowAssets[setIndex + 1] = <Icon src={Assets.getSetImage(allowedSets[0])} />
      } else {
        // 2p2p
        for (const p2 of allowedSets) {
          const setIndex = setToIndex[p2]
          rowAssets[setIndex + 1] = <Icon src={Assets.getSetImage(p2)} />
        }
      }
    }

    for (const p2 of character.scoringMetadata.simulation!.ornamentSets) {
      const setIndex = setToIndex[p2]
      rowAssets[setIndex + 1] = <Icon src={Assets.getSetImage(p2)} />
    }

    assetByCharacterThenSet.push(rowAssets)
  }

  return assetByCharacterThenSet
}

// =========================================== SimulationTeamDashboard ===========================================

function SimulationTeamDashboard() {
  const characters = Object.values(getGameMetadata().characters)
  return (
    <Flex direction='column' gap={40}>
      <GridDisplay grid={generateTeamGrid(filterByPath(characters, PathNames.Destruction))} />
      <GridDisplay grid={generateTeamGrid(filterByPath(characters, PathNames.Hunt))} />
      <GridDisplay grid={generateTeamGrid(filterByPath(characters, PathNames.Erudition))} />
      <GridDisplay grid={generateTeamGrid(filterByPath(characters, PathNames.Nihility))} />
      <GridDisplay grid={generateTeamGrid(filterByPath(characters, PathNames.Remembrance))} />
      <GridDisplay grid={generateTeamGrid(filterByPath(characters, PathNames.Preservation))} />
      <GridDisplay grid={generateTeamGrid(filterByPath(characters, PathNames.Harmony))} />
      <GridDisplay grid={generateTeamGrid(filterByPath(characters, PathNames.Elation))} />
      <GridDisplay grid={generateTeamGrid(filterByPath(characters, PathNames.Abundance))} />
    </Flex>
  )
}

function generateTeamGrid(characters: DBMetadataCharacter[]) {
  const teamsByCharacter: ReactElement[][] = [[
    <IconPair key={0} src1={Assets.getPath(characters[0].path)} />,
    <IconPair key={1} />,
    <IconPair key={2} />,
    <IconPair key={3} />,
  ]]

  for (const character of characters) {
    const simTeam = character.scoringMetadata.simulation?.teammates
    if (!simTeam) continue

    const row: ReactElement[] = [<Icon key={0} src={Assets.getCharacterAvatarById(character.id)} />]
    simTeam.forEach((teammate, i) => {
      row.push(<IconPair key={i + 1} src1={Assets.getCharacterAvatarById(teammate.characterId)} src2={Assets.getLightConeIconById(teammate.lightCone)} />)
    })
    teamsByCharacter.push(row)
  }
  return teamsByCharacter
}

// =========================================== SimulationComboDashboard ===========================================

function SimulationComboDashboard() {
  const characters = Object.values(getGameMetadata().characters)
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  return (
    <Flex direction='column' gap={40}>
      <GridDisplay grid={generateComboGrid(filterByPath(characters, PathNames.Destruction), t)} />
      <GridDisplay grid={generateComboGrid(filterByPath(characters, PathNames.Hunt), t)} />
      <GridDisplay grid={generateComboGrid(filterByPath(characters, PathNames.Erudition), t)} />
      <GridDisplay grid={generateComboGrid(filterByPath(characters, PathNames.Nihility), t)} />
      <GridDisplay grid={generateComboGrid(filterByPath(characters, PathNames.Remembrance), t)} />
      <GridDisplay grid={generateComboGrid(filterByPath(characters, PathNames.Preservation), t)} />
      <GridDisplay grid={generateComboGrid(filterByPath(characters, PathNames.Harmony), t)} />
      <GridDisplay grid={generateComboGrid(filterByPath(characters, PathNames.Elation), t)} />
      <GridDisplay grid={generateComboGrid(filterByPath(characters, PathNames.Abundance), t)} />
    </Flex>
  )
}

function generateComboGrid(characters: DBMetadataCharacter[], t: TFunction<'optimizerTab', 'ComboFilter'>) {
  const comboByCharacter: ReactElement[][] = [[
    <Icon key={0} src={Assets.getPath(characters[0].path)} />,
    <Fragment key={1} />,
  ]]

  for (const character of characters) {
    const combo = character.scoringMetadata.simulation?.comboTurnAbilities?.filter((x) => typeof x === 'string')
    if (!combo) continue

    const text = combo
      .filter((x) => x != NULL_TURN_ABILITY_NAME)
      .map((action) => formatComboAction(action, t))
      .join(' - ')

    comboByCharacter.push([
      <Icon key={0} src={Assets.getCharacterAvatarById(character.id)} />,
      <Flex key={1} style={{ whiteSpace: 'nowrap', justifyContent: 'flex-start', marginRight: 10, marginLeft: 10, width: 600 }}>{text}</Flex>,
    ])
  }
  return comboByCharacter
}

function formatComboAction(action: TurnAbilityName, t: TFunction<'optimizerTab', 'ComboFilter'>) {
  return toI18NVisual(toTurnAbility(action), t)
}

// =========================================== ConditionalSetsPresetsDashboard ===========================================

const presetToSetMapping: Record<string, string> = {
  fnAshblazingSet: Sets.TheAshblazingGrandDuke,
  fnPioneerSet: Sets.PioneerDiverOfDeadWaters,
  fnSacerdosSet: Sets.SacerdosRelivedOrdeal,
  fnMortenaxAshblazingSet: Sets.TheAshblazingGrandDuke,
  PRISONER_SET: Sets.PrisonerInDeepConfinement,
  WASTELANDER_SET: Sets.WastelanderOfBanditryDesert,
  VALOROUS_SET: Sets.TheWindSoaringValorous,
  BANANA_SET: Sets.TheWondrousBananAmusementPark,
}

function ConditionalSetsPresetsDashboard() {
  const characters = Object.values(getGameMetadata().characters)

  return (
    <Flex direction='column' gap={10}>
      <GridDisplay grid={generateConditionalSetsGrid(filterByPath(characters, PathNames.Destruction))} />
      <GridDisplay grid={generateConditionalSetsGrid(filterByPath(characters, PathNames.Hunt))} />
      <GridDisplay grid={generateConditionalSetsGrid(filterByPath(characters, PathNames.Erudition))} />
      <GridDisplay grid={generateConditionalSetsGrid(filterByPath(characters, PathNames.Nihility))} />
      <GridDisplay grid={generateConditionalSetsGrid(filterByPath(characters, PathNames.Remembrance))} />
      <GridDisplay grid={generateConditionalSetsGrid(filterByPath(characters, PathNames.Preservation))} />
      <GridDisplay grid={generateConditionalSetsGrid(filterByPath(characters, PathNames.Harmony))} />
      <GridDisplay grid={generateConditionalSetsGrid(filterByPath(characters, PathNames.Elation))} />
      <GridDisplay grid={generateConditionalSetsGrid(filterByPath(characters, PathNames.Abundance))} />
    </Flex>
  )
}

function generateConditionalSetsGrid(characters: DBMetadataCharacter[]) {
  const assetByCharacterThenSet: ReactElement[][] = [setsTopRow(characters[0].path)]

  for (const character of characters) {
    const rowAssets: ReactElement[] = Array(sets.length + 1).fill(<Icon src={Assets.getBlank()} />)
    rowAssets[0] = <Icon src={Assets.getCharacterAvatarById(character.id)} />

    for (const preset of character.scoringMetadata.presets) {
      const set = presetToSetMapping[preset.name]
      const setIndex = setToIndex[set]

      rowAssets[setIndex + 1] = <div>{preset.value === true ? '⚪' : preset.value}</div>
    }

    assetByCharacterThenSet.push(rowAssets)
  }

  return assetByCharacterThenSet
}

// =========================================== SubstatWeightDashboard ===========================================

function SubstatWeightDashboard() {
  const characters = Object.values(getGameMetadata().characters)

  return (
    <Flex direction='column' gap={10}>
      <GridDisplay grid={generateSubstatWeightGrid(filterByPath(characters, PathNames.Destruction))} />
      <GridDisplay grid={generateSubstatWeightGrid(filterByPath(characters, PathNames.Hunt))} />
      <GridDisplay grid={generateSubstatWeightGrid(filterByPath(characters, PathNames.Erudition))} />
      <GridDisplay grid={generateSubstatWeightGrid(filterByPath(characters, PathNames.Nihility))} />
      <GridDisplay grid={generateSubstatWeightGrid(filterByPath(characters, PathNames.Remembrance))} />
      <GridDisplay grid={generateSubstatWeightGrid(filterByPath(characters, PathNames.Preservation))} />
      <GridDisplay grid={generateSubstatWeightGrid(filterByPath(characters, PathNames.Harmony))} />
      <GridDisplay grid={generateSubstatWeightGrid(filterByPath(characters, PathNames.Elation))} />
      <GridDisplay grid={generateSubstatWeightGrid(filterByPath(characters, PathNames.Abundance))} />
    </Flex>
  )
}

function generateSubstatWeightGrid(characters: DBMetadataCharacter[]) {
  const weightedStats = [
    Stats.ATK_P,
    Stats.DEF_P,
    Stats.HP_P,
    Stats.SPD,
    Stats.CR,
    Stats.CD,
    Stats.EHR,
    Stats.RES,
    Stats.BE,
  ]

  const substatAssets = weightedStats.map((x) => Assets.getStatIcon(x))
  substatAssets.unshift(Assets.getBlank())

  const assetByCharacterThenStat: ReactElement[][] = [[]]

  for (let j = 0; j < weightedStats.length + 1; j++) {
    assetByCharacterThenStat[0][j] = <Icon src={substatAssets[j]} />
  }

  for (const character of characters) {
    const rowAssets: ReactElement[] = []

    rowAssets.push(<Icon src={Assets.getCharacterAvatarById(character.id)} />)
    for (const stat of weightedStats) {
      const value = character.scoringMetadata.stats[stat]
      rowAssets.push(<div>{value || ''}</div>)
    }

    assetByCharacterThenStat.push(rowAssets)
  }

  return assetByCharacterThenStat
}

// =========================================== Utils ===========================================

function Icon(props: {
  src: string,
}): ReactElement {
  return <img src={props.src} style={{ width: 40 }} />
}

function IconPair(props: { src1?: string, src2?: string }) {
  return (
    <Flex style={{ width: 80, justifyContent: 'center', marginLeft: 10, marginRight: 10 }}>
      <Icon src={props.src1 ?? Assets.getBlank()} />
      {props.src2 && <Icon src={props.src2} />}
    </Flex>
  )
}

function setsTopRow(path: PathName) {
  const out = sets.map((x, i) => <Icon key={i + 1} src={Assets.getSetImage(x.name)} />)
  out.unshift(<Icon key={0} src={Assets.getPath(path)} />)
  return out
}

function filterByPath<T extends { path: PathName }>(characters: T[], path: PathName) {
  return characters.filter((x) => x.path === path)
}

function GridDisplay(props: {
  grid: (ReactElement | string)[][],
}) {
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null)
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  return (
    <table style={{ borderCollapse: 'collapse', width: 'fit-content', lineHeight: '0px' }}>
      <tbody>
        {props.grid.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            style={{ backgroundColor: hoveredRow === rowIndex ? 'rgba(255,255,255,0.11)' : '' }}
            onMouseEnter={() => setHoveredRow(rowIndex)}
            onMouseLeave={() => setHoveredRow(null)}
          >
            {row.map((cell, colIndex) => (
              <td
                key={`${rowIndex}-${colIndex}`}
                style={{
                  height: iconSize,
                  width: iconSize,
                  border: '1px solid #464d6bc4',
                  padding: 0,
                  textAlign: 'center',
                  backgroundColor: hoveredColumn === colIndex ? 'rgba(255,255,255,0.11)' : '',
                }}
                onMouseEnter={() => setHoveredColumn(colIndex)}
                onMouseLeave={() => setHoveredColumn(null)}
              >
                <div>
                  {cell || ''}
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// =========================================== CharacterColorGridDashboard ===========================================

function CharacterColorGridDashboard() {
  const characters = useCharacterStore((s) => s.characters)
  const { savedPresetGroups, pillGroups, groups } = useDebugPanelConfig()
  const debugVisualConfig = useDebugVisualConfigStore()

  // No-op callbacks since we don't need modal functionality in the grid view
  const setOriginalCharacterModalOpen = useCallback(() => {}, [])
  const setOriginalCharacterModalInitialCharacter = useCallback(() => {}, [])

  if (characters.length === 0) {
    return <div style={{ padding: 20 }}>No characters imported. Import characters to see the color grid.</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 10 }}>
      {/* Single floating debug panel that controls all cards via global store */}
      <DebugSliderPanel
        savedPresetGroups={savedPresetGroups}
        pillGroups={pillGroups}
        groups={groups}
      />
      {/* Character grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(3, ${cardTotalW}px)`,
          gap: 10,
        }}
      >
        {characters.map((character: Character, index: number) => (
          <CharacterPreview
            key={character.id}
            id={`colorGrid-${character.id}-${index}`}
            source={ShowcaseSource.CHARACTER_TAB}
            character={character}
            setOriginalCharacterModalOpen={setOriginalCharacterModalOpen}
            setOriginalCharacterModalInitialCharacter={setOriginalCharacterModalInitialCharacter}
            forceDebug
            debugVisualConfig={debugVisualConfig}
          />
        ))}
      </div>
    </div>
  )
}
