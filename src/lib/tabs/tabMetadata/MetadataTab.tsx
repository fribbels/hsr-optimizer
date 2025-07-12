import {
  Collapse,
  Flex,
} from 'antd'
import gameData from 'data/game_data.json'
import { TFunction } from 'i18next'
import {
  PathName,
  PathNames,
  Sets,
  Stats,
} from 'lib/constants/constants'
import {
  NULL_TURN_ABILITY_NAME,
  toTurnAbility,
  TurnAbilityName,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { Assets } from 'lib/rendering/assets'
import {
  AppPages,
  DB,
} from 'lib/state/db'
import { toI18NVisual } from 'lib/tabs/tabOptimizer/optimizerForm/components/TurnAbilitySelector'
import {
  Fragment,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { StringToNumberMap } from 'types/common'
import { ReactElement } from 'types/components'
import { DBMetadataCharacter } from 'types/metadata'

const setToIndex: StringToNumberMap = {}
const iconSize = 40

export default function MetadataTab(): ReactElement {
  const activeKey = window.store((s) => s.activeKey)

  if (activeKey != AppPages.METADATA_TEST) {
    // Don't load unless tab active
    return <></>
  }

  return (
    <Flex vertical style={{ width: '100%', height: 'fit-content' }}>
      <h1 style={{ marginLeft: 20 }}>
        Metadata viewer
      </h1>
      <Collapse
        items={[
          {
            key: '1',
            label: 'Simulation sets',
            children: <SimulationEquivalentSetsDashboard />,
          },
          {
            key: '2',
            label: 'Simulation teams',
            children: <SimulationTeamDashboard />,
          },
          {
            key: '3',
            label: 'Simulation combo',
            children: <SimulationComboDashboard />,
          },
          {
            key: '4',
            label: 'Conditional sets presets',
            children: <ConditionalSetsPresetsDashboard />,
          },
          {
            key: '5',
            label: 'Substat weight dashboard',
            children: <SubstatWeightDashboard />,
          },
          {
            key: '6',
            label: 'Relic set weight dashboard',
            children: <RelicSetWeightDashboard />,
          },
          {
            key: '7',
            label: 'Ornament set weight dashboard',
            children: <OrnamentSetWeightDashboard />,
          },
        ]}
      />
    </Flex>
  )
}

// =========================================== SimulationEquivalentSetsDashboard ===========================================

function SimulationEquivalentSetsDashboard() {
  const sets = gameData.relics.toReversed()
  const characters = Object.values(DB.getMetadata().characters)

  for (let i = 0; i < sets.length; i++) {
    setToIndex[sets[i].name] = i
  }

  return (
    <Flex vertical gap={50}>
      <GridDisplay grid={generateEquivalentSetsGrid(filterByPath(characters, PathNames.Destruction), sets)} />
      <GridDisplay grid={generateEquivalentSetsGrid(filterByPath(characters, PathNames.Hunt), sets)} />
      <GridDisplay grid={generateEquivalentSetsGrid(filterByPath(characters, PathNames.Erudition), sets)} />
      <GridDisplay grid={generateEquivalentSetsGrid(filterByPath(characters, PathNames.Nihility), sets)} />
      <GridDisplay grid={generateEquivalentSetsGrid(filterByPath(characters, PathNames.Remembrance), sets)} />
      <GridDisplay grid={generateEquivalentSetsGrid(filterByPath(characters, PathNames.Preservation), sets)} />
      <GridDisplay grid={generateEquivalentSetsGrid(filterByPath(characters, PathNames.Harmony), sets)} />
      <GridDisplay grid={generateEquivalentSetsGrid(filterByPath(characters, PathNames.Abundance), sets)} />
    </Flex>
  )
}

function generateEquivalentSetsGrid(characters: DBMetadataCharacter[], sets: typeof gameData.relics) {
  const assetByCharacterThenSet: ReactElement[][] = [setsTopRow(sets, characters[0].path)]

  characters = characters.filter((x) => x.scoringMetadata.simulation)

  for (let i = 0; i < characters.length; i++) {
    const character = characters[i]
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
  const characters = Object.values(DB.getMetadata().characters)
  return (
    <Flex vertical gap={40}>
      <GridDisplay grid={generateTeamGrid(filterByPath(characters, PathNames.Destruction))} />
      <GridDisplay grid={generateTeamGrid(filterByPath(characters, PathNames.Hunt))} />
      <GridDisplay grid={generateTeamGrid(filterByPath(characters, PathNames.Erudition))} />
      <GridDisplay grid={generateTeamGrid(filterByPath(characters, PathNames.Nihility))} />
      <GridDisplay grid={generateTeamGrid(filterByPath(characters, PathNames.Remembrance))} />
      <GridDisplay grid={generateTeamGrid(filterByPath(characters, PathNames.Preservation))} />
      <GridDisplay grid={generateTeamGrid(filterByPath(characters, PathNames.Harmony))} />
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
    let i = 0
    const row: ReactElement[] = [<Icon key={i++} src={Assets.getCharacterAvatarById(character.id)} />]
    for (const teammate of simTeam) {
      row.push(<IconPair key={i++} src1={Assets.getCharacterAvatarById(teammate.characterId)} src2={Assets.getLightConeIconById(teammate.lightCone)} />)
    }
    teamsByCharacter.push(row)
  }
  return teamsByCharacter
}

// =========================================== SimulationComboDashboard ===========================================

function SimulationComboDashboard() {
  const characters = Object.values(DB.getMetadata().characters)
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  return (
    <Flex vertical gap={40}>
      <GridDisplay grid={generateComboGrid(filterByPath(characters, PathNames.Destruction), t)} />
      <GridDisplay grid={generateComboGrid(filterByPath(characters, PathNames.Hunt), t)} />
      <GridDisplay grid={generateComboGrid(filterByPath(characters, PathNames.Erudition), t)} />
      <GridDisplay grid={generateComboGrid(filterByPath(characters, PathNames.Nihility), t)} />
      <GridDisplay grid={generateComboGrid(filterByPath(characters, PathNames.Remembrance), t)} />
      <GridDisplay grid={generateComboGrid(filterByPath(characters, PathNames.Preservation), t)} />
      <GridDisplay grid={generateComboGrid(filterByPath(characters, PathNames.Harmony), t)} />
      <GridDisplay grid={generateComboGrid(filterByPath(characters, PathNames.Abundance), t)} />
    </Flex>
  )
}

function generateComboGrid(characters: DBMetadataCharacter[], t: TFunction<'optimizerTab', 'ComboFilter'>) {
  let i = 0
  const comboByCharacter = [
    Array<ReactElement>(2)
      .fill(<></>)
      .map((_x, idx) =>
        idx !== 0
          ? <Fragment key={i++}></Fragment>
          : <Icon key={i++} src={Assets.getPath(characters[0].path)} />
      ),
  ]

  for (const character of characters) {
    const combo = character.scoringMetadata.simulation?.comboTurnAbilities?.filter((x) => typeof x === 'string')
    if (!combo) continue

    i = 0
    const row: ReactElement[] = Array(2).fill(<Icon key={i++} src={Assets.getBlank()} />)
    row[0] = <Icon key={0} src={Assets.getCharacterAvatarById(character.id)} />
    const text = combo
      .filter((x) => x != NULL_TURN_ABILITY_NAME)
      .map((action) => formatComboAction(action, t))
      .join(' - ')

    row[1] = <Flex style={{ whiteSpace: 'nowrap', justifyContent: 'flex-start', marginRight: 10, marginLeft: 10, width: 600 }}>{text}</Flex>
    comboByCharacter.push(row)
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
  PRISONER_SET: Sets.PrisonerInDeepConfinement,
  WASTELANDER_SET: Sets.WastelanderOfBanditryDesert,
  VALOROUS_SET: Sets.TheWindSoaringValorous,
  BANANA_SET: Sets.TheWondrousBananAmusementPark,
}

function ConditionalSetsPresetsDashboard() {
  const sets = gameData.relics.toReversed()
  const characters = Object.values(DB.getMetadata().characters)

  for (let i = 0; i < sets.length; i++) {
    setToIndex[sets[i].name] = i
  }

  return (
    <Flex vertical gap={10}>
      <GridDisplay grid={generateConditionalSetsGrid(filterByPath(characters, PathNames.Destruction), sets)} />
      <GridDisplay grid={generateConditionalSetsGrid(filterByPath(characters, PathNames.Hunt), sets)} />
      <GridDisplay grid={generateConditionalSetsGrid(filterByPath(characters, PathNames.Erudition), sets)} />
      <GridDisplay grid={generateConditionalSetsGrid(filterByPath(characters, PathNames.Nihility), sets)} />
      <GridDisplay grid={generateConditionalSetsGrid(filterByPath(characters, PathNames.Remembrance), sets)} />
      <GridDisplay grid={generateConditionalSetsGrid(filterByPath(characters, PathNames.Preservation), sets)} />
      <GridDisplay grid={generateConditionalSetsGrid(filterByPath(characters, PathNames.Harmony), sets)} />
      <GridDisplay grid={generateConditionalSetsGrid(filterByPath(characters, PathNames.Abundance), sets)} />
    </Flex>
  )
}

function generateConditionalSetsGrid(characters: DBMetadataCharacter[], sets: typeof gameData.relics) {
  const assetByCharacterThenSet: ReactElement[][] = [setsTopRow(sets, characters[0].path)]

  for (let i = 0; i < characters.length; i++) {
    const character = characters[i]
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
  const sets = gameData.relics.toReversed()
  const characters = Object.values(DB.getMetadata().characters)

  for (let i = 0; i < sets.length; i++) {
    setToIndex[sets[i].name] = i
  }

  return (
    <Flex vertical gap={10}>
      <GridDisplay grid={generateSubstatWeightGrid(filterByPath(characters, PathNames.Destruction))} />
      <GridDisplay grid={generateSubstatWeightGrid(filterByPath(characters, PathNames.Hunt))} />
      <GridDisplay grid={generateSubstatWeightGrid(filterByPath(characters, PathNames.Erudition))} />
      <GridDisplay grid={generateSubstatWeightGrid(filterByPath(characters, PathNames.Nihility))} />
      <GridDisplay grid={generateSubstatWeightGrid(filterByPath(characters, PathNames.Remembrance))} />
      <GridDisplay grid={generateSubstatWeightGrid(filterByPath(characters, PathNames.Preservation))} />
      <GridDisplay grid={generateSubstatWeightGrid(filterByPath(characters, PathNames.Harmony))} />
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

  for (let i = 0; i < characters.length; i++) {
    const character = characters[i]
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

// =========================================== RelicSetWeightDashboard ===========================================

function RelicSetWeightDashboard() {
  const sets = gameData.relics.toReversed()
  const characters = Object.values(DB.getMetadata().characters)

  sets.forEach((set, idx) => setToIndex[set.name] = idx)

  const ornamentSets = sets.filter((x) => x.id.startsWith('1'))

  return (
    <Flex vertical gap={10}>
      {Object.values(PathNames).map((x, idx) => {
        return <GridDisplay key={idx} grid={generateSetWeightGrid(filterByPath(characters, x), ornamentSets)} />
      })}
    </Flex>
  )
}

function generateSetWeightGrid(characters: DBMetadataCharacter[], sets: typeof gameData.relics) {
  const assetByCharacterThenSet: ReactElement[][] = [setsTopRow(sets, characters[0].path)]

  characters.forEach((character) => {
    const rowAssets: ReactElement[] = Array.from({ length: sets.length + 1 })
    rowAssets[0] = <Icon src={Assets.getCharacterAvatarById(character.id)} />
    sets.forEach((set, idx) => {
      const weight = character.scoringMetadata.sets[set.name as Sets]
      if (weight) {
        rowAssets[idx + 1] = <>{weight}</>
      }
    })
    assetByCharacterThenSet.push(rowAssets)
  })

  return assetByCharacterThenSet
}

// =========================================== OrnamentSetWeightDashboard ===========================================

function OrnamentSetWeightDashboard() {
  const sets = gameData.relics.toReversed()
  const characters = Object.values(DB.getMetadata().characters)

  sets.forEach((set, idx) => setToIndex[set.name] = idx)

  const ornamentSets = sets.filter((x) => x.id.startsWith('3'))

  return (
    <Flex vertical gap={10}>
      {Object.values(PathNames).map((x, idx) => {
        return <GridDisplay key={idx} grid={generateSetWeightGrid(filterByPath(characters, x), ornamentSets)} />
      })}
    </Flex>
  )
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

function setsTopRow(sets: typeof gameData.relics, path: PathName) {
  let i = 0
  const out = sets
    .map((x) => <Icon key={i++} src={Assets.getSetImage(x.name)} />)
  out.unshift(<Icon key={i++} src={Assets.getPath(path)} />)
  return out
}

function filterByPath<T extends { path: PathName }>(characters: T[], path: PathName) {
  return characters.filter((x) => x.path === path)
}

function GridDisplay(props: {
  grid: (ReactElement | string)[][],
}) {
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null)

  return (
    <table style={{ borderCollapse: 'collapse', width: 'fit-content', lineHeight: '0px' }}>
      <tbody>
        {props.grid.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.11)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
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
                  backgroundColor: hoveredColumn === colIndex ? 'rgba(255,255,255,0.11)' : '', // Apply background on hover
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
