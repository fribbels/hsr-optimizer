import React from "react";
import { Stats } from "lib/constants";
import { baseComputedStatsObject } from "lib/conditionals/constants";
import { basicRev, precisionRound, skillRev, talentRev, ultRev } from "lib/conditionals/utils";
import DisplayFormControl from "components/optimizerForm/conditionals/DisplayFormControl";
import { FormSwitchWithPopover } from "components/optimizerForm/conditionals/FormSwitch";
import { FormSliderWithPopover } from "components/optimizerForm/conditionals/FormSlider";

import { Eidolon } from "types/Character";
import { Form, PrecomputedCharacterConditional } from "types/CharacterConditional";

const Sampo = (e:Eidolon) => {
  const dotVulnerabilityValue = ultRev(e, 0.30, 0.32);

  const basicScaling = basicRev(e, 1.00, 1.10);
  const skillScaling = skillRev(e, 0.56, 0.616);
  const ultScaling = ultRev(e, 1.60, 1.728);
  const dotScaling = talentRev(e, 0.52, 0.572);

  const maxExtraHits = e < 1 ? 5 : 6;

  const content = [{
    formItem: FormSwitchWithPopover,
    id: 'targetDotTakenDebuff',
    name: 'targetDotTakenDebuff',
    text: 'Ult dot taken debuff',
    title: 'Ult: Target Dot Taken Debuff',
    content: `Increases DMG by ${precisionRound(dotVulnerabilityValue * 100)}% against enemies affected by Sampo's Ultimate.`,
  }, {
    formItem: FormSliderWithPopover,
    id: 'skillExtraHits',
    name: 'skillExtraHits',
    text: 'Skill extra hits',
    title: 'Skill: Extra Hits',
    content: `
      Number of hits from Skill.
      ::BR::
      E1: Increases the number of hits from Skill by 1.
      `,
    min: 1,
    max: maxExtraHits,
  }, {
    formItem: FormSwitchWithPopover,
    id: 'targetWindShear',
    name: 'targetWindShear',
    text: 'Target has wind shear',
    title: 'Target has wind shear',
    content: `Decreases DMG taken by 15% if the target has Wind Shear.`,
  }];

  return {
    display: () => <DisplayFormControl content={content} />,
    defaults: () => ({
      targetDotTakenDebuff: true,
      skillExtraHits: 4,
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