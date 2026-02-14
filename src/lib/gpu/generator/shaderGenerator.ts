import {
  GpuConstants,
  RelicsByPart,
} from 'lib/gpu/webgpuTypes'
import computeShader from 'lib/gpu/wgsl/computeShader.wgsl?raw'
import { Form } from 'types/form'
import { OptimizerContext } from 'types/optimizer'

export enum Injections {
  GPU_PARAMS = 'GPU PARAMS',
  ACTIONS_DEFINITION = 'ACTIONS DEFINITION',
  RESULTS_BUFFER = 'RESULTS BUFFER',
  RELIC_SLOT_INDEX_STRATEGY = 'RELIC SLOT INDEX STRATEGY',
  SET_FILTERS = 'SET FILTERS',
  BASIC_CONDITIONALS = 'BASIC CONDITIONALS',
  COMBAT_CONDITIONALS = 'COMBAT CONDITIONALS',
  BASIC_STAT_FILTERS = 'BASIC STAT FILTERS',
  RATING_STAT_FILTERS = 'RATING STAT FILTERS',
}

export class ShaderGenerator {
  public wgsl: string = `${computeShader}`

  constructor(
    context: OptimizerContext,
    request: Form,
    relics: RelicsByPart,
    gpuParams: GpuConstants,
  ) {
  }
}
