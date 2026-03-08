import {
  Alert,
  Form as AntDForm,
} from 'antd'
import DB from 'lib/state/db'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterId } from 'types/character'
import {
  LightCone,
  LightConeId,
} from 'types/lightCone'

const UNRELEASED_CHARACTER_IDS = new Set<CharacterId>([])

const UNRELEASED_LIGHT_CONE_IDS = new Set<LightConeId>([])

export function UnreleasedCharacterDisclaimer() {
  const { t: tGameData } = useTranslation('gameData')
  const { t } = useTranslation('optimizerTab')
  const characterId = AntDForm.useWatch(['characterId'], window.optimizerForm)
  const lightConeId = AntDForm.useWatch(['lightCone'], window.optimizerForm)
  const teammate0CharId = AntDForm.useWatch(['teammate0', 'characterId'], window.optimizerForm)
  const teammate1CharId = AntDForm.useWatch(['teammate1', 'characterId'], window.optimizerForm)
  const teammate2CharId = AntDForm.useWatch(['teammate2', 'characterId'], window.optimizerForm)
  const teammate0LcId = AntDForm.useWatch(['teammate0', 'lightCone'], window.optimizerForm)
  const teammate1LcId = AntDForm.useWatch(['teammate1', 'lightCone'], window.optimizerForm)
  const teammate2LcId = AntDForm.useWatch(['teammate2', 'lightCone'], window.optimizerForm)

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
    <Alert
      message={t('UnreleasedDisclaimer', { nameList: unreleasedNames.join(', ') })}
      // `Calculations for ${unreleasedNames.join(', ')} are not complete yet, optimizer results will not be accurate`
      type='warning'
      showIcon
    />
  )
}
