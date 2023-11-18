import React from 'react';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import OptimizerTab from './OptimizerTab'
import ImportTab from './ImportTab'
import RelicsTab from './RelicsTab'
import CharacterTab from './CharacterTab';

const Tabs = ({activeKey}) => {
  return (
    <>
      <OptimizerTab style={{display: activeKey == '1' ? 'block' : 'none'}}/>
      <RelicsTab style={{display: activeKey == '2' ? 'block' : 'none'}}/>
      <CharacterTab style={{display: activeKey == '3' ? 'block' : 'none'}}/>
      <ImportTab style={{display: activeKey == '4' ? 'block' : 'none'}}/>
    </>
  )
}

export default Tabs;
