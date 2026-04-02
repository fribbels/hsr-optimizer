import i18next from 'i18next'
import { WeltB1 } from 'lib/conditionals/character/1000/WeltB1'
import { SeeleB1 } from 'lib/conditionals/character/1100/SeeleB1'
import { HuohuoB1 } from 'lib/conditionals/character/1200/HuohuoB1'
import { FireflyB1 } from 'lib/conditionals/character/1300/FireflyB1'
import { Ashveil } from 'lib/conditionals/character/1500/Ashveil'
import { Evanescia } from 'lib/conditionals/character/1500/Evanescia'
import { SilverWolfLv999 } from 'lib/conditionals/character/1500/SilverWolfLv999'
import {
  TrailblazerElationCaelus,
  TrailblazerElationStelle,
} from 'lib/conditionals/character/8000/TrailblazerElation'
import { ElationBrimmingWithBlessings } from 'lib/conditionals/lightcone/5star/ElationBrimmingWithBlessings'
import { EncounterAtFloweringsComing } from 'lib/conditionals/lightcone/5star/EncounterAtFloweringsComing'
import { InTheNameOfTheWorld } from 'lib/conditionals/lightcone/5star/InTheNameOfTheWorld'
import { InTheNight } from 'lib/conditionals/lightcone/5star/InTheNight'
import { NightOfFright } from 'lib/conditionals/lightcone/5star/NightOfFright'
import { TheFinaleOfALie } from 'lib/conditionals/lightcone/5star/TheFinaleOfALie'
import { WelcomeToTheCityOfStars } from 'lib/conditionals/lightcone/5star/WelcomeToTheCityOfStars'
import { WhereaboutsShouldDreamsRest } from 'lib/conditionals/lightcone/5star/WhereaboutsShouldDreamsRest'
import { AppPages, PageToRoute } from 'lib/constants/appPages'
import { Message } from 'lib/interactions/message'
import * as persistenceService from 'lib/services/persistenceService'
import { SaveState } from 'lib/state/saveState'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { submitForm } from 'lib/tabs/tabShowcase/showcaseApi'
import { getSelectedCharacter, useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import type { CharacterModalForm } from 'lib/overlays/modals/characterModalStore'
import type { CharacterId } from 'types/character'
import type { Form } from 'types/form'
import type { LightConeId } from 'types/lightCone'
import type { ShowcaseTabCharacter } from 'lib/tabs/tabShowcase/showcaseTabTypes'

// ── Preset types ──

export type Preset = CharacterPreset | FillerPreset

export type CharacterPreset = {
  characterId: CharacterId | null
  lightConeId: LightConeId | null
  characterEidolon?: number
  lightConeSuperimposition?: number
  rerun?: boolean
  custom?: never
}

type FillerPreset = {
  characterId?: never
  lightConeId?: never
  rerun?: never
  custom: true
}

// ── Preset characters ──

export function presetCharacters(): Preset[] {
  const DBMetadata = getGameMetadata()
  const char = (id: CharacterId) => Object.values(DBMetadata.characters).some((x) => x.id === id) ? id : null
  const lc = (id: LightConeId) => Object.values(DBMetadata.lightCones).some((x) => x.id === id) ? id : null

  return [
    { characterId: char(SilverWolfLv999.id), lightConeId: lc(WelcomeToTheCityOfStars.id) },
    { characterId: char(Evanescia.id), lightConeId: lc(EncounterAtFloweringsComing.id) },
    { characterId: char(TrailblazerElationStelle.id), lightConeId: lc(ElationBrimmingWithBlessings.id), characterEidolon: 6, lightConeSuperimposition: 5 },
    { characterId: char(TrailblazerElationCaelus.id), lightConeId: lc(ElationBrimmingWithBlessings.id), characterEidolon: 6, lightConeSuperimposition: 5 },
    { characterId: char(Ashveil.id), lightConeId: lc(TheFinaleOfALie.id) },
    { characterId: char(WeltB1.id), lightConeId: lc(InTheNameOfTheWorld.id), rerun: true },
    { characterId: char(SeeleB1.id), lightConeId: lc(InTheNight.id), rerun: true },
    { characterId: char(HuohuoB1.id), lightConeId: lc(NightOfFright.id), rerun: true },
    { characterId: char(FireflyB1.id), lightConeId: lc(WhereaboutsShouldDreamsRest.id), rerun: true },

    // { characterId: char(CASTORICE), lightConeId: lc(MAKE_FAREWELLS_MORE_BEAUTIFUL) , rerun: true},
    // { characterId: char(HYACINE), lightConeId: lc(LONG_MAY_RAINBOWS_ADORN_THE_SKY) , rerun: true},
    // { characterId: char(TRIBBIE), lightConeId: lc(IF_TIME_WERE_A_FLOWER), rerun: true },

    { custom: true },
  ].filter((x) => x.custom || !!x.characterId) as Preset[]
}

// ── Initialization ──

export function parseShowcaseUrlId(): string | null {
  return window.location.href.split('?')[1]?.split('id=')[1]?.split('&')[0] ?? null
}

/**
 * Called once on mount — handles URL parameter and saved session auto-load.
 * URL parameter takes priority over saved session.
 */
export function initializeShowcaseOnMount(): void {
  const urlId = parseShowcaseUrlId()
  const { savedSession, availableCharacters } = useShowcaseTabStore.getState()

  if (urlId) {
    // URL parameter takes priority — load that profile
    submitForm({ scorerId: urlId }, { skipCooldown: true })
  } else if (!availableCharacters?.length && savedSession.scorerId) {
    // No URL param, no data yet, but saved session has a UID — auto-load
    submitForm({ scorerId: savedSession.scorerId }, { skipCooldown: true })
  }
  // Otherwise: stay on Landing screen, wait for user input
}

/**
 * Called on tab activation (via activation listener) — URL sync only.
 * Guard: only writes URL if data is loaded and scorerId exists.
 */
export function syncShowcaseUrl(): void {
  const { availableCharacters, savedSession } = useShowcaseTabStore.getState()
  const { scorerId } = savedSession

  if (availableCharacters?.length && scorerId) {
    window.history.replaceState(
      { id: scorerId },
      `profile: ${scorerId}`,
      PageToRoute[AppPages.SHOWCASE] + `?id=${scorerId}`,
    )
  }
}

// ── Controller functions (moved from store — side effects belong here) ──

/**
 * Handles character modal OK — validation + error messages + store update.
 * Keep: null characterId check.
 * Dropped: duplicate character restriction (users can simulate same character on multiple slots).
 */
export function handleCharacterModalOk(form: CharacterModalForm): void {
  const t = i18next.getFixedT(null, 'relicScorerTab', 'Messages')

  if (!form.characterId || !form.lightCone) {
    return Message.error(t('NoCharacterSelected') /* No selected character */)
  }

  // Safe cast: after guards, characterId and lightCone are non-null
  useShowcaseTabStore.getState().applyCharacterOverride(form as ShowcaseTabCharacter['form'])
}

/**
 * Handles importing showcase characters/relics into the optimizer.
 * Persistence side effects live here, not in the store.
 */
export function importShowcaseCharacters(mode: 'singleCharacter' | 'multiCharacter'): void {
  const selectedCharacter = getSelectedCharacter()
  const { availableCharacters } = useShowcaseTabStore.getState()
  let newCharacters: ShowcaseTabCharacter[] = []

  if (mode === 'singleCharacter' && selectedCharacter?.form) {
    persistenceService.upsertCharacterFromForm(selectedCharacter.form as Form)
    newCharacters = [selectedCharacter]
  } else if (mode === 'multiCharacter' && availableCharacters) {
    availableCharacters.forEach((char) => {
      persistenceService.upsertCharacterFromForm(char.form as Form)
    })
    newCharacters = availableCharacters
  }

  const newRelics = availableCharacters
    ?.flatMap((x) => Object.values(x.equipped))
    .filter((x) => !!x)

  persistenceService.mergePartialRelics(newRelics, newCharacters)
  SaveState.delayedSave()
}

