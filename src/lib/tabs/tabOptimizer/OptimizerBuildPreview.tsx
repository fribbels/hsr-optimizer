import { Flex } from '@mantine/core'
import { Parts } from 'lib/constants/constants'

import { RelicModalController } from 'lib/overlays/modals/relicModalController'
import { useRelicModalStore } from 'lib/overlays/modals/relicModalStore'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import { useGlobalStore } from 'lib/stores/appStore'
import { AppPages } from 'lib/constants/appPages'
import { useRelicStore } from 'lib/stores/relicStore'
import { RelicPreview } from 'lib/tabs/tabRelics/RelicPreview'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
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

function navigateRelic(direction: 1 | -1) {
  const currentRelic = useRelicModalStore.getState().config?.selectedRelic
  const optimizerBuild = useOptimizerDisplayStore.getState().optimizerBuild
  const relicsById = useRelicStore.getState().relicsById
  if (!currentRelic || !optimizerBuild) return

  const startingIndex = partToIndex[currentRelic.part] + direction * (direction > 0 ? 1 : -1)
  for (let i = 0; i < 6; i++) {
    const idx = ((startingIndex + direction * i) % 6 + 6) % 6
    const nextRelic = relicsById[optimizerBuild[indexToPart[idx]]!]
    if (nextRelic) {
      useRelicModalStore.getState().updateConfig({ selectedRelic: nextRelic })
      return
    }
  }
}

const next = () => navigateRelic(1)
const prev = () => navigateRelic(-1)

export function OptimizerBuildPreview() {
  const optimizerBuild = useOptimizerDisplayStore((s) => s.optimizerBuild)
  const relicsById = useRelicStore((s) => s.relicsById)
  const characterId = useOptimizerDisplayStore((s) => s.focusCharacterId)
  const activeKey = useGlobalStore((s) => s.activeKey)

  if (activeKey !== AppPages.OPTIMIZER || characterId == undefined) {
    return null
  }

  const openRelicModal = (_open: boolean, relic?: Relic) => {
    if (relic) {
      useRelicModalStore.getState().openOverlay({
        selectedRelic: relic,
        onOk: (editedRelic: Relic) => {
          RelicModalController.onEditOk(relic, editedRelic)
        },
        next,
        prev,
      })
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
      <Flex gap={6} id='optimizerBuildPreviewContainer' justify='space-between' style={{ paddingLeft: 1, paddingRight: 1 }}>
        <RelicPreview setEditModalOpen={openRelicModal} relic={headRelic} score={headScore} />
        <RelicPreview setEditModalOpen={openRelicModal} relic={handsRelic} score={handsScore} />
        <RelicPreview setEditModalOpen={openRelicModal} relic={bodyRelic} score={bodyScore} />
        <RelicPreview setEditModalOpen={openRelicModal} relic={feetRelic} score={feetScore} />
        <RelicPreview setEditModalOpen={openRelicModal} relic={planarSphereRelic} score={planarSphereScore} />
        <RelicPreview setEditModalOpen={openRelicModal} relic={linkRopeRelic} score={linkRopeScore} />
      </Flex>
    </div>
  )
}
