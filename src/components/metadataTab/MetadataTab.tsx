import React from 'react'
import { AppPages, DB } from 'lib/db.js'
import { Assets } from 'lib/assets'
import { StringToNumberMap } from 'types/Common'
import { ReactElement } from 'types/Components'
import { CheckCircleOutlined } from '@ant-design/icons'
import { Flex } from 'antd'

export default function MetadataTab(): React.JSX.Element {
  const activeKey = window.store((s) => s.activeKey)

  if (activeKey != AppPages.METADATA_TEST) {
    // Don't load unless tab active
    return (<></>)
  }

  return (
    <SimulationEquivalentSetsDashboard/>
  )
}

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
}

const setToIndex: StringToNumberMap = {}
const characterToIndex: StringToNumberMap = {}
const iconSize = 35

type CharacterSetActivation = {
  characterId: string;
  fullSets: string[],
  incompleteSets: string[]
}

function SimulationEquivalentSetsDashboard() {
  const metadata = DB.getMetadata()
  const characters: MetadataObject[] = Object.values(DB.getMetadata().characters)
  const simulationCharacters: MetadataObject[] = characters.filter(x => x.scoringMetadata.simulation)
  const sets: MetadataObject[] = Object.values(DB.getMetadata().relics.relicSets)

  for (let i = 0; i < sets.length; i++) {
    setToIndex[sets[i].name] = i
  }
  for (let i = 0; i < simulationCharacters.length; i++) {
    characterToIndex[simulationCharacters[i].id] = i
  }

  const characterAssets = simulationCharacters.map(x => Assets.getCharacterAvatarById(x.id))

  const gridPhysical = generateGrid(simulationCharacters.filter(x => x.element == 'Physical'))
  const gridFire = generateGrid(simulationCharacters.filter(x => x.element == 'Fire'))
  const gridIce = generateGrid(simulationCharacters.filter(x => x.element == 'Ice'))
  const gridLightning = generateGrid(simulationCharacters.filter(x => x.element == 'Lightning'))
  const gridWind = generateGrid(simulationCharacters.filter(x => x.element == 'Wind'))
  const gridQuantum = generateGrid(simulationCharacters.filter(x => x.element == 'Quantum'))
  const gridImaginary = generateGrid(simulationCharacters.filter(x => x.element == 'Imaginary'))

  function generateGrid(characters: MetadataObject[]) {
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

  return (
    <Flex vertical style={{ width: 3000, height: 3000 }} gap={50}>
      <GridDisplay grid={gridPhysical}/>
      <GridDisplay grid={gridFire}/>
      <GridDisplay grid={gridIce}/>
      <GridDisplay grid={gridLightning}/>
      <GridDisplay grid={gridWind}/>
      <GridDisplay grid={gridQuantum}/>
      <GridDisplay grid={gridImaginary}/>
    </Flex>
  )
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
  let display: ReactElement[] = []

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
        <tr key={rowIndex}>
          {row.map((cell, colIndex) => (
            <td
              key={`${rowIndex}-${colIndex}`}
              style={{
                height: iconSize,
                width: iconSize,
                border: '1px solid #464d6bc4',
                padding: 0,
                textAlign: 'center',
              }}
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