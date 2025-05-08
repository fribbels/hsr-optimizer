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


Hook - [ ULT, SKILL ], [ SKILL ], [ SKILL ], [ SKILL ] // added 1 skill
+ preprocessor? //Y



Glacial
4-Pc: After the wearer uses their Ultimate, their CRIT DMG increases by 25% for 2 turn(s).

Firesmith
4-Pc: Increases DMG by the wearer's Skill by 12%. After unleashing Ultimate, increases the wearer's Fire DMG by 12% for the next attack.

Thunder
4-Pc: When the wearer uses their Skill, increases the wearer's ATK by 20% for 1 turn(s).

Messenger
4-Pc: When the wearer uses their Ultimate on an ally, SPD for all allies increases by 12% for 1 turn(s). This effect cannot be stacked.

Watchmaker
4-Pc: When the wearer uses their Ultimate on an ally, all allies' Break Effect increases by 30% for 2 turn(s). This effect cannot be stacked.

Valorous
4-Pc: Increases the wearer's CRIT Rate by 6%. After the wearer uses a Follow-up ATK, increases DMG dealt by Ultimate by 36%, lasting for 1 turn(s).

Captain
4-Pc: When the wearer becomes the target of another ally target's ability, gains 1 stack of "Help," stacking up to 2 time(s). If there are 2 stack(s) of "Help" when the wearer uses their Ultimate, consumes all "Help" to increase the wearer's ATK by 48% for 1 turn(s).