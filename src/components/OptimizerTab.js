import React, { useState, useRef, useEffect, useMemo, useCallback} from 'react';

import OptimizerForm from './OptimizerForm'
import {
  Button,
  Cascader,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Slider,
  ConfigProvider,
  Space,
  Divider,
  Switch,
  Row,
  Col,
  Typography,
  message,
  Upload,
  Image,
  Flex,
  Modal, Affix,
} from 'antd';

import styled from 'styled-components';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import { OptimizerTabController } from '../lib/optimizerTabController';
import OptimizerBuildPreview from './OptimizerBuildPreview';

import "../style/style.css";
import { HeaderText } from './HeaderText';
import { Renderer } from '../lib/renderer';
import { TooltipImage } from './TooltipImage';
import { ErrorBoundary } from 'react-error-boundary';
import Sidebar from "./optimizerTab/Sidebar";

const { Text } = Typography;

export default function OptimizerTab(props) {
  console.log('OptimizerTab', props)
  const optimizerGrid = useRef();
  window.optimizerGrid = optimizerGrid;

  const [optimizerBuild, setOptimizerBuild] = useState();
  window.setOptimizerBuild = setOptimizerBuild;

  const cellClickedListener = useCallback(event => {
    OptimizerTabController.cellClicked(event)
  }, []);

  const DIGITS_2 = 30;
  const DIGITS_3 = 34;
  const DIGITS_4 = 50;
  const DIGITS_5 = 60;
  const DIGITS_6 = 48;

  // const columnDefs = useMemo(() => [
  //   {field: 'id', cellRenderer: Renderer.relicSet, width: 70, headerName: 'Set'},
  //   {field: 'id', cellRenderer: Renderer.ornamentSet, width: 50, headerName: 'Set'},

  //   {field: Constants.Stats.ATK, valueFormatter: Renderer.floor, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient},
  //   {field: Constants.Stats.DEF, valueFormatter: Renderer.floor, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient},
  //   {field: Constants.Stats.HP, valueFormatter: Renderer.floor, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient},
  //   {field: Constants.Stats.SPD, valueFormatter: Renderer.floor, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient},
  //   {field: Constants.Stats.CR, valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'CR', cellStyle: Gradient.getOptimizerColumnGradient},
  //   {field: Constants.Stats.CD, valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'CD', cellStyle: Gradient.getOptimizerColumnGradient},
  //   {field: Constants.Stats.EHR, valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'EHR', cellStyle: Gradient.getOptimizerColumnGradient},
  //   {field: Constants.Stats.RES, valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'RES', cellStyle: Gradient.getOptimizerColumnGradient},
  //   {field: Constants.Stats.BE, valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'BE', cellStyle: Gradient.getOptimizerColumnGradient},
  //   {field: Constants.Stats.ERR, valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'ERR'},
  //   {field: Constants.Stats.OHB, valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'HEAL'},
  //   {field: 'ED', valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'ELEM'},
  //   {field: 'CV', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'CV'},
  //   {field: 'DMG', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'DMG'},
  //   {field: 'MCD', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'MCD'},
  //   {field: 'EHP', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'EHP'},
  //   {field: 'EHP', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'EHP'},

  //   {field: 'basic', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'basic'},
  //   {field: 'skill', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'skill'},
  //   {field: 'ult', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'ult'},
  //   {field: 'fua', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'fua'},
  // ], []);


  const statDisplay = store(s => s.statDisplay)
  const setStatDisplay = store(s => s.setStatDisplay)

  let baseColumnDefs = [
    {field: 'id', cellRenderer: Renderer.relicSet, width: 70, headerName: 'Set'},
    {field: 'id', cellRenderer: Renderer.ornamentSet, width: 50, headerName: 'Set'},

    {field: Constants.Stats.ATK, valueFormatter: Renderer.floor, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.DEF, valueFormatter: Renderer.floor, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.HP,  valueFormatter: Renderer.floor, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.SPD, valueFormatter: Renderer.floor, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.CR,  valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'CR', cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.CD,  valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'CD', cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.EHR, valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'EHR', cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.RES, valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'RES', cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.BE,  valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'BE', cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.ERR, valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'ERR'},
    {field: Constants.Stats.OHB, valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'HEAL'},

    {field: 'ED',  valueFormatter: Renderer.x100Tenths, width: DIGITS_4, headerName: 'ELEM'},
    {field: 'CV',  valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'CV'},
    {field: 'EHP', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'EHP'},

    {field: 'BASIC', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'BASIC'},
    {field: 'SKILL', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'SKILL'},
    {field: 'ULT',   valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'ULT'},
    {field: 'FUA',   valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'FUA'},
    {field: 'DOT',   valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'DOT'},
  ]

  let combatColumnDefs = [
    {field: 'id', cellRenderer: Renderer.relicSet, width: 70, headerName: 'Set'},
    {field: 'id', cellRenderer: Renderer.ornamentSet, width: 50, headerName: 'Set'},

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

    {field: 'BASIC', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'BASIC'},
    {field: 'SKILL', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'SKILL'},
    {field: 'ULT',   valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'ULT'},
    {field: 'FUA',   valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'FUA'},
    {field: 'DOT',   valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'DOT'},
  ]



  // useEffect(() => {
  //   console.log('!!!!', optimizerGrid)
  //   if (!optimizerGrid.current || !optimizerGrid.current.api) return
  //
  //   if (statDisplay == 'combat') {
  //     optimizerGrid.current.api.setGridOption('columnDefs', combatColumnDefs)
  //   } else {
  //     optimizerGrid.current.api.setGridOption('columnDefs', baseColumnDefs)
  //   }
  // }, [statDisplay])

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

  let defaultGap = 5;

  return (
    <div style={{display: props.active ? 'block' : 'none'}}>
      <Flex style={{marginBottom: 10}}>
        <Flex vertical gap={10}>
          <OptimizerForm/>

          <Flex>
            <div id="optimizerGridContainer" className="ag-theme-balham-dark" style={{width: 1225, minHeight: 500, resize: 'vertical', overflow: 'hidden'}}>
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
