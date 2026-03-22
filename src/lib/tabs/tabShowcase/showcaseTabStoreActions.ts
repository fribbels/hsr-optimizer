import type { ShowcaseTabCharacter, ShowcaseTabState } from 'lib/tabs/tabShowcase/showcaseTabTypes'

/**
 * Pure compute function for applying a character override at the selected index.
 * Used when a simulation preset is clicked or character is swapped via modal.
 * No validation — the controller handles that.
 */
export function computeCharacterOverride(
  state: ShowcaseTabState,
  form: ShowcaseTabCharacter['form'],
): Pick<ShowcaseTabState, 'availableCharacters'> {
  // Guard is in the store action — availableCharacters is guaranteed non-null here
  const { availableCharacters, selectedIndex } = state
  const currentChar = availableCharacters![selectedIndex]

  const updatedCharacter: ShowcaseTabCharacter = {
    ...currentChar,
    id: form.characterId!,
    form,
    equipped: Object.fromEntries(
      Object.entries(currentChar.equipped).map(([part, relic]) =>
        [part, relic ? { ...relic, equippedBy: form.characterId! } : null],
      ),
    ) as ShowcaseTabCharacter['equipped'],
  }

  const updatedCharacters = [...availableCharacters!]
  updatedCharacters[selectedIndex] = updatedCharacter

  return { availableCharacters: updatedCharacters }
}
