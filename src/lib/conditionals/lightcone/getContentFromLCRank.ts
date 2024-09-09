import { LightConeRawRank } from 'types/LightConeConditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { precisionRound } from 'lib/conditionals/conditionalUtils.ts'

/**
 * Takss a SuperImpositionLevel and a LightConeRawRank and returns a string
 * String will contain tokens in the shape of "#1[i]" where (#x - 1) is the index of the param.
 * SuperImpositionLevel indicates rank values to use.
 *
 * Ranks are copied/stored in src/data/en/light_cone_ranks.json; imported from Mar-7th repo.
 *
 * Exmaple rank:
 *
 *const lcRank = {
 *"id": "23014",
 *"skill": "With This Evening Jade",
 *"desc": "Increases the wearer's CRIT DMG by #1[i]%. When an ally (excluding the wearer) gets attacked or loses HP, the wearer gains 1 stack of Eclipse, up to a max of #2[i] stack(s). Each stack of Eclipse increases the DMG of the wearer's next attack by #3[f1]%. When #2[i] stack(s) are reached, additionally enables that attack to ignore #4[i]% of the enemy's DEF. This effect will be removed after the wearer uses an attack.",
 *"params": [
 *  [0.2, 3, 0.14, 0.12], [0.23, 3, 0.165, 0.14],
 *  [0.26, 3, 0.19, 0.16], [0.29, 3, 0.215, 0.18], [0.32, 3, 0.24, 0.2]
 *],
 *"properties": [
 *  [{ "type": "CriticalDamageBase", "value": 0.2 }],
 *  [{ "type": "CriticalDamageBase", "value": 0.23 }],
 *  [{ "type": "CriticalDamageBase", "value": 0.26 }],
 *  [{ "type": "CriticalDamageBase", "value": 0.29 }],
 *  [{ "type": "CriticalDamageBase", "value": 0.32 }]
 *]
 *};
 *
 * @param s
 * @param lcRank
 * @returns
 */
const getContentFromLCRanks = (s: SuperImpositionLevel, lcRank: LightConeRawRank): string => {
  const params = lcRank.params[s]
  let ret = lcRank.desc

  // on render,
  if (params) {
    // const properties = lcRank.properties[s];
    lcRank.desc.match(/#(\d+)\[\w+\]/g)?.forEach((token) => {
      // get params value
      token.match(/#(\d+)/)?.forEach((tokenPieces, i) => {
        if (i > 0) {
          // ["#4[i]", "4"]
          let value = params[parseInt(tokenPieces) - 1]
          /*
           * change to percent
           * TODO: This isnt correct in all cases, "There is a 100% chance" gets turned into "There is a 1% chance": Incessant Rain
           */
          if (value < 1) {
            value = precisionRound(value * 100)
          }
          ret = ret.replace(token, value.toString())
        }
      })
    })
  }

  return ret
}

export default getContentFromLCRanks
