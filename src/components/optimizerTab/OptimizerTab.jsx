import React from 'react'
import PropTypes from 'prop-types'
import { Flex } from 'antd'
import 'ag-grid-community/styles/ag-grid.css'

import OptimizerForm from 'components/optimizerTab/OptimizerForm'
import OptimizerBuildPreview from 'components/OptimizerBuildPreview'
import Sidebar from 'components/optimizerTab/Sidebar'
import { OptimizerGrid } from 'components/optimizerTab/OptimizerGrid'
import { ZeroPermutationsSuggestionsModal } from 'components/optimizerTab/OptimizerSuggestionsModal'

export default function OptimizerTab() {
  console.log('======================================================================= RENDER OptimizerTab')

  return (
    <Flex>
      <Flex vertical gap={10} style={{ marginBottom: 100 }}>
        <OptimizerForm />
        <OptimizerGrid />
        <OptimizerBuildPreview />
      </Flex>
      <ZeroPermutationsSuggestionsModal />
      <Sidebar />
    </Flex>
  )
}
OptimizerTab.propTypes = {
  active: PropTypes.bool,
}
