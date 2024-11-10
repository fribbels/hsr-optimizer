import { Flex } from 'antd'
import 'ag-grid-community/styles/ag-grid.css'
import OptimizerBuildPreview from 'lib/tabs/tabOptimizer/OptimizerBuildPreview'
import { OptimizerGrid } from 'lib/tabs/tabOptimizer/optimizerForm/grid/OptimizerGrid'

import OptimizerForm from 'lib/tabs/tabOptimizer/optimizerForm/OptimizerForm'
import { ZeroPermutationsSuggestionsModal, ZeroResultSuggestionModal } from 'lib/tabs/tabOptimizer/OptimizerSuggestionsModal'
import Sidebar from 'lib/tabs/tabOptimizer/Sidebar'
import React from 'react'

export default function OptimizerTab() {
  console.log('======================================================================= RENDER OptimizerTab')

  return (
    <Flex>
      <Flex vertical gap={10} style={{ marginBottom: 100 }}>
        <OptimizerForm/>
        <OptimizerGrid/>
        <OptimizerBuildPreview/>
      </Flex>
      <ZeroPermutationsSuggestionsModal/>
      <ZeroResultSuggestionModal/>
      <Sidebar/>
    </Flex>
  )
}
