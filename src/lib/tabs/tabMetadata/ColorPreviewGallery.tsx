import { Button, Flex, Group, Text } from '@mantine/core'
import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { cardTotalW, parentH } from 'lib/constants/constantsUi'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { useMemo, useState } from 'react'
import type { Character, CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'

const SCALE = 0.6
const PER_PAGE = 999
const SCALED_W = Math.ceil(cardTotalW * SCALE)
const SCALED_H = Math.ceil(parentH * SCALE)

export function ColorPreviewGallery() {
  const [page, setPage] = useState(0)
  const [shuffleSeed, setShuffleSeed] = useState(0)

  const allCharacters = useMemo(() => {
    const metadata = getGameMetadata()

    // Build LC lookup by path — pick highest rarity per path
    const lcByPath = new Map<string, { id: string }>()
    for (const lc of Object.values(metadata.lightCones).sort((a, b) => b.rarity - a.rarity)) {
      if (!lcByPath.has(lc.path)) lcByPath.set(lc.path, lc)
    }

    // Skip base versions when a b1 variant exists (e.g. 1005 → 1005b1)
    const charIds = new Set(Object.keys(metadata.characters))
    const filtered = Object.values(metadata.characters)
      .filter((c) => !charIds.has(`${c.id}b1`))

    return filtered
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((charMeta) => {
        const charId = charMeta.id as CharacterId
        const form = getDefaultForm({ id: charId })
        const lc = lcByPath.get(charMeta.path)
        if (lc) {
          form.lightCone = lc.id as LightConeId
          form.lightConeSuperimposition = 1
        }
        return { id: charId, equipped: {}, form } as Character
      })
  }, [])

  const displayCharacters = useMemo(() => {
    if (shuffleSeed === 0) return allCharacters
    const shuffled = [...allCharacters]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }, [allCharacters, shuffleSeed])

  const totalPages = Math.ceil(displayCharacters.length / PER_PAGE)
  const pageCharacters = displayCharacters.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  return (
    <Flex direction="column" gap={12}>
      <Group>
        <Button size="xs" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
          Prev
        </Button>
        <Text size="sm">
          Page {page + 1} / {totalPages} ({allCharacters.length} characters)
        </Text>
        <Button size="xs" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
          Next
        </Button>
        <Button size="xs" variant="light" onClick={() => setShuffleSeed((s) => s + 1)}>
          Shuffle
        </Button>
      </Group>

      <Flex wrap="wrap" gap={50} style={{ maxWidth: 2500 }}>
        {pageCharacters.map((character) => (
          <div key={character.id} style={{ width: SCALED_W, height: SCALED_H, overflow: 'hidden' }}>
            <div style={{ transform: `scale(${SCALE})`, transformOrigin: 'top left' }}>
              <CharacterPreview
                character={character}
                id={`color-gallery-${character.id}`}
                source={ShowcaseSource.BUILDS_MODAL}
                savedBuildOverride={null}
              />
            </div>
          </div>
        ))}
      </Flex>
    </Flex>
  )
}
