import { Constants } from "lib/constants";
import { SuperImpositionLevel } from "types/LightCone";
import { LightCone } from "types/LightCone";

export const precisionRound = (number: number, precision: number = 8): number => {
  const factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
};

// Remove the ashblazing set atk bonus only when calc-ing fua attacks
export const calculateAshblazingSet = (c, request, hitMulti): {
  ashblazingMulti: number,
  ashblazingAtk: number
} => {
  const enabled = p4(c.sets.TheAshblazingGrandDuke);
  const valueTheAshblazingGrandDuke = request.setConditionals[Constants.Sets.TheAshblazingGrandDuke][1];
  const ashblazingAtk = 0.06 * valueTheAshblazingGrandDuke * enabled * c.baseAtk * enabled;
  const ashblazingMulti = hitMulti * enabled * c.baseAtk;

  return {
    ashblazingMulti,
    ashblazingAtk
  }
};

export const getLightconeFullDescription = (s: SuperImpositionLevel, lc: LightCone): string => {
  let desc = lc.ranks.desc || "Increases the wearer's CRIT DMG by #1[i]%." 
  + "When an ally (excluding the wearer) gets attacked or loses HP, the wearer gains 1 stack of Eclipse, up to a max of #2[i] stack(s)."
  + "Each stack of Eclipse increases the DMG of the wearer's next attack by #3[f1]%."
  + "When #2[i] stack(s) are reached, additionally enables that attack to ignore #4[i]% of the enemy's DEF."
  + "This effect will be removed after the wearer uses an attack.";

  desc = desc.replace(/#1\[i\]/g, lc.ranks.params[s - 1][0].toString());

  return desc;
};

export const p4 = (set: number): number => {
  return set >> 2
};

export const skill = (eidolon: number, value1: number, value2: number): number => {
  return eidolon >= 3 ? value2 : value1
};

export const ult = (eidolon: number, value1: number, value2: number): number => {
  return eidolon >= 5 ? value2 : value1
}

export const talent = skill;
export const basic = ult;