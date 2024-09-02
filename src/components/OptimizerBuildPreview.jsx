import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Flex } from 'antd'

import RelicModal from 'components/RelicModal.tsx'
import RelicPreview from 'components/RelicPreview'
import DB from 'lib/db'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { RelicScorer } from 'lib/relicScorerPotential'
import { RelicModalController } from 'lib/relicModalController'

export default function OptimizerBuildPreview(props) {
  // console.log('OptimizerBuildPreview', props)

  const [optimizerBuild, setOptimizerBuild] = useState()
  window.setOptimizerBuild = setOptimizerBuild

  function onEditOk(relic) {
    const updatedRelic = RelicModalController.onEditOk(selectedRelic, relic)
    setSelectedRelic(updatedRelic)
  }

  /*
   * TODO: Force update was a band-aid fix, revisit if we actually need to
   * const [, forceUpdate] = React.useReducer(o => !o, true);
   * window.forceOptimizerBuildPreviewUpdate = forceUpdate
   */
  const [selectedRelic, setSelectedRelic] = useState()
  const [editModalOpen, setEditModalOpen] = useState(false)

  const relicsById = DB.getRelicsById()
  const characterId = OptimizerTabController.getForm().characterId

  const headScore = optimizerBuild ? RelicScorer.scoreCurrentRelic(relicsById[optimizerBuild?.Head], characterId) : undefined
  const handsScore = optimizerBuild ? RelicScorer.scoreCurrentRelic(relicsById[optimizerBuild?.Hands], characterId) : undefined
  const bodyScore = optimizerBuild ? RelicScorer.scoreCurrentRelic(relicsById[optimizerBuild?.Body], characterId) : undefined
  const feetScore = optimizerBuild ? RelicScorer.scoreCurrentRelic(relicsById[optimizerBuild?.Feet], characterId) : undefined
  const planarSphereScore = optimizerBuild ? RelicScorer.scoreCurrentRelic(relicsById[optimizerBuild?.PlanarSphere], characterId) : undefined
  const linkRopeScore = optimizerBuild ? RelicScorer.scoreCurrentRelic(relicsById[optimizerBuild?.LinkRope], characterId) : undefined

  return (
    <div>
      <Flex gap={5} id='optimizerBuildPreviewContainer'>
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={relicsById[optimizerBuild?.Head]} score={headScore}/>
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={relicsById[optimizerBuild?.Hands]} score={handsScore}/>
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={relicsById[optimizerBuild?.Body]} score={bodyScore}/>
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={relicsById[optimizerBuild?.Feet]} score={feetScore}/>
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={relicsById[optimizerBuild?.PlanarSphere]} score={planarSphereScore}/>
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={relicsById[optimizerBuild?.LinkRope]} score={linkRopeScore}/>
      </Flex>
      <RelicModal selectedRelic={selectedRelic} type='edit' onOk={onEditOk} setOpen={setEditModalOpen} open={editModalOpen}/>
    </div>
  )
}
OptimizerBuildPreview.propTypes = {
  build: PropTypes.object,
}
