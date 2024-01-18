import React, { useCallback, useMemo, useRef, useState } from 'react';
import OptimizerForm from './OptimizerForm'
import { Flex, } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import { OptimizerTabController } from '../lib/optimizerTabController';
import OptimizerBuildPreview from './OptimizerBuildPreview';
import "../style/style.css";
import { Renderer } from '../lib/renderer';
import Sidebar from "./optimizerTab/Sidebar";
import PropTypes from "prop-types";
import { Constants } from "../lib/constants";
import { Gradient } from "../lib/gradient";

export default function OptimizerTab(props) {
  console.log('OptimizerTab', props)
  const optimizerGrid = useRef();
  window.optimizerGrid = optimizerGrid;

  const [optimizerBuild, setOptimizerBuild] = useState();
  window.setOptimizerBuild = setOptimizerBuild;

  const cellClickedListener = useCallback(event => {
    OptimizerTabController.cellClicked(event)
  }, []);

  const DIGITS_4 = 50;
  const DIGITS_5 = 60;

  const statDisplay = global.store(s => s.statDisplay)

  let baseColumnDefs = [
    {field: 'relicSetIndex', cellRenderer: Renderer.relicSet, width: 70, headerName: 'Set'},
    {field: 'ornamentSetIndex', cellRenderer: Renderer.ornamentSet, width: 50, headerName: 'Set'},

    {field: Constants.Stats.ATK, valueFormatter: Renderer.floor, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.DEF, valueFormatter: Renderer.floor, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.HP,  valueFormatter: Renderer.floor, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.SPD, valueFormatter: Renderer.tenths, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.CR,  valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'CR', cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.CD,  valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'CD', cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.EHR, valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'EHR', cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.RES, valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'RES', cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.BE,  valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'BE', cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.ERR, valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'ERR'},
    {field: Constants.Stats.OHB, valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'HEAL'},

    {field: 'ED',      valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'ELEM'},
    {field: 'CV',      valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'CV'},
    {field: 'EHP',     valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'EHP'},
    {field: 'WEIGHT',  valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'WEIGHT'},

    {field: 'BASIC', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'BASIC'},
    {field: 'SKILL', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'SKILL'},
    {field: 'ULT',   valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'ULT'},
    {field: 'FUA',   valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'FUA'},
    {field: 'DOT',   valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'DOT'},
  ]

  let combatColumnDefs = [
    {field: 'relicSetIndex', cellRenderer: Renderer.relicSet, width: 70, headerName: 'Set'},
    {field: 'ornamentSetIndex', cellRenderer: Renderer.ornamentSet, width: 50, headerName: 'Set'},

    {field: 'xATK', valueFormatter: Renderer.floor, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient, headerName: 'Σ ATK'},
    {field: 'xDEF', valueFormatter: Renderer.floor, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient, headerName: 'Σ DEF'},
    {field: 'xHP',  valueFormatter: Renderer.floor, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient, headerName: 'Σ HP'},
    {field: 'xSPD', valueFormatter: Renderer.floor, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient, headerName: 'Σ SPD'},
    {field: 'xCR',  valueFormatter: Renderer.x100Tenths, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient, headerName: 'Σ CR'},
    {field: 'xCD',  valueFormatter: Renderer.x100Tenths, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient, headerName: 'Σ CD'},
    {field: 'xEHR', valueFormatter: Renderer.x100Tenths, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient, headerName: 'Σ EHR'},
    {field: 'xRES', valueFormatter: Renderer.x100Tenths, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient, headerName: 'Σ RES'},
    {field: 'xBE',  valueFormatter: Renderer.x100Tenths, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient, headerName: 'Σ BE'},
    {field: 'xERR', valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'Σ ERR'},
    {field: 'xOHB', valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'Σ HEAL'},

    {field: 'xELEMENTAL_DMG',  valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'Σ ELEM'},
    {field: 'CV',  valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'CV'},
    {field: 'EHP', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'EHP'},
    {field: 'WEIGHT',  valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'WEIGHT'},

    {field: 'BASIC', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'BASIC'},
    {field: 'SKILL', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'SKILL'},
    {field: 'ULT',   valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'ULT'},
    {field: 'FUA',   valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'FUA'},
    {field: 'DOT',   valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'DOT'},
  ]

  const columnDefs = useMemo(() => statDisplay == 'combat' ? combatColumnDefs : baseColumnDefs, [statDisplay]);

  const datasource = useMemo(() => {
    return OptimizerTabController.getDataSource();
  }, []);

  const gridOptions = useMemo(() => ({
    rowHeight: 33,
    pagination: true,
    rowSelection: 'single',
    rowModelType: 'infinite',
    datasource: datasource,
    paginationPageSize: 500,
    paginationPageSizeSelector: [100, 500, 1000],
    cacheBlockSize: 500,
    suppressDragLeaveHidesColumns: true,
    suppressScrollOnNewData: true,
    suppressCellFocus: true
  }), []);

  const defaultColDef = useMemo(() => ({
    cellStyle: Gradient.getOptimizerColumnGradient,
    sortable: true,
    sortingOrder: ['desc', 'asc']
  }), []);

  return (
    <div style={{display: props.active ? 'block' : 'none'}}>
      <Flex style={{marginBottom: 10}}>
        <Flex vertical gap={10}>
          <OptimizerForm/>

          <Flex>
            <div id="optimizerGridContainer" className="ag-theme-balham-dark" style={{width: 1225, minHeight: 300, height: 600, resize: 'vertical', overflow: 'hidden'}}>
              <AgGridReact
                ref={optimizerGrid}

                gridOptions={gridOptions}

                columnDefs={columnDefs}
                defaultColDef={defaultColDef}

                animateRows={false}
                rowSelection='single'
                headerHeight={24}

                onCellClicked={cellClickedListener}
              />
            </div>
          </Flex>

          <OptimizerBuildPreview build={optimizerBuild}/>
        </Flex>

        <Sidebar />
      </Flex>
    </div>
  );
}
OptimizerTab.propTypes = {
  active: PropTypes.bool,
}
