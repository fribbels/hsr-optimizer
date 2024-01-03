export function getDefaultForm(initialCharacter) {
  return {
    "characterId": initialCharacter.id,
    "mainBody": [
    ],
    "mainFeet": [
    ],
    "mainPlanarSphere": [
    ],
    "mainLinkRope": [
    ],
    "relicSets": [
    ],
    "ornamentSets": [
    ],
    "characterLevel": 80,
    "characterEidolon": 0,
    "lightConeLevel": 80,
    "lightConeSuperimposition": 1,
    "predictMaxedMainStat": true,
    "rankFilter": true,
    "keepCurrentRelics": false,
    "enhance": 9,
    "grade": 5,
    "enemyLevel": 95,
    "enemyCount": 1,
    "enemyResistance": 0.2,
    "enemyHpPercent": 1.0,
    "mainHead": [],
    "mainHands": [],
    "weights": {
      [Constants.Stats.HP_P]: 1,
      [Constants.Stats.ATK_P]: 1,
      [Constants.Stats.DEF_P]: 1,
      [Constants.Stats.SPD_P]: 1,
      [Constants.Stats.HP]: 1,
      [Constants.Stats.ATK]: 1,
      [Constants.Stats.DEF]: 1,
      [Constants.Stats.SPD]: 1,
      [Constants.Stats.CD]: 1,
      [Constants.Stats.CR]: 1,
      [Constants.Stats.EHR]: 1,
      [Constants.Stats.RES]: 1,
      [Constants.Stats.BE]: 1,
      topPercent: 100
    },
    "setConditionals": {
      "The Ashblazing Grand Duke": [undefined, 2],
      "Prisoner in Deep Confinement": [undefined, true]
    }
  }
}