import React from 'react';
import { ErrorBoundary } from "react-error-boundary";
import { Typography } from 'antd';

import OptimizerTab from 'components/OptimizerTab'
import ImportTab from 'components/ImportTab'
import RelicsTab from 'components/RelicsTab'
import CharacterTab from 'components/CharacterTab';
import ComingSoonTab from 'components/ComingSoonTab';
import RelicScorerTab from 'components/RelicScorerTab';
import GettingStartedTab from 'components/GettingStartedTab';
import BetaTab from 'components/BetaTab';
import ScoringModal from 'components/ScoringModal';

const defaultError = <Typography>Something went wrong</Typography>;

const Tabs = () => {
  const activeKey = global.store(s => s.activeKey)

  let displayTab;
  switch (activeKey) {
    case 'characters':
      displayTab = <CharacterTab active={true} />;
      break;
    case 'relics':
      displayTab = <RelicsTab active={true} />;
      break;
    case 'import':
      displayTab = <ImportTab active={true} />;
      break;
    case '#getting-started':
      displayTab = <GettingStartedTab active={true} />;
      break;
    case '#scorer':
      displayTab = <RelicScorerTab active={true} />;
      break;
    case 'coming-soon':
      displayTab = <ComingSoonTab active={true} />;
      break;
    case '#beta':
      displayTab = <BetaTab active={true} />;
      break;
    case 'optimizer':
    default:
      displayTab = <OptimizerTab active={true} />;
      break;
  }

  return (
    <>
      <ErrorBoundary fallback={defaultError}>
        {displayTab}
      </ErrorBoundary>
      <ErrorBoundary fallback={defaultError}>
        <ScoringModal />
      </ErrorBoundary >
    </>
  )
}

export default Tabs;
