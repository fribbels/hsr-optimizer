import { Flex } from 'antd'
import { Constants } from 'lib/constants/constants'
import { defaultGap } from 'lib/constants/constantsUi'
import { RelicPreview } from 'lib/tabs/tabRelics/RelicPreview'
import React from 'react'

export enum ShowcaseSource {
  CHARACTER_TAB,
  SHOWCASE_TAB,
  BUILDS_MODAL,
}

export function ShowcaseRelicPreview(props: {
  setEditModalOpen
  setSelectedRelic
  setAddModalOpen
  displayRelics
  source: ShowcaseSource
  characterId: string
  scoredRelics
}) {
  return (
    <Flex gap={defaultGap}>
      <Flex vertical gap={defaultGap}>
        <RelicPreview
          setEditModalOpen={setEditModalOpen}
          setSelectedRelic={setSelectedRelic}
          setAddModelOpen={setAddModalOpen}
          relic={{ ...displayRelics.Head, part: Constants.Parts.Head }}
          source={props.source}
          characterId={characterId}
          score={scoredRelics.find((x) => x.part == Constants.Parts.Head)}
        />
        <RelicPreview
          setEditModalOpen={setEditModalOpen}
          setSelectedRelic={setSelectedRelic}
          setAddModelOpen={setAddModalOpen}
          relic={{ ...displayRelics.Body, part: Constants.Parts.Body }}
          source={props.source}
          characterId={characterId}
          score={scoredRelics.find((x) => x.part == Constants.Parts.Body)}
        />
        <RelicPreview
          setEditModalOpen={setEditModalOpen}
          setSelectedRelic={setSelectedRelic}
          setAddModelOpen={setAddModalOpen}
          relic={{ ...displayRelics.PlanarSphere, part: Constants.Parts.PlanarSphere }}
          source={props.source}
          characterId={characterId}
          score={scoredRelics.find((x) => x.part == Constants.Parts.PlanarSphere)}
        />
      </Flex>

      <Flex vertical gap={defaultGap}>
        <RelicPreview
          setEditModalOpen={setEditModalOpen}
          setSelectedRelic={setSelectedRelic}
          setAddModelOpen={setAddModalOpen}
          relic={{ ...displayRelics.Hands, part: Constants.Parts.Hands }}
          source={props.source}
          characterId={characterId}
          score={scoredRelics.find((x) => x.part == Constants.Parts.Hands)}
        />
        <RelicPreview
          setEditModalOpen={setEditModalOpen}
          setSelectedRelic={setSelectedRelic}
          setAddModelOpen={setAddModalOpen}
          relic={{ ...displayRelics.Feet, part: Constants.Parts.Feet }}
          source={props.source}
          characterId={characterId}
          score={scoredRelics.find((x) => x.part == Constants.Parts.Feet)}
        />
        <RelicPreview
          setEditModalOpen={setEditModalOpen}
          setSelectedRelic={setSelectedRelic}
          setAddModelOpen={setAddModalOpen}
          relic={{ ...displayRelics.LinkRope, part: Constants.Parts.LinkRope }}
          source={props.source}
          characterId={characterId}
          score={scoredRelics.find((x) => x.part == Constants.Parts.LinkRope)}
        />
      </Flex>
    </Flex>
  )
}
