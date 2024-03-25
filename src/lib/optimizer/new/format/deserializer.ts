/* eslint-disable @typescript-eslint/no-unused-vars */
import { OptimizationRequest } from '../optimizationRequest'
import { BasicPercentageStats } from '../stats/basicStat'
import {
  EarlyConditional,
  FixedStat,
  LateConditional,
  StatSupplier,
  ToStat,
  TransformingStat,
} from '../stats/conditional'
import { SupportedContextStat as FromStat } from '../stats/context'
import {
  AllMatcher,
  AnyMatcher,
  EarlyAllMatcher,
  EarlyAnyMatcher,
  EarlyMatcher,
  Matcher,
  MatcherType,
  TraitMatcher,
  UnassumingStatMatcher,
  alwaysMatch,
  matchByElement,
} from '../stats/matcher'
import { RelicContext, RelicSetEffect } from '../stats/relic'
import { PartialModifiableStats, StatCollector } from '../stats/stat'
import { StatBuilder } from '../stats/statBuilder'
import { Formula } from '../step/formula'
import { DotDamageStep, NormalDamageStep, Step, StepType } from '../step/step'

/*
 * As much as I hate Javascript for having to write these pieces of shit, I hate
 * myself more for not seeing this coming from a mile away. We should have
 * dodged this if we worked on purely data object literals types. I am once
 * again reminded about how bad ES6 classes and Web Worker proposals are.
 *
 * Strongly remind me to refactor those classes into something more humane. This
 * file is just a patch to materialize those ES6 classes (and my pain) we
 * currently using. Personally, I'm skeptical with using external library, well
 * the most popular one is TypedJSON, and its last commit is 3 years ago,
 * relying on an experimental Typescript feature (decorator). Our best bet is
 * just another refactor.
 */

export function deserialize(json: object): OptimizationRequest {
  if ('formula' in json && 'relics' in json) {
    return {
      formula: deserFormula(json.formula as object),
      relics: deserRelics(json.relics as object),
      ...('options' in json && {
        options: json.options as OptimizationRequest['options'],
      }),
    }
  } else {
    throw new Error(
      'Unknown deserialization json, did you pass the correct serialized OptimizationRequest?',
    )
  }
}

type SerializedSetEff = {
  early: object[]
  late: object[]
}
function deserRelics(json: object): RelicContext {
  return {
    pieces: json['pieces'],
    sets: Object.fromEntries(
      Object.entries(
        json['sets'] as {
          [K: string]: { set2: SerializedSetEff; set4?: SerializedSetEff }
        },
      ).map(([setName, setEffs]): [string, RelicSetEffect] => {
        let set4: undefined | RelicSetEffect['set4'] = undefined
        if (setEffs.set4) {
          set4 = {
            early: setEffs.set4.early.map(
              deserConditional,
            ) as EarlyConditional[],
            late: setEffs.set4.late.map(deserConditional) as LateConditional[],
          }
        }
        return [
          setName,
          {
            set2: {
              early: setEffs.set2.early.map(
                (val) => deserConditional(val) as EarlyConditional,
              ),
              late: setEffs.set2.late.map(
                (val) => deserConditional(val) as LateConditional,
              ),
            },
            ...(set4 && { set4: set4 }),
          },
        ]
      }),
    ),
  }
}

function deserFormula(json: object): Formula {
  if (!('steps' in json)) {
    throw new Error(
      'Unknown deserialization json, did you pass the correct serialized Formula?',
    )
  }
  const steps = (json['steps'] as object[]).map(deserStep)
  const stepStatBuilders = (json['stepStatBuilders'] as object[]).map(
    statBuilder,
  )
  if ('nonCombatBuilder' in json) {
    return new Formula(
      steps,
      stepStatBuilders,
      statBuilder(json['nonCombatBuilder'] as object),
      json['nonCombatLimit'],
    )
  }
  return new Formula(steps, stepStatBuilders)
}

function deserStep(json: object): Step {
  if ('type' in json) {
    switch (json.type) {
      case StepType.NORMAL_DAMAGE:
        return new NormalDamageStep(
          json['broken'],
          {},
          json['element'],
          json['traits'],
          json['multiplier'],
          json['statType'],
          json['crit'],
          json['limit'],
        )
      case StepType.DOT_DAMAGE:
        return new DotDamageStep(
          json['broken'],
          {},
          json['element'],
          json['traits'],
          json['multiplier'],
          json['statType'],
        )
      case StepType.BREAK_DAMAGE:
        console.log('Unsupported StepType')
        break
      case StepType.NO_DAMAGE:
        console.log('Unsupported StepType')
        break
      default:
        throw new Error('Unknown StepType')
    }
  }
  throw new Error(
    'Unknown deserialization json, did you pass the correct serialized Step?',
  )
}

function basicPercentageStats(json: object): BasicPercentageStats {
  return Object.assign(Object.create(BasicPercentageStats.prototype), json)
}

function statCollector(json: object): StatCollector {
  json['basic'] = basicPercentageStats(json['basic'])
  return Object.assign(Object.create(StatCollector.prototype), json)
}

function statBuilder(json: object): StatBuilder {
  if ('pre' in json) json.pre = statCollector(json.pre as object)
  json['early'] = (json['early'] as object[]).map(deserConditional)
  json['late'] = (json['late'] as object[]).map(deserConditional)
  return Object.assign(Object.create(StatBuilder.prototype), json)
}

export function deserMatcher(json: object): Matcher {
  switch (json['type']) {
    case MatcherType.ELEMENT:
      return matchByElement(json['element'])
    case MatcherType.TRAIT:
      return new TraitMatcher(json['traits'])
    case MatcherType.ALWAYS:
      return alwaysMatch()
    case MatcherType.STAT:
      return new UnassumingStatMatcher(
        json['whichStat'],
        json['matchType'],
        json['value'],
      )
    case MatcherType.ALL:
      return new AllMatcher(
        (json['matchers'] as Array<object>).map(
          (mtch) => deserMatcher(mtch) as Matcher,
        ),
      )
    case MatcherType.ANY:
      return new AnyMatcher(
        (json['matchers'] as Array<object>).map(
          (mtch) => deserMatcher(mtch) as Matcher,
        ),
      )
    case MatcherType.EARLY_ALL:
      return new EarlyAllMatcher(
        (json['matchers'] as Array<object>).map(
          (mtch) => deserMatcher(mtch) as EarlyMatcher,
        ),
      )
    case MatcherType.EARLY_ANY:
      return new EarlyAnyMatcher(
        (json['matchers'] as Array<object>).map(
          (mtch) => deserMatcher(mtch) as EarlyMatcher,
        ),
      )
    default:
      throw new Error('Unknown Matcher type')
  }
}
export function deserConditional(json: object) {
  if ('statz' in json) {
    return new EarlyConditional(
      deserMatcher(json['matcher']),
      json.statz as PartialModifiableStats,
    )
  } else if ('provider' in json) {
    return new LateConditional(
      deserMatcher(json['matcher']),
      deserializeStatSupplier(json.provider as object),
    )
  }
  throw new Error('Unknown Conditional type' + json)
}
function deserializeStatSupplier(json: object): StatSupplier {
  if ('statz' in json) {
    return new FixedStat(json.statz as PartialModifiableStats)
  } else if (
    'from' in json
    && 'to' in json
    && 'scale' in json
    && 'max' in json
  ) {
    return new TransformingStat(
      json.from as FromStat,
      json.to as ToStat,
      json.scale as number,
      json.max as number,
    )
  } else {
    throw new Error('Unknown StatSupplier')
  }
}
