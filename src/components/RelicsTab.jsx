import { Button, Flex, InputNumber, Popconfirm, Popover, Select, theme, Typography } from 'antd'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import Plot from 'react-plotly.js'

import RelicPreview from './RelicPreview'
import { Constants, Stats } from 'lib/constants'
import RelicModal from './RelicModal.tsx'
import { RelicScorer } from 'lib/relicScorerPotential'
import { Gradient } from 'lib/gradient'
import { Message } from 'lib/message'
import { TooltipImage } from './TooltipImage'
import RelicFilterBar from './RelicFilterBar'
import DB from '../lib/db'
import { Assets } from 'lib/assets'
import { Renderer } from 'lib/renderer'
import { SaveState } from 'lib/saveState'
import { Hint } from 'lib/hint'
import PropTypes from 'prop-types'
import { RelicModalController } from 'lib/relicModalController'
import { arrowKeyGridNavigation } from 'lib/arrowKeyGridNavigation'
import { getGridTheme } from 'lib/theme'
import { HeaderText } from 'components/HeaderText'
import { SettingOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

const { useToken } = theme

const PLOT_ALL = 'PLOT_ALL'
const PLOT_CUSTOM = 'PLOT_CUSTOM'

export default function RelicsTab() {
  const { token } = useToken()

  // TODO: This is currently rerendering the whole tab on every relic click, revisit
  console.log('======================================================================= RENDER RelicsTab')
  const gridRef = useRef()
  window.relicsGrid = gridRef

  const [relicRows, setRelicRows] = useState(DB.getRelics())
  window.setRelicRows = setRelicRows

  const [selectedRelic, setSelectedRelic] = useState()
  const [selectedRelics, setselectedRelics] = useState([])
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [plottedCharacterType, setPlottedCharacterType] = useState(PLOT_CUSTOM)
  const [relicInsight, setRelicInsight] = useState('buckets')

  const relicTabFilters = window.store((s) => s.relicTabFilters)

  const inventoryWidth = window.store((s) => s.inventoryWidth)
  const setInventoryWidth = window.store((s) => s.setInventoryWidth)

  const rowLimit = window.store((s) => s.rowLimit)
  const setRowLimit = window.store((s) => s.setRowLimit)

  const { t } = useTranslation(['relicsTab', 'common', 'gameData'])

  const relicInsightOptions = [
    { value: 'buckets', label: t('toolbar.insightoptions.buckets') },
    { value: 'top10', label: t('toolbar.insightoptions.top10') },
  ]
  const characterPlotOptions = [
    { value: PLOT_ALL, label: t('toolbar.plotoptions.plotall') },
    { value: PLOT_CUSTOM, label: t('toolbar.plotoptions.plotcustom') },
  ]

  useEffect(() => {
    if (!window.relicsGrid?.current?.api) return
    console.log('RelicTabFilters', relicTabFilters)

    if (Object.values(relicTabFilters).filter((x) => x.length > 0).length == 0) {
      window.relicsGrid.current.api.setFilterModel(null)
      return
    }

    // Calculate filter conditions
    const filterModel = {}

    filterModel.set = {
      conditions: relicTabFilters.set.map((x) => ({
        filterType: 'text',
        type: 'equals',
        filter: x,
      })),
      operator: 'OR',
    }

    filterModel.part = {
      conditions: relicTabFilters.part.map((x) => ({
        filterType: 'text',
        type: 'equals',
        filter: x,
      })),
      operator: 'OR',
    }

    filterModel.grade = {
      conditions: relicTabFilters.grade.map((x) => ({
        filterType: 'number',
        type: 'equals',
        filter: x,
      })),
      operator: 'OR',
    }

    filterModel.verified = {
      conditions: [
        relicTabFilters.verified.includes('true') && {
          filterType: 'text',
          type: 'true',
        },
        relicTabFilters.verified.includes('false') && {
          filterType: 'text',
          type: 'false',
        },
      ],
      operator: 'OR',
    }

    filterModel.equippedBy = {
      conditions: [
        relicTabFilters.equippedBy.includes('true') && {
          filterType: 'text',
          type: 'notBlank',
        },
        relicTabFilters.equippedBy.includes('false') && {
          filterType: 'text',
          type: 'blank',
        },
      ],
      operator: 'OR',
    }

    filterModel['main.stat'] = {
      conditions: relicTabFilters.mainStats.map((x) => ({
        filterType: 'text',
        type: 'equals',
        filter: x,
      })),
      operator: 'OR',
    }

    // Substats have to filter augmented stats individually
    for (const substatFilter of relicTabFilters.subStats) {
      filterModel[`augmentedStats.${substatFilter}`] = {
        filterType: 'number',
        type: 'greaterThan',
        filter: 0,
      }
    }

    // Enhance includes a range from x to x + 2
    filterModel.enhance = {
      conditions: relicTabFilters.enhance.flatMap((x) => [
        {
          filterType: 'number',
          type: 'equals',
          filter: x,
        },
        {
          filterType: 'number',
          type: 'equals',
          filter: x + 1,
        },
        {
          filterType: 'number',
          type: 'equals',
          filter: x + 2,
        },
      ]),
      operator: 'OR',
    }

    console.log('FilterModel', filterModel)

    // Apply to grid
    window.relicsGrid.current.api.setFilterModel(filterModel)
  }, [relicTabFilters])

  const [relicPositionIndex, setRelicPositionIndex] = useState(0)
  const [locatorFilters, setLocatorFilters] = useState({ set: undefined, part: undefined })

  useEffect(() => {
    if (!selectedRelic) return
    const indexLimit = Math.max(1, rowLimit) * Math.max(1, inventoryWidth)

    if (selectedRelic.ageIndex < indexLimit) {
      setRelicPositionIndex(selectedRelic.ageIndex)
      setLocatorFilters({ set: undefined, part: undefined })
      return
    }

    const newerRelics = DB.getRelics().filter((x) => x.ageIndex <= selectedRelic.ageIndex)

    const partFilteredIndex = newerRelics.filter((x) => selectedRelic.part == x.part).length - 1
    if (partFilteredIndex < indexLimit) {
      setRelicPositionIndex(partFilteredIndex)
      setLocatorFilters({ set: undefined, part: selectedRelic.part })
      return
    }

    const setFilteredIndex = newerRelics.filter((x) => selectedRelic.set == x.set).length - 1
    if (setFilteredIndex < indexLimit) {
      setRelicPositionIndex(setFilteredIndex)
      setLocatorFilters({ set: selectedRelic.set, part: undefined })
      return
    }

    const filteredIndex = newerRelics.filter((x) => selectedRelic.part == x.part && selectedRelic.set == x.set).length - 1
    setRelicPositionIndex(filteredIndex)
    setLocatorFilters({ set: selectedRelic.set, part: selectedRelic.part })
  }, [selectedRelic, inventoryWidth, rowLimit])

  const valueColumnOptions = useMemo(() => [
    {
      label: t('relicGrid.valuecolumns.selectedcharacter.label'),
      options: [
        { column: t('relicGrid.valuecolumns.selectedcharacter.scorecol.header'), value: 'weights.current', label: t('relicGrid.valuecolumns.selectedcharacter.scorecol.label') },
        { column: t('relicGrid.valuecolumns.selectedcharacter.avgpotcol.header'), value: 'weights.potentialSelected.averagePct', label: t('relicGrid.valuecolumns.selectedcharacter.avgpotcol.label'), percent: true },
        { column: t('relicGrid.valuecolumns.selectedcharacter.maxpotcol.header'), value: 'weights.potentialSelected.bestPct', label: t('relicGrid.valuecolumns.selectedcharacter.maxpotcol.label'), percent: true },
      ],
    },
    {
      label: t('relicGrid.valuecolumns.customcharacters.label'),
      options: [
        { column: t('relicGrid.valuecolumns.customcharacters.avgpotcol.header'), value: 'weights.potentialAllCustom.averagePct', label: t('relicGrid.valuecolumns.customcharacters.avgpotcol.label'), percent: true },
        { column: t('relicGrid.valuecolumns.customcharacters.maxpotcol.header'), value: 'weights.potentialAllCustom.bestPct', label: t('relicGrid.valuecolumns.customcharacters.maxpotcol.label'), percent: true },
      ],
    },
    {
      label: t('relicGrid.valuecolumns.allcharacters.label'),
      options: [
        { column: t('relicGrid.valuecolumns.allcharacters.avgpotcol.header'), value: 'weights.potentialAllAll.averagePct', label: t('relicGrid.valuecolumns.allcharacters.avgpotcol.label'), percent: true },
        { column: t('relicGrid.valuecolumns.allcharacters.maxpotcol.header'), value: 'weights.potentialAllAll.bestPct', label: t('relicGrid.valuecolumns.allcharacters.maxpotcol.label'), percent: true },
      ],
    },
    {
      label: t('relicGrid.valuecolumns.comingsoon.label'),
      options: [
        { column: t('relicGrid.valuecolumns.comingsoon.setspotential.header'), disabled: true, value: 'weights.potentialAllSets', label: t('relicGrid.valuecolumns.comingsoon.setspotential.label'), percent: true },
      ],
    },
  ], [t])

  const flatValueColumnOptions = useMemo(() => valueColumnOptions.flatMap((x) => x.options), [valueColumnOptions])

  const [valueColumns, setValueColumns] = useState(['weights.current', 'weights.potentialSelected.averagePct', 'weights.potentialSelected.bestPct', 'weights.potentialAllCustom.averagePct', 'weights.potentialAllCustom.bestPct'])

  const columnDefs = useMemo(() => [
    { field: 'verified', hide: true, filter: 'agTextColumnFilter', filterParams: { maxNumConditions: 2 } },
    { field: 'equippedBy', headerName: t('relicGrid.headers.equippedby'), width: 40, cellRenderer: Renderer.characterIcon, filter: 'agTextColumnFilter' },
    { field: 'set', cellRenderer: Renderer.anySet, width: 40, headerName: t('relicGrid.headers.set'), filter: 'agTextColumnFilter' },
    { field: 'grade', width: 40, cellRenderer: Renderer.renderGradeCell, headerName: t('relicGrid.headers.grade'), filter: 'agNumberColumnFilter' },
    { field: 'part', valueFormatter: Renderer.readablePart, width: 55, headerName: t('relicGrid.headers.part'), filter: 'agTextColumnFilter' },
    { field: 'enhance', width: 55, headerName: t('relicGrid.headers.enhance'), filter: 'agNumberColumnFilter' },
    { field: 'main.stat', valueFormatter: Renderer.readableStat, headerName: t('relicGrid.headers.mainstat'), width: 70, filter: 'agTextColumnFilter' },
    { field: 'main.value', headerName: t('relicGrid.headers.mainvalue'), width: 50, valueFormatter: Renderer.mainValueRenderer, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.HP_P}`, headerName: t('relicGrid.headers.hpp'), cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.ATK_P}`, headerName: t('relicGrid.headers.atkp'), cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.DEF_P}`, headerName: t('relicGrid.headers.defp'), cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.HP}`, headerName: t('relicGrid.headers.hp'), cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesFloor, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.ATK}`, headerName: t('relicGrid.headers.atk'), cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesFloor, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.DEF}`, headerName: t('relicGrid.headers.def'), cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesFloor, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.SPD}`, headerName: t('relicGrid.headers.spd'), cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroes10thsRelicTabSpd, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.CR}`, headerName: t('relicGrid.headers.cr'), cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.CD}`, headerName: t('relicGrid.headers.cd'), cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.EHR}`, headerName: t('relicGrid.headers.ehr'), cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.RES}`, headerName: t('relicGrid.headers.res'), cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.BE}`, headerName: t('relicGrid.headers.be'), cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: 'cv', valueGetter: cvValueGetter, headerName: t('relicGrid.headers.cv'), cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
  ].concat(valueColumns
    .map((vc) => {
      const i = flatValueColumnOptions.findIndex((x) => x.value === vc)
      return [i, flatValueColumnOptions[i]]
    })
    .sort((a, b) => a[0] - b[0])
    .map(([_i, field]) => (
      {
        field: field.value,
        headerName: field.column,
        cellStyle: Gradient.getRelicGradient,
        valueFormatter: field.percent ? Renderer.hideNaNAndFloorPercent : Renderer.hideNaNAndFloor,
        filter: 'agNumberColumnFilter',
        width: 75,
      }
    )),
  ), [flatValueColumnOptions, valueColumns, t])

  const gridOptions = useMemo(() => ({
    rowHeight: 33,
    rowSelection: 'single',
    suppressDragLeaveHidesColumns: true,
    suppressScrollOnNewData: true,
    enableRangeSelection: false,
    suppressMultiSort: true,
    getRowId: (params) => String(params.data.id),
  }), [])

  // headerTooltip
  const defaultColDef = useMemo(() => ({
    sortable: true,
    width: 46,
    headerClass: 'relicsTableHeader',
    sortingOrder: ['desc', 'asc'],
    filterParams: { maxNumConditions: 200 },
    wrapHeaderText: true,
    autoHeaderHeight: true,
    suppressHeaderMenuButton: true,
  }), [])

  const onSelectionChanged = useCallback((event) => {
    console.log('selectionChanged', event)
    setselectedRelics(event.api.getSelectedRows())
  }, [])

  const rowClickedListener = useCallback((event) => {
    console.log('rowClicked', event)
    if (!event.type) {
      const node = gridRef.current.api.getRowNode(event.id)
      node.setSelected(true, true)
    }
    setSelectedRelic(event.data)
  }, [])

  const onRowDoubleClickedListener = useCallback((e) => {
    console.log('rowDblClicked', e)
    setSelectedRelic(e.data)
    setEditModalOpen(true)
  }, [])

  const navigateToNextCell = useCallback((params) => {
    return arrowKeyGridNavigation(params, gridRef, (selectedNode) => rowClickedListener(selectedNode))
  }, [])

  function onAddOk(relic) {
    DB.setRelic(relic)
    window.forceCharacterTabUpdate()
    setRelicRows(DB.getRelics())
    SaveState.save()

    setSelectedRelic(relic)

    Message.success(t('messages.addrelicsuccess'))
    console.log('onAddOk', relic)
  }

  // DRY this up (CharacterPreview.js, OptimizerBuildPreview.js, RelicsTab.js)
  function onEditOk(relic) {
    const updatedRelic = RelicModalController.onEditOk(selectedRelic, relic)
    setSelectedRelic(updatedRelic)
  }

  function editClicked() {
    console.log('edit clicked')
    if (!selectedRelic) return Message.error(t('messages.norelicselected'))
    setEditModalOpen(true)
  }

  function addClicked() {
    console.log('add clicked')
    setAddModalOpen(true)
  }

  function deleteClicked(isOpen) {
    console.log('delete clicked')

    if (selectedRelics.length === 0) {
      setDeleteConfirmOpen(false)
      return Message.error(t('messages.norelicselected'))
    }

    setDeleteConfirmOpen(isOpen)
  }

  function deletePerform() {
    if (selectedRelics.length === 0) return Message.error(t('messages.norelicselected'))

    selectedRelics.forEach((relic) => {
      DB.deleteRelic(relic.id)
    })

    setRelicRows(DB.getRelics())
    setSelectedRelic(undefined)
    SaveState.save()

    Message.success(t('messages.deleterelicsuccess'))
  }

  const focusCharacter = window.store.getState().relicsTabFocusCharacter
  let score
  if (focusCharacter && selectedRelic) {
    score = RelicScorer.scoreCurrentRelic(selectedRelic, focusCharacter)
  }

  const numScores = 10
  const [scores, setScores] = useState(null)
  const [scoreBuckets, setScoreBuckets] = useState(null)
  const excludedRelicPotentialCharacters = window.store((s) => s.excludedRelicPotentialCharacters)
  useEffect(() => {
    if (selectedRelic) {
      const chars = DB.getMetadata().characters
      const allScores = Object.keys(chars)
        .filter((id) => !(plottedCharacterType === PLOT_CUSTOM && excludedRelicPotentialCharacters.includes(id)))
        .map((id) => ({
          cid: id,
          name: t(`gameData:characters.${id}.name`),
          score: RelicScorer.scoreRelicPotential(selectedRelic, id, true),
          color: '#000',
          owned: !!DB.getCharacterById(id),
        }))

      allScores.sort((a, b) => b.score.bestPct - a.score.bestPct)
      allScores.forEach((x, idx) => {
        x.color = 'hsl(' + (idx * 360 / (numScores + 1)) + ',50%,50%)'
      })
      setScores(allScores.slice(0, numScores))

      //        0+  10+ 20+ 30+ 40+ 50+ 60+ 70+ 80+ 90+
      const sb = [[], [], [], [], [], [], [], [], [], []]
      for (const score of allScores) {
        let lowerBound = Math.floor(score.score.bestPct / 10)
        lowerBound = Math.min(9, Math.max(0, lowerBound))
        sb[lowerBound].push(score)
      }
      sb.forEach((bucket) => bucket.sort((s1, s2) => s1.name.localeCompare(s2.name)))
      setScoreBuckets(sb)
    }
  }, [plottedCharacterType, selectedRelic, excludedRelicPotentialCharacters, t])

  return (
    <Flex style={{ width: 1350, marginBottom: 100 }}>
      <RelicModal selectedRelic={selectedRelic} type='add' onOk={onAddOk} setOpen={setAddModalOpen} open={addModalOpen}/>
      <RelicModal selectedRelic={selectedRelic} type='edit' onOk={onEditOk} setOpen={setEditModalOpen} open={editModalOpen}/>
      <Flex vertical gap={10}>

        <RelicFilterBar setValueColumns={setValueColumns} valueColumns={valueColumns} valueColumnOptions={valueColumnOptions}/>

        <div
          id='relicGrid' className='ag-theme-balham-dark' style={{
            ...{ width: 1350, height: 500, resize: 'vertical', overflow: 'hidden' },
            ...getGridTheme(token),
          }}
        >

          <AgGridReact
            ref={gridRef}

            rowData={relicRows}
            gridOptions={gridOptions}

            columnDefs={columnDefs}
            defaultColDef={defaultColDef}

            animateRows={true}
            headerHeight={24}
            rowSelection='multiple'

            pagination={true}
            paginationPageSizeSelector={false}
            paginationPageSize={2000}

            onSelectionChanged={onSelectionChanged}
            onRowClicked={rowClickedListener}
            onRowDoubleClicked={onRowDoubleClickedListener}
            navigateToNextCell={navigateToNextCell}
          />
        </div>
        <Flex gap={10}>
          <Button
            type='primary'
            onClick={editClicked}
            style={{ width: 170 }}
            disabled={selectedRelics.length === 0 || selectedRelics.length > 1}
          >
            {t('toolbar.editrelic')}
          </Button>
          <Popconfirm
            title={t('common:confirm')}
            description={t('toolbar.deleterelic.warning', { count: selectedRelics.length })}
            open={deleteConfirmOpen}
            onOpenChange={deleteClicked}
            onConfirm={deletePerform}
            placement='bottom'
            okText={t('common:yes')}
            cancelText={t('common:cancel')}
          >
            <Button type='primary' style={{ width: 170 }} disabled={selectedRelics.length === 0}>
              {t('toolbar.deleterelic.buttontext')}
            </Button>
          </Popconfirm>
          <Button type='primary' onClick={addClicked} style={{ width: 170 }}>
            {t('toolbar.addrelic')}
          </Button>

          <Popover
            trigger='click'
            onOpenChange={(open) => {
              if (!open) {
                SaveState.save()
              }
            }}
            content={(
              <Flex gap={8} style={{ width: 260 }}>
                <Flex vertical>
                  <Flex justify='space-between' align='center'>
                    <HeaderText>{t('toolbar.reliclocator.width')}</HeaderText>
                  </Flex>
                  <InputNumber
                    defaultValue={window.store.getState().inventoryWidth}
                    style={{ width: 'auto' }}
                    min={1}
                    onChange={(e) => {
                      setInventoryWidth(e)
                    }}
                  />
                </Flex>

                <Flex vertical>
                  <Flex justify='space-between' align='center' gap={10}>
                    <HeaderText>{t('toolbar.reliclocator.filter')}</HeaderText>
                    <TooltipImage type={Hint.locatorParams()}/>
                  </Flex>
                  <InputNumber
                    defaultValue={window.store.getState().rowLimit}
                    style={{ width: 'auto' }}
                    min={1}
                    onChange={(e) => {
                      setRowLimit(e)
                    }}
                  />
                </Flex>
              </Flex>
            )}
          >
            <Flex
              justify='space-between'
              align='center'
              style={{
                cursor: 'pointer',
                paddingLeft: 8,
                paddingRight: 10,
                width: 285,
                marginTop: 1,
                borderRadius: 5,
                height: 30,
                background: 'rgba(36, 51, 86)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
                outline: '1px solid rgba(63, 90, 150)',
              }}
            >
              {
                selectedRelic && (
                  <Flex align='center' justify='space-between' style={{ width: '100%' }}>
                    <Flex gap={5} style={{ minWidth: 10 }} justify='flex-start'>
                      {locatorFilters.part && <img src={Assets.getPart(locatorFilters.part)} style={{ height: 25 }}/>}
                      {locatorFilters.set && <img src={Assets.getSetImage(locatorFilters.set, undefined, true)} style={{ height: 26 }}/>}
                      {!locatorFilters.part && !locatorFilters.set && <div style={{ width: 10 }}></div>}
                    </Flex>
                    <Typography>
                      {!selectedRelic ? '' : t('toolbar.reliclocator.location', { columnindex: relicPositionIndex % inventoryWidth + 1, rowindex: Math.ceil((relicPositionIndex + 1) / inventoryWidth) })}
                    </Typography>
                    <SettingOutlined/>
                  </Flex>

                )
              }
              {
                !selectedRelic && (
                  <Flex style={{ width: '100%' }} justify='space-between'>
                    <div style={{ width: 10 }}></div>
                    <div>{t('toolbar.reliclocator.noneselected')}</div>
                    <SettingOutlined/>
                  </Flex>
                )
              }
            </Flex>
          </Popover>

          <Flex style={{ display: 'block' }}>
            <TooltipImage type={Hint.relicLocation()}/>
          </Flex>
          <Select
            value={plottedCharacterType}
            onChange={setPlottedCharacterType}
            options={characterPlotOptions}
            style={{ width: 225 }}
          />
          <Select
            value={relicInsight}
            onChange={setRelicInsight}
            options={relicInsightOptions}
            style={{ width: 225 }}
          />
          <Flex style={{ display: 'block' }}>
            <TooltipImage type={Hint.relicInsight()}/>
          </Flex>
        </Flex>
        <Flex gap={10}>
          <RelicPreview
            relic={selectedRelic}
            setSelectedRelic={setSelectedRelic}
            setEditModalOpen={setEditModalOpen}
            score={score}
          />
          <Flex style={{ display: 'block' }}>
            <TooltipImage type={Hint.relics()}/>
          </Flex>

          {relicInsight === 'top10' && scores && (
            <Flex gap={10}>
              <Flex style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${token.colorBorderSecondary}` }}>
                <Plot
                  onClick={(e) => {
                    store.getState().setScoringAlgorithmFocusCharacter(e.points[0].data.cid)
                    window.setIsScoringModalOpen(true)
                  }}
                  data={
                    scores.map((s) => ({
                      x: [s.score.averagePct],
                      y: [s.name],
                      hoverinfo: 'name',
                      mode: 'markers',
                      type: 'scatter',
                      error_x: {
                        type: 'data',
                        symmetric: false,
                        array: [s.score.bestPct - s.score.averagePct],
                        arrayminus: [s.score.averagePct - s.score.worstPct],
                      },
                      marker: { color: s.color },
                      name: s.name,
                      cid: s.cid,
                    })).reverse()
                  }
                  layout={{
                    plot_bgcolor: 'rgba(0, 0, 0, 0)',
                    paper_bgcolor: token.colorBgContainer,
                    font: {
                      color: 'rgba(255, 255, 255, 0.85)',
                    },
                    autosize: true,
                    width: 320,
                    height: 278,
                    margin: {
                      b: 20,
                      l: 10,
                      r: 20,
                      t: 10,
                    },
                    showlegend: false,
                    xaxis: {
                      fixedrange: true,
                      range: [0, 100],
                      tick0: 0,
                      dtick: 10,
                      showgrid: true,
                      showline: true,
                      showticklabels: true,
                      type: 'linear',
                      zeroline: true,
                      gridcolor: 'rgba(128, 128, 128, 0.15)',
                    },
                    yaxis: {
                      fixedrange: true,
                      showticklabels: false,
                      gridcolor: 'rgba(128, 128, 128, 0.15)',
                    },
                  }}
                  config={{
                    displayModeBar: false,
                    editable: false,
                    scrollZoom: false,
                  }}
                />
              </Flex>
              <ol>
                <Flex vertical gap={5.5}>
                  {
                    scores
                      .map((x) => {
                        const rect = (
                          <svg width={10} height={10}>
                            <rect
                              width={10} height={10} style={{
                                fill: x.color,
                                strokeWidth: 1,
                                stroke: 'rgb(0,0,0)',
                              }}
                            />
                          </svg>
                        )
                        const worstPct = Math.floor(x.score.worstPct)
                        const bestPct = Math.floor(x.score.bestPct)
                        const pctText = worstPct === bestPct ? `${worstPct}%` : `${worstPct}% - ${bestPct}%`
                        return (
                          <Flex key={x.cid} gap={4}>
                            <li style={x.owned ? { fontWeight: 'bold' } : undefined}>
                              <Flex align='center' gap={8}>
                                {rect}
                                <a style={{ height: '19px' }}> {/* 20 px is too big and pushes the characters below the lower edge of the plot */}
                                  <img
                                    src={Assets.getCharacterAvatarById(x.cid)}
                                    style={{ height: '19px' }}
                                    onClick={(e) => {
                                      store.getState().setScoringAlgorithmFocusCharacter(e.target.attributes.src.nodeValue.split('avatar/')[1].split('.webp')[0])
                                      window.setIsScoringModalOpen(true)
                                    }}
                                  />
                                </a>
                                {x.name}: {pctText}
                              </Flex>
                            </li>
                          </Flex>
                        )
                      })
                  }
                </Flex>
              </ol>
            </Flex>
          )}
          <Flex style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${token.colorBorderSecondary}` }}>
            {relicInsight === 'buckets' && scoreBuckets && (
              // Since plotly doesn't natively support images as points, we emulate it in this plot
              // by adding invisible points for each character (to get 'name on hover' behavior),
              // then adding an image on top of each point
              <Plot
                onClick={(e) => {
                  store.getState().setScoringAlgorithmFocusCharacter(e.points[0].data.cid[e.points[0].pointIndex])
                  window.setIsScoringModalOpen(true)
                }}
                data={[
                  // Add fake data in each category to make sure we don't elide any categories - that would
                  // mess up our image placement
                  {
                    type: 'scatter',
                    x: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    y: ['0%+', '10%+', '20%+', '30%+', '40%+', '50%+', '60%+', '70%+', '80%+', '90%+'],
                    hoverinfo: 'skip',
                    mode: 'markers',
                    marker: {
                      color: 'rgba(0, 0, 0, 0)',
                      symbol: 'circle',
                      size: 16,
                    },
                  },
                  {
                    type: 'scatter',
                    hoverinfo: 'text',
                    mode: 'markers',
                    x: scoreBuckets.flatMap((bucket, _bucketIdx) =>
                      bucket.map((_score, idx) => idx + 0.5)),
                    y: scoreBuckets.flatMap((bucket, bucketIdx) =>
                      bucket.map((_score, _idx) => (bucketIdx * 10) + '%+')),
                    hovertext: scoreBuckets.flatMap((bucket, _bucketIdx) =>
                      bucket.map((score, _idx) => [
                        score.name,
                        (score.score.meta.bestAddedStats.length === 0
                          ? ''
                          : t('relicinsights.newstats') + score.score.meta.bestAddedStats.join(' / ')),
                        (score.score.meta.bestUpgradedStats == null
                          ? ''
                          : t('relicinsights.upgradedstats') + score.score.meta.bestUpgradedStats.join(' / ')),
                      ].filter((t) => t !== '').join('<br>')),
                    ),
                    cid: scoreBuckets.flatMap((bucket, _bucketIdx) =>
                      bucket.map((score, idx) => score.cid)),
                    marker: {
                      color: 'rgba(0, 0, 0, 0)', // change to 1 to see backing points
                      symbol: 'circle',
                      size: 16,
                    },
                  },
                ]}
                layout={{
                  plot_bgcolor: 'rgba(0, 0, 0, 0)',
                  paper_bgcolor: token.colorBgContainer,
                  font: {
                    color: 'rgba(255, 255, 255, 0.85)',
                  },
                  autosize: true,
                  height: 278,
                  width: 1112,
                  margin: {
                    b: 5,
                    l: 50,
                    r: 20,
                    t: 0,
                  },
                  hovermode: 'closest',
                  hoverdistance: 20,
                  showlegend: false,
                  images: scoreBuckets.flatMap((bucket, bucketIdx) =>
                    bucket.map((score, idx) => ({
                      source: Assets.getCharacterAvatarById(score.cid),
                      xref: 'x',
                      yref: 'y',
                      x: idx + 0.6,
                      y: bucketIdx,
                      sizex: 1,
                      sizey: 1,
                      xanchor: 'center',
                      yanchor: 'middle',
                    })),
                  ),
                  xaxis: {
                    fixedrange: true,
                    range: [0, Math.max(...scoreBuckets.map((sb) => sb.length)) + 1],
                    tick0: 0,
                    showgrid: false,
                    showticklabels: false,
                    type: 'linear',
                    zeroline: false,
                  },
                  yaxis: {
                    fixedrange: true,
                    showticklabels: true,
                    gridcolor: 'rgba(128, 128, 128, 0.15)',
                  },
                }}
                config={{
                  displayModeBar: false,
                  editable: false,
                  scrollZoom: false,
                }}
              />
            )}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}
RelicsTab.propTypes = {
  active: PropTypes.bool,
}

function cvValueGetter(params) {
  return params.data.augmentedStats[Stats.CR] * 2 + params.data.augmentedStats[Stats.CD]
}
