import React, { useState, useRef, useEffect, useMemo, useCallback} from 'react';

import { Flex, Image, InputNumber, Space, Button, Divider, Typography, Popconfirm } from 'antd';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Optional theme CSS

import "ag-grid-community/styles/ag-theme-balham.css";
import "../style/style.css";
import DB from '../lib/db';
import { StatCalculator } from '../lib/statCalculator';
import styled from 'styled-components';
import RelicPreview from './RelicPreview';
import { StateEditor } from '../lib/stateEditor';

const { Text } = Typography;

const props = {
  name: 'file',
};

function cellImageRenderer(params) {
  let data = params.data
  let characterMetadata = DB.getMetadata().characters[data.id]
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
  let characterMetadata = DB.getMetadata().characters[data.id]
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
      <Text style={{ margin: 'auto', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', textWrap: 'wrap', fontSize: 14, lineHeight: '18px'}}>
        {characterName}
      </Text>
      <Flex style={{display: 'block', width: 3, height: '100%', backgroundColor: color}}>

      </Flex>
    </Flex>
  )
}

const StatText = styled(Text)`
  font-family: Segoe UI,Frutiger,Frutiger Linotype,Dejavu Sans,Helvetica Neue,Arial,sans-serif;
  font-size: 17px;
  font-weight: 400;
`

export default function CharacterTab({style}) {
  const characterGrid = useRef(); // Optional - for accessing Grid's API
  window.characterGrid = characterGrid;

  const [characterRows, setCharacterRows] = React.useState(DB.getCharacters());
  window.setCharacterRows = setCharacterRows;

  const [selectedCharacter, setSelectedCharacter] = useState();
  window.setSelectedCharacterPreview = setSelectedCharacter;


  const columnDefs = useMemo(() => [
    {field: '', headerName: 'Image', cellRenderer: cellImageRenderer, width: 52 },
    {field: '', headerName: 'Rank', cellRenderer: cellRankRenderer, width: 50, rowDrag: true, rowDragText: (params, dragItemCount) => {
      return params.rowNode.data.displayName;
    }},
    {field: '', headerName: 'Character', flex: 1, cellRenderer: cellNameRenderer},
  ], []);

  const gridOptions = useMemo(() => ({
    rowHeight: 50,
    rowSelection: 'single',
    rowDragEntireRow: true,
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

  const cellClickedListener = useCallback( event => {
    let data = event.data
    console.log('cellClicked', event);

    setSelectedCharacter(data)
  }, []);

  function drag(event, index) {
    const dragged = event.node.data;
    DB.insertCharacter(dragged.id, index);
    SaveState.save()
    characterGrid.current.api.redrawRows()
  }

  const onRowDragEnd = useCallback( event => {
    console.log('onRowDragEnd', event, event.overIndex);
    drag(event, event.overIndex)
  }, []);

  const onRowDragLeave = useCallback( event => {
    console.log('onRowDragLeave', event, event.overIndex);
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

    StateEditor.removeCharacter(id)
    setCharacterRows(DB.getCharacters())
    setSelectedCharacter(undefined)
    
    SaveState.save()
    // characterGrid.current.api.redrawRows()

    Message.success('Successfully removed character')
  }

  function unequipClicked() {
    let selectedNodes = characterGrid.current.api.getSelectedNodes()
    if (!selectedNodes || selectedNodes.length == 0) {
      return
    }

    let row = selectedNodes[0].data
    let id = row.id

    StateEditor.unequipCharacter(id);

    console.log('unequipClicked', DB.getCharacterById(selectedCharacter.id))

    characterGrid.current.api.redrawRows()
    setSelectedCharacter(JSON.parse(JSON.stringify(DB.getCharacterById(selectedCharacter.id))))
    
    SaveState.save()
    
    Message.success('Successfully unequipped character')
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

  function PortraitPanel(props) {
    let character = props.character
    if (!character) return ('')
    let finalStats = StatCalculator.calculate(selectedCharacter);

    console.log({finalStats})
    console.log({selectedCharacter})

    let lightConeId = selectedCharacter.form.lightCone
    let lightConeLevel = selectedCharacter.form.lightConeLevel
    let lightConeSuperimposition = selectedCharacter.form.lightConeSuperimposition
    let lightConeMetadata = DB.getMetadata().lightCones[lightConeId]
    let lightConeName = lightConeMetadata.name
    let lightConeSrc = Assets.getLightConePortrait(lightConeMetadata)

    let characterId = selectedCharacter.form.characterId
    let characterLevel = selectedCharacter.form.characterLevel
    let characterEidolon = selectedCharacter.form.characterEidolon
    let characterMetadata = DB.getMetadata().characters[characterId]
    let characterName = characterMetadata.displayName
    let characterPath = characterMetadata.path
    let characterElement = characterMetadata.element

    console.log('Level ' + characterLevel + ' E' + characterEidolon)
    console.log('Level ' + lightConeLevel + ' S' + lightConeSuperimposition)

    let elementToDmgValueMapping = {
      Physical: Constants.Stats.Physical_DMG,
      Fire: Constants.Stats.Fire_DMG,
      Ice: Constants.Stats.Ice_DMG,
      Thunder: Constants.Stats.Lightning_DMG,
      Wind: Constants.Stats.Wind_DMG,
      Quantum: Constants.Stats.Quantum_DMG,
      Imaginary: Constants.Stats.Imaginary_DMG,
    }
    let elementalDmgValue = elementToDmgValueMapping[characterElement]

    console.log({
      lightConeMetadata,
      characterMetadata
    })

    function StatRow(props) {
      let stat = props.stat
      let readableStat = stat.replace('DMG Boost', 'DMG')
      let value = finalStats[stat]
      if (Utils.isFlat(stat)) {
        value = Math.floor(value)
      } else {
        value = (value * 100).toFixed(1)
      }

      if (!finalStats) return console.log('No final stats');
      let iconSize = 25
      return (
        <Flex justify='space-between'>
          <img src={Assets.getStatIcon(stat)} style={{width: iconSize, height: iconSize, marginRight: 3}}></img>
          <StatText>{readableStat}</StatText>
          <Divider style={{margin: 'auto 10px', flexGrow: 1, width: 'unset', minWidth: 'unset'}} dashed/>
          <StatText>{`${value}${Utils.isFlat(stat) ? '' : '%'}`}</StatText>
        </Flex>
      )
    }

    function Rarity() {
      let children = []
      for (let i = 0; i < characterMetadata.rarity; i++) {
        children.push(
          <img src={Assets.getStar()} key={i} style={{width: 20, height: 20}}></img>
        )
      }
      return (
        <Flex gap={0} align='center'>
          {children}
        </Flex>
      )
    }

    return (
      <Flex style={{display: selectedCharacter ? 'flex' : 'none', height: parentH}} gap={defaultGap}>
        <div style={{ width: `${parentW}px`, height: `${parentH}px`, overflow: 'hidden', borderRadius: '10px'}}>
          <Image
            preview={false}
            width={innerW}
            src={Assets.getCharacterPortraitById(selectedCharacter.id)}
            style={{transform: `translate(${(innerW - parentW)/2/innerW * -100}%, ${(innerW - parentH)/2/innerW * -100}%)`}}
          />
        </div>

        <Flex gap={defaultGap}>
          <Flex vertical gap={defaultGap} align='center'>
            <Flex vertical style={{width: middleColumnWidth, height: 280 * 2 + defaultGap}} justify='space-between'>
              <Flex vertical gap={defaultGap}>
                <Flex justify='space-between' style={{height: 50}}>
                  <Image
                    preview={false}
                    width={50}
                    src={Assets.getElement(characterElement)}
                  />
                  <Rarity/>
                  <Image
                    preview={false}
                    width={50}
                    src={Assets.getPathFromClass(characterPath)}
                  />
                </Flex>
                <Flex vertical>
                  <StatText style={{fontSize: 24, fontWeight: 400, textAlign: 'center'}}>
                    {characterName}
                  </StatText>
                  <StatText style={{fontSize: 18, fontWeight: 400, textAlign: 'center'}}>
                    {`Lv${characterLevel} E${characterEidolon}`}
                  </StatText>
                </Flex>
              </Flex>
              <Flex vertical style={{width: middleColumnWidth, paddingLeft: 8, paddingRight: 8}} gap={5}>
                <StatRow stat={Constants.Stats.HP}/>
                <StatRow stat={Constants.Stats.ATK}/>
                <StatRow stat={Constants.Stats.DEF}/>
                <StatRow stat={Constants.Stats.SPD}/>
                <StatRow stat={Constants.Stats.CR}/>
                <StatRow stat={Constants.Stats.CD}/>
                <StatRow stat={Constants.Stats.EHR}/>
                <StatRow stat={Constants.Stats.RES}/>
                <StatRow stat={Constants.Stats.BE}/>
                <StatRow stat={elementalDmgValue}/>
              </Flex>
              <Flex vertical>
                <StatText style={{fontSize: 18, fontWeight: 400, textAlign: 'center'}} ellipsis={true}>
                  {lightConeName}
                </StatText>
                <StatText style={{fontSize: 18, fontWeight: 400, textAlign: 'center'}}>
                  {`Lv${lightConeLevel} S${lightConeSuperimposition}`}
                </StatText>
              </Flex>
            </Flex>
            <div style={{ width: `${lcParentW}px`, height: `${lcParentH}px`, overflow: 'hidden', borderRadius: '10px'}}>
              <img
                src={lightConeSrc}
                style={{width: lcInnerW, transform: `translate(${(lcInnerW - lcParentW)/2/lcInnerW * -100}%, ${(lcInnerH - lcParentH)/2/lcInnerH * -100}%)`}}
              />
            </div>
          </Flex>

          <Flex vertical gap={defaultGap}>
            <RelicPreview relic={selectedCharacter.equipped?.Head}/>
            <RelicPreview relic={selectedCharacter.equipped?.Body}/>
            <RelicPreview relic={selectedCharacter.equipped?.PlanarSphere}/>
          </Flex>

          <Flex vertical gap={defaultGap}>
            <RelicPreview relic={selectedCharacter.equipped?.Hands}/>
            <RelicPreview relic={selectedCharacter.equipped?.Feet}/>
            <RelicPreview relic={selectedCharacter.equipped?.LinkRope}/>
          </Flex>
        </Flex>
      </Flex>
    )
  }

  return (
    <div style={{
      ...style,
      ...{
        height: '100%'
      }
    }}>
      <Flex style={{height: '100%'}} gap={8}>
        <Flex vertical gap={10}>
          <div className="ag-theme-balham-dark" style={{display: 'block', width: 230, height: parentH - 55}}>
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
          <Flex justify='space-between'>
            
            <Popconfirm
              title="Confirm"
              description="Remove this character?"
              onConfirm={removeClicked}
              placement="bottom"
              okText="Yes"
              cancelText="Cancel"
            >
              <Button style={{width: 110}}>
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
              <Button style={{width: 110}}>
                Unequip
              </Button>
            </Popconfirm>
          </Flex>
        </Flex>
        <PortraitPanel character={selectedCharacter}/>
      </Flex>
    </div>
  );
}