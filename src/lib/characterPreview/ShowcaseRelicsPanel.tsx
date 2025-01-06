import { Flex } from 'antd'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { Constants } from 'lib/constants/constants'
import { defaultGap } from 'lib/constants/constantsUi'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { RelicScoringResult } from 'lib/relics/relicScorerPotential'
import { RelicPreview, ShowcaseTheme } from 'lib/tabs/tabRelics/RelicPreview'
import React from 'react'
import { Relic } from 'types/relic'

export function ShowcaseRelicsPanel(props: {
  setSelectedRelic: (r: Relic) => void
  setEditModalOpen: (b: boolean) => void
  setAddModalOpen: (b: boolean) => void
  displayRelics: SingleRelicByPart
  source: ShowcaseSource
  scoringType: string
  characterId: string
  scoredRelics: RelicScoringResult[]
  showcaseColors?: ShowcaseTheme
}) {
  const {
    setSelectedRelic,
    setEditModalOpen,
    setAddModalOpen,
    displayRelics,
    source,
    characterId,
    scoredRelics,
    showcaseColors,
  } = props
  return (
    <Flex gap={defaultGap}>
      <Flex vertical gap={defaultGap}>
        <RelicPreview
          setEditModalOpen={setEditModalOpen}
          setSelectedRelic={setSelectedRelic}
          setAddModalOpen={setAddModalOpen}
          relic={{ ...displayRelics.Head, part: Constants.Parts.Head }}
          source={source}
          characterId={characterId}
          score={scoredRelics.find((x) => x.part == Constants.Parts.Head)}
          scoringType={props.scoringType}
          showcaseTheme={showcaseColors}
        />
        <RelicPreview
          setEditModalOpen={setEditModalOpen}
          setSelectedRelic={setSelectedRelic}
          setAddModalOpen={setAddModalOpen}
          relic={{ ...displayRelics.Body, part: Constants.Parts.Body }}
          source={source}
          characterId={characterId}
          score={scoredRelics.find((x) => x.part == Constants.Parts.Body)}
          scoringType={props.scoringType}
          showcaseTheme={showcaseColors}
        />
        <RelicPreview
          setEditModalOpen={setEditModalOpen}
          setSelectedRelic={setSelectedRelic}
          setAddModalOpen={setAddModalOpen}
          relic={{ ...displayRelics.PlanarSphere, part: Constants.Parts.PlanarSphere }}
          source={source}
          characterId={characterId}
          score={scoredRelics.find((x) => x.part == Constants.Parts.PlanarSphere)}
          scoringType={props.scoringType}
          showcaseTheme={showcaseColors}
        />
      </Flex>

      <Flex vertical gap={defaultGap}>
        <RelicPreview
          setEditModalOpen={setEditModalOpen}
          setSelectedRelic={setSelectedRelic}
          setAddModalOpen={setAddModalOpen}
          relic={{ ...displayRelics.Hands, part: Constants.Parts.Hands }}
          source={source}
          characterId={characterId}
          score={scoredRelics.find((x) => x.part == Constants.Parts.Hands)}
          scoringType={props.scoringType}
          showcaseTheme={showcaseColors}
        />
        <RelicPreview
          setEditModalOpen={setEditModalOpen}
          setSelectedRelic={setSelectedRelic}
          setAddModalOpen={setAddModalOpen}
          relic={{ ...displayRelics.Feet, part: Constants.Parts.Feet }}
          source={source}
          characterId={characterId}
          score={scoredRelics.find((x) => x.part == Constants.Parts.Feet)}
          scoringType={props.scoringType}
          showcaseTheme={showcaseColors}
        />
        <RelicPreview
          setEditModalOpen={setEditModalOpen}
          setSelectedRelic={setSelectedRelic}
          setAddModalOpen={setAddModalOpen}
          relic={{ ...displayRelics.LinkRope, part: Constants.Parts.LinkRope }}
          source={source}
          characterId={characterId}
          score={scoredRelics.find((x) => x.part == Constants.Parts.LinkRope)}
          scoringType={props.scoringType}
          showcaseTheme={showcaseColors}
        />
      </Flex>
    </Flex>
  )
}
