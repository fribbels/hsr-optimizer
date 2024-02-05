import React from "react";
import { Stats } from "lib/constants";
import { baseComputedStatsObject } from "lib/conditionals/constants";
import { basicRev, precisionRound, skillRev, talentRev, ultRev } from "lib/conditionals/utils";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";
import { FormSliderWithPopover } from "components/optimizerForm/conditionals/FormSlider";

import { Eidolon } from "types/Character";
import { PrecomputedCharacterConditional } from "types/CharacterConditional";
import { Form } from 'types/Form';

const Sampo = (e:Eidolon) => {
  const dotVulnerabilityValue = ultRev(e, 0.30, 0.32);

  const basicScaling = basicRev(e, 1.00, 1.10);
  const skillScaling = skillRev(e, 0.56, 0.616);
  const ultScaling = ultRev(e, 1.60, 1.728);
  const dotScaling = talentRev(e, 0.52, 0.572);

  const maxExtraHits = e < 1 ? 4 : 5;

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'targetDotTakenDebuff',
    name: 'targetDotTakenDebuff',
    text: 'Ult DoT taken debuff',
    title: 'Ult Dot taken debuff',
    content: `When debuffed by Sampo's Ultimate, increase the targets' DoT taken by ${precisionRound(dotVulnerabilityValue * 100)}% for 2 turn(s).`,
  }, {
    formItem: FormSliderWithPopover,
    id: 'skillExtraHits',
    name: 'skillExtraHits',
    text: 'Skill extra hits',
    title: 'Skill extra hits',
    content: `
      Number of extra hits from Skill.
      `,
    min: 1,
    max: maxExtraHits,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'targetWindShear',
    name: 'targetWindShear',
    text: 'Target has wind shear',
    title: 'Target has wind shear',
    content: `Enemies with Wind Shear effect deal 15% less damage to Sampo.`,
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      targetDotTakenDebuff: true,
      skillExtraHits: maxExtraHits,
      targetWindShear: true
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.SKILL_SCALING += (r.skillExtraHits) * skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += dotScaling
      x.DOT_SCALING += (e >= 6) ? 0.15 : 0

      // Boost
      x.DOT_VULNERABILITY += (r.targetDotTakenDebuff) ? dotVulnerabilityValue : 0
      x.DMG_RED_MULTI *= (r.targetWindShear) ? (1 - 0.15) : 1

      return x
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c['x'];

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]
    }
  }
}

export default Sampo;