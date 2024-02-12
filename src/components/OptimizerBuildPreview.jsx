import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Flex } from 'antd'

import RelicModal from 'components/RelicModal'
import RelicPreview from 'components/RelicPreview'
import DB from 'lib/db'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { RelicScorer } from 'lib/relicScorer.ts'
import { RelicModalController } from 'lib/relicModalController'

export default function OptimizerBuildPreview(props) {
  console.log('OptimizerBuildPreview', props)

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

  const headScore = props.build ? RelicScorer.score(relicsById[props.build?.Head], characterId) : undefined
  const handsScore = props.build ? RelicScorer.score(relicsById[props.build?.Hands], characterId) : undefined
  const bodyScore = props.build ? RelicScorer.score(relicsById[props.build?.Body], characterId) : undefined
  const feetScore = props.build ? RelicScorer.score(relicsById[props.build?.Feet], characterId) : undefined
  const planarSphereScore = props.build ? RelicScorer.score(relicsById[props.build?.PlanarSphere], characterId) : undefined
  const linkRopeScore = props.build ? RelicScorer.score(relicsById[props.build?.LinkRope], characterId) : undefined

  return (
    <div>
      <Flex gap={5} id="optimizerBuildPreviewContainer">
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={relicsById[props.build?.Head]} score={headScore} />
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={relicsById[props.build?.Hands]} score={handsScore} />
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={relicsById[props.build?.Body]} score={bodyScore} />
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={relicsById[props.build?.Feet]} score={feetScore} />
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={relicsById[props.build?.PlanarSphere]} score={planarSphereScore} />
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={relicsById[props.build?.LinkRope]} score={linkRopeScore} />
      </Flex>
      <RelicModal selectedRelic={selectedRelic} type="edit" onOk={onEditOk} setOpen={setEditModalOpen} open={editModalOpen} />
    </div>
  )
}
OptimizerBuildPreview.propTypes = {
  build: PropTypes.object,
}
