# Print combo abilities

```
window.toVisual = toVisual
window.toTurnAbility = toTurnAbility
window.preprocessTurnAbilityNames = preprocessTurnAbilityNames

////////

path = 'Erudition'
output = path.toUpperCase() + '\n----\n'
Object.values(DB.getMetadata().characters)
  .filter(x => x.path == path)
  .filter(x => x.scoringMetadata.simulation).forEach(x => {
    characterName = DB.getMetadata().characters[x.id].displayName
    combo = preprocessTurnAbilityNames(x.scoringMetadata.simulation.comboTurnAbilities).map(y => window.toVisual(window.toTurnAbility(y))).slice(1)
    output += characterName + ' - ' + combo.join(', ') + '\n\n'
  })
console.log(output)


Guidelines:
* 10 (maybe 12) actions
* [ and ] are start / end of turns
* aim for a general rotation in the middle of a fight rather than the beginning
* non damaging SKILL / ULT / etc abilities should be included for activating other effects
* BREAK now counts as an ability
* DOT DMG instances are spread evenly across the DOT abilities

```
