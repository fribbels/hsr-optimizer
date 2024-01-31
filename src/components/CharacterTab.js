import React, { useCallback, useMemo, useRef, useState } from 'react';

import { Button, Dropdown, Flex, Image, Modal, Typography } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import "ag-grid-community/styles/ag-theme-balham.css";
import DB from '../lib/db';
import { CharacterPreview } from './CharacterPreview';
import { Assets } from "../lib/assets";
import { SaveState } from "../lib/saveState";
import { Message } from "../lib/message";
import PropTypes from "prop-types";
import { useSubscribe } from 'hooks/useSubscribe';
import { CameraOutlined, DownOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import CharacterModal from "./CharacterModal";
import { Utils } from "../lib/utils";

const { Text } = Typography;

function cellImageRenderer(params) {
  let data = params.data
  let characterIconSrc = Assets.getCharacterAvatarById(data.id)

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

  return (
    <Text style={{ height: '100%' }}>
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
    <Flex align='center' justify='flex-start' style={{ height: '100%', width: '100%' }}>
      <Text style={{ margin: 'auto', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', textWrap: 'wrap', fontSize: 14, width: '100%', lineHeight: '18px' }}>
        {characterName}
      </Text>
      <Flex style={{ display: 'block', width: 3, height: '100%', backgroundColor: color }}>

      </Flex>
    </Flex>
  )
}

export default function CharacterTab() {
  const [confirmationModal, contextHolder] = Modal.useModal();
  const [screenshotLoading, setScreenshotLoading] = useState(false);

  const [isCharacterModalOpen, setCharacterModalOpen] = useState(false);
  const [characterModalInitialCharacter, setCharacterModalInitialCharacter] = useState();

  console.log('CharacterTab');

  useSubscribe('refreshRelicsScore', () => {
    // TODO: understand why setTimeout is needed and refactor
    setTimeout(() => { window.forceCharacterTabUpdate() }, 100);
  });

  const characterGrid = useRef(); // Optional - for accessing Grid's API
  window.characterGrid = characterGrid;

  const [characterRows, setCharacterRows] = React.useState(DB.getCharacters());
  window.setCharacterRows = setCharacterRows;

  const characterTabFocusCharacter = global.store(s => s.characterTabFocusCharacter);
  const setCharacterTabFocusCharacter = global.store(s => s.setCharacterTabFocusCharacter);
  const setOptimizerTabFocusCharacter = global.store(s => s.setOptimizerTabFocusCharacter);
  const setScoringAlgorithmFocusCharacter = global.store(s => s.setScoringAlgorithmFocusCharacter);
  const charactersById = global.store(s => s.charactersById)
  const selectedCharacter = charactersById[characterTabFocusCharacter]

  const [, forceUpdate] = React.useReducer(o => !o);
  window.forceCharacterTabUpdate = () => {
    console.log('__________ CharacterTab forceCharacterTabUpdate')
    forceUpdate()

    // no charGrid in scorer tab
    if (characterGrid?.current?.api?.redrawRows) {
      characterGrid.current.api.redrawRows()
    } else {
      console.log('@forceCharacterTabUpdate: No characterGrid.current.api')
    }
  }

  const columnDefs = useMemo(() => [
    { field: '', headerName: 'Icon', cellRenderer: cellImageRenderer, width: 52 },
    { field: '', headerName: 'Rank', cellRenderer: cellRankRenderer, width: 50, rowDrag: true },
    { field: '', headerName: 'Character', flex: 1, cellRenderer: cellNameRenderer },
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
    cellStyle: { display: 'flex' }
  }), []);

  const cellClickedListener = useCallback(event => {
    let data = event.data

    // Only blur if different character
    global.store.getState().setCharacterTabBlur(global.store.getState().characterTabFocusCharacter != data.id)
    setCharacterTabFocusCharacter(data.id)
    console.log(`@CharacterTab::setCharacterTabFocusCharacter - [${data.id}]`, event.data);
  }, [setCharacterTabFocusCharacter]);

  // TODO: implement routing to handle this
  const setActiveKey = global.store(s => s.setActiveKey);

  const cellDoubleClickedListener = useCallback(e => {
    // setSelectedChar
    setOptimizerTabFocusCharacter(e.data.id);
    // set view
    setActiveKey('optimizer');
    console.log(`@CharacterTab.cellDoubleClickedListener::setOptimizerTabFocusCharacter - focus [${e.data.id}]`, e.data);
  }, [setActiveKey, setOptimizerTabFocusCharacter]);

  function drag(event, index) {
    const dragged = event.node.data;
    DB.insertCharacter(dragged.id, index);
    SaveState.save()
    characterGrid.current.api.redrawRows()
  }

  const onRowDragEnd = useCallback(event => {
    drag(event, event.overIndex)
  }, []);

  // The grid can do weird things when you drag rows beyond its bounds, cap the behavior
  const onRowDragLeave = useCallback(event => {
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
    setCharacterTabFocusCharacter(undefined)
    if (global.relicsGrid?.current?.api) {
      global.relicsGrid.current.api.redrawRows()
    }

    SaveState.save()

    Message.success('Successfully removed character')
  }

  function unequipClicked() {
    console.log('unequipClicked', DB.getCharacterById(characterTabFocusCharacter))

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
    global.relicsGrid.current.api.redrawRows()

    SaveState.save()
  }

  // Reuse the same modal for both edit/add and scroll to the selected character
  function onCharacterModalOk(form) {
    if (!form.characterId) {
      return Message.error('No selected character')
    }

    const character = DB.addFromForm(form)
    global.characterGrid.current.api.ensureIndexVisible(character.rank)
  }

  function scoringAlgorithmClicked() {
    setScoringAlgorithmFocusCharacter(characterTabFocusCharacter)
    global.setIsScoringModalOpen(true)
  }

  function screenshotClicked() {
    setScreenshotLoading(true)
    // Use a small timeout here so the spinner doesn't lag while the image is being generated
    setTimeout(() => {
      Utils.screenshotElementById('characterTabPreview').finally(() => {
        setScreenshotLoading(false)
      })
    }, 50)
  }

  const handleActionsMenuClick = async (e) => {
    switch(e.key) {
      case 'add':
        setCharacterModalInitialCharacter(null)
        setCharacterModalOpen(true)
        break;
      case 'edit':
        if (!selectedCharacter) {
          Message.error('No selected character')
          return;
        }
        setCharacterModalInitialCharacter(selectedCharacter)
        setCharacterModalOpen(true)
        break;
      case 'unequip':
        if (!selectedCharacter) {
          Message.error('No selected character')
          return;
        }

        if (!await confirm('Are you sure you want to unequip this character?')) return;
        unequipClicked();
        break;
      case 'delete':
        if (!selectedCharacter) {
          Message.error('No selected character')
          return;
        }

        if (!await confirm('Are you sure you want to delete this character?')) return;
        removeClicked()
        break;
      default:
        console.error(`Unknown key ${e.key} in handleActionsMenuClick`)
    }
  };
  const items = [
    {
      label: 'Add new character',
      key: 'add',
    },
    {
      label: 'Edit character',
      key: 'edit',
    },
    {
      label: 'Unequip character',
      key: 'unequip',
    },
    {
      label: 'Delete character',
      key: 'delete',
    },
  ];
  const actionsMenuProps = {
    items,
    onClick: handleActionsMenuClick,
  };

  async function confirm(content) {
    return confirmationModal.confirm({
      title: 'Confirm',
      icon: <ExclamationCircleOutlined/>,
      content: content,
      okText: 'Confirm',
      cancelText: 'Cancel',
      centered: true
    });
  }

  let defaultGap = 8;
  let parentH = 280 * 3 + defaultGap * 2;

  return (
    <div style={{
        height: '100%'
    }}>
      <Flex style={{ height: '100%' }}>
        <Flex vertical gap={10} style={{ marginRight: 8 }}>
          <div id="characterGrid" className="ag-theme-balham-dark" style={{ display: 'block', width: 230, height: parentH - 85 }}>
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
              onCellDoubleClicked={cellDoubleClickedListener}
              onRowDragEnd={onRowDragEnd}
              onRowDragLeave={onRowDragLeave}
            />
          </div>
          <Flex vertical gap={10}>
            <Flex justify='space-between'>
              <Dropdown
                menu={actionsMenuProps}
                trigger={['click']}
              >
                <Button style={{ width: 110 }}>
                  Actions
                  <DownOutlined />
                </Button>
              </Dropdown>
              <Button style={{ width: 110 }} onClick={scoringAlgorithmClicked}>
                Scoring
              </Button>
            </Flex>
            <Flex>
              <Button style={{ width: '100%' }} icon={<CameraOutlined />} onClick={screenshotClicked} type='primary' loading={screenshotLoading}>
                Screenshot
              </Button>
            </Flex>
          </Flex>
        </Flex>
        <CharacterPreview id='characterTabPreview' character={selectedCharacter} />
      </Flex>
      <CharacterModal onOk={onCharacterModalOk} open={isCharacterModalOpen} setOpen={setCharacterModalOpen} initialCharacter={characterModalInitialCharacter} />
      {contextHolder}
    </div>
  );
}
CharacterTab.propTypes = {
  active: PropTypes.bool,
};