import { Constants } from "lib/constants";

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

export const p4 = (set: number): number => {
  return set >> 2
};


// normal: JL, Dr.Ratio
// reversed: Topaz
export const skill = (eidolon: number, value1: number, value2: number): number => {
  return eidolon >= 3 ? value2 : value1
};
export const talent = skill;
export const ultRev = skill;
export const basicRev = skill;

export const ult = (eidolon: number, value1: number, value2: number): number => {
  return eidolon >= 5 ? value2 : value1
}
export const basic = ult;
export const skillRev = ult;
export const talentRev = ult;


type SkillLevel = 10 | 12;
export const getContentForCharacterSkill = (skillLevel: SkillLevel, skill: string, skillRank: unknown): string => {
  let ret = '';

  skill.match(/#(\d+)\[\w+\]/g).forEach((token) => {
    // get params value
    token.match(/#(\d+)/).forEach((tokenPieces, i) => {
      if (i > 0) {
        // ["#4[i]", "4"]
        let value = skillRank[parseInt(tokenPieces) - 1];
        // change to percent
        if (value < 1) {
          value = Math.round(value * 100);
        }
        ret = ret.replace(token, value.toString());
      }
    });
  });

  return ret;
};