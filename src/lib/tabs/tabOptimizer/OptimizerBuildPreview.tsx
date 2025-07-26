import { Flex } from 'antd'

import RelicModal from 'lib/overlays/modals/RelicModal'
import { RelicModalController } from 'lib/overlays/modals/relicModalController'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import DB, { AppPages } from 'lib/state/db'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { RelicPreview } from 'lib/tabs/tabRelics/RelicPreview'
import React, { useState } from 'react'
import { Relic } from 'types/relic'

export default function OptimizerBuildPreview() {
  const optimizerBuild = window.store((s) => s.optimizerBuild)

  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null)
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false)

  if (window.store.getState().activeKey != AppPages.OPTIMIZER) {
    return <></>
  }

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
      <Flex gap={5} id='optimizerBuildPreviewContainer' justify='space-between' style={{ paddingLeft: 1, paddingRight: 1 }}>
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={headRelic} score={headScore} />
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={handsRelic} score={handsScore} />
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={bodyRelic} score={bodyScore} />
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={feetRelic} score={feetScore} />
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={planarSphereRelic} score={planarSphereScore} />
        <RelicPreview setEditModalOpen={setEditModalOpen} setSelectedRelic={setSelectedRelic} relic={linkRopeRelic} score={linkRopeScore} />
      </Flex>
      <RelicModal selectedRelic={selectedRelic} onOk={onEditOk} setOpen={setEditModalOpen} open={editModalOpen} />
    </div>
  )
}
