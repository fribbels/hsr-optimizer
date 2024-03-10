import { Button, Flex, Popconfirm } from 'antd'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import Plot from 'react-plotly.js'

import RelicPreview from './RelicPreview'
import { Constants, Stats } from 'lib/constants'
import RelicModal from './RelicModal'
import { RelicScorer } from 'lib/relicScorer'
import { HeaderText } from './HeaderText'
import { Gradient } from 'lib/gradient'
import { Message } from 'lib/message'
import { TooltipImage } from './TooltipImage'
import RelicFilterBar from './RelicFilterBar'
import DB from '../lib/db'
import { Renderer } from 'lib/renderer'
import { SaveState } from 'lib/saveState'
import { Hint } from 'lib/hint'
import PropTypes from 'prop-types'
import { RelicModalController } from 'lib/relicModalController'
import { arrowKeyGridNavigation } from 'lib/arrowKeyGridNavigation'

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
    let gradeFilter = model.grade.length > 0 ? `Grade ${model.grade.sort().join(' or ')}` : null
    let verifiedFilter = model.verified.length > 0 ? `${model.verified.sort().reverse().map((x) => x ? 'Verified' : 'not Verified').join(' or ')}` : null

    let filters = [gradeFilter, verifiedFilter].filter((x) => x)
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

