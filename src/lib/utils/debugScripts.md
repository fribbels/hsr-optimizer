# Print combo abilities

```
window.toVisual = toVisual
window.toTurnAbility = toTurnAbility
window.preprocessTurnAbilityNames = preprocessTurnAbilityNames

...

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
DESTRUCTION
----
Arlan - [ ULT, SKILL ], [ SKILL ], [ SKILL ]

Clara - [ ULT, SKILL ], FUA, FUA, FUA

Hook - [ ULT, SKILL ], [ SKILL ], [ SKILL ]
+ preprocessor?

Blade - [ ULT, BASIC ], FUA, [ BASIC ]
+ skill?

Jingliu - [ ULT, SKILL ], [ SKILL ], [ SKILL ]
+ preprocessor?

Imbibitor Lunae - [ SKILL, ULT ], [ SKILL ], [ SKILL ]
+ assumes everything is full stacked

Xueyi - [ ULT, FUA, SKILL ], FUA, [ SKILL ], FUA
+ 1 break

Yunli - [ ULT, SKILL ], FUA
+ preprocessor?

Firefly - [ ULT, SKILL ], [ SKILL ], [ SKILL ]
+ preprocessor
+ BREAK

Misha - [ ULT, SKILL ], [ SKILL ], [ SKILL ]

Mydei - [ SKILL ], [ ULT, SKILL ]
+ preprocessor?

Stelle / Caelus (Destruction) - [ ULT, SKILL ], [ SKILL ], [ SKILL ]
+ break?



NIHILITY
----
Welt - [ ULT, SKILL ], [ SKILL ], [ SKILL ]

Kafka - [ ULT, DOT, SKILL, DOT ], FUA, [ SKILL, DOT ], FUA
+ 16 dots distributed

Sampo - [ ULT, SKILL ], [ SKILL ], [ SKILL ]
+ 60 dots distributed

Luka - [ ULT, SKILL ], [ BASIC ], [ BASIC ]
+ 5 dots distributed
+ 1 break

Fugue - [ ULT, BASIC ], [ BASIC ], [ BASIC ]
+ 3 breaks to stop her sim from building crit

Black Swan - [ ULT, SKILL ], DOT, [ BASIC ], DOT, [ BASIC ], DOT
+ 16 dots distributed

Acheron - [ ULT, SKILL ], [ SKILL ]

Cipher - [ ULT, SKILL ], FUA, [ SKILL ], FUA, [ BASIC ], FUA



HARMONY
----
Tribbie - [ ULT, FUA, BASIC ], FUA, FUA
+ skill?


PRESERVATION
----
Aventurine - [ ULT, BASIC ], FUA, [ BASIC ], FUA
+ skill?


REMEMBRANCE
----
Aglaea - [ ULT, BASIC ], MEMO_SKILL, MEMO_SKILL, [ BASIC ], MEMO_SKILL

Castorice - [ SKILL ], [ SKILL ], ULT, MEMO_SKILL, MEMO_SKILL, MEMO_SKILL, MEMO_SKILL, MEMO_TALENT
+ already has rotation preprocessor for e1 and e2, adjacent memoskills are considered connected


```

FINALIZED:
=====================================


HUNT
----
Dan Heng - [ SKILL, ULT ], [ SKILL ], [ SKILL ]

Seele - [ ULT, SKILL, SKILL, SKILL ], [ SKILL ]

Topaz & Numby - [ ULT, BASIC ], FUA, FUA, [ SKILL ], FUA, [ BASIC ], FUA, [BASIC ], FUA

Sushang - [ SKILL, ULT, BREAK ], [ SKILL ], [ SKILL ], [ SKILL ]

Yanqing - [ ULT, SKILL, FUA ], [ SKILL, FUA], [ SKILL ], [ SKILL ]

Feixiao - [ ULT, SKILL, FUA ], FUA, [ ULT, SKILL, FUA ], FUA

Moze - [ SKILL ], ULT, FUA, FUA, FUA

March 7th (Hunt) - [ ULT, BREAK, BASIC ], FUA, [ BASIC ], FUA, [ BASIC ], FUA

Dr. Ratio - [ ULT, SKILL , FUA ], FUA, [ SKILL , FUA ], FUA, [ SKILL, FUA ]

Boothill - [ SKILL, ULT, BASIC, BREAK ], [ BASIC ], [ BASIC, BREAK ]




ERUDITION
----
Himeko - [ ULT, FUA, SKILL ], FUA, [ SKILL, BREAK ], FUA

Herta - [ ULT, FUA, SKILL ], FUA, [ SKILL ], FUA
+ preprocessor

Serval - [ ULT, SKILL ], [ SKILL ]

Qingque - [ SKILL, ULT, BASIC ], FUA, [ SKILL, BASIC ], FUA

Jing Yuan - [ ULT, SKILL ], [ SKILL ], FUA, [ SKILL ], [ ULT, SKILL ], FUA, [ SKILL ], [ SKILL ], FUA

Argenti - [ ULT, SKILL ], [ ULT, ULT, SKILL ], [ ULT, SKILL ]
+ default small ults

Jade - [ SKILL ], ULT, FUA, [ BASIC ], FUA, FUA, [ BASIC ], FUA

Rappa - [ ULT, BASIC ], [ BASIC ], [ BASIC, BREAK ], [ SKILL ]

The Herta - [ SKILL, ULT ], [ SKILL ]

Anaxa - [ SKILL, SKILL, ULT ], [ SKILL, SKILL ]


