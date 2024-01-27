import React from 'react';
import PropTypes from 'prop-types';
import { Flex } from 'antd';
import { Stats } from 'lib/constants';
import { FormSliderWithPopover, FormSwitchWithPopover } from 'components/optimizerTab/FormConditionalInputs';
import { calculateAshblazingSet, basic, skill, talent, ult } from "lib/character/conditionals/utils";
import { ASHBLAZING_ATK_STACK, ComputedStatsObject, baseComputedStatsObject } from './constants';

import { CharacterConditional, ConditionalMap, Form } from 'types/CharacterConditional';


const Display = (props): JSX.Element => {
  const { content } = props;
  const ret = [];

  for (const key in content) {
    const Item = content[key].formItem;
    ret.push(
      <Item
        name={key}
        title={content[key].title}
        content={content[key].content}
        text={content[key].title} />
    );
  }
  return (<Flex vertical gap={10}>{ret}</Flex>);
};
Display.displayName = 'XueyiDisplay';
Display.propTypes = {
  content: PropTypes.object,
  eidolon: PropTypes.number,
  ultBoostMax: PropTypes.number,
};

const Xueyi = (eidolon: number): CharacterConditional => {
  const ultBoostMax = ult(eidolon, 0.60, 0.648)
  const basicScaling = basic(eidolon, 1.00, 1.10)
  const skillScaling = skill(eidolon, 1.40, 1.54)
  const ultScaling = ult(eidolon, 2.50, 2.70)
  const fuaScaling = talent(eidolon, 0.90, 0.99)

  const hitMultiByFuaHits = {
    0: 0,
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1), // 0.06
    2: ASHBLAZING_ATK_STACK * (1 * 1 / 2 + 2 * 1 / 2), // 0.09
    3: ASHBLAZING_ATK_STACK * (1 * 1 / 3 + 2 * 1 / 3 + 3 * 1 / 3) // 0.12
  };

  const content = {
    enemyToughness50 : {
      formItem: FormSwitchWithPopover,
      title: 'Intrepid Rollerbearings',
      content: "If the enemy target's Toughness is equal to or higher than 50% of their Max Toughness, deals 10% more DMG when using Ultimate.",
      text: 'Intrepid Rollerbearings',
    },
    toughnessReductionDmgBoost: {
      formItem: FormSliderWithPopover,
      title: 'Ultimate: Divine Castigation',
      content: "Deals Quantum DMG equal to 250% of Xueyi's ATK to a single target enemy. This attack ignores Weakness Types and reduces the enemy's Toughness. When the enemy's Weakness is Broken, the Quantum Weakness Break effect is triggered. In this attack, the more Toughness is reduced, the higher the DMG will be dealt, up to a max of 60% increase.",
      min: 0,
      max: ultBoostMax,
      percent: true,
    },
    fuaHits: {
      formItem: FormSliderWithPopover,
      title: 'Talent: Karmic Perpetuation',
      content: "When Karma reaches the max number of stacks, consumes all current Karma stacks and immediately launches a follow-up attack against an enemy target, dealing DMG up to 3 times, with each time dealing Quantum DMG to a single random enemy.",
      min: 0,
      max: 3,
    },
    e4BeBuff: {
      formItem: FormSwitchWithPopover,
      title: 'E4: Karma, Severed',
      content: "When using Ultimate, increases Break Effect by 40% for 2 turn(s).",
      disabled: (eidolon < 4),
    }
  };

  type NewType = unknown;

  return {
    getContent: () => content,
    display: () => <Display ultBoostMax={ultBoostMax} eidolon={eidolon} content={content} />,
    defaults: () => ({
      enemyToughness50: true,
      toughnessReductionDmgBoost: ultBoostMax,
      fuaHits: 3,
      e4BeBuff: true,
    }),
    precomputeEffects: (request: Form) => {
      const r: ConditionalMap = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.BE] += (eidolon >= 4 && r.e4BeBuff) ? 0.40 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling * (r.fuaHits as number);

      // Boost
      x.ULT_BOOST += (r.enemyToughness50) ? 0.10 : 0
      x.ULT_BOOST += r.toughnessReductionDmgBoost as number;
      x.FUA_BOOST += (eidolon >= 1) ? 0.40 : 0

      return x;
    },
    calculateBaseMultis: (c: NewType, request: Form) => {
      const r = request.characterConditionals as { [key: string]: number }
      const x: ComputedStatsObject = c['x'];

      x.ELEMENTAL_DMG += Math.min(2.40, x[Stats.BE])

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]

      const hitMulti = hitMultiByFuaHits[r.fuaHits]
      const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)
      x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
    }
  }
}

export default Xueyi;