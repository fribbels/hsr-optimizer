import React, { useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Flex, Typography } from 'antd'

import OptimizerTab from 'components/optimizerTab/OptimizerTab'
import RelicsTab from 'components/RelicsTab'
import CharacterTab from 'components/CharacterTab'
import RelicScorerTab from 'components/RelicScorerTab'
import GettingStartedTab from 'components/GettingStartedTab'
import ScoringModal from 'components/ScoringModal'
import PropTypes from 'prop-types'
import ChangelogTab from 'components/ChangelogTab'
import { AppPages, PageToRoute } from 'lib/db'
import { OptimizerTabController } from 'lib/optimizerTabController'
import ImportTab from 'components/importerTab/ImportTab'
import SettingsTab from 'components/settingsTab/settingsTab'

const defaultErrorRender = ({ error }) => <Typography>Something went wrong: {error.message}</Typography>

let optimizerInitialized = false

const Tabs = () => {
  const activeKey = window.store((s) => s.activeKey)

  const optimizerTab = React.useMemo(() => <OptimizerTab />, [])
  const characterTab = React.useMemo(() => <CharacterTab />, [])
  const relicsTab = React.useMemo(() => <RelicsTab />, [])
  const importTab = React.useMemo(() => <ImportTab />, [])
  const gettingStartedTab = React.useMemo(() => <GettingStartedTab />, [])
  const relicScorerTab = React.useMemo(() => <RelicScorerTab />, [])
  const changelogTab = React.useMemo(() => <ChangelogTab />, [])
  const settingsTab = React.useMemo(() => <SettingsTab />, [])

  useEffect(() => {
    const route = PageToRoute[activeKey] || PageToRoute[AppPages.OPTIMIZER]
    console.log('Navigating activekey to route', activeKey, route)
    window.history.pushState({}, window.title, route)

    if (activeKey == AppPages.OPTIMIZER) {
      window.onOptimizerFormValuesChange({}, OptimizerTabController.getForm())

      // Only kick off the workers on the first load of OptimizerTab. Skips this for scorer-only users.
      if (!optimizerInitialized) {
        optimizerInitialized = true
        WorkerPool.initializeAllWorkers()
      }
    } else {
      window.scrollTo(0, 0)
    }
  }, [activeKey])

  return (
    <Flex justify="space-around">
      <TabRenderer activeKey={activeKey} tabKey={AppPages.OPTIMIZER} content={optimizerTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.CHARACTERS} content={characterTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.RELICS} content={relicsTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.IMPORT} content={importTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.GETTING_STARTED} content={gettingStartedTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.RELIC_SCORER} content={relicScorerTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.CHANGELOG} content={changelogTab} />
      <TabRenderer activeKey={activeKey} tabKey={AppPages.SETTINGS} content={settingsTab} />

      <ErrorBoundary fallbackRender={defaultErrorRender}>
        <ScoringModal />
      </ErrorBoundary>
    </Flex>
  )
}

export default Tabs

function TabRenderer(props) {
  return (
    <ErrorBoundary fallbackRender={defaultErrorRender}>
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
