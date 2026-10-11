import { Button, Group, Stack } from "@mantine/core"
import { CombatActionModifier, CombatBuff } from "types/form"
import { useShallow } from "zustand/react/shallow"
import { useCombatBuffStore } from "../useCombatBuffsStore"
import { ModifierKindSelect } from "./ModifierKindSelect"
import { optimizerTabDefaultGap } from "../../../grid/optimizerGridColumns"
import { DamageElementSelect } from "./DamageElementSelect"
import { AbilitySelect } from "./AbilitySelect"

export function ActionModifierBuilder({
  addBuff,
  hidden,
}: {
  addBuff: (buff: CombatBuff) => void,
  hidden: boolean,
}) {
  const {
    modifierKind,
    setModifierKind,
    damageElement,
    setDamageElement,
    abilityTargets,
    setAbilityTargets,
  } = useCombatBuffStore(useShallow((s) => ({
    modifierKind: s.modifierKind,
    setModifierKind: s.setModifierKind,
    damageElement: s.damageElement,
    setDamageElement: s.setDamageElement,
    abilityTargets: s.abilityTargets,
    setAbilityTargets: s.setAbilityTargets,
  })))
  return (
    <Stack gap={optimizerTabDefaultGap} style={{ display: hidden ? 'none' : undefined }}>
      <Group wrap="nowrap">
        <ModifierKindSelect value={modifierKind} onChange={setModifierKind} />
        <DamageElementSelect value={damageElement} onChange={setDamageElement} />
      </Group>
      <AbilitySelect value={abilityTargets} onChange={setAbilityTargets} />
      <Button
        onClick={() => {
          const modifier = validateActionModifier()
          if (!modifier) return
          addBuff(modifier)
        }}
      >
        Apply modifier
      </Button>
    </Stack>
  )
}

function validateActionModifier(): CombatActionModifier | null {
  //TODO:
  return null
}