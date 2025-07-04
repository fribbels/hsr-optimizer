import i18next from 'i18next'
import {
  CharacterConverter,
  UnconvertedCharacter,
} from 'lib/importer/characterConverter'
import { Message } from 'lib/interactions/message'
import {
  AGLAEA,
  BLADE_B1,
  CERYDRA,
  ERA_ENGRAVED_BY_GOLDEN_BLOOD,
  HYSILENS,
  I_SHALL_BE_MY_OWN_SWORD,
  INCESSANT_RAIN,
  INTO_THE_UNREACHABLE_VEIL,
  JINGLIU_B1,
  KAFKA_B1,
  PATIENCE_IS_ALL_YOU_NEED,
  SILVER_WOLF_B1,
  THE_HERTA,
  THE_UNREACHABLE_SIDE,
  TIME_WOVEN_INTO_GOLD,
  WHY_DOES_THE_OCEAN_SING,
} from 'lib/simulations/tests/testMetadataConstants'
import DB, {
  AppPage,
  AppPages,
  PageToRoute,
} from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import {
  APIResponse,
  processEnkaData,
  processMihomoData,
} from 'lib/tabs/tabShowcase/dataProcessors'
import {
  ShowcaseTabCharacter,
  useShowcaseTabStore,
} from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { TsUtils } from 'lib/utils/TsUtils'
import { CharacterId } from 'types/character'
import { Form } from 'types/form'
import { LightCone } from 'types/lightCone'

export const API_ENDPOINT = 'https://9di5b7zvtb.execute-api.us-west-2.amazonaws.com/prod'

export type ShowcaseTabForm = {
  scorerId: string | null,
}

export type Preset = CharacterPreset | FillerPreset

export type CharacterPreset = {
  characterId: CharacterId | null,
  lightConeId: LightCone['id'] | null,
  rerun?: boolean,
  custom?: never,
}

type FillerPreset = {
  characterId?: never,
  lightConeId?: never,
  rerun?: never,
  custom: true,
}

export function presetCharacters(): Preset[] {
  const DBMetadata = DB.getMetadata()
  const char = (id: CharacterId) => Object.values(DBMetadata.characters).some((x) => x.id === id) ? id : null
  const lc = (id: LightCone['id']) => Object.values(DBMetadata.lightCones).some((x) => x.id === id) ? id : null

  return [
    { characterId: char(HYSILENS), lightConeId: lc(WHY_DOES_THE_OCEAN_SING) },
    { characterId: char(CERYDRA), lightConeId: lc(ERA_ENGRAVED_BY_GOLDEN_BLOOD) },

    { characterId: char('1408'), lightConeId: lc('23044') },
    { characterId: char('1014'), lightConeId: lc('23045') },
    { characterId: char('1015'), lightConeId: lc('23046') },

    { characterId: char(KAFKA_B1), lightConeId: lc(PATIENCE_IS_ALL_YOU_NEED) },
    { characterId: char(SILVER_WOLF_B1), lightConeId: lc(INCESSANT_RAIN) },
    { characterId: char(BLADE_B1), lightConeId: lc(THE_UNREACHABLE_SIDE) },
    { characterId: char(JINGLIU_B1), lightConeId: lc(I_SHALL_BE_MY_OWN_SWORD) },

    { characterId: char(THE_HERTA), lightConeId: lc(INTO_THE_UNREACHABLE_VEIL), rerun: true },
    { characterId: char(AGLAEA), lightConeId: lc(TIME_WOVEN_INTO_GOLD), rerun: true },

    { custom: true },
  ].filter((x) => x.custom || !!x.characterId) as Preset[]
}

export function onCharacterModalOk(form: ShowcaseTabCharacter['form']) {
  const t = i18next.getFixedT(null, 'relicScorerTab', 'Messages')
  const state = useShowcaseTabStore.getState()
  if (!form.characterId) {
    return Message.error(t('NoCharacterSelected') /* No selected character */)
  }
  if (state.availableCharacters?.find((x) => x.id === form.characterId) && state.selectedCharacter?.id !== form.characterId) {
    return Message.error(t('CharacterAlreadyExists') /* Selected character already exists */)
  }

  const selectedCharacter = TsUtils.clone(state.selectedCharacter)!
  const availableCharacters = TsUtils.clone(state.availableCharacters)!
  selectedCharacter.form = form
  selectedCharacter.id = form.characterId
  Object.values(selectedCharacter.equipped)
    .filter((x) => !!x)
    .forEach((x) => x.equippedBy = form.characterId!)
  availableCharacters[selectedCharacter.index] = selectedCharacter

  state.setSelectedCharacter(selectedCharacter)
  state.setAvailableCharacters(availableCharacters)
  console.log('Modified character', selectedCharacter)
}

