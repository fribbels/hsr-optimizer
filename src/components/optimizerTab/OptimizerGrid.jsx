import { AgGridReact } from 'ag-grid-react'
import { baseColumnDefs, combatColumnDefs, defaultColDef } from 'components/optimizerTab/constants.tsx'
import { OptimizerTabController } from 'lib/optimizerTabController.js'
import React, { useMemo, useRef } from 'react'
import { Flex, Typography } from 'antd'
import { Stats, StatsToCompact } from 'lib/constants'
import { Utils } from 'lib/utils'
import VerticalDivider from 'components/VerticalDivider'

const lineHeight = '18px'
function ExpandedStatRow({ data, stat }) {
  let displayLabel = StatsToCompact[stat]
  if (!displayLabel) {
    displayLabel = stat
  }

  let displayValue = Utils.precisionRound(data[stat], 3)
  if (isNaN(displayValue)) {
    displayValue = ''
  }

  return (
    <Flex justify="space-between" style={{ width: 150 }}>
      <Typography.Text style={{ lineHeight: lineHeight }}>
        {displayLabel}
      </Typography.Text>

      <Typography.Text style={{ lineHeight: lineHeight }}>
        {displayValue}
      </Typography.Text>
    </Flex>
  )
}

const renderer = (x) => {
  console.log('!!!y')
  const data = x.node.data
  return (
    <Flex style={{ width: '100%', height: '100%', margin: 5 }} gap={1}>
      <Flex vertical>
        <ExpandedStatRow data={data} stat={Stats.ATK} />
        <ExpandedStatRow data={data} stat={Stats.DEF} />
        <ExpandedStatRow data={data} stat={Stats.HP} />
        <ExpandedStatRow data={data} stat={Stats.SPD} />
        <ExpandedStatRow data={data} stat={Stats.CR} />
        <ExpandedStatRow data={data} stat={Stats.CD} />
        <ExpandedStatRow data={data} stat={Stats.EHR} />
        <ExpandedStatRow data={data} stat={Stats.RES} />
        <ExpandedStatRow data={data} stat={Stats.BE} />
      </Flex>
      <VerticalDivider />
      <Flex vertical>
        <ExpandedStatRow data={data} stat="ED" />
        <ExpandedStatRow data={data} stat="CV" />
        <ExpandedStatRow data={data} stat="EHP" />
        <ExpandedStatRow data={data} stat="WEIGHT" />
        <ExpandedStatRow data={data} stat="BASIC" />
        <ExpandedStatRow data={data} stat="SKILL" />
        <ExpandedStatRow data={data} stat="ULT" />
        <ExpandedStatRow data={data} stat="FUA" />
        <ExpandedStatRow data={data} stat="DOT" />
      </Flex>
      <VerticalDivider />
      <Flex vertical>
        <ExpandedStatRow data={data} stat="column" />
      </Flex>
      <VerticalDivider />
      <Flex vertical>
        <ExpandedStatRow data={data} stat="column" />
      </Flex>
      <VerticalDivider />
      <Flex vertical>
        <ExpandedStatRow data={data} stat="column" />
      </Flex>
      <VerticalDivider />
      <Flex vertical>
        <ExpandedStatRow data={data} stat="column" />
      </Flex>
      <VerticalDivider />
      <Flex vertical>
        <ExpandedStatRow data={data} stat="column" />
      </Flex>
    </Flex>
  )
}

export function OptimizerGrid() {
  console.log('======================================================================= RENDER OptimizerGrid')
  let showOptimizerGridDetails = window.store((s) => s.showOptimizerGridDetails)

  const optimizerGrid = useRef()
  window.optimizerGrid = optimizerGrid

  const datasource = useMemo(() => {
    return OptimizerTabController.getDataSource()
  }, [])

  const statDisplay = window.store((s) => s.statDisplay)
  const columnDefs = useMemo(() => {
    return statDisplay == 'combat' ? combatColumnDefs : baseColumnDefs
  }, [statDisplay])

  const gridOptions = useMemo(() => {
    console.log('!!!z')
    return {
      pagination: true,
      rowHeight: 33,
      rowSelection: 'single',
      rowModelType: 'infinite',
      datasource: datasource,
      paginationPageSize: 500,
      paginationPageSizeSelector: [100, 500, 1000],
      cacheBlockSize: 500,
      maxBlocksInCache: 1,
      suppressDragLeaveHidesColumns: true,
      suppressScrollOnNewData: true,
      suppressMultiSort: true,
      suppressCellFocus: true,
    }
  }, [showOptimizerGridDetails])

  const x = useMemo(() => {
    console.log('!!!x')
    return (params) => params?.rowNode?.data?.fullWidth
  }, [showOptimizerGridDetails])

  // const rowHeight = useCallback((params) => {
  //   return params?.rowNode?.data?.fullWidth ? 200 : 33
  // }, [showOptimizerGridDetails])

  // TODO: I think these things need memos: https://www.ag-grid.com/react-data-grid/react-hooks/
  return (
    <Flex>
      <div id="optimizerGridContainer" className="ag-theme-balham-dark" style={{ width: 1225, minHeight: 300, height: 600, resize: 'vertical', overflow: 'hidden' }}>
        <AgGridReact
          animateRows={false}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          gridOptions={gridOptions}
          headerHeight={24}
          onCellClicked={OptimizerTabController.cellClicked}
          ref={optimizerGrid}
          rowSelection="single"
          isFullWidthRow={x}
          rowHeight={33}
          getRowHeight={(params) => {
            return params?.data?.fullWidth ? 200 : null
          }}
          fullWidthCellRenderer={renderer}
          pinnedBottomRowData={showOptimizerGridDetails}
        />
      </div>
    </Flex>
  )
}
