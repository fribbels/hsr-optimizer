import {
  ColDef,
  GetRowIdParams,
  GridOptions,
  IRowNode,
} from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import {
  Flex,
  Typography,
} from 'antd'
import i18next from 'i18next'
import { Assets } from 'lib/rendering/assets'
import DB from 'lib/state/db'
import { CharacterTabController } from 'lib/tabs/tabCharacters/characterTabController'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Character } from 'types/character'

const { Text } = Typography

const defaultColDef: ColDef<Character> = {
  sortable: false,
  cellStyle: { display: 'flex' },
}

const gridOptions: GridOptions<Character> = {
  rowHeight: 46,
  rowDragManaged: true,
  animateRows: true,
  suppressDragLeaveHidesColumns: true,
  suppressScrollOnNewData: true,
}

export function CharacterGrid() {
  const { t } = useTranslation('charactersTab', { keyPrefix: 'GridHeaders' })
  const { t: tGameData } = useTranslation('gameData', { keyPrefix: 'Characters' })
  const filters = useCharacterTabStore((s) => s.filters)
  const [characterRows, setCharacterRows] = useState(DB.getCharacters())
  window.setCharacterRows = setCharacterRows

  const gridRef = useRef<AgGridReact<Character> | null>(null)
  window.characterGrid = gridRef

  const columnDefs: ColDef<Character>[] = useMemo(() => [
    {
      field: 'id',
      headerName: t('Icon'), // Icon
      cellRenderer: cellImageRenderer,
      width: 52,
    },
    {
      field: 'rank',
      headerName: t('Priority'), // Priority
      cellRenderer: cellRankRenderer,
      width: 60,
      rowDrag: true,
    },
    {
      field: 'equipped',
      headerName: t('Character'), // Character
      flex: 1,
      cellRenderer: cellNameRenderer,
      // because character.equipped is an object the grid needs a valueFormatter even if in this case its useless
      valueFormatter: () => '',
    },
  ], [t])

  const isExternalFilterPresent = useCallback(() => {
    return filters.element.length + filters.path.length + filters.name.length > 0
  }, [filters])

  const doesExternalFilterPass = useCallback((node: IRowNode<Character>) => {
    const data = node.data
    if (!data) return false
    const character = DB.getMetadata().characters[data.id]!
    if (filters.element.length && !filters.element.includes(character.element)) return false
    if (filters.path.length && !filters.path.includes(character.path)) return false
    return tGameData(`${character.id}.LongName`).toLowerCase().includes(filters.name)
  }, [filters])

  return (
    <AgGridReact
      ref={gridRef}
      rowData={characterRows}
      gridOptions={gridOptions}
      getRowId={(params: GetRowIdParams<Character>) => params.data.id}
      columnDefs={columnDefs}
      defaultColDef={defaultColDef}
      headerHeight={24}
      onCellClicked={CharacterTabController.cellClickedListener}
      onCellDoubleClicked={CharacterTabController.cellDoubleClickedListener}
      onRowDragEnd={CharacterTabController.onRowDragEnd}
      onRowDragLeave={CharacterTabController.onRowDragLeave}
      navigateToNextCell={CharacterTabController.navigateToNextCell}
      isExternalFilterPresent={isExternalFilterPresent}
      doesExternalFilterPass={doesExternalFilterPass}
      rowSelection='single'
    />
  )
}

function cellRankRenderer(params: IRowNode<Character>) {
  const rank = params.data?.rank
  if (rank == undefined) return <></>

  return (
    <Text style={{ height: '100%' }}>
      {rank + 1}
    </Text>
  )
}

function cellNameRenderer(params: IRowNode<Character>) {
  const t = i18next.getFixedT(null, 'gameData', 'Characters')
  const data = params.data!
  const characterNameString = t(`${data.id}.LongName`)

  // Separate the path parens for multipath characters or handle dots so they render on separate lines if overflow
  const nameSections = characterNameString.includes(' (')
    ? characterNameString.split(' (')
      .map((section) => section.trim())
      .map((section, index) => index === 1 ? ` (${section} ` : section)
    : characterNameString.split(/ - |•/) // some languages use a dash instead of a dot
      .map((section) => section.trim())

  const nameSectionRender = nameSections
    .map((section, index) => <span key={index} style={{ display: 'inline-block' }}>{section}</span>)

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
      <div style={{ display: 'block', width: 3, height: '100%', backgroundColor: color, zIndex: 2 }} />
    </Flex>
  )
}

function cellImageRenderer(params: IRowNode<Character>) {
  const data = params.data!
  const characterIconSrc = Assets.getCharacterAvatarById(data.id)

  return (
    <img
      src={characterIconSrc}
      style={{ flex: '0 0 auto', maxWidth: '100%', width: 48 }}
    />
  )
}
