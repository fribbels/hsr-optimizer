import { Flex } from 'antd'
import { Parts } from 'lib/constants/constants'
import { useState } from 'react'

import RelicModal from 'lib/overlays/modals/RelicModal'
import { RelicModalController } from 'lib/overlays/modals/relicModalController'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import { AppPages } from 'lib/state/db'
import { RelicPreview } from 'lib/tabs/tabRelics/RelicPreview'
import { Relic } from 'types/relic'

const partToIndex: Record<Parts, number> = {
  [Parts.Head]: 0,
  [Parts.Hands]: 1,
  [Parts.Body]: 2,
  [Parts.Feet]: 3,
  [Parts.PlanarSphere]: 4,
  [Parts.LinkRope]: 5,
}

const indexToPart: Record<number, Parts> = {
  0: Parts.Head,
  1: Parts.Hands,
  2: Parts.Body,
  3: Parts.Feet,
  4: Parts.PlanarSphere,
  5: Parts.LinkRope,
}

export default function OptimizerBuildPreview() {
  const optimizerBuild = window.store((s) => s.optimizerBuild)
  const relicsById = window.store((s) => s.relicsById)
  const characterId = window.store((s) => s.optimizerTabFocusCharacter)
  const activeKey = window.store((s) => s.activeKey)

  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null)
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false)

  if (activeKey !== AppPages.OPTIMIZER || characterId == undefined) {
    return <></>
  }

  function onEditOk(relic: Relic) {
    const updatedRelic = RelicModalController.onEditOk(selectedRelic!, relic)
    setSelectedRelic(updatedRelic)
  }

  const next = () => {
    if (!selectedRelic || !optimizerBuild) {
      return
    }
    let startingIndex = partToIndex[selectedRelic.part] + 1
    let nextRelic: Relic | undefined
    for (let i = startingIndex; i < startingIndex + 6; i++) {
      nextRelic = relicsById[optimizerBuild[indexToPart[i % 6]]!]
      if (nextRelic) {
        return setSelectedRelic(nextRelic)
      }
    }
  }

  const prev = () => {
    if (!selectedRelic || !optimizerBuild) {
      return
    }
    let startingIndex = partToIndex[selectedRelic.part] + 5
    let nextRelic: Relic | undefined
    for (let i = startingIndex; i > startingIndex - 6; i--) {
      nextRelic = relicsById[optimizerBuild[indexToPart[i % 6]]!]
      if (nextRelic) {
        return setSelectedRelic(nextRelic)
      }
    }
  }

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
      <RelicModal selectedRelic={selectedRelic} onOk={onEditOk} setOpen={setEditModalOpen} open={editModalOpen} next={next} prev={prev} />
    </div>
  )
}
