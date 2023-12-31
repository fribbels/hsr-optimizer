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

export default function OptimizerTab({style}) {
  const optimizerGrid = useRef();
  window.optimizerGrid = optimizerGrid;

  const [optimizerBuild, setOptimizerBuild] = useState();
  window.setOptimizerBuild = setOptimizerBuild;

  const cellClickedListener = useCallback(event => {
    OptimizerTabController.cellClicked(event)
  }, []);

  const DIGITS_2 = 30;
  const DIGITS_3 = 34;
  const DIGITS_4 = 47;
  const DIGITS_5 = 55;
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


  const columnDefs = useMemo(() => [
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
    // {field: 'DMG', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'DMG'},
    // {field: 'MCD', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'MCD'},
    {field: 'EHP', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'EHP'},

    {field: 'BASIC', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'BASIC'},
    {field: 'SKILL', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'SKILL'},
    {field: 'ULT',   valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'ULT'},
    {field: 'FUA',   valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'FUA'},
    {field: 'DOT',   valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'DOT'},

    {field: 'xATK', valueFormatter: Renderer.floor, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient},
    {field: 'xDEF', valueFormatter: Renderer.floor, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient},
    {field: 'xHP',  valueFormatter: Renderer.floor, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient},
    {field: 'xSPD', valueFormatter: Renderer.floor, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient},
    {field: 'xCR',  valueFormatter: Renderer.x100Tenths, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient},
    {field: 'xCD',  valueFormatter: Renderer.x100Tenths, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient},
    {field: 'xEHR', valueFormatter: Renderer.x100Tenths, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient},
    {field: 'xRES', valueFormatter: Renderer.x100Tenths, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient},
    {field: 'xBE',  valueFormatter: Renderer.x100Tenths, width: DIGITS_4, cellStyle: Gradient.getOptimizerColumnGradient},
    {field: 'xERR', valueFormatter: Renderer.x100Tenths, width: DIGITS_4},
    {field: 'xOHB', valueFormatter: Renderer.x100Tenths, width: DIGITS_4},
    {field: 'xELEMENTAL_DMG',  valueFormatter: Renderer.x100Tenths, width: DIGITS_5},
    {field: 'xBASIC_BOOST',  valueFormatter: Renderer.x100Tenths, width: DIGITS_5, headerName: '+%BASIC'},
    {field: 'xSKILL_BOOST',  valueFormatter: Renderer.x100Tenths, width: DIGITS_5, headerName: '+%SKILL'},
    {field: 'xULT_BOOST',  valueFormatter: Renderer.x100Tenths, width: DIGITS_5, headerName: '+%ULT'},
    {field: 'xFUA_BOOST',  valueFormatter: Renderer.x100Tenths, width: DIGITS_5, headerName: '+%FUA'},
    {field: 'xDOT_BOOST',  valueFormatter: Renderer.x100Tenths, width: DIGITS_5, headerName: '+%DOT'},

  ], []);

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
    <div style={style}>
      <Flex style={{marginBottom: 10}}>
        <Flex vertical gap={10}>
          <OptimizerForm/>

          <Flex>
            <div id="optimizerGridContainer" className="ag-theme-balham-dark" style={{width: 1225, height: 500}}>
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
