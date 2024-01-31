import React from "react";
import { Stats } from "lib/constants";
import { baseComputedStatsObject } from "lib/conditionals/constants";
import { basic, calculateAshblazingSet, skill, talent, ult } from "lib/conditionals/utils";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";
import { FormSliderWithPopover } from "components/optimizerForm/conditionals/FormSlider";

import { Eidolon } from "types/Character";

export default (e: Eidolon) => {
  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.00, 2.16)
  const fuaScaling = talent(e, 0.66, 0.726)

  let hitMulti = 0

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'skillCritBuff',
    name: 'skillCritBuff',
    text: 'Skill CR Buff',
    title: 'Skill CR Buff',
    content: `Increases CR by 10%.`,
  }, {
    formItem: FormSliderWithPopover,
    id: 'talentHitsPerAction',
    name: 'talentHitsPerAction',
    text: 'Lightning Lord Stacks',
    title: 'Lightning Lord Stacks',
    content: `Lightning Lord hits-per-action stack up to 10 times.`,
    min: 3,
    max: 10,
  }, {
    formItem: FormSliderWithPopover,
    id: 'talentAttacks',
    name: 'talentAttacks',
    text: 'Lightning Lord Hits on Target',
    title: 'Lightning Lord Hits on Target',
    content: `Count of hits on target. Should usually be set to the same value as Lightning Lord Stacks.`,
    min: 0,
    max: 10,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'e2DmgBuff',
    name: 'e2DmgBuff',
    text: 'E2 dmg buff',
    title: 'E2 dmg buff',
    content: `Increases DMG by 20% for 2 turn(s) after using Ultimate.`,
    disabled: e < 2,
  }, {
    formItem: FormSliderWithPopover,
    id: 'e6FuaVulnerabilityStacks',
    name: 'e6FuaVulnerabilityStacks',
    text: 'E6 vulnerable stacks (applies to all hits)',
    title: 'E6 vulnerable stacks (applies to all hits)',
    content: `Increases DMG taken by 12% per stack. Stacks up to 3 times.`,
    min: 0,
    max: 3,
    disabled: e < 6,
  }];


  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      skillCritBuff: true,
      talentHitsPerAction: 10,
      talentAttacks: 10,
      e2DmgBuff: true,
      e6FuaVulnerabilityStacks: 3
    }),
    precomputeEffects: (request) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      r.talentHitsPerAction = Math.max(r.talentHitsPerAction, r.talentAttacks)

      // Stats
      x[Stats.CR] += (r.skillCritBuff) ? 0.10 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling

      // Boost
      x.FUA_CD_BOOST += (r.talentHitsPerAction >= 6) ? 0.25 : 0
      x.BASIC_BOOST += (e >= 2 && r.e2DmgBuff) ? 0.20 : 0
      x.SKILL_BOOST += (e >= 2 && r.e2DmgBuff) ? 0.20 : 0
      x.ULT_BOOST += (e >= 2 && r.e2DmgBuff) ? 0.20 : 0

      x.FUA_VULNERABILITY += (e >= 6) ? r.e6FuaVulnerabilityStacks * 0.12 : 0

      // Lightning lord calcs
      const stacks = r.talentHitsPerAction
      const hits = r.talentAttacks
      const stacksPerMiss = (request.enemyCount >= 3) ? 2 : 0
      const stacksPerHit = (request.enemyCount >= 3) ? 3 : 1
      const stacksPreHit = (request.enemyCount >= 3) ? 2 : 1

      // Calc stacks on miss
      let ashblazingStacks = stacksPerMiss * (stacks - hits)

      // Calc stacks on hit
      ashblazingStacks += stacksPreHit
      let atkBoostSum = 0
      for (let i = 0; i < hits; i++) {
        atkBoostSum += Math.min(8, ashblazingStacks) * (1 / hits)
        ashblazingStacks += stacksPerHit
      }

      hitMulti = atkBoostSum * 0.06

      return x
    },
    calculateBaseMultis: (c, request) => {
      const r = request.characterConditionals
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]

      const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)
      x.FUA_DMG += x.FUA_SCALING * r.talentAttacks * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
    }
  }
}