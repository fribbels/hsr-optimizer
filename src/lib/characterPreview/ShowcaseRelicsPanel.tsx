import { Flex } from '@mantine/core'
import { useRenderTracker } from 'lib/debug/renderDebug'
import { type ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import {
  Constants,
  type Parts,
} from 'lib/constants/constants'
import { defaultGap } from 'lib/constants/constantsUi'
import { type SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { type RelicScoringResult } from 'lib/relics/scoring/relicScorer'
import { type ScoringType } from 'lib/scoring/simScoringUtils'
import {
  RelicPreview,
} from 'lib/tabs/tabRelics/RelicPreview'
import { memo, useMemo } from 'react'
import { type CharacterId } from 'types/character'
import { type Relic } from 'types/relic'

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

export const ShowcaseRelicsPanel = memo(function ShowcaseRelicsPanel({
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
  useRenderTracker('ShowcaseRelicsPanel', {
    setSelectedRelic, setEditModalOpen, setAddModalOpen,
    displayRelics, source, scoringType, characterId, scoredRelics,
  })

  const relicByPart = useMemo(() => {
    const map: Record<string, Relic> = {}
    for (const { key, part } of [...leftParts, ...rightParts]) {
      map[key] = { ...displayRelics[key], part }
    }
    return map
  }, [displayRelics])

  const scoreByPart = useMemo(() => {
    const map: Record<string, RelicScoringResult | undefined> = {}
    for (const { part } of [...leftParts, ...rightParts]) {
      map[part] = scoredRelics.find((x) => x.part === part)
    }
    return map
  }, [scoredRelics])

  const renderColumn = (parts: typeof leftParts | typeof rightParts) => (
    <Flex direction="column" gap={defaultGap}>
      {parts.map(({ key, part }) => (
        <RelicPreview
          key={key}
          setEditModalOpen={setEditModalOpen}
          setSelectedRelic={setSelectedRelic}
          setAddModalOpen={setAddModalOpen}
          relic={relicByPart[key]}
          source={source}
          characterId={characterId}
          score={scoreByPart[part]}
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
})
