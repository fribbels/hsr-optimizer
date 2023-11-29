import React from 'react';
import OptimizerTab from './OptimizerTab'
import ImportTab from './ImportTab'
import RelicsTab from './RelicsTab'
import CharacterTab from './CharacterTab';
import ComingSoonTab from './ComingSoonTab';
import RelicScorerTab from './RelicScorerTab';
import GettingStartedTab from './GettingStartedTab';

const Tabs = ({activeKey}) => {
  return (
    <>
      <OptimizerTab style={{display: activeKey == 'optimizer' ? 'block' : 'none'}}/>
      <RelicsTab style={{display: activeKey == 'relics' ? 'block' : 'none'}}/>
      <CharacterTab style={{display: activeKey == 'characters' ? 'block' : 'none'}}/>
      <ImportTab style={{display: activeKey == 'import' ? 'block' : 'none'}}/>
      <GettingStartedTab style={{display: activeKey == '#getting-started' ? 'block' : 'none'}}/>
      <RelicScorerTab style={{display: activeKey == '#scorer' ? 'block' : 'none'}}/>
      <ComingSoonTab style={{display: activeKey == 'coming-soon' ? 'block' : 'none'}}/>
    </>
  )
}

export default Tabs;
