import { Alert } from '@mantine/core'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'
import { useShallow } from 'zustand/react/shallow'

const UNRELEASED_CHARACTER_IDS = new Set<CharacterId>([])

const UNRELEASED_LIGHT_CONE_IDS = new Set<LightConeId>([])

export function UnreleasedCharacterDisclaimer() {
  const { t: tGameData } = useTranslation('gameData')
  const { t } = useTranslation('optimizerTab')
  const {
    characterId,
    lightConeId,
    teammate0CharId,
    teammate1CharId,
    teammate2CharId,
    teammate0LcId,
    teammate1LcId,
    teammate2LcId,
  } = useOptimizerRequestStore(
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
    const names: string[] = []

    for (const id of [characterId, teammate0CharId, teammate1CharId, teammate2CharId]) {
      if (id && UNRELEASED_CHARACTER_IDS.has(id)) {
        const name = tGameData(`Characters.${id}.LongName`)
        if (!names.includes(name)) {
          names.push(name)
        }
      }
    }

    for (const id of [lightConeId, teammate0LcId, teammate1LcId, teammate2LcId]) {
      if (id && UNRELEASED_LIGHT_CONE_IDS.has(id)) {
        const name = tGameData(`Lightcones.${id}.Name`)
        if (!names.includes(name)) {
          names.push(name)
        }
      }
    }

    return names
  }, [characterId, lightConeId, teammate0CharId, teammate1CharId, teammate2CharId, teammate0LcId, teammate1LcId, teammate2LcId, tGameData])

  if (unreleasedNames.length === 0) {
    return null
  }

  return (
    <Alert color='yellow'>
      {t('UnreleasedDisclaimer', { nameList: unreleasedNames.join(', ') })}
    </Alert>
  )
}
