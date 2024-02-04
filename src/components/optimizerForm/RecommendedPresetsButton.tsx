import React, { useMemo } from "react";
import { Button, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import DB from "../../lib/db.js";
import { Message } from "../../lib/message.js";
import { getDefaultForm } from "../../lib/defaultForm.js";
import { Constants } from "../../lib/constants.ts";
import { OptimizerTabController } from "../../lib/optimizerTabController.js";

// 111.2 (5 actions in first four cycles)
// 114.3 (4 actions in first three cycles)
// 120.1 (3 actions in two cycles, activates planar set effects)
// 133.4 (2 actions in first cycle, 6 actions in first four cycles)
// 142.9 (5 actions in first three cycles)
// 160.1 (4 actions in first two cycles)
// 171.5 (6 actions in first three cycles)
// 177.8 (8 actions in first four cycles)
// 200.1 (3 actions in first cycle, 2 actions per cycle thereafter)

const SpdValues = {
  SPD111: {
    key: 'SPD111',
    label: '111.2 SPD - 5 actions in first four cycles',
    value: 111.2,
  },
  SPD114: {
    key: 'SPD114',
    label: '114.3 SPD - 4 actions in first three cycles',
    value: 114.3,
  },
  SPD120: {
    key: 'SPD120',
    label: '120.1 SPD - 3 actions in first two cycles',
    value: 120.1,
  },
  SPD133: {
    key: 'SPD133',
    label: (<b>133.4 SPD - 2 actions in first cycle, 6 actions in first four cycles</b>),
    value: 133.4,
  },
  SPD142: {
    key: 'SPD142',
    label: '142.9 SPD - 5 actions in first three cycles',
    value: 142.9
  },
  SPD160: {
    key: 'SPD160',
    label: '160.1 SPD - 4 actions in first two cycles',
    value: 160.1
  },
  SPD171: {
    key: 'SPD171',
    label: '171.5 SPD - 6 actions in first three cycles',
    value: 171.5
  },
  SPD177: {
    key: 'SPD177',
    label: '177.8 SPD - 8 actions in first four cycles',
    value: 177.8
  },
  SPD200: {
    key: 'SPD200',
    label: '200.1 SPD - 3 actions in first cycle, 2 actions per cycle thereafter',
    value: 200.1
  },
}
const standardSpdOptions = Object.values(SpdValues)

export function generateStandardSpdOptions(label) {
  return {
    key: label,
    label: label,
    children: standardSpdOptions,
  }
}

const RecommendedPresetsButton = () => {
  const optimizerTabFocusCharacter = global.store(s => s.optimizerTabFocusCharacter);

  const items = useMemo(function () {
    const character = DB.getMetadata().characters[optimizerTabFocusCharacter]
    if (!character) return []

    // "Standard" Placeholder for now until we have customized builds
    const standardOptions = [generateStandardSpdOptions(`Standard ${character.displayName}`)]
    const presets = DB.getMetadata().characters[optimizerTabFocusCharacter]?.scoringMetadata.presets
    return presets || standardOptions
  }, [optimizerTabFocusCharacter])

  const actionsMenuProps = {
    items,
    onClick: (event) => {
      if (!optimizerTabFocusCharacter) return

      const key = event.key
      if (SpdValues[key]) {
        const character = DB.getMetadata().characters[optimizerTabFocusCharacter]
        // const standardOptions = [generateStandardSpdOptions(`Standard ${character.displayName}`)]
        const metadata = character.scoringMetadata
        // const presets = metadata.presets || standardOptions
        const spd = SpdValues[key].value

        const form = OptimizerTabController.getDisplayFormValues(getDefaultForm(character))
        form.minSpd = spd
        form.mainBody = metadata.parts[Constants.Parts.Body]
        form.mainFeet = metadata.parts[Constants.Parts.Feet]
        form.mainPlanarSphere = metadata.parts[Constants.Parts.PlanarSphere]
        form.mainLinkRope = metadata.parts[Constants.Parts.LinkRope]

        // Not sure if we want to support set recommendations yet
        // form.ornamentSets = metadata.ornamentSets
        // form.relicSets = metadata.relicSets.map(x => ['2 + Any', x])

        global.optimizerForm.setFieldsValue(form)
      } else {
        Message.warn('Preset not available, please select another option');
      }
    },
  };

  return (
    <Dropdown
      menu={actionsMenuProps}
      trigger={['click']}
    >
      <Button type='primary' style={{ width: '100%' }}>
        Recommended presets
        <DownOutlined />
      </Button>
    </Dropdown>
  )
}

export default RecommendedPresetsButton;