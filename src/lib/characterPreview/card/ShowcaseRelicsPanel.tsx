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
import {
  memo,
  useMemo,
} from 'react'
import { type CharacterId } from 'types/character'
import { type Relic } from 'types/relic'
import { type PreviewRelics } from '../characterPreviewController'

const leftParts: Parts[] = [Constants.Parts.Head, Constants.Parts.Body, Constants.Parts.PlanarSphere]
const rightParts: Parts[] = [Constants.Parts.Hands, Constants.Parts.Feet, Constants.Parts.LinkRope]
const ALL_PARTS: Parts[] = [...leftParts, ...rightParts]

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
  setSelectedRelic: (r: Relic) => void,
  setEditModalOpen: (b: boolean, relic?: Relic) => void,
  setAddModalOpen: (b: boolean, part: Parts, relic?: Relic) => void,
  displayRelics: PreviewRelics,
  source: ShowcaseSource,
  scoringType: ScoringType,
  characterId: CharacterId,
  scoredRelics: RelicScoringResult[],
}) {
  const relicByPart = useMemo(() => {
    const map: Partial<Record<Parts, Relic | null>> = {}
    for (const part of ALL_PARTS) {
      map[part] = displayRelics[part] ? { ...displayRelics[part], part } : null
    }
    return map
  }, [displayRelics])

  const scoreByPart = useMemo(() => {
    const map: Partial<Record<Parts, RelicScoringResult>> = {}
    for (const part of ALL_PARTS) {
      map[part] = scoredRelics.find((x) => x.part === part)
    }
    return map
  }, [scoredRelics])

  const renderColumn = (parts: Parts[]) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: defaultGap }}>
      {parts.map((part) => (
        <RelicPreview
          key={part}
          part={part}
          setEditModalOpen={setEditModalOpen}
          setSelectedRelic={setSelectedRelic}
          setAddModalOpen={setAddModalOpen}
          relic={relicByPart[part]}
          source={source}
          characterId={characterId}
          score={scoreByPart[part]}
          scoringType={scoringType}
          useShowcaseColors
        />
      ))}
    </div>
  )

  return (
    <div style={{ display: 'flex', gap: defaultGap, zIndex: 1 }}>
      {renderColumn(leftParts)}
      {renderColumn(rightParts)}
    </div>
  )
})
