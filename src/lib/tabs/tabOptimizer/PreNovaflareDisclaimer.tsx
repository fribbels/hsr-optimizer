import { Alert } from '@mantine/core'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useMemo } from 'react'
import type { CharacterId } from 'types/character'
import { useShallow } from 'zustand/react/shallow'

function getPreNovaflareIds(): Set<CharacterId> {
  const characters = getGameMetadata().characters
  const ids = new Set<CharacterId>()
  for (const id of Object.keys(characters) as CharacterId[]) {
    if (id.endsWith('b1') && !characters[id].unreleased) {
      const originalId = id.replace('b1', '') as CharacterId
      if (characters[originalId]) {
        ids.add(originalId)
      }
    }
  }
  return ids
}

export function PreNovaflareDisclaimer() {
  const {
    characterId,
    teammate0CharId,
    teammate1CharId,
    teammate2CharId,
  } = useOptimizerRequestStore(
    useShallow((s) => ({
      characterId: s.characterId,
      teammate0CharId: s.teammates[0].characterId,
      teammate1CharId: s.teammates[1].characterId,
      teammate2CharId: s.teammates[2].characterId,
    })),
  )

  const hasPreNovaflare = useMemo(() => {
    const preNovaflareIds = getPreNovaflareIds()
    return [characterId, teammate0CharId, teammate1CharId, teammate2CharId]
      .some((id) => id && preNovaflareIds.has(id))
  }, [characterId, teammate0CharId, teammate1CharId, teammate2CharId])

  if (!hasPreNovaflare) {
    return null
  }

  return (
    <Alert color='orange'>
      Damage calculations for Pre-Novaflare characters and teammates are no longer supported. Please switch to their Novaflare versions.
    </Alert>
  )
}
