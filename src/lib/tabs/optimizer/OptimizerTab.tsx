import { Flex } from 'antd'
import 'ag-grid-community/styles/ag-grid.css'
import OptimizerBuildPreview from 'lib/tabs/optimizer/OptimizerBuildPreview'

import OptimizerForm from 'lib/tabs/optimizer/OptimizerForm'
import { OptimizerGrid } from 'lib/tabs/optimizer/OptimizerGrid'
import { ZeroPermutationsSuggestionsModal, ZeroResultSuggestionModal } from 'lib/tabs/optimizer/OptimizerSuggestionsModal'
import Sidebar from 'lib/tabs/optimizer/Sidebar'
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
