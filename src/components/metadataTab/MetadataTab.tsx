import React, { useState } from 'react'
import { AppPages, DB } from 'lib/db.js'
import { Assets } from 'lib/assets'
import { StringToNumberMap } from 'types/Common'
import { ReactElement } from 'types/Components'
import { CheckCircleOutlined } from '@ant-design/icons'
import { Collapse, Flex } from 'antd'
import gameData from 'data/game_data.json'

// Fake type for metadata
type MetadataObject = {
  id: string
  name: string
  scoringMetadata: {
    simulation: {
      relicSets: string[][]
      ornamentSets: string[]
    }
  }
  element: string
  path: string
}

const setToIndex: StringToNumberMap = {}
const characterToIndex: StringToNumberMap = {}
const iconSize = 40


export default function MetadataTab(): React.JSX.Element {
  const activeKey = window.store((s) => s.activeKey)

  if (activeKey != AppPages.METADATA_TEST) {
    // Don't load unless tab active
    return (<></>)
  }

  return (
    <Flex vertical style={{ width: 3000, height: 3000 }}>
      <h1 style={{ marginLeft: 20 }}>
        Metadata debugger
      </h1>
      <Collapse
        items={[
          {
            key: '1',
            label: 'Simulation sets',
            children: <SimulationEquivalentSetsDashboard/>,
          },
          {
            key: '2',
            label: 'Conditional sets presets',
            children: <ConditionalSetsPresets/>,
          },
        ]}
      />
    </Flex>
  )
}

function ConditionalSetsPresets() {
  return (
    <></>
  )
}

function SimulationEquivalentSetsDashboard() {
  const metadata = DB.getMetadata()
  const characters: MetadataObject[] = Object.values(DB.getMetadata().characters)
  const simulationCharacters: MetadataObject[] = characters.filter(x => x.scoringMetadata.simulation)

  // @ts-ignore
  const sets: MetadataObject[] = gameData.relics.reverse()

  for (let i = 0; i < sets.length; i++) {
    setToIndex[sets[i].name] = i
  }
  for (let i = 0; i < simulationCharacters.length; i++) {
    characterToIndex[simulationCharacters[i].id] = i
  }

  return (
    <Flex vertical gap={50}>
      <GridDisplay grid={generateGrid(simulationCharacters.filter(x => x.path == 'Destruction'), sets)}/>
      <GridDisplay grid={generateGrid(simulationCharacters.filter(x => x.path == 'Hunt'), sets)}/>
      <GridDisplay grid={generateGrid(simulationCharacters.filter(x => x.path == 'Erudition'), sets)}/>
      <GridDisplay grid={generateGrid(simulationCharacters.filter(x => x.path == 'Nihility'), sets)}/>
      <GridDisplay grid={generateGrid(simulationCharacters.filter(x => x.path == 'Preservation'), sets)}/>
      <GridDisplay grid={generateGrid(simulationCharacters.filter(x => x.path == 'Harmony'), sets)}/>
      <GridDisplay grid={generateGrid(simulationCharacters.filter(x => x.path == 'Abundance'), sets)}/>
    </Flex>
  )
}

function generateGrid(characters: MetadataObject[], sets: MetadataObject[]) {
  const relicAssets = sets.map(x => Assets.getSetImage(x.name))
  relicAssets.unshift(Assets.getBlank())

  const assetByCharacterThenSet: ReactElement[][] = [[]]

  for (let j = 0; j < sets.length + 1; j++) {
    assetByCharacterThenSet[0][j] = <Icon src={relicAssets[j]}/>
  }

  for (let i = 0; i < characters.length; i++) {
    const character = characters[i]
    const rowAssets: ReactElement[] = [<Icon src={Assets.getCharacterAvatarById(character.id)}/>]

    for (const allowedSets of character.scoringMetadata.simulation.relicSets) {
      if (allowedSets.length == 2) {
        // 4p
        const setIndex = setToIndex[allowedSets[0]]
        rowAssets[setIndex + 1] = <Icon src={Assets.getSetImage(allowedSets[0])}/>
      } else {
        // 2p2p
        for (const p2 of allowedSets) {
          const setIndex = setToIndex[p2]
          rowAssets[setIndex + 1] = <Icon src={Assets.getSetImage(p2)}/>
        }
      }
    }

    for (const p2 of character.scoringMetadata.simulation.ornamentSets) {
      const setIndex = setToIndex[p2]
      rowAssets[setIndex + 1] = <Icon src={Assets.getSetImage(p2)}/>
    }

    assetByCharacterThenSet.push(rowAssets)
  }

  return assetByCharacterThenSet
}

function Checkmark() {
  return (
    <CheckCircleOutlined style={{ width: iconSize, justifyContent: 'center', fontSize: 24, color: 'green' }}/>
  )
}

function Icon(props: { src: string }): ReactElement {
  return (
    <img src={props.src} style={{ width: 40 }}/>
  )
}

function GridDisplay(props: { grid: ReactElement[][] }) {
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);

  for (const row of props.grid) {
    for (let i = 0; i < Object.values(setToIndex).length + 1; i++) {
      if (!row[i]) {
        // @ts-ignore
        row[i] = null
      }
    }
  }

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
  );
}