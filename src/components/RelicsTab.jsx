import { Button, Flex, Popconfirm, Select, theme } from 'antd'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import Plot from 'react-plotly.js'

import RelicPreview from './RelicPreview'
import { Constants, Stats } from 'lib/constants'
import RelicModal from './RelicModal.tsx'
import { RelicScorer } from 'lib/relicScorer'
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

const { useToken } = theme
const GradeFilter = forwardRef((props, ref) => {
  const [model, setModel] = useState(null)

  const isFilterActive = useCallback(() => {
    return model != null && (model.grade.length > 0 || model.verified.length > 0)
  }, [model])

  // expose AG Grid Filter Lifecycle callbacks
  useImperativeHandle(ref, () => {
    return {
      doesFilterPass(params) {
        if (model.grade.length > 0) {
          if (!model.grade.includes(params.data.grade)) {
            return false
          }
        }

        if (model.verified.length > 0) {
          if (!model.verified.includes(params.data.verified ?? false)) {
            return false
          }
        }

        return true
      },

      isFilterActive,

      getModel() {
        return model
      },

      setModel(model) {
        setModel(model)
      },
    }
  })

  useEffect(() => {
    props.filterChangedCallback()
  }, [model, props])

  let filterMessage = 'No Filters Applied'
  if (isFilterActive()) {
    const gradeFilter = model.grade.length > 0 ? `Grade ${model.grade.sort().join(' or ')}` : null
    const verifiedFilter = model.verified.length > 0 ? `${model.verified.sort().reverse().map((x) => x ? 'Verified' : 'not Verified').join(' or ')}` : null

    const filters = [gradeFilter, verifiedFilter].filter((x) => x)
    filterMessage = `Filtering by ${filters.join(' and ')}`
  }

  return (
    <div style={{ padding: '8px' }}>
      {filterMessage}
    </div>
  )
})

GradeFilter.displayName = 'GradeFilter'
GradeFilter.propTypes = {
  filterChangedCallback: PropTypes.func,
}

const EquippedFilter = forwardRef((props, ref) => {
  const [model, setModel] = useState(null)

  const isFilterActive = useCallback(() => {
    return model != null && (model.equipped.length > 0)
  }, [model])

  useImperativeHandle(ref, () => {
    return {
      doesFilterPass(params) {
        if ([0, 2].includes(model.equipped.length)) return true
        if (model.equipped[0] && params.data.equippedBy != undefined) return true
        if (!model.equipped[0] && params.data.equippedBy == undefined) return true
        return false
      },

      isFilterActive,

      getModel() {
        return model
      },

      setModel(model) {
        setModel(model)
      },
    }
  })

  useEffect(() => {
    props.filterChangedCallback()
  }, [model, props])
})

EquippedFilter.displayName = 'EquippedFilter'
EquippedFilter.propTypes = {
  filterChangedCallback: PropTypes.func,
}

const PLOT_ALL = 'PLOT_ALL'
const PLOT_CUSTOM = 'PLOT_CUSTOM'

const relicInsightOptions = [
  { value: 'buckets', label: 'Relic Insight: Buckets' },
  { value: 'top10', label: 'Relic Insight: Top 10' },
]
const characterPlotOptions = [
  { value: PLOT_ALL, label: 'Show all characters' },
  { value: PLOT_CUSTOM, label: 'Show custom characters' },
]

