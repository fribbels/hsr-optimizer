import { Flex } from 'antd'
import 'ag-grid-community/styles/ag-grid.css'
import OptimizerBuildPreview from 'lib/tabs/tabOptimizer/OptimizerBuildPreview'

import OptimizerForm from 'lib/tabs/tabOptimizer/OptimizerForm'
import { OptimizerGrid } from 'lib/tabs/tabOptimizer/OptimizerGrid'
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
