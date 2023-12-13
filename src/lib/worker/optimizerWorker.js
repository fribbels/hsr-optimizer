import { lib } from './testLib.js'
import { Constants } from '../constants.js'
import { character } from 'stylis';

self.onmessage = function (e) {
  // console.log("Message received from main script", e);

  let data = e.data;
  let relics = data.relics;
  let character = data.character;
  let Stats = Constants.Stats;

  let rows = []
  let lSize = data.consts.lSize
  let pSize = data.consts.pSize
  let fSize = data.consts.fSize
  let bSize = data.consts.bSize
  let gSize = data.consts.gSize
  let hSize = data.consts.hSize

  let relicSetSolutions = data.consts.relicSetSolutions
  let ornamentSetSolutions = data.consts.ornamentSetSolutions

  let relicSetToIndex = data.relicSetToIndex
  let ornamentSetToIndex = data.ornamentSetToIndex

  let elementalMultipliers = data.elementalMultipliers

  let trace = character.traces
  let lc = character.lightCone
  let base = character.base

  let request = data.request

  function sum(h, g, b, f, p, l, stat) {
    return relics.Head[h].augmentedStats[stat] +
      relics.Hands[g].augmentedStats[stat] +
      relics.Body[b].augmentedStats[stat] +
      relics.Feet[f].augmentedStats[stat] +
      relics.PlanarSphere[p].augmentedStats[stat] +
      relics.LinkRope[l].augmentedStats[stat]
  }

  for (let row = 0; row < data.HEIGHT; row++) {
    for (let col = 0; col < data.WIDTH; col++) {
      
      let x = data.skip + row * data.HEIGHT + col

      if (x >= data.permutations) {
        continue;
      }

      let l = (x % lSize);
      let p = (((x - l) / lSize) % pSize);
      let f = (((x - p * lSize - l) / (lSize * pSize)) % fSize);
      let b = (((x - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize)) % bSize);
      let g = (((x - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize)) % gSize);
      let h = (((x - g * bSize * fSize * pSize * lSize - b * fSize * pSize * lSize - f * pSize * lSize - p * lSize - l) / (lSize * pSize * fSize * bSize * gSize)) % hSize);

      let setH = relicSetToIndex[relics.Head[h].set]
      let setG = relicSetToIndex[relics.Hands[g].set]
      let setB = relicSetToIndex[relics.Body[b].set]
      let setF = relicSetToIndex[relics.Feet[f].set]

      let setP = ornamentSetToIndex[relics.PlanarSphere[p].set]
      let setL = ornamentSetToIndex[relics.LinkRope[l].set]

      let relicSetCount = data.consts.relicSetCount
      let ornamentSetCount = data.consts.ornamentSetCount
      let relicSetIndex = setH + setB * relicSetCount + setG * relicSetCount * relicSetCount + setF * relicSetCount * relicSetCount * relicSetCount
      let ornamentSetIndex = setP + setL * ornamentSetCount;

      let PasserbyOfWanderingCloud       = (1 >> (setH ^ 0))  + (1 >> (setG ^ 0))  + (1 >> (setB ^ 0))  + (1 >> (setF ^ 0)) // Passerby of Wandering Cloud
      let MusketeerOfWildWheat           = (1 >> (setH ^ 1))  + (1 >> (setG ^ 1))  + (1 >> (setB ^ 1))  + (1 >> (setF ^ 1)) // Musketeer of Wild Wheat
      let KnightOfPurityPalace           = (1 >> (setH ^ 2))  + (1 >> (setG ^ 2))  + (1 >> (setB ^ 2))  + (1 >> (setF ^ 2)) // Knight of Purity Palace
      let HunterOfGlacialForest          = (1 >> (setH ^ 3))  + (1 >> (setG ^ 3))  + (1 >> (setB ^ 3))  + (1 >> (setF ^ 3)) // Hunter of Glacial Forest
      let ChampionOfStreetwiseBoxing     = (1 >> (setH ^ 4))  + (1 >> (setG ^ 4))  + (1 >> (setB ^ 4))  + (1 >> (setF ^ 4)) // Champion of Streetwise Boxing
      let GuardOfWutheringSnow           = (1 >> (setH ^ 5))  + (1 >> (setG ^ 5))  + (1 >> (setB ^ 5))  + (1 >> (setF ^ 5)) // Guard of Wuthering Snow
      let FiresmithOfLavaForging         = (1 >> (setH ^ 6))  + (1 >> (setG ^ 6))  + (1 >> (setB ^ 6))  + (1 >> (setF ^ 6)) // Firesmith Of Lava-Forging
      let GeniusOfBrilliantStars         = (1 >> (setH ^ 7))  + (1 >> (setG ^ 7))  + (1 >> (setB ^ 7))  + (1 >> (setF ^ 7)) // Genius of Brilliant Stars
      let BandOfSizzlingThunder          = (1 >> (setH ^ 8))  + (1 >> (setG ^ 8))  + (1 >> (setB ^ 8))  + (1 >> (setF ^ 8)) // Band of Sizzling Thunder
      let EagleOfTwilightLine            = (1 >> (setH ^ 9))  + (1 >> (setG ^ 9))  + (1 >> (setB ^ 9))  + (1 >> (setF ^ 9)) // Eagle of Twilight Line
      let ThiefOfShootingMeteor          = (1 >> (setH ^ 10)) + (1 >> (setG ^ 10)) + (1 >> (setB ^ 10)) + (1 >> (setF ^ 10)) // Thief of Shooting Meteor
      let WastelanderOfBanditryDesert    = (1 >> (setH ^ 11)) + (1 >> (setG ^ 11)) + (1 >> (setB ^ 11)) + (1 >> (setF ^ 11)) // Wastelander of Banditry Desert
      let LongevousDisciple              = (1 >> (setH ^ 12)) + (1 >> (setG ^ 12)) + (1 >> (setB ^ 12)) + (1 >> (setF ^ 12)) // Longevous Disciple
      let MessengerTraversingHackerspace = (1 >> (setH ^ 13)) + (1 >> (setG ^ 13)) + (1 >> (setB ^ 13)) + (1 >> (setF ^ 13)) // Messenger Traversing Hackerspace
      let TheAshblazingGrandDuke         = (1 >> (setH ^ 14)) + (1 >> (setG ^ 14)) + (1 >> (setB ^ 14)) + (1 >> (setF ^ 14)) // The Ashblazing Grand Duke
      let PrisonerInDeepConfinement      = (1 >> (setH ^ 15)) + (1 >> (setG ^ 15)) + (1 >> (setB ^ 15)) + (1 >> (setF ^ 15)) // Prisoner in Deep Confinement

      let SpaceSealingStation           = (1 >> (setP ^ 0))  + (1 >> (setL ^ 0)) // Space Sealing Station
      let FleetOfTheAgeless             = (1 >> (setP ^ 1))  + (1 >> (setL ^ 1)) // Fleet of the Ageless
      let PanCosmicCommercialEnterprise = (1 >> (setP ^ 2))  + (1 >> (setL ^ 2)) // Pan-Cosmic Commercial Enterprise
      let BelobogOfTheArchitects        = (1 >> (setP ^ 3))  + (1 >> (setL ^ 3)) // Belobog of the Architects
      let CelestialDifferentiator       = (1 >> (setP ^ 4))  + (1 >> (setL ^ 4)) // Celestial Differentiator
      let InertSalsotto                 = (1 >> (setP ^ 5))  + (1 >> (setL ^ 5)) // Inert Salsotto
      let TaliaKingdomOfBanditry        = (1 >> (setP ^ 6))  + (1 >> (setL ^ 6)) // Talia: Kingdom of Banditry
      let SprightlyVonwacq              = (1 >> (setP ^ 7))  + (1 >> (setL ^ 7)) // Sprightly Vonwacq
      let RutilantArena                 = (1 >> (setP ^ 8))  + (1 >> (setL ^ 8)) // Rutilant Arena
      let BrokenKeel                    = (1 >> (setP ^ 9))  + (1 >> (setL ^ 9)) // Broken Keel
      let FirmamentFrontlineGlamoth     = (1 >> (setP ^ 10)) + (1 >> (setL ^ 10)) // Firmament Frontline: Glamoth
      let PenaconyLandOfTheDreams       = (1 >> (setP ^ 11)) + (1 >> (setL ^ 11)) // Penacony, Land of the Dreams

      let elementalDmg = 0
      if (elementalMultipliers[0]) elementalDmg = 0.1 * p2(ChampionOfStreetwiseBoxing) + (base[Stats.Physical_DMG] + lc[Stats.Physical_DMG] + sum(h, g, b, f, p, l, Stats.Physical_DMG) + trace[Stats.Physical_DMG])
      if (elementalMultipliers[1]) elementalDmg = 0.1 * p2(FiresmithOfLavaForging) + (base[Stats.Fire_DMG] + lc[Stats.Fire_DMG] + sum(h, g, b, f, p, l, Stats.Fire_DMG) + trace[Stats.Fire_DMG])
      if (elementalMultipliers[2]) elementalDmg = 0.1 * p2(HunterOfGlacialForest) + (base[Stats.Ice_DMG] + lc[Stats.Ice_DMG] + sum(h, g, b, f, p, l, Stats.Ice_DMG) + trace[Stats.Ice_DMG])
      if (elementalMultipliers[3]) elementalDmg = 0.1 * p2(BandOfSizzlingThunder) + (base[Stats.Lightning_DMG] + lc[Stats.Lightning_DMG] + sum(h, g, b, f, p, l, Stats.Lightning_DMG) + trace[Stats.Lightning_DMG])
      if (elementalMultipliers[4]) elementalDmg = 0.1 * p2(EagleOfTwilightLine) + (base[Stats.Wind_DMG] + lc[Stats.Wind_DMG] + sum(h, g, b, f, p, l, Stats.Wind_DMG) + trace[Stats.Wind_DMG])
      if (elementalMultipliers[5]) elementalDmg = 0.1 * p2(GeniusOfBrilliantStars) + (base[Stats.Quantum_DMG] + lc[Stats.Quantum_DMG] + sum(h, g, b, f, p, l, Stats.Quantum_DMG) + trace[Stats.Quantum_DMG])
      if (elementalMultipliers[6]) elementalDmg = 0.1 * p2(WastelanderOfBanditryDesert) + (base[Stats.Imaginary_DMG] + lc[Stats.Imaginary_DMG] + sum(h, g, b, f, p, l, Stats.Imaginary_DMG) + trace[Stats.Imaginary_DMG])

      let character = {}

      let crSum = sum(h, g, b, f, p, l, Stats.CR)
      let cdSum = sum(h, g, b, f, p, l, Stats.CD)
      character[Stats.HP]  = (base[Stats.HP]  + lc[Stats.HP])  * (1 + 0.12 * p2(FleetOfTheAgeless) + 0.12 * p2(LongevousDisciple) + sum(h, g, b, f, p, l, Stats.HP_P) + trace[Stats.HP_P] + lc[Stats.HP_P]) + sum(h, g, b, f, p, l, Stats.HP)
      character[Stats.ATK] = (base[Stats.ATK] + lc[Stats.ATK]) * (1 + 0.12 * p2(SpaceSealingStation) + 0.12 * p2(FirmamentFrontlineGlamoth) + 0.12 * p2(MusketeerOfWildWheat) + 0.12 * p2(PrisonerInDeepConfinement) + sum(h, g, b, f, p, l, Stats.ATK_P) + trace[Stats.ATK_P] + lc[Stats.ATK_P]) + sum(h, g, b, f, p, l, Stats.ATK)
      character[Stats.DEF] = (base[Stats.DEF] + lc[Stats.DEF]) * (1 + 0.15 * p2(BelobogOfTheArchitects) + 0.15 * p2(KnightOfPurityPalace) + sum(h, g, b, f, p, l, Stats.DEF_P) + trace[Stats.DEF_P] + lc[Stats.DEF_P]) + sum(h, g, b, f, p, l, Stats.DEF)
      character[Stats.SPD] = (base[Stats.SPD] + lc[Stats.SPD]) * (1 + 0.06 * p2(MessengerTraversingHackerspace) + 0.06 * p4(MusketeerOfWildWheat) + sum(h, g, b, f, p, l, Stats.SPD_P) + trace[Stats.SPD_P]) + sum(h, g, b, f, p, l, Stats.SPD) + trace[Stats.SPD]
      character[Stats.CR]  = 0.08 * p2(InertSalsotto) + 0.08 * p2(RutilantArena) + (base[Stats.CR] + lc[Stats.CR] + crSum + trace[Stats.CR])
      character[Stats.CD]  = 0.16 * p2(CelestialDifferentiator) + (base[Stats.CD] + lc[Stats.CD] + cdSum + trace[Stats.CD])
      character[Stats.EHR] = 0.1  * p2(PanCosmicCommercialEnterprise) + (base[Stats.EHR] + lc[Stats.EHR] + sum(h, g, b, f, p, l, Stats.EHR) + trace[Stats.EHR])
      character[Stats.RES] = 0.1  * p2(BrokenKeel) + (base[Stats.RES] + lc[Stats.RES] + sum(h, g, b, f, p, l, Stats.RES) + trace[Stats.RES])
      character[Stats.BE]  = 0.16 * p2(TaliaKingdomOfBanditry) + 0.16 * p2(LongevousDisciple) + 0.16 * p4(LongevousDisciple) + (base[Stats.BE] + lc[Stats.BE] + sum(h, g, b, f, p, l, Stats.BE) + trace[Stats.BE])
      character[Stats.ERR] = 0.05 * p2(SprightlyVonwacq) + 0.05 * p2(PenaconyLandOfTheDreams) + (base[Stats.ERR] + lc[Stats.ERR] + sum(h, g, b, f, p, l, Stats.ERR) + trace[Stats.ERR])
      character[Stats.OHB] = 0.1  * p2(PasserbyOfWanderingCloud) + (base[Stats.OHB] + lc[Stats.OHB] + sum(h, g, b, f, p, l, Stats.OHB) + trace[Stats.OHB])
      character['ED'] = elementalDmg
      character['id'] = x

      let cappedCrit = Math.min(character[Stats.CR] + request.buffCr, 1)
      let dmg = (character[Stats.ATK] + request.buffAtk + (request.buffAtkP * (base[Stats.ATK] + lc[Stats.ATK]))) * (1 + character[Stats.CD] + request.buffCd) * cappedCrit * (1 + elementalDmg)
      let mcd = (character[Stats.ATK] + request.buffAtk + (request.buffAtkP * (base[Stats.ATK] + lc[Stats.ATK]))) * (1 + character[Stats.CD] + request.buffCd) * (1 + elementalDmg)
      let ehp = character[Stats.HP] / (1 - character[Stats.DEF] / (character[Stats.DEF] + 200 + 10 * 80))
      let cv = 100 * (crSum * 2 + cdSum)

      character.CV = cv
      character.DMG = dmg
      character.MCD = mcd
      character.EHP = ehp

      let result =
        character[Stats.HP]  >= request.minHp && character[Stats.HP] <= request.maxHp &&
        character[Stats.ATK] >= request.minAtk && character[Stats.ATK] <= request.maxAtk &&
        character[Stats.DEF] >= request.minDef && character[Stats.DEF] <= request.maxDef &&
        character[Stats.SPD] >= request.minSpd && character[Stats.SPD] <= request.maxSpd &&
        character[Stats.CR] >= request.minCr && character[Stats.CR] <= request.maxCr &&
        character[Stats.CD] >= request.minCd && character[Stats.CD] <= request.maxCd &&
        character[Stats.EHR] >= request.minEhr && character[Stats.EHR] <= request.maxEhr &&
        character[Stats.RES] >= request.minRes && character[Stats.RES] <= request.maxRes &&
        character[Stats.BE] >= request.minBe && character[Stats.BE] <= request.maxBe &&
        cv >= request.minCv && cv <= request.maxCv &&
        dmg >= request.minDmg && dmg <= request.maxDmg &&
        mcd >= request.minMcd && mcd <= request.maxMcd &&
        ehp >= request.minEhp && ehp <= request.maxEhp

      calculateCharacterColumns(character)

      if (result && (relicSetSolutions[relicSetIndex] == 1) && (ornamentSetSolutions[ornamentSetIndex] == 1)) {
        rows.push(character)
      }
    }
  }

  self.postMessage({
    rows: rows,
  });
}

function calculateCharacterColumns(character) {
  character.basic = 100
  character.skill = 200
  character.ult = 300
  character.extra = 400
}

function p4(set) {
  return set >> 2
}

function p2(set) {
  return Math.min(1, set >> 1)
}