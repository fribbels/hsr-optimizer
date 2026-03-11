import { Alert } from '@mantine/core'
import DB from 'lib/state/db'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { useMemo } from 'react'
import { LightCone } from 'types/lightCone'
import { useShallow } from 'zustand/react/shallow'

const UNRELEASED_CHARACTER_IDS = new Set<string>([
  // '1501', // Sparxie
  // '1502', // Yao Guang
])

const UNRELEASED_LIGHT_CONE_IDS = new Set<string>([
  // '23053', // Dazzled by a Flowery World
  // '23054', // When She Decided to See
  // // '24006', // Elation Brimming With Blessings
  // '21064', // Mushy Shroomy's Adventures
  // '21065', // Today's Good Luck
  // '20023', // Sneering
  // '20024', // Lingering Tear
])

export function UnreleasedCharacterDisclaimer() {
  const {
    characterId,
    lightConeId,
    teammate0CharId,
    teammate1CharId,
    teammate2CharId,
    teammate0LcId,
    teammate1LcId,
    teammate2LcId,
  } = useOptimizerFormStore(
    useShallow((s) => ({
      characterId: s.characterId,
      lightConeId: s.lightCone,
      teammate0CharId: s.teammates[0].characterId,
      teammate1CharId: s.teammates[1].characterId,
      teammate2CharId: s.teammates[2].characterId,
      teammate0LcId: s.teammates[0].lightCone,
      teammate1LcId: s.teammates[1].lightCone,
      teammate2LcId: s.teammates[2].lightCone,
    })),
  )

  const unreleasedNames = useMemo(() => {
    const metadata = DB.getMetadata()
    const names: string[] = []

    for (const id of [characterId, teammate0CharId, teammate1CharId, teammate2CharId]) {
      if (id && UNRELEASED_CHARACTER_IDS.has(id)) {
        const name = metadata.characters[id]?.displayName ?? id
        if (!names.includes(name)) {
          names.push(name)
        }
      }
    }

    for (const id of [lightConeId, teammate0LcId, teammate1LcId, teammate2LcId]) {
      if (id && UNRELEASED_LIGHT_CONE_IDS.has(id)) {
        const name = metadata.lightCones[id as LightCone['id']]?.displayName ?? id
        if (!names.includes(name)) {
          names.push(name)
        }
      }
    }

    return names
  }, [characterId, lightConeId, teammate0CharId, teammate1CharId, teammate2CharId, teammate0LcId, teammate1LcId, teammate2LcId])

  if (unreleasedNames.length === 0) {
    return null
  }

  return (
    <Alert
      color='yellow'
    >
      {`Calculations for ${unreleasedNames.join(', ')} are not complete yet, optimizer results will not be accurate`}
    </Alert>
  )
}
