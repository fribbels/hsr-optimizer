import React, { useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Typography } from 'antd'

import OptimizerTab from 'components/optimizerTab/OptimizerTab'
import ImportTab from 'components/ImportTab'
import RelicsTab from 'components/RelicsTab'
import CharacterTab from 'components/CharacterTab'
import RelicScorerTab from 'components/RelicScorerTab'
import GettingStartedTab from 'components/GettingStartedTab'
import ScoringModal from 'components/ScoringModal'
import PropTypes from 'prop-types'
import ChangelogTab from 'components/ChangelogTab'
import { AppPages, PageToRoute } from 'lib/db'
import { OptimizerTabController } from 'lib/optimizerTabController'

const defaultError = <Typography>Something went wrong</Typography>

const Tabs = () => {
  const activeKey = window.store((s) => s.activeKey)

  const optimizerTab = React.useMemo(() => <OptimizerTab />, [])
  const characterTab = React.useMemo(() => <CharacterTab />, [])
  const relicsTab = React.useMemo(() => <RelicsTab />, [])
  const importTab = React.useMemo(() => <ImportTab />, [])
  const gettingStartedTab = React.useMemo(() => <GettingStartedTab />, [])
  const relicScorerTab = React.useMemo(() => <RelicScorerTab />, [])
  const changelogTab = React.useMemo(() => <ChangelogTab />, [])

  useEffect(() => {
    const route = PageToRoute[activeKey] || PageToRoute[AppPages.OPTIMIZER]
    console.log('Navigating activekey to route', activeKey, route)
    window.history.pushState({}, window.title, route)

    if (activeKey == AppPages.OPTIMIZER) {
      window.onOptimizerFormValuesChange({}, OptimizerTabController.getForm())
    }
  }, [activeKey])

  return (
    <>
      <TabRenderer activeKey={activeKey} tabKey={AppPages.OPTIMIZER} content={optimizerTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.CHARACTERS} content={characterTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.RELICS} content={relicsTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.IMPORT} content={importTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.GETTING_STARTED} content={gettingStartedTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.RELIC_SCORER} content={relicScorerTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.CHANGELOG} content={changelogTab} />

      <ErrorBoundary fallback={defaultError}>
        <ScoringModal />
      </ErrorBoundary>
    </>
  )
}

export default Tabs

function TabRenderer(props) {
  return (
    <ErrorBoundary fallback={defaultError}>
      <div style={{ display: props.activeKey === props.tabKey ? 'contents' : 'none' }} id={props.tabKey}>
        {props.content}
      </div>
    </ErrorBoundary>
  )
}
TabRenderer.propTypes = {
  activeKey: PropTypes.string,
  tabKey: PropTypes.string,
  content: PropTypes.element,
}
