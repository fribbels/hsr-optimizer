# Print combo abilities

```
window.toVisual = toVisual
window.toTurnAbility = toTurnAbility
window.preprocessTurnAbilityNames = preprocessTurnAbilityNames

...

path = 'Hunt'
output = path.toUpperCase() + '\n----\n'
Object.values(DB.getMetadata().characters)
  .filter(x => x.path == 'Hunt')
  .filter(x => x.scoringMetadata.simulation).forEach(x => {
    characterName = DB.getMetadata().characters[x.id].displayName
    combo = preprocessTurnAbilityNames(x.scoringMetadata.simulation.comboTurnAbilities).map(y => window.toVisual(window.toTurnAbility(y))).slice(1)
    output += characterName + ' - ' + combo.join(', ') + '\n\n'
  })
console.log(output)
```