import { Conditional, ConditionalBuff } from "types/Conditionals";
import { Form } from "types/Form";
import { ComputedStatsObject } from "lib/conditionals/constants";
export interface CharacterConditional extends Conditional {
  precomputeEffects: (request: Form) => ComputedStatsObject;
}
export type CharacterConditionalMap = {
  [key in ConditionalBuff]: number;
};
export interface PrecomputedCharacterConditional {
  BASIC_BOOST: number;
  BASIC_SCALING: number;
  DEF_SHRED: number;
  DMG_RED_MULTI: number;
  DOT_BOOST: number;
  DOT_DEF_PEN: number;
  ELEMENTAL_DMG: number;
  FUA_BOOST: number;
  FUA_DEF_PEN: number;
  SKILL_BOOST: number;
  SKILL_SCALING: number;
  ULT_BOOST: number;
}
