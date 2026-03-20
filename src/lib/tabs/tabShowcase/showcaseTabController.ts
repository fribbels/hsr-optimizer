import i18next from 'i18next'
import { Ashveil } from 'lib/conditionals/character/1500/Ashveil'
import { Sparxie } from 'lib/conditionals/character/1500/Sparxie'
import { Yaoguang } from 'lib/conditionals/character/1500/Yaoguang'
import { DazzledByAFloweryWorld } from 'lib/conditionals/lightcone/5star/DazzledByAFloweryWorld'
import { TheFinaleOfALie } from 'lib/conditionals/lightcone/5star/TheFinaleOfALie'
import { WhenSheDecidedToSee } from 'lib/conditionals/lightcone/5star/WhenSheDecidedToSee'
import { AppPages, PageToRoute } from 'lib/constants/appPages'
import { Message } from 'lib/interactions/message'
import * as persistenceService from 'lib/services/persistenceService'
import { SaveState } from 'lib/state/saveState'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { submitForm } from 'lib/tabs/tabShowcase/showcaseApi'
import { getSelectedCharacter, useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import type { CharacterId } from 'types/character'
import type { Form } from 'types/form'
import type { LightConeId } from 'types/lightCone'
import type { ShowcaseTabCharacter } from 'lib/tabs/tabShowcase/showcaseTabTypes'

// ── Preset types ──

export type Preset = CharacterPreset | FillerPreset

export type CharacterPreset = {
  characterId: CharacterId | null
  lightConeId: LightConeId | null
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
    { characterId: char(Yaoguang.id), lightConeId: lc(WhenSheDecidedToSee.id) },
    { characterId: char(Sparxie.id), lightConeId: lc(DazzledByAFloweryWorld.id) },
    { characterId: char(Ashveil.id), lightConeId: lc(TheFinaleOfALie.id) },

    // { characterId: char(CASTORICE), lightConeId: lc(MAKE_FAREWELLS_MORE_BEAUTIFUL) , rerun: true},
    // { characterId: char(HYACINE), lightConeId: lc(LONG_MAY_RAINBOWS_ADORN_THE_SKY) , rerun: true},
    // { characterId: char(TRIBBIE), lightConeId: lc(IF_TIME_WERE_A_FLOWER), rerun: true },

    { custom: true },
  ].filter((x) => x.custom || !!x.characterId) as Preset[]
}

// ── Initialization ──

function parseShowcaseUrlId(): string | null {
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
    submitForm({ scorerId: urlId })
  } else if (!availableCharacters?.length && savedSession.scorerId) {
    // No URL param, no data yet, but saved session has a UID — auto-load
    submitForm({ scorerId: savedSession.scorerId })
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
export function handleCharacterModalOk(form: ShowcaseTabCharacter['form']): void {
  const t = i18next.getFixedT(null, 'relicScorerTab', 'Messages')

  if (!form.characterId) {
    return Message.error(t('NoCharacterSelected') /* No selected character */)
  }

  useShowcaseTabStore.getState().applyCharacterOverride(form)
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