export function importClicked(mode: 'relics' | 'singleCharacter' | 'multiCharacter') {
  const state = useShowcaseTabStore.getState()

  let newCharacters: ShowcaseTabCharacter[] = []

  if (mode === 'singleCharacter' && state.selectedCharacter?.form) {
    DB.addFromForm(state.selectedCharacter.form as Form, false)
    newCharacters = [state.selectedCharacter]
  } else if (mode === 'multiCharacter' && state.availableCharacters) {
    state.availableCharacters?.forEach((char) => {
      DB.addFromForm(char.form as Form)
    })
    newCharacters = state.availableCharacters
  }

  const newRelics = state.availableCharacters
    ?.flatMap((x) => Object.values(x.equipped))
    .filter((x) => !!x)

  console.log('import clicked! mode:', mode, 'relics:', newRelics)

  DB.mergePartialRelicsWithState(newRelics, newCharacters)
  SaveState.delayedSave()
}

export function initialiseShowcaseTab(activeKey: AppPage) {
  const { savedSession, availableCharacters } = useShowcaseTabStore.getState()
  const { scorerId } = savedSession

  if (activeKey !== AppPages.SHOWCASE) return

  // load showcase if id present in url | only applies to initial website load
  const id: string | null = window.location.href.split('?')[1]?.split('id=')[1]?.split('&')[0] ?? null
  if (id) submitForm({ scorerId: id })

  // add id to url when navigating if a showcase is already loaded
  if (availableCharacters?.length && scorerId && activeKey === AppPages.SHOWCASE) {
    window.history.replaceState({ id: scorerId }, `profile: ${scorerId}`, PageToRoute[AppPages.SHOWCASE] + `?id=${scorerId}`)
  }
  // load showcase when the user first visits the tab
  if (!id && !availableCharacters?.length) submitForm({ scorerId })
}

const throttleSeconds = 10

export function submitForm(form: ShowcaseTabForm) {
  if (!form.scorerId) return
  const t = i18next.getFixedT(null, 'relicScorerTab', 'Messages')
  const {
    setSelectedCharacter,
    setAvailableCharacters,
    latestRefreshDate,
    setLatestRefreshDate,
    setLoading,
    loading,
    setScorerId,
  } = useShowcaseTabStore.getState()

  console.log('scorerId:', form.scorerId)
  const id = form.scorerId?.trim() ?? ''

  if (id.length != 9) {
    setLoading(false)
    Message.error(t('InvalidIdWarning') /* Invalid ID */)
    return
  }

  if (latestRefreshDate) {
    const t = i18next.getFixedT(null, 'relicScorerTab', 'Messages')
    Message.warning(t('ThrottleWarning', /* Please wait {{seconds}} seconds before retrying */ {
      seconds: Math.max(1, Math.ceil(throttleSeconds - (new Date().getTime() - latestRefreshDate.getTime()) / 1000)),
    }))
    if (loading) {
      setLoading(false)
    }
    return
  } else {
    setLoading(true)
    setLatestRefreshDate(new Date())
    setTimeout(() => {
      setLatestRefreshDate(null)
    }, throttleSeconds * 1000)
  }

  setScorerId(id)
  SaveState.delayedSave()

  window.history.replaceState({ id: id }, `profile: ${id}`, PageToRoute[AppPages.SHOWCASE] + `?id=${id}`)

  void fetch(`${API_ENDPOINT}/profile/${id}`, { method: 'GET' })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`)
      return response.json() as Promise<APIResponse>
    })
    .then((data) => {
      console.log(data)

      let characters: UnconvertedCharacter[]
      // backup
      if (data.source === 'mihomo') {
        characters = processMihomoData(data)
        // enka
      } else if (data.source === 'enka') {
        characters = processEnkaData(data)
      } else {
        setLoading(false)
        Message.error(t('IdLoadError') /* Error loading ID */)
        return
      }

      console.log('characters', characters)

      // Remove duplicate characters (the same character can be placed in both one of the first 3 slots and one of the latter 5)
      const converted = characters
        .map((x) => CharacterConverter.convert(x))
        .filter((
          value,
          index,
          self,
        ) => self.map((x) => x.id).indexOf(value.id) == index)
      converted.forEach((x, index) => x.index = index)

      setAvailableCharacters(converted)
      if (converted.length) {
        setSelectedCharacter(converted[0])
      }
      setLoading(false)
      Message.success(t('SuccessMsg') /* Successfully loaded profile */)
      window.showcaseTabForm.setFieldValue('scorerId', id)
    })
    .catch((error) => {
      setTimeout(() => {
        Message.warning(t('LookupError') /* Error during lookup, please try again in a bit */)
        console.error('Fetch error:', error)
        setLoading(false)
      }, 1000 * 5)
    })
}
