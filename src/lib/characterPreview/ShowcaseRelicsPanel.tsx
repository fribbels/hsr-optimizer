import { Flex } from '@mantine/core'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import {
  Constants,
  Parts,
} from 'lib/constants/constants'
import { defaultGap } from 'lib/constants/constantsUi'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { RelicScoringResult } from 'lib/relics/relicScorerPotential'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import {
  RelicPreview,
} from 'lib/tabs/tabRelics/RelicPreview'
import { CharacterId } from 'types/character'
import { Relic } from 'types/relic'

const leftParts = [
  { key: 'Head' as const, part: Constants.Parts.Head },
  { key: 'Body' as const, part: Constants.Parts.Body },
  { key: 'PlanarSphere' as const, part: Constants.Parts.PlanarSphere },
]

const rightParts = [
  { key: 'Hands' as const, part: Constants.Parts.Hands },
  { key: 'Feet' as const, part: Constants.Parts.Feet },
  { key: 'LinkRope' as const, part: Constants.Parts.LinkRope },
]

export function ShowcaseRelicsPanel({
  setSelectedRelic,
  setEditModalOpen,
  setAddModalOpen,
  displayRelics,
  source,
  scoringType,
  characterId,
  scoredRelics,
}: {
  setSelectedRelic: (r: Relic) => void
  setEditModalOpen: (b: boolean, relic?: Relic) => void
  setAddModalOpen: (b: boolean, part: Parts, relic?: Relic) => void
  displayRelics: SingleRelicByPart
  source: ShowcaseSource
  scoringType: ScoringType
  characterId: CharacterId
  scoredRelics: RelicScoringResult[]
}) {
  const renderColumn = (parts: typeof leftParts | typeof rightParts) => (
    <Flex direction="column" gap={defaultGap}>
      {parts.map(({ key, part }) => (
        <RelicPreview
          key={key}
          setEditModalOpen={setEditModalOpen}
          setSelectedRelic={setSelectedRelic}
          setAddModalOpen={setAddModalOpen}
          relic={{ ...displayRelics[key], part }}
          source={source}
          characterId={characterId}
          score={scoredRelics.find((x) => x.part === part)}
          scoringType={scoringType}
          useShowcaseColors
        />
      ))}
    </Flex>
  )

  return (
    <Flex gap={defaultGap} style={{ zIndex: 1 }}>
      {renderColumn(leftParts)}
      {renderColumn(rightParts)}
    </Flex>
  )
}
