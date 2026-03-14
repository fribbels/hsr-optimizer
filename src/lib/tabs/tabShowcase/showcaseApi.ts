import i18next from 'i18next'
import {
  CharacterConverter,
  UnconvertedCharacter,
} from 'lib/importer/characterConverter'
import { Message } from 'lib/interactions/message'
import { AppPages, PageToRoute } from 'lib/constants/appPages'
import { SaveState } from 'lib/state/saveState'
import {
  APIResponse,
  processEnkaData,
  processMihomoData,
} from 'lib/tabs/tabShowcase/dataProcessors'
import { Assets } from 'lib/rendering/assets'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'

export const API_ENDPOINT = 'https://9di5b7zvtb.execute-api.us-west-2.amazonaws.com/prod'

const THROTTLE_SECONDS = 10

export type ShowcaseTabForm = {
  scorerId: string | null,
}

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
  const id = form.scorerId.trim()

  if (id.length != 9) {
    setLoading(false)
    Message.error(t('InvalidIdWarning') /* Invalid ID */)
    return
  }

  if (latestRefreshDate) {
    Message.warning(t('ThrottleWarning', /* Please wait {{seconds}} seconds before retrying */ {
      seconds: Math.max(1, Math.ceil(THROTTLE_SECONDS - (new Date().getTime() - latestRefreshDate.getTime()) / 1000)),
    }))
    if (loading) {
      setLoading(false)
    }
    return
  }

  setLoading(true)
  setLatestRefreshDate(new Date())
  setTimeout(() => {
    setLatestRefreshDate(null)
  }, THROTTLE_SECONDS * 1000)

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
      for (const char of converted) {
        const img = new Image()
        img.src = Assets.getCharacterPortraitById(char.id)
      }
      if (converted.length) {
        setSelectedCharacter(converted[0])
      }
      setLoading(false)
      Message.success(t('SuccessMsg') /* Successfully loaded profile */)
    })
    .catch((error) => {
      setTimeout(() => {
        Message.warning(t('LookupError') /* Error during lookup, please try again in a bit */)
        console.error('Fetch error:', error)
        setLoading(false)
      }, 1000 * 5)
    })
}
