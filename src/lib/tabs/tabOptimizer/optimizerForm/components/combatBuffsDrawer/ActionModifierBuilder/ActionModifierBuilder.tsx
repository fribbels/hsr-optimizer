import { Stack } from "@mantine/core"
import { CombatBuff } from "types/form"
import { useShallow } from "zustand/react/shallow"
import { useCombatBuffStore } from "../useCombatBuffsStore"

export function ActionModifierBuilder({
  addBuff,
  hidden,
}: {
  addBuff: (buff: CombatBuff) => void,
  hidden: boolean,
}) {
  const { } = useCombatBuffStore(useShallow((s) => ({
    modifierType: s.modifierType,
    setModifierType: s.setModifierType
  })))
  return (
    <Stack></Stack>
  )
}
