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
  Modal,
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

const { Text } = Typography;

export default function OptimizerTab({style}) {
  const optimizerGrid = useRef();
  window.optimizerGrid = optimizerGrid;

  const [optimizerBuild, setOptimizerBuild] = useState();
  window.setOptimizerBuild = setOptimizerBuild;

  const [optimizerPermutationSearched, setOptimizerPermutationSearched] = useState(0)
  const [optimizerPermutationResults, setOptimizerPermutationResults] = useState(0)
  const [optimizerPermutationDetails, setOptimizerPermutationDetails] = useState({
    Head: 0,
    Hands: 0,
    Body: 0,
    Feet: 0,
    PlanarSphere: 0,
    LinkRope: 0,
    HeadTotal: DB.getRelics().filter(x => x.part == Constants.Parts.Head).length,
    HandsTotal: DB.getRelics().filter(x => x.part == Constants.Parts.Hands).length,
    BodyTotal: DB.getRelics().filter(x => x.part == Constants.Parts.Body).length,
    FeetTotal: DB.getRelics().filter(x => x.part == Constants.Parts.Feet).length,
    PlanarSphereTotal: DB.getRelics().filter(x => x.part == Constants.Parts.PlanarSphere).length,
    LinkRopeTotal: DB.getRelics().filter(x => x.part == Constants.Parts.LinkRope).length,
    permutations: 0,
    searched: 0,
    results: 0
  });
  window.setOptimizerPermutationSearched = setOptimizerPermutationSearched
  window.setOptimizerPermutationResults = setOptimizerPermutationResults
  window.setOptimizerPermutationDetails = setOptimizerPermutationDetails

  const cellClickedListener = useCallback(event => {
    OptimizerTabController.cellClicked(event)
  }, []);

  const DIGITS_2 = 30;
  const DIGITS_3 = 34;
  const DIGITS_4 = 39;
  const DIGITS_5 = 59;
  const DIGITS_6 = 48;

  const columnDefs = useMemo(() => [
    {field: 'id', cellRenderer: Renderer.relicSet, width: 70, headerName: 'Set'},
    {field: 'id', cellRenderer: Renderer.ornamentSet, width: 50, headerName: 'Set'},

    {field: Constants.Stats.ATK, valueFormatter: Renderer.floor, width: DIGITS_5, cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.DEF, valueFormatter: Renderer.floor, width: DIGITS_5, cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.HP, valueFormatter: Renderer.floor, width: DIGITS_5, cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.SPD, valueFormatter: Renderer.floor, width: DIGITS_5, cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.CR, valueFormatter: Renderer.x100Tenths, width: DIGITS_5, headerName: 'CR', cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.CD, valueFormatter: Renderer.x100Tenths, width: DIGITS_5, headerName: 'CD', cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.EHR, valueFormatter: Renderer.x100Tenths, width: DIGITS_5, headerName: 'EHR', cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.RES, valueFormatter: Renderer.x100Tenths, width: DIGITS_5, headerName: 'RES', cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.BE, valueFormatter: Renderer.x100Tenths, width: DIGITS_5, headerName: 'BE', cellStyle: Gradient.getOptimizerColumnGradient},
    {field: Constants.Stats.ERR, valueFormatter: Renderer.x100Tenths, width: DIGITS_5, headerName: 'ERR'},
    {field: Constants.Stats.OHB, valueFormatter: Renderer.x100Tenths, width: DIGITS_5, headerName: 'OHB'},
    {field: 'ED', valueFormatter: Renderer.x100Tenths, width: DIGITS_5, headerName: 'ELEM'},
    {field: 'DMG', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'DMG'},
    {field: 'MCD', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'MCD'},
    {field: 'EHP', valueFormatter: Renderer.floor, width: DIGITS_5, headerName: 'EHP'},
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
      <Space direction='vertical'>
        <OptimizerForm/>
        
        <Flex>
          <div className="ag-theme-balham-dark" style={{width: 1035, height: 340}}>
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

          <Flex vertical gap={defaultGap} style={{ width: 200, marginLeft: 8}}>
            <Flex justify='space-between' align='center'>
              <HeaderText>Details</HeaderText>
              <TooltipImage type={Hint.optimizationDetails()}/>
            </Flex>
            
            <PermutationDisplayPanel 
              optimizerPermutationDetails={optimizerPermutationDetails} 
              searched={optimizerPermutationSearched} 
              results={optimizerPermutationResults}
            />
            
            <HeaderText>
              Build
            </HeaderText>

            <Flex gap={defaultGap} justify='space-around'>
              <Button type="primary" onClick={OptimizerTabController.equipClicked} style={{width: '100px'}} >
                Equip
              </Button>
            </Flex>
          </Flex>
        </Flex>

        <OptimizerBuildPreview build={optimizerBuild}/>
      </Space>
    </div>
  );
}

function PermutationDisplayPanel(props) {
  return (
    <Flex vertical>
      <PermutationDisplay left='Head' right={props.optimizerPermutationDetails.Head} total={props.optimizerPermutationDetails.HeadTotal}/>
      <PermutationDisplay left='Hands' right={props.optimizerPermutationDetails.Hands} total={props.optimizerPermutationDetails.HandsTotal}/>
      <PermutationDisplay left='Body' right={props.optimizerPermutationDetails.Body} total={props.optimizerPermutationDetails.BodyTotal}/>
      <PermutationDisplay left='Feet' right={props.optimizerPermutationDetails.Feet} total={props.optimizerPermutationDetails.FeetTotal}/>
      <PermutationDisplay left='Link Rope' right={props.optimizerPermutationDetails.LinkRope} total={props.optimizerPermutationDetails.LinkRopeTotal}/>
      <PermutationDisplay left='Planar Sphere' right={props.optimizerPermutationDetails.PlanarSphere} total={props.optimizerPermutationDetails.PlanarSphereTotal}/>
      <div style={{height: 10}}></div>
      <PermutationDisplay left='Perms' right={props.optimizerPermutationDetails.permutations}/>
      <PermutationDisplay left='Searched' right={props.searched}/>
      <PermutationDisplay left='Results' right={props.results}/>
    </Flex>
  )
}

function PermutationDisplay(props) {
  let rightText = props.total 
    ? `${Number(props.right).toLocaleString()} / ${Number(props.total).toLocaleString()}`
    : `${Number(props.right).toLocaleString()}`

  return (
    <Flex justify='space-between'>
      <Text style={{lineHeight: '24px'}}>
        {props.left} 
      </Text>
      <Divider style={{margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset'}} dashed/>
      <Text style={{lineHeight: '24px'}}>
        {rightText}
      </Text>
    </Flex>
  )
}
