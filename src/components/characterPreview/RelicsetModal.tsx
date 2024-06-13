import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { Flex, Modal, theme } from 'antd'
import DB from 'lib/db'
import { AgGridReact } from 'ag-grid-react'
import { ColDef } from 'ag-grid-community'
import { Utils } from 'lib/utils'
import { Assets } from 'lib/assets'
import { getGridTheme } from 'lib/theme'

const { useToken } = theme

function removeDupes(array) {
  const output: string[] = []
  for (const element of array) {
    if (!output.includes(element)) output.push(element)
  }
  return output
}

function characterImageRenderer(params) {
  return (
    <div style={{ height: 75, width: 75 }}>
      <img
        src={Assets.getCharacterAvatarById(params.value)}
        style={{ height: 75 }}
      />
    </div>
  )
}

function relic2pcIconRenderer(params) { // feels like there should be a better way to do this but I have no clue how to do it so ugly way it is
  const array = params.value
  if (!array.length) return
  const safe = array.length - 1
  return (
    <Flex gap={10} style={{ margin: 'auto' }}>
      <Flex>
        <img src={Assets.getSetImage(array[0])} style={{ display: 0 > safe ? 'none' : 'block', height: 40, width: 40 }} />
      </Flex>
      <Flex>
        <img src={Assets.getSetImage(array[1])} style={{ display: 1 > safe ? 'none' : 'block', height: 40, width: 40 }} />
      </Flex>
      <Flex>
        <img src={Assets.getSetImage(array[2])} style={{ display: 2 > safe ? 'none' : 'block', height: 40, width: 40 }} />
      </Flex>
      <Flex>
        <img src={Assets.getSetImage(array[3])} style={{ display: 3 > safe ? 'none' : 'block', height: 40, width: 40 }} />
      </Flex>
      <Flex>
        <img src={Assets.getSetImage(array[4])} style={{ display: 4 > safe ? 'none' : 'block', height: 40, width: 40 }} />
      </Flex>
      <Flex>
        <img src={Assets.getSetImage(array[5])} style={{ display: 5 > safe ? 'none' : 'block', height: 40, width: 40 }} />
      </Flex>
      <Flex>
        <img src={Assets.getSetImage(array[6])} style={{ display: 6 > safe ? 'none' : 'block', height: 40, width: 40 }} />
      </Flex>
    </Flex>
  )// can only fit up to 7 planar / 2pc relics
}

function relic4pcIconRenderer(params) {
  const array = params.value
  if (!array.length) return
  const safe = array.length - 1
  return (
    <Flex gap={10} style={{ margin: 'auto' }}>
      <Flex>
        <img src={Assets.getSetImage(array[0])} style={{ display: 0 > safe ? 'none' : 'block', height: 40, width: 40 }} />
        <img src={Assets.getSetImage(array[0])} style={{ display: 0 > safe ? 'none' : 'block', height: 40, width: 40 }} />
      </Flex>
      <Flex>
        <img src={Assets.getSetImage(array[1])} style={{ display: 1 > safe ? 'none' : 'block', height: 40, width: 40 }} />
        <img src={Assets.getSetImage(array[1])} style={{ display: 1 > safe ? 'none' : 'block', height: 40, width: 40 }} />
      </Flex>
      <Flex>
        <img src={Assets.getSetImage(array[2])} style={{ display: 2 > safe ? 'none' : 'block', height: 40, width: 40 }} />
        <img src={Assets.getSetImage(array[2])} style={{ display: 2 > safe ? 'none' : 'block', height: 40, width: 40 }} />
      </Flex>
      <Flex>
        <img src={Assets.getSetImage(array[3])} style={{ display: 3 > safe ? 'none' : 'block', height: 40, width: 40 }} />
        <img src={Assets.getSetImage(array[3])} style={{ display: 3 > safe ? 'none' : 'block', height: 40, width: 40 }} />
      </Flex>
    </Flex>
  )// having more than 4 valid 2pc sets doesn't fit with the current formatting, can be pushed to 7 if only show 1 icon instead of 2
}

interface IRow {
  id: number
  sets2: string[]
  sets4: string[]
  planar: string[]
}

export function RelicsetModal(props) {
  const { token } = useToken()
  useEffect(() => {
    if (!props.open) return
  }, [props.open])

  const closeModal = () => props.setOpen(false)

  const [characterRows, setCharacterRows] = useState<IRow[]>(getRowData(Utils.clone(DB.getMetadata().characters)))

  function getRowData(chardata) {
    const characters: { id: number; sets2: string[]; sets4: string[]; planar: string[] }[] = []
    // I couldn't find a lost of the character IDs so iterate across the possible ones instead, shouldn't break though unless Hoyo get up to shenanigans
    for (let id = 1; id < 9000; id++) {
      if (!chardata[id.toString()]) continue
      if (!chardata[id.toString()].scoringMetadata.simulation) continue
      const metadata = chardata[id.toString()].scoringMetadata.simulation
      let relics2a: string[] = []
      let relics4a: string[] = []
      let planara: string[] = []
      for (const set of metadata.relicSets) {
        if (set.length == 2 && set[0] == set[1]) {
          relics4a.push(set[0])
        } else {
          for (const relic of set) {
            relics2a.push(relic)
          }
        }
      }
      relics2a = removeDupes(relics2a)
      relics4a = removeDupes(relics4a)
      for (const set of metadata.ornamentSets) planara.push(set)
      planara = removeDupes(planara)
      characters.push({
        id: id,
        sets2: relics2a,
        sets4: relics4a,
        planar: planara,
      })
    }
    console.log(characters)
    return characters
  }

  const [colDefs, setColDefs] = useState<ColDef<IRow>[]>([
    { headerName: 'character', field: 'id', width: 100, cellRenderer: characterImageRenderer },
    { headerName: '2pc relic sets', field: 'sets2', width: 350, cellRenderer: relic2pcIconRenderer },
    { headerName: '4pc relic sets', field: 'sets4', width: 450, cellRenderer: relic4pcIconRenderer },
    { headerName: 'planar sets', field: 'planar', width: 450, cellRenderer: relic2pcIconRenderer },
  ])

  return (
    <Modal
      open={props.open}
      width={1420}
      centered
      onCancel={closeModal}
      footer={null}
    >
      <Flex vertical gap={10}>
        <div
          id="relicSetGrid" className="ag-theme-balham-dark" style={{
            ...{ display: 'block', height: 900 },
            ...getGridTheme(token),
            marginTop: 30,
          }}
        >
          <AgGridReact
            rowData={characterRows}
            columnDefs={colDefs}
            rowHeight={75}
          />
        </div>
      </Flex>
    </Modal>
  )
}
RelicsetModal.propTypes = {
  open: PropTypes.bool,
  setOpen: PropTypes.func,
}
