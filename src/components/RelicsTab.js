import styled from 'styled-components';
import { Button, Select, Modal, message, Avatar, Flex, Radio, Upload, Image, InputNumber, Segmented, Popconfirm } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import React, { useState, useRef, useEffect, useMemo, useCallback} from 'react';
import { AgGridReact } from 'ag-grid-react';

import RelicPreview from './RelicPreview';
import { Constants } from '../lib/constants';
import { HeaderText } from './HeaderText';
import RelicModal from './RelicModal';
import { Gradient } from '../lib/gradient';
import { Message } from '../lib/message';
import { TooltipImage } from './TooltipImage';


export default function RelicsTab({style}) {
  const gridRef = useRef();
  global.relicsGrid = gridRef;

  const [relicRows, setRelicRows] = useState(DB.getRelics());
  window.setRelicRows = setRelicRows

  const [selectedRelic, setSelectedRelic] = useState();

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  window.setEditModalOpen = setEditModalOpen
  window.setSelectedRelic = setSelectedRelic

  const columnDefs = useMemo(() => [
    { field: 'equippedBy', headerName: 'Owner', cellRenderer: Renderer.characterIcon },
    {field: 'set', cellRenderer: Renderer.anySet, width: 50, headerName: 'Set', filter: 'agTextColumnFilter'},
    { field: 'part', valueFormatter: Renderer.readablePart, width: 100, filter: 'agTextColumnFilter' },
    { field: 'enhance', width: 60, filter: 'agNumberColumnFilter' },
    {field: 'main.stat', valueFormatter: Renderer.readableStat, headerName: 'Main', width: 100, filter: 'agTextColumnFilter'},
    {field: 'main.value', headerName: 'Value', valueFormatter: Renderer.mainValueRenderer, filter: 'agNumberColumnFilter'},
    {field: `augmentedStats.${Constants.Stats.HP}`, headerName: 'HP', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroes, filter: 'agNumberColumnFilter'},
    {field: `augmentedStats.${Constants.Stats.ATK}`, headerName: 'ATK', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroes, filter: 'agNumberColumnFilter'},
    {field: `augmentedStats.${Constants.Stats.DEF}`, headerName: 'DEF', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroes, filter: 'agNumberColumnFilter'},
    {field: `augmentedStats.${Constants.Stats.SPD}`, headerName: 'SPD', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroes, filter: 'agNumberColumnFilter'},
    {field: `augmentedStats.${Constants.Stats.ATK_P}`, headerName: 'ATK %', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter'},
    {field: `augmentedStats.${Constants.Stats.HP_P}`, headerName: 'HP %', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter'},
    {field: `augmentedStats.${Constants.Stats.DEF_P}`, headerName: 'DEF %', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter'},
    {field: `augmentedStats.${Constants.Stats.CR}`, headerName: 'CR', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter'},
    {field: `augmentedStats.${Constants.Stats.CD}`, headerName: 'CD', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter'},
    {field: `augmentedStats.${Constants.Stats.EHR}`, headerName: 'EHR', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter'},
    {field: `augmentedStats.${Constants.Stats.RES}`, headerName: 'RES', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter'},
    {field: `augmentedStats.${Constants.Stats.BE}`, headerName: 'BE', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.hideZeroesX100Tenths, filter: 'agNumberColumnFilter'},
    {field: `cs`, headerName: 'CScore', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.scoreRenderer, filter: 'agNumberColumnFilter'},
    {field: `ss`, headerName: 'SScore', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.scoreRenderer, filter: 'agNumberColumnFilter'},
    {field: `ds`, headerName: 'DScore', cellStyle: Gradient.getRelicGradient, valueFormatter: Renderer.scoreRenderer, filter: 'agNumberColumnFilter'},
  ], []);

  const gridOptions = useMemo(() => ({
    rowHeight: 33,
    rowSelection: 'single',
    suppressDragLeaveHidesColumns: true,
    suppressScrollOnNewData: true,
    suppressCellFocus: true
  }), []);

  const defaultColDef = useMemo( ()=> ({
    sortable: true,
    width: 50,
    headerClass: 'relicsTableHeader',
    sortingOrder: ['desc', 'asc']
  }), []);

  const cellClickedListener = useCallback( event => {
    console.log('cellClicked', event);
    setSelectedRelic(event.data)
  }, []);

  function onAddOk(relic) {
    DB.setRelic(relic)
    setRelicRows(DB.getRelics())
    SaveState.save()

    setSelectedRelic(relic)

    Message.success('Successfully added relic')
    console.log('onAddOk', relic)
  }

  function onEditOk(relic) {
    relic.id = selectedRelic.id

    const updatedRelic = {...selectedRelic, ...relic}

    if (updatedRelic.equippedBy) {
      DB.equipRelic(updatedRelic, updatedRelic.equippedBy)
    } else {
      DB.unequipRelic(updatedRelic);
    }

    DB.setRelic(updatedRelic)
    setRelicRows(DB.getRelics())
    SaveState.save()

    setSelectedRelic(updatedRelic)

    window.forceOptimizerBuildPreviewUpdate()
    window.forceCharacterTabUpdate()

    Message.success('Successfully edited relic')
    console.log('onEditOk', updatedRelic)
  }

  function editClicked(x) {
    console.log('edit clicked');
    setEditModalOpen(true)
  }
  
  function addClicked(x) {
    console.log('add clicked');
    setAddModalOpen(true)
  }
  
  function deleteClicked(x) {
    console.log('delete clicked');

    if (!selectedRelic) return Message.error('No relic selected')

    DB.deleteRelic(selectedRelic.id)
    setRelicRows(DB.getRelics())
    setSelectedRelic(undefined)
    SaveState.save()

    Message.success('Successfully deleted relic')
  }

  return (
    <Flex style={style}>
      <RelicModal selectedRelic={selectedRelic} type='add' onOk={onAddOk} setOpen={setAddModalOpen} open={addModalOpen} />
      <RelicModal selectedRelic={selectedRelic} type='edit' onOk={onEditOk} setOpen={setEditModalOpen} open={editModalOpen} />
      <Flex vertical gap={10}>
        <div id="relicGrid" className="ag-theme-balham-dark" style={{width: 1250, height: 500}}>

          <AgGridReact
              ref={gridRef} // Ref for accessing Grid's API

              rowData={relicRows} // Row Data for Rows
              gridOptions={gridOptions}

              columnDefs={columnDefs} // Column Defs for Columns
              defaultColDef={defaultColDef} // Default Column Properties

              animateRows={true} // Optional - set to 'true' to have rows animate when sorted
              headerHeight={24}
              rowSelection='multiple' // Options - allows click selection of rows

              onCellClicked={cellClickedListener} // Optional - registering for Grid Event
              />
        </div>
        <Flex gap={10}>
          <Button type="primary" onClick={editClicked} style={{width: '150px'}} >
            Edit Relic
          </Button>
          <Button type="primary" onClick={addClicked} style={{width: '150px'}} >
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
            <Button type="primary" style={{width: '150px'}} >
              Delete Relic
            </Button>
          </Popconfirm>
        </Flex>
        <Flex gap={10}>
          <RelicPreview relic={selectedRelic}/>
          <Flex style={{display: 'block'}}>
            <TooltipImage type={Hint.relics()}/>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};