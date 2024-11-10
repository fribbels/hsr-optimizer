import { ConditionalBuff, ConditionalsController } from 'types/Conditionals'

export interface LightConeConditionalsController extends ConditionalsController {
}

export type LightConeConditionalMap = {
  [key in ConditionalBuff]: number;
}
