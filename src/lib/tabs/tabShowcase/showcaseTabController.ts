import i18next from 'i18next'
import { Evanescia } from 'lib/conditionals/character/1500/Evanescia'
import { MortenaxBlade } from 'lib/conditionals/character/1500/MortenaxBlade'
import { SilverWolfLv999 } from 'lib/conditionals/character/1500/SilverWolfLv999'
import {
  TrailblazerElationCaelus,
  TrailblazerElationStelle,
} from 'lib/conditionals/character/8000/TrailblazerElation'
import { ElationBrimmingWithBlessings } from 'lib/conditionals/lightcone/5star/ElationBrimmingWithBlessings'
import { ReforgedInHellfire } from 'lib/conditionals/lightcone/5star/ReforgedInHellfire'
import { UntilTheFlowersBloomAgain } from 'lib/conditionals/lightcone/5star/UntilTheFlowersBloomAgain'
import { WelcomeToTheCosmicCity } from 'lib/conditionals/lightcone/5star/WelcomeToTheCosmicCity'
import {
  AppPages,
  PageToRoute,
} from 'lib/constants/appPages'
import { Message } from 'lib/interactions/message'
import type { CharacterModalForm } from 'lib/overlays/modals/characterModalStore'
import * as persistenceService from 'lib/services/persistenceService'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { SaveState } from 'lib/state/saveState'
import { submitForm } from 'lib/tabs/tabShowcase/showcaseApi'
import type { ShowcaseTabCharacter } from 'lib/tabs/tabShowcase/showcaseTabTypes'
import {
  getSelectedCharacter,
  useShowcaseTabStore,
} from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import type { CharacterId } from 'types/character'
import type { Form } from 'types/form'
import type { LightConeId } from 'types/lightCone'

// ── Preset types ──

export type Preset = CharacterPreset | FillerPreset

export type CharacterPreset = {
  characterId: CharacterId | null,
  lightConeId: LightConeId | null,
  characterEidolon?: number,
  lightConeSuperimposition?: number,
  rerun?: boolean,
  custom?: never,
}

type FillerPreset = {
  characterId?: never,
  lightConeId?: never,
  rerun?: never,
  custom: true,
}

// ── Preset characters ──

export function presetCharacters(): Preset[] {
  const DBMetadata = getGameMetadata()
  const char = (id: CharacterId) => Object.values(DBMetadata.characters).some((x) => x.id === id) ? id : null
  const lc = (id: LightConeId) => Object.values(DBMetadata.lightCones).some((x) => x.id === id) ? id : null

  return [
    { characterId: char(MortenaxBlade.id), lightConeId: lc(ReforgedInHellfire.id) },
    { characterId: char(SilverWolfLv999.id), lightConeId: lc(WelcomeToTheCosmicCity.id) },
    { characterId: char(Evanescia.id), lightConeId: lc(UntilTheFlowersBloomAgain.id) },
    { characterId: char(TrailblazerElationStelle.id), lightConeId: lc(ElationBrimmingWithBlessings.id), characterEidolon: 6, lightConeSuperimposition: 5 },
    { characterId: char(TrailblazerElationCaelus.id), lightConeId: lc(ElationBrimmingWithBlessings.id), characterEidolon: 6, lightConeSuperimposition: 5 },

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
 * Called on tab activation — handles URL parameter and saved session auto-load.
 * Idempotent: skips fetch if already loading or if the same ID is already loaded.
 */
export function initializeShowcaseOnMount(): void {
  const urlId = parseShowcaseUrlId()
  const { savedSession, availableCharacters, loading } = useShowcaseTabStore.getState()

  if (loading) return

  if (urlId) {
    if (availableCharacters?.length && savedSession.scorerId === urlId) return
    submitForm({ scorerId: urlId }, { skipCooldown: true })
  } else if (!availableCharacters?.length && savedSession.scorerId) {
    submitForm({ scorerId: savedSession.scorerId }, { skipCooldown: true })
  }
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
export function handleCharacterModalOk(form: CharacterModalForm): boolean {
  const t = i18next.getFixedT(null, 'relicScorerTab', 'Messages')

  if (!form.characterId) {
    Message.error(t('NoCharacterSelected'))
    return false
  }
  if (!form.lightCone) {
    Message.error(t('NoSelectedLightCone'))
    return false
  }

  // Safe cast: after guards, characterId and lightCone are non-null
  useShowcaseTabStore.getState().applyCharacterOverride(form as ShowcaseTabCharacter['form'])
  return true
}

/**
 * Handles importing showcase characters/relics into the optimizer.
 * Persistence side effects live here, not in the store.
 */
export function importShowcaseCharacters(mode: 'relics' | 'singleCharacter' | 'multiCharacter'): void {
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
