import { AgGridReact } from 'ag-grid-react'
import { Flex, Typography } from 'antd'
import i18next from 'i18next'
import { Assets } from 'lib/rendering/assets'
import DB from 'lib/state/db'
import React, { MutableRefObject, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

// FIXME HIGH

export function CharacterGrid(props: {
  characterGrid: MutableRefObject<any>
  cellClickedListener: any,
  cellDoubleClickedListener: any,
  onRowDragEnd: any,
  onRowDragLeave: any,
  navigateToNextCell: any,
  isExternalFilterPresent: any,
  doesExternalFilterPass: any,
}) {
  const { t } = useTranslation(['charactersTab', 'common', 'gameData'])
  const [characterRows, setCharacterRows] = React.useState(DB.getCharacters())
  window.setCharacterRows = setCharacterRows

  const gridOptions = useMemo(() => ({
    rowHeight: 46,
    rowDragManaged: true,
    animateRows: true,
    suppressDragLeaveHidesColumns: true,
    suppressScrollOnNewData: true,
  }), [])

  const columnDefs = useMemo(() => [
    { field: '', headerName: t('GridHeaders.Icon')/* Icon */, cellRenderer: cellImageRenderer, width: 52 },
    {
      field: '',
      headerName: t('GridHeaders.Priority')/* Priority */,
      cellRenderer: cellRankRenderer,
      width: 60,
      rowDrag: true,
    },
    { field: '', headerName: t('GridHeaders.Character')/* Character */, flex: 1, cellRenderer: cellNameRenderer },
  ], [t])

  const defaultColDef = useMemo(() => ({
    sortable: false,
    cellStyle: { display: 'flex' },
  }), [])

  return (
    <AgGridReact
      ref={props.characterGrid}

      rowData={characterRows}
      gridOptions={gridOptions}
      getRowNodeId={(data) => data.id}

      columnDefs={columnDefs}
      defaultColDef={defaultColDef}
      deltaRowDataMode={true}

      headerHeight={24}

      onCellClicked={props.cellClickedListener}
      onCellDoubleClicked={props.cellDoubleClickedListener}
      onRowDragEnd={props.onRowDragEnd}
      onRowDragLeave={props.onRowDragLeave}
      navigateToNextCell={props.navigateToNextCell}
      isExternalFilterPresent={props.isExternalFilterPresent}
      doesExternalFilterPass={props.doesExternalFilterPass}
      rowSelection='single'
    />
  )
}

function cellRankRenderer(params) {
  const data = params.data
  const character = DB.getCharacters().find((x) => x.id == data.id)

  return (
    <Text style={{ height: '100%' }}>
      {character.rank + 1}
    </Text>
  )
}

function cellNameRenderer(params) {
  const t = i18next.getFixedT(null, 'gameData', 'Characters')
  const data = params.data
  const characterNameString = t(`${data.id}.LongName`)

  // Separate the path parens for multipath characters or handle dots so they render on separate lines if overflow
  const nameSections = characterNameString.includes(' (')
    ? characterNameString.split(' (')
      .map((section) => section.trim())
      .map((section, index) => index === 1 ? ` (${section} ` : section)
    : characterNameString.split(/ - |•/) // some languages use a dash instead of a dot
      .map((section) => section.trim())

  const nameSectionRender = nameSections
    .map((section, index) => (
      <span key={index} style={{ display: 'inline-block' }}>{section}</span>
    ))

  const equippedNumber = data.equipped ? Object.values(data.equipped).filter((x) => x != undefined).length : 0
  let color = '#81d47e'
  if (equippedNumber < 6) color = 'rgb(229, 135, 66)'
  if (equippedNumber < 1) color = '#d72f2f'

  return (
    <Flex align='center' justify='flex-start' style={{ height: '100%', width: '100%' }}>
      <Text
        style={{
          margin: 'auto',
          padding: '0px 5px',
          textAlign: 'center',
          overflow: 'hidden',
          whiteSpace: 'break-spaces',
          textWrap: 'wrap',
          fontSize: 14,
          width: '100%',
          lineHeight: '18px',
        }}
      >
        {nameSectionRender}
      </Text>
      <Flex style={{ display: 'block', width: 3, height: '100%', backgroundColor: color, zIndex: 2 }}>

      </Flex>
    </Flex>
  )
}

export function cellImageRenderer(params) {
  const data = params.data
  const characterIconSrc = Assets.getCharacterAvatarById(data.id)

  return (
    <img
      src={characterIconSrc}
      style={{ flex: '0 0 auto', maxWidth: '100%', width: 48 }}
    />
  )
}
