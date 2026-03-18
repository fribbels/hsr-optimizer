import { Ashveil } from 'lib/conditionals/character/1500/Ashveil'
import { Sparxie } from 'lib/conditionals/character/1500/Sparxie'
import { Yaoguang } from 'lib/conditionals/character/1500/Yaoguang'
import { DazzledByAFloweryWorld } from 'lib/conditionals/lightcone/5star/DazzledByAFloweryWorld'
import { TheFinaleOfALie } from 'lib/conditionals/lightcone/5star/TheFinaleOfALie'
import { WhenSheDecidedToSee } from 'lib/conditionals/lightcone/5star/WhenSheDecidedToSee'
import { AppPages, PageToRoute } from 'lib/constants/appPages'
import { submitForm } from 'lib/tabs/tabShowcase/showcaseApi'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'
import { getGameMetadata } from 'lib/state/gameMetadata'

export type Preset = CharacterPreset | FillerPreset

export type CharacterPreset = {
  characterId: CharacterId | null,
  lightConeId: LightConeId | null,
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
  const DBMetadata = getGameMetadata()
  const char = (id: CharacterId) => Object.values(DBMetadata.characters).some((x) => x.id === id) ? id : null
  const lc = (id: LightConeId) => Object.values(DBMetadata.lightCones).some((x) => x.id === id) ? id : null

  return [
    { characterId: char(Yaoguang.id), lightConeId: lc(WhenSheDecidedToSee.id) },
    { characterId: char(Sparxie.id), lightConeId: lc(DazzledByAFloweryWorld.id) },
    { characterId: char(Ashveil.id), lightConeId: lc(TheFinaleOfALie.id) },

    // { characterId: char(CASTORICE), lightConeId: lc(MAKE_FAREWELLS_MORE_BEAUTIFUL) , rerun: true},
    // { characterId: char(HYACINE), lightConeId: lc(LONG_MAY_RAINBOWS_ADORN_THE_SKY) , rerun: true},
    // { characterId: char(TRIBBIE), lightConeId: lc(IF_TIME_WERE_A_FLOWER), rerun: true },

    { custom: true },
  ].filter((x) => x.custom || !!x.characterId) as Preset[]
}

export function initialiseShowcaseTab(activeKey: AppPages) {
  const { savedSession, availableCharacters } = useShowcaseTabStore.getState()
  const { scorerId } = savedSession

  if (activeKey !== AppPages.SHOWCASE) return

  // load showcase if id present in url | only applies to initial website load
  const id: string | null = window.location.href.split('?')[1]?.split('id=')[1]?.split('&')[0] ?? null
  if (id) submitForm({ scorerId: id })

  // add id to url when navigating if a showcase is already loaded
  if (availableCharacters?.length && scorerId) {
    window.history.replaceState({ id: scorerId }, `profile: ${scorerId}`, PageToRoute[AppPages.SHOWCASE] + `?id=${scorerId}`)
  }
  // load showcase when the user first visits the tab
  if (!id && !availableCharacters?.length) submitForm({ scorerId })
}
