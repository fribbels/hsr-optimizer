import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from "prop-types";
import { Flex, } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';

import OptimizerForm from 'components/OptimizerForm'
import OptimizerBuildPreview from 'components/OptimizerBuildPreview';
import { baseColumnDefs, combatColumnDefs, defaultColDef, gridOptions } from 'components/optimizerTab/constants';
import Sidebar from "components/optimizerTab/Sidebar";

import { OptimizerTabController } from 'lib/optimizerTabController';

export default function OptimizerTab(props) {
  console.log('======================================================================= RENDER OptimizerTab');
  console.log('OptimizerTab', props);
  const optimizerGrid = useRef();
  window.optimizerGrid = optimizerGrid;

  const [optimizerBuild, setOptimizerBuild] = useState();
  window.setOptimizerBuild = setOptimizerBuild;

  const cellClickedListener = useCallback(event => {
    OptimizerTabController.cellClicked(event)
  }, []);
  const statDisplay = global.store(s => s.statDisplay)
  const columnDefs = useMemo(() => statDisplay == 'combat' ? combatColumnDefs : baseColumnDefs, [statDisplay]);

  const datasource = useMemo(() => {
    return OptimizerTabController.getDataSource();
  }, []);
  gridOptions.datasource = datasource;


  return (
    <div style={{ display: props.active ? 'block' : 'none' }}>
      <Flex style={{ marginBottom: 10 }}>
        <Flex vertical gap={10}>
          <OptimizerForm />

          <Flex>
            <div id="optimizerGridContainer" className="ag-theme-balham-dark" style={{ width: 1225, minHeight: 300, height: 600, resize: 'vertical', overflow: 'hidden' }}>
              <AgGridReact
                animateRows={false}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                gridOptions={gridOptions}
                headerHeight={24}
                onCellClicked={cellClickedListener}
                ref={optimizerGrid}
                rowSelection='single'
              />
            </div>
          </Flex>

          <OptimizerBuildPreview build={optimizerBuild} />
        </Flex>

        <Sidebar />
      </Flex>
    </div>
  );
}
OptimizerTab.propTypes = {
  active: PropTypes.bool,
}
