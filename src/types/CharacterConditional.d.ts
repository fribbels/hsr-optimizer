import { Conditional, ConditionalBuff } from 'types/Conditionals'

export interface CharacterConditional extends Conditional {
}

export type CharacterConditionalMap = {
  [key in ConditionalBuff]: number;
}
