import { BasicPercentageStats } from '../stats/basicStat'
import { EarlyConditional, FixedStat, LateConditional, TransformingStat } from '../stats/conditional'
import {
  AllMatcher,
  AlwaysMatcher,
  AnyMatcher,
  EarlyAllMatcher,
  EarlyAnyMatcher,
  ElementMatcher,
  TraitMatcher,
  UnassumingStatMatcher,
} from '../stats/matcher'
import { StatCollector } from '../stats/stat'
import { StatBuilder } from '../stats/statBuilder'
import { Formula } from '../step/formula'
import { NormalDamageStep } from '../step/step'
import { ObjectMapper } from './serializer'
/**
 * So what is this class?
 *
 * Short answer: A serialization/deserialization mini library.
 *
 * Long answer: TODO let me collect my thought before I create a medium account lmao
 */
const DEFAULT_CLASSES = [
  BasicPercentageStats,
  StatCollector,
  StatBuilder,
  Formula,
  NormalDamageStep,
  // --------
  // Matchers
  // --------
  ElementMatcher,
  TraitMatcher,
  UnassumingStatMatcher,
  AllMatcher,
  EarlyAllMatcher,
  AnyMatcher,
  EarlyAnyMatcher,
  AlwaysMatcher,
  // ------------
  // Conditionals
  // ------------
  EarlyConditional,
  LateConditional,
  FixedStat,
  TransformingStat,
]

const DEFAULT_OBJECT_MAPPER = new ObjectMapper(DEFAULT_CLASSES)

export function serialize(instance: unknown): string {
  return DEFAULT_OBJECT_MAPPER.serialize(instance)
}

export function deserialize<T>(json: string): T {
  return DEFAULT_OBJECT_MAPPER.deserialize(json)
}
