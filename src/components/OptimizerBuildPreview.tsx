import React, { useState } from 'react'
import { Flex } from 'antd'

import RelicModal from 'components/RelicModal'
import { RelicPreview } from 'components/RelicPreview'
import DB from 'lib/db'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { RelicScorer } from 'lib/relicScorerPotential'
import { RelicModalController } from 'lib/relicModalController'
import { Relic } from 'types/Relic'

export default function OptimizerBuildPreview() {
  const optimizerBuild = window.store((s) => s.optimizerBuild)

  /*
   * TODO: Force update was a band-aid fix, revisit if we actually need to
   * const [, forceUpdate] = React.useReducer(o => !o, true);
   * window.forceOptimizerBuildPreviewUpdate = forceUpdate
   */
  const [selectedRelic, setSelectedRelic] = useState<Relic>()
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false)

  function onEditOk(relic: Relic) {
    const updatedRelic = RelicModalController.onEditOk(selectedRelic!, relic)
    setSelectedRelic(updatedRelic)
  }

  const relicsById = DB.getRelicsById()
  const characterId = OptimizerTabController.getForm().characterId

  const headRelic = optimizerBuild?.Head ? relicsById[optimizerBuild.Head] : undefined
  const handsRelic = optimizerBuild?.Hands ? relicsById[optimizerBuild.Hands] : undefined
  const bodyRelic = optimizerBuild?.Body ? relicsById[optimizerBuild.Body] : undefined
  const feetRelic = optimizerBuild?.Feet ? relicsById[optimizerBuild.Feet] : undefined
  const planarSphereRelic = optimizerBuild?.PlanarSphere ? relicsById[optimizerBuild.PlanarSphere] : undefined
  const linkRopeRelic = optimizerBuild?.LinkRope ? relicsById[optimizerBuild.LinkRope] : undefined

  const headScore = headRelic ? RelicScorer.scoreCurrentRelic(headRelic, characterId) : undefined
  const handsScore = handsRelic ? RelicScorer.scoreCurrentRelic(handsRelic, characterId) : undefined
  const bodyScore = bodyRelic ? RelicScorer.scoreCurrentRelic(bodyRelic, characterId) : undefined
  const feetScore = feetRelic ? RelicScorer.scoreCurrentRelic(feetRelic, characterId) : undefined
  const planarSphereScore = planarSphereRelic ? RelicScorer.scoreCurrentRelic(planarSphereRelic, characterId) : undefined
  const linkRopeScore = linkRopeRelic ? RelicScorer.scoreCurrentRelic(linkRopeRelic, characterId) : undefined

  return (
    <div>
      <Flex gap={5} id='optimizerBuildPreviewContainer'>
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={headRelic} score={headScore}/>
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={handsRelic} score={handsScore}/>
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={bodyRelic} score={bodyScore}/>
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={feetRelic} score={feetScore}/>
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={planarSphereRelic} score={planarSphereScore}/>
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={linkRopeRelic} score={linkRopeScore}/>
      </Flex>
      <RelicModal selectedRelic={selectedRelic} type='edit' onOk={onEditOk} setOpen={setEditModalOpen} open={editModalOpen}/>
    </div>
  )
}
