import React, { useState, useRef, useReducer, useEffect, useMemo, useCallback} from 'react';

import { Flex, Image, InputNumber, Space, Button, Divider, Typography, Popconfirm } from 'antd';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-balham.css";
import "../style/style.css";
import DB from '../lib/db';
import { StatCalculator } from '../lib/statCalculator';
import styled from 'styled-components';
import RelicPreview from './RelicPreview';
import { CharacterPreview } from './CharacterPreview';

const { Text } = Typography;

const props = {
  name: 'file',
};

function cellImageRenderer(params) {
  let data = params.data
  let characterIconSrc = Assets.getCharacterAvatarById(data.id)

  // console.log('CellRenderer', data, characterMetadata)
  return (
      <Image
        preview={false}
        width={50}
        src={characterIconSrc}
        style={{ flex: '0 0 auto', maxWidth: '100%', minWidth: 50 }}
      />
  )
}

function cellRankRenderer(params) {
  let data = params.data
  let character = DB.getCharacters().find(x => x.id == data.id)

  // console.log('CellRenderer', data, characterMetadata)
  return (
    <Text style={{ height: '100%'}}>
      {character.rank + 1}
    </Text>
  )
}

function cellNameRenderer(params) {
  let data = params.data
  let characterMetadata = DB.getMetadata().characters[data.id]
  let characterName = characterMetadata.displayName

  let equippedNumber = data.equipped ? Object.values(data.equipped).filter(x => x != undefined).length : 0
  // console.log('CellRenderer', equippedNumber, data, characterMetadata)
  let color = '#81d47e'
  if (equippedNumber < 6) color = '#eae084'
  if (equippedNumber < 1) color = '#d72f2f'
  

  return (
    <Flex align='center' justify='flex-start' style={{height: '100%', width: '100%'}}>
      <Text style={{ margin: 'auto', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', textWrap: 'wrap', fontSize: 14, width: '100%', lineHeight: '18px'}}>
        {characterName}
      </Text>
      <Flex style={{display: 'block', width: 3, height: '100%', backgroundColor: color}}>

      </Flex>
    </Flex>
  )
}


export default function CharacterTab(props) {
  const characterGrid = useRef(); // Optional - for accessing Grid's API
  window.characterGrid = characterGrid;

  const [characterRows, setCharacterRows] = React.useState(DB.getCharacters());
  window.setCharacterRows = setCharacterRows;

  let setSelectedScoringCharacter = store(s => s.setSelectedScoringCharacter);

  const characterTabSelectedId = store(s => s.characterTabSelectedId)
  const setCharacterTabSelectedId = store(s => s.setCharacterTabSelectedId)
  const charactersById = store(s => s.charactersById)
  const selectedCharacter = charactersById[characterTabSelectedId]

  const [, forceUpdate] = React.useReducer(o => !o);
  window.forceCharacterTabUpdate = () => {
    forceUpdate()
    characterGrid.current.api.redrawRows()
  }

  const columnDefs = useMemo(() => [
    {field: '', headerName: 'Icon', cellRenderer: cellImageRenderer, width: 52 },
    {field: '', headerName: 'Rank', cellRenderer: cellRankRenderer, width: 50, rowDrag: true, rowDragText: (params, dragItemCount) => {
      return params.rowNode.data.displayName;
    }},
    {field: '', headerName: 'Character', flex: 1, cellRenderer: cellNameRenderer},
  ], []);

  const gridOptions = useMemo(() => ({
    rowHeight: 50,
    rowSelection: 'single',
    rowDragManaged: true,
    animateRows: true,
    suppressDragLeaveHidesColumns: true,
    suppressScrollOnNewData: true,
    suppressCellFocus: true
  }), []);
  
  const defaultColDef = useMemo(() => ({
    sortable: false,
    cellStyle: {display: 'flex'}
  }), []);

  const cellClickedListener = useCallback(event => {
    console.log('cellClicked', event);
    let data = event.data

    store.getState().setCharacterTabBlur(store.getState().characterTabSelectedId == data.id ? false : true) // Only blur if different character
    setCharacterTabSelectedId(data.id)
  }, []);

  function drag(event, index) {
    const dragged = event.node.data;
    DB.insertCharacter(dragged.id, index);
    SaveState.save()
    characterGrid.current.api.redrawRows()
  }

  const onRowDragEnd = useCallback( event => {
    drag(event, event.overIndex)
  }, []);

  const onRowDragLeave = useCallback( event => {
    if (event.overIndex == 0) {
      drag(event, 0)
    } else if (event.overIndex == -1 && event.vDirection == 'down') {
      drag(event, DB.getCharacters().length)
    } else if (event.overIndex == -1 && event.vDirection == 'up') {
      drag(event, 0)
    } else {
      drag(event, event.overIndex)
    }
  }, []);

  function removeClicked() {
    let selectedNodes = characterGrid.current.api.getSelectedNodes()
    if (!selectedNodes || selectedNodes.length == 0) {
      return
    }

    let row = selectedNodes[0].data
    let id = row.id

    DB.removeCharacter(id)
    setCharacterRows(DB.getCharacters())
    setCharacterTabSelectedId(undefined)
    relicsGrid.current.api.redrawRows()
    
    SaveState.save()

    Message.success('Successfully removed character')
  }

  function unequipClicked() {
    console.log('unequipClicked', DB.getCharacterById(characterTabSelectedId))

    let selectedNodes = characterGrid.current.api.getSelectedNodes()
    if (!selectedNodes || selectedNodes.length == 0) {
      return
    }
    let row = selectedNodes[0].data
    let id = row.id

    DB.unequipCharacter(id);

    characterGrid.current.api.redrawRows()
    window.forceCharacterTabUpdate()
    Message.success('Successfully unequipped character')
    relicsGrid.current.api.redrawRows()

    SaveState.save()
  }

  function scoringAlgorithmClicked() {
    console.log('Scoring algorithm clicked', characterTabSelectedId)
    setSelectedScoringCharacter(characterTabSelectedId)
    setIsScoringModalOpen(true)
  }

  let defaultGap = 8;

  let parentH = 280 * 3 + defaultGap * 2;
  let parentW = 150 + 200 + defaultGap;
  let innerW = 1024;

  let middleColumnWidth = 240;
  let lcParentH = 280;
  let lcParentW = 230;
  let lcInnerW = 240;
  let lcInnerH = 1260/902 * lcInnerW;

  return (
    <div style={{
      ...{display: props.active ? 'block' : 'none'},
      ...{
        height: '100%'
      }
    }}>
      <Flex style={{height: '100%'}} gap={8}>
        <Flex vertical gap={10}>
          <div id="characterGrid" className="ag-theme-balham-dark" style={{display: 'block', width: 230, height: parentH - 85}}>
            <AgGridReact
              ref={characterGrid} // Ref for accessing Grid's API

              rowData={characterRows} // Row Data for Rows
              gridOptions={gridOptions}
              getRowNodeId={data => data.id}

              columnDefs={columnDefs} // Column Defs for Columns
              defaultColDef={defaultColDef} // Default Column Properties
              deltaRowDataMode={true}

              headerHeight={24}

              onCellClicked={cellClickedListener} // Optional - registering for Grid Event
              onRowDragEnd={onRowDragEnd}
              onRowDragLeave={onRowDragLeave}
              />
          </div>
          <Flex vertical gap={10}>
            <Flex justify='space-between'>

              <Popconfirm
                title="Confirm"
                description="Remove this character?"
                onConfirm={removeClicked}
                placement="bottom"
                okText="Yes"
                cancelText="Cancel"
              >
                <Button style={{ width: 110 }}>
                  Remove
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Confirm"
                description="Unequip this character?"
                onConfirm={unequipClicked}
                placement="bottom"
                okText="Yes"
                cancelText="Cancel"
              >
                <Button style={{ width: 110 }}>
                  Unequip
                </Button>
              </Popconfirm>
            </Flex>
            <Button style={{  }} onClick={scoringAlgorithmClicked}>
              Scoring algorithm
            </Button>
          </Flex>
        </Flex>
        <CharacterPreview character={selectedCharacter}/>
      </Flex>
    </div>
  );
}