export default function RelicsTab() {
  const { token } = useToken()

  // TODO: This is currently rerendering the whole tab on every relic click, revisit
  console.log('======================================================================= RENDER RelicsTab')
  const gridRef = useRef()
  window.relicsGrid = gridRef

  const [relicRows, setRelicRows] = useState(DB.getRelics())
  window.setRelicRows = setRelicRows

  const [selectedRelic, setSelectedRelic] = useState()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [plottedCharacterType, setPlottedCharacterType] = useState(PLOT_CUSTOM)
  const [relicInsight, setRelicInsight] = useState('buckets')

  const relicTabFilters = window.store((s) => s.relicTabFilters)

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
      grade: relicTabFilters.grade,
      verified: relicTabFilters.verified,
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

    filterModel.equipped = {
      equipped: relicTabFilters.equipped,
    }

    console.log('FilterModel', filterModel)

    // Apply to grid
    window.relicsGrid.current.api.setFilterModel(filterModel)
  }, [relicTabFilters])

  const valueColumnOptions = useMemo(() => [
    {
      label: 'Selected character',
      options: [
        { column: 'Selected Char\nScore', value: 'weights.current', label: 'Selected character: Score' },
        { column: 'Selected Char\nAvg Potential', value: 'weights.potentialSelected.averagePct', label: 'Selected character: Average potential', percent: true },
        { column: 'Selected Char\nMax Potential', value: 'weights.potentialSelected.bestPct', label: 'Selected character: Max potential', percent: true },
      ],
    },
    {
      label: 'Custom characters',
      options: [
        { column: 'Custom Chars\nAvg Potential', value: 'weights.potentialAllCustom.averagePct', label: 'Custom characters: Avg potential', percent: true },
        { column: 'Custom Chars\nMax Potential', value: 'weights.potentialAllCustom.bestPct', label: 'Custom characters: Max potential', percent: true },
      ],
    },
    {
      label: 'All characters',
      options: [
        { column: 'All Chars\nAvg Potential', value: 'weights.potentialAllAll.averagePct', label: 'All characters: Avg potential', percent: true },
        { column: 'All Chars\nMax Potential', value: 'weights.potentialAllAll.bestPct', label: 'All characters: Max potential', percent: true },
      ],
    },
    {
      label: 'Coming soon',
      options: [
        { column: 'All Chars\nMax Potential + Sets', disabled: true, value: 'weights.potentialAllSets', label: 'Relic / Ornament sets potential', percent: true },
      ],
    },
  ], [])

  const flatValueColumnOptions = useMemo(() => valueColumnOptions.flatMap((x) => x.options), [valueColumnOptions])

  const [valueColumns, setValueColumns] = useState(['weights.current', 'weights.potentialSelected.averagePct', 'weights.potentialSelected.bestPct', 'weights.potentialAllCustom.averagePct', 'weights.potentialAllCustom.bestPct'])

  const columnDefs = useMemo(() => [
    {
      field: 'equipped',
      filter: EquippedFilter,
      hide: true,
    },
    { field: 'equippedBy', headerName: 'Owner', width: 40, cellRenderer: Renderer.characterIcon },
    { field: 'set', cellRenderer: Renderer.anySet, width: 40, headerName: 'Set', filter: 'agTextColumnFilter' },
    {
      field: 'grade',
      width: 40,
      cellRenderer: Renderer.renderGradeCell,
      filter: GradeFilter,
      comparator: (a, b, nodeA, nodeB) => {
        if (a === b) {
          return (nodeA.data.verified ?? false) - (nodeB.data.verified ?? false)
        } else {
          return a - b
        }
      },
    },
    { field: 'part', valueFormatter: Renderer.readablePart, width: 55, filter: 'agTextColumnFilter' },
    { field: 'enhance', width: 55, filter: 'agNumberColumnFilter' },
    { field: 'main.stat', valueFormatter: Renderer.readableStat, headerName: 'Main\nStat', width: 70, filter: 'agTextColumnFilter' },
    { field: 'main.value', headerName: 'Main Value', width: 50, valueFormatter: Renderer.mainValueRenderer, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.HP_P}`, headerName: 'HP %', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.ATK_P}`, headerName: 'ATK %', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.DEF_P}`, headerName: 'DEF %', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.HP}`, headerName: 'HP', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesFloor, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.ATK}`, headerName: 'ATK', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesFloor, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.DEF}`, headerName: 'DEF', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesFloor, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.SPD}`, headerName: 'SPD', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroes10thsRelicTabSpd, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.CR}`, headerName: 'Crit\nRate', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.CD}`, headerName: 'Crit\nDMG', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.EHR}`, headerName: 'Effect\nHit Rate', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.RES}`, headerName: 'Effect\nRES', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.BE}`, headerName: 'Break\nEffect', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: 'cv', valueGetter: cvValueGetter, headerName: 'Crit\nValue', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
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
  ), [flatValueColumnOptions, valueColumns])

  const gridOptions = useMemo(() => ({
    rowHeight: 33,
    rowSelection: 'single',
    suppressDragLeaveHidesColumns: true,
    suppressScrollOnNewData: true,
    enableRangeSelection: false,
    suppressMultiSort: true,
  }), [])

  // headerTooltip
  const defaultColDef = useMemo(() => ({
    sortable: true,
    width: 46,
    headerClass: 'relicsTableHeader',
    sortingOrder: ['desc', 'asc'],
    filterParams: { maxNumConditions: 100 },
    wrapHeaderText: true,
    autoHeaderHeight: true,
    suppressHeaderMenuButton: true,
  }), [])

  const rowClickedListener = useCallback((event) => {
    console.log('rowClicked', event)
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

    Message.success('Successfully added relic')
    console.log('onAddOk', relic)
  }

  // DRY this up (CharacterPreview.js, OptimizerBuildPreview.js, RelicsTab.js)
  function onEditOk(relic) {
    const updatedRelic = RelicModalController.onEditOk(selectedRelic, relic)
    setSelectedRelic(updatedRelic)
  }

  function editClicked() {
    console.log('edit clicked')
    setEditModalOpen(true)
  }

  function addClicked() {
    console.log('add clicked')
    setAddModalOpen(true)
  }

  function deleteClicked() {
    console.log('delete clicked')

    if (!selectedRelic) return Message.error('No relic selected')

    DB.deleteRelic(selectedRelic.id)
    setRelicRows(DB.getRelics())
    setSelectedRelic(undefined)
    SaveState.save()

    Message.success('Successfully deleted relic')
  }

  const focusCharacter = window.store.getState().relicsTabFocusCharacter
  let score
  if (focusCharacter) {
    score = RelicScorer.score(selectedRelic, focusCharacter)
  }

  const numScores = 10
  const [scores, setScores] = useState(null)
  const [scoreBuckets, setScoreBuckets] = useState(null)
  useEffect(() => {
    if (selectedRelic) {
      const chars = DB.getMetadata().characters
      const excluded = window.store.getState().excludedRelicPotentialCharacters
      const allScores = Object.keys(chars)
        .filter((id) => !(plottedCharacterType === PLOT_CUSTOM && excluded.includes(id)))
        .map((id) => ({
          cid: id,
          name: chars[id].displayName,
          score: RelicScorer.scoreRelicPct(selectedRelic, id, true),
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
  }, [plottedCharacterType, selectedRelic])

  return (
    <Flex style={{ width: 1350, marginBottom: 100 }}>
      <RelicModal selectedRelic={selectedRelic} type="add" onOk={onAddOk} setOpen={setAddModalOpen} open={addModalOpen} />
      <RelicModal selectedRelic={selectedRelic} type="edit" onOk={onEditOk} setOpen={setEditModalOpen} open={editModalOpen} />
      <Flex vertical gap={10}>

        <RelicFilterBar setValueColumns={setValueColumns} valueColumns={valueColumns} valueColumnOptions={valueColumnOptions} />

        <div
          id="relicGrid" className="ag-theme-balham-dark" style={{
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
            rowSelection="single"

            pagination={true}
            paginationPageSizeSelector={false}
            paginationPageSize={2000}

            onRowClicked={rowClickedListener}
            onRowDoubleClicked={onRowDoubleClickedListener}
            navigateToNextCell={navigateToNextCell}
          />
        </div>
        <Flex gap={10}>
          <Button type="primary" onClick={editClicked} style={{ width: '150px' }}>
            Edit Relic
          </Button>
          <Button type="primary" onClick={addClicked} style={{ width: '150px' }}>
            Add New Relic
          </Button>
          <Popconfirm
            title="Confirm"
            description="Delete this relic?"
            onConfirm={deleteClicked}
            placement="bottom"
            okText="Yes"
            cancelText="Cancel"
          >
            <Button type="primary" style={{ width: '150px' }}>
              Delete Relic
            </Button>
          </Popconfirm>
          <Select
            value={plottedCharacterType}
            onChange={setPlottedCharacterType}
            options={characterPlotOptions}
            style={{ width: 210 }}
          />
          <Select
            value={relicInsight}
            onChange={setRelicInsight}
            options={relicInsightOptions}
            style={{ width: 210 }}
          />
          <Flex style={{ display: 'block' }}>
            <TooltipImage type={Hint.relicInsight()} />
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
            <TooltipImage type={Hint.relics()} />
          </Flex>

          {relicInsight === 'top10' && scores && (
            <Flex gap={10}>
              <Flex style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${token.colorBorderSecondary}` }}>
                <Plot
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
                          <li key={x.cid} style={x.owned ? { fontWeight: 'bold' } : undefined}>
                            {rect} {x.name}: {pctText}
                          </li>
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
                        (score.score.meta.bestNewSubstats.length === 0
                          ? ''
                          : 'New stats: ' + score.score.meta.bestNewSubstats.join(' / ')),
                        (score.score.meta.bestRolledSubstats == null
                          ? ''
                          : 'Upgraded stats: ' + score.score.meta.bestRolledSubstats.join(' / ')),
                      ].filter((t) => t !== '').join('<br>')),
                    ),
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
