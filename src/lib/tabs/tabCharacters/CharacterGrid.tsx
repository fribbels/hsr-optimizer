import {
  ColDef,
  GetRowIdParams,
  GridOptions,
  IRowNode,
} from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { Flex, Text } from '@mantine/core'
import i18next from 'i18next'
import { Assets } from 'lib/rendering/assets'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { CharacterTabController } from 'lib/tabs/tabCharacters/characterTabController'
import { useCharacterStore } from 'lib/stores/characterStore'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { gridStore } from 'lib/utils/gridStore'
import {
  useCallback,
  useMemo,
  useRef,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Character } from 'types/character'
import classes from './CharacterGrid.module.css'

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
  const characters = useCharacterStore((s) => s.characters)

  const gridRef = useRef<AgGridReact<Character> | null>(null)
  gridStore.setCharacterGrid(gridRef)

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
    const character = getGameMetadata().characters[data.id]!
    if (filters.element.length && !filters.element.includes(character.element)) return false
    if (filters.path.length && !filters.path.includes(character.path)) return false
    return tGameData(`${character.id}.LongName`).toLowerCase().includes(filters.name)
  }, [filters, tGameData])

  return (
    <AgGridReact
      ref={gridRef}
      rowData={characters}
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
    <Text h='100%'>
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
    .map((section, index) => <span key={index} className={classes.nameSection}>{section}</span>)

  const equippedNumber = data.equipped ? Object.values(data.equipped).filter((x) => x != undefined).length : 0
  let color = '#81d47e'
  if (equippedNumber < 6) color = 'rgb(229, 135, 66)'
  if (equippedNumber < 1) color = '#d72f2f'

  return (
    <Flex align='center' className={classes.nameContainer}>
      <Text className={classes.nameText}>
        {nameSectionRender}
      </Text>
      <div className={classes.equippedIndicator} style={{ backgroundColor: color }} />
    </Flex>
  )
}

function cellImageRenderer(params: IRowNode<Character>) {
  const data = params.data!
  const characterIconSrc = Assets.getCharacterAvatarById(data.id)

  return (
    <img
      src={characterIconSrc}
      className={classes.characterIcon}
    />
  )
}