export default function RelicsTab() {
  // TODO: This is currently rerendering the whole tab on every relic click, revisit
  console.log('======================================================================= RENDER RelicsTab')
  const gridRef = useRef()
  window.relicsGrid = gridRef

  const [relicRows, setRelicRows] = useState(DB.getRelics())
  window.setRelicRows = setRelicRows

  const [selectedRelic, setSelectedRelic] = useState()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)

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

    console.log('FilterModel', filterModel)

    // Apply to grid
    window.relicsGrid.current.api.setFilterModel(filterModel)
  }, [relicTabFilters])

  const valueColumnOptions = useMemo(() => [
    { column: 'WEIGHT', value: 'weights.current', label: 'Weight' },
    { column: 'AVGCASE', value: 'weights.average', label: 'Weight: Average' },
    { column: 'BESTCASE', value: 'weights.best', label: 'Weight: Best' },
    { column: 'OPT A+A', value: 'weights.optimalityAllAll', label: 'Optimality: All Chars, Any Relics' },
    { column: 'OPT O+A', value: 'weights.optimalityOwnedAll', label: 'Optimality: Owned Chars, Any Relics' },
  ], [])

  const [valueColumns, setValueColumns] = useState(['weights.current', 'weights.average', 'weights.best'])

  const columnDefs = useMemo(() => [
    { field: 'equippedBy', headerName: 'Owner', cellRenderer: Renderer.characterIcon },
    { field: 'set', cellRenderer: Renderer.anySet, width: 50, headerName: 'Set', filter: 'agTextColumnFilter' },
    {
      field: 'grade',
      width: 60,
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
    { field: 'part', valueFormatter: Renderer.readablePart, width: 50, filter: 'agTextColumnFilter' },
    { field: 'enhance', width: 50, filter: 'agNumberColumnFilter' },
    { field: 'main.stat', valueFormatter: Renderer.readableStat, headerName: 'Main', width: 100, filter: 'agTextColumnFilter' },
    { field: 'main.value', headerName: 'Value', valueFormatter: Renderer.mainValueRenderer, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.HP_P}`, headerName: 'HP %', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.ATK_P}`, headerName: 'ATK %', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.DEF_P}`, headerName: 'DEF %', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.HP}`, headerName: 'HP', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesFloor, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.ATK}`, headerName: 'ATK', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesFloor, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.DEF}`, headerName: 'DEF', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesFloor, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.SPD}`, headerName: 'SPD', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroes10ths, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.CR}`, headerName: 'CR', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.CD}`, headerName: 'CD', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.EHR}`, headerName: 'EHR', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.RES}`, headerName: 'RES', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: `augmentedStats.${Constants.Stats.BE}`, headerName: 'BE', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    { field: 'cv', valueGetter: cvValueGetter, headerName: 'CV', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter' },
    /*
            ,
     * {field: `cs`, headerName: 'CScore', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.scoreRenderer, filter: 'agNumberColumnFilter'},
     * {field: `ss`, headerName: 'SScore', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.scoreRenderer, filter: 'agNumberColumnFilter'},
     * {field: `ds`, headerName: 'DScore', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.scoreRenderer, filter: 'agNumberColumnFilter'},
     */
  ].concat(valueColumns
    .map((vc) => {
      let i = valueColumnOptions.findIndex((x) => x.value === vc)
      return [i, valueColumnOptions[i]]
    })
    .sort((a, b) => a[0] - b[0])
    .map(([_i, field]) => (
      { field: field.value, headerName: field.column.toUpperCase(), cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideNaNAndRound, filter: 'agNumberColumnFilter', width: 60 }
    )),
  ), [valueColumnOptions, valueColumns])

  const gridOptions = useMemo(() => ({
    rowHeight: 33,
    rowSelection: 'single',
    suppressDragLeaveHidesColumns: true,
    suppressScrollOnNewData: true,
    enableRangeSelection: false,
    suppressMultiSort: true,
  }), [])

  const defaultColDef = useMemo(() => ({
    sortable: true,
    width: 45,
    headerClass: 'relicsTableHeader',
    sortingOrder: ['desc', 'asc'],
    filterParams: { maxNumConditions: 100 },
  }), [])

  const cellClickedListener = useCallback((event) => {
    console.log('cellClicked', event)
    setSelectedRelic(event.data)
  }, [])

  const onCellDoubleClickedListener = useCallback((e) => {
    console.log('cellDblClicked', e)
    setSelectedRelic(e.data)
    setEditModalOpen(true)
  }, [])

  const navigateToNextCell = useCallback((params) => {
    return arrowKeyGridNavigation(params, gridRef, (selectedNode) => cellClickedListener(selectedNode))
  }, [])

  function onAddOk(relic) {
    DB.setRelic(relic)
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

  const numScores = 10
  let scores /*: {
    cid: string
    name: string
    score: {
      bestPct: number
      averagePct: number
      worstPct: number
    }
    color: string
  }[] | null*/ = null
  if (selectedRelic) {
    const chars = DB.getMetadata().characters
    let s = Object.keys(chars)
      .map((id) => ({
        cid: id,
        name: chars[id].displayName,
        score: RelicScorer.scoreRelicPct(selectedRelic, id),
        color: '#000',
        owned: !!DB.getCharacterById(id),
      }))
    s.sort((a, b) => b.score.bestPct - a.score.bestPct)
    s = s.slice(0, numScores)
    s.forEach((x, idx) => {
      x.color = 'hsl(' + (idx * 360 / (numScores + 1)) + ',50%,50%)'
    })
    scores = s
  }

  return (
    <Flex style={{ width: 1250 }}>
      <RelicModal selectedRelic={selectedRelic} type="add" onOk={onAddOk} setOpen={setAddModalOpen} open={addModalOpen} />
      <RelicModal selectedRelic={selectedRelic} type="edit" onOk={onEditOk} setOpen={setEditModalOpen} open={editModalOpen} />
      <Flex vertical gap={10}>

        <RelicFilterBar setValueColumns={setValueColumns} valueColumns={valueColumns} valueColumnOptions={valueColumnOptions} />

        <div id="relicGrid" className="ag-theme-balham-dark" style={{ width: 1250, height: 500, resize: 'vertical', overflow: 'hidden' }}>

          <AgGridReact
            ref={gridRef}

            rowData={relicRows}
            gridOptions={gridOptions}

            columnDefs={columnDefs}
            defaultColDef={defaultColDef}

            animateRows={true}
            headerHeight={24}
            rowSelection="single"

            onCellMouseDown={cellClickedListener}
            onCellDoubleClicked={onCellDoubleClickedListener}
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
        </Flex>
        <Flex gap={10}>
          <RelicPreview
            relic={selectedRelic}
            setSelectedRelic={setSelectedRelic}
            setEditModalOpen={setEditModalOpen}
          />
          <Flex style={{ display: 'block' }}>
            <TooltipImage type={Hint.relics()} />
          </Flex>
          {scores && (
            <Flex vertical gap={5} style={{ width: 400 }}>
              <HeaderText>Relic Optimality %</HeaderText>
              Showing the best 10 characters for this relic (characters in bold are owned)
              <ol>
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
                      return (
                        <li key={x.cid} style={x.owned ? { fontWeight: 'bold' } : undefined}>
                          {rect} {x.name} - {Math.round(x.score.worstPct)}% to {Math.round(x.score.bestPct)}%
                        </li>
                      )
                    })
                }
              </ol>
              The plot below shows the worst, average and best case optimality when the relic is fully upgraded.
            </Flex>
          )}
          {scores && (
            <Plot
              data={
                scores.map((s) => ({
                  x: [s.score.averagePct],
                  y: [s.name],
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
                autosize: true,
                width: 320,
                height: 240,
                margin: {
                  b: 20,
                  l: 10,
                  r: 20,
                  t: 10,
                },
                showlegend: false,

                xaxis: {
                  range: [0, 100],
                  tick0: 0,
                  dtick: 10,
                  showgrid: true,
                  showline: true,
                  showticklabels: true,
                  type: 'linear',
                  zeroline: true,
                },
                yaxis: {
                  showticklabels: false,
                },
              }}
              config={{
                staticPlot: true,
              }}
            />
          )}
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
