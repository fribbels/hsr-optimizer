import { ConditionalBuff, ConditionalsController } from 'types/Conditionals'

export interface CharacterConditionalsController extends ConditionalsController {
}

export type CharacterConditionalMap = {
  [key in ConditionalBuff]: number;
}
