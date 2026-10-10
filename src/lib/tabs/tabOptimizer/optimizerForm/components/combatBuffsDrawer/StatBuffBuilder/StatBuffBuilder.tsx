import { Stack, Group, NumberInput, Button } from "@mantine/core"
import { Message } from "lib/interactions/message"
import { isHitAKey, getAKeyConfig } from "lib/optimization/engine/config/keys"
import { TargetTag } from "lib/optimization/engine/config/tag"
import { uuid } from "lib/utils/miscUtils"
import { CombatBuff, CombatStatBuff, CombatBuffType } from "types/form"
import { useShallow } from "zustand/react/shallow"
import { useCombatBuffStore } from "../useCombatBuffsStore"
import { DamageTagSelect } from "./DamageTagSelect"
import { ElementTagSelect } from "./ElementTagSelect"
import { StatSelect } from "./StatSelect"
import { TargetTagSelect } from "./TargetTagSelect"


export function StatBuffBuilder({
  addBuff,
  hidden,
}: {
  addBuff: (buff: CombatBuff) => void,
  hidden: boolean,
}) {
  const {
    stat,
    setStat,
    value,
    setValue,
    targetTag,
    setTargetTag,
    damageTags,
    setDamageTags,
    elementTags,
    setElementTags,
  } = useCombatBuffStore(useShallow((s) => ({
    stat: s.stat,
    setStat: s.setStat,
    value: s.value,
    setValue: s.setValue,
    targetTag: s.targetTag,
    setTargetTag: s.setTargetTag,
    damageTags: s.damageTags,
    setDamageTags: s.setDamageTags,
    elementTags: s.elementTags,
    setElementTags: s.setElementTags,
  })))

  const suffix = getSuffix(stat)

  const hitTagsDisabled = stat !== null && !isHitAKey(stat)

  return (
    // TODO: add <Hint/> to the various selects
    <Stack gap={4} style={{ display: hidden ? 'none' : undefined }}>
      <Group gap={8}>
        <StatSelect value={stat} onChange={setStat} style={{ flex: 7 }} />
        <NumberInput
          flex={2}
          suffix={suffix}
          value={value}
          onChange={setValue}
          label='value'
          hideControls
        />
      </Group>
      <TargetTagSelect value={targetTag} onChange={setTargetTag} />
      <DamageTagSelect disabled={hitTagsDisabled} value={damageTags} onChange={setDamageTags} />
      <ElementTagSelect disabled={hitTagsDisabled} value={elementTags} onChange={setElementTags} />
      <Button
        onClick={() => {
          console.log(
            stat,
            value,
            targetTag,
            damageTags,
          )
          const buff = validateStatBuff(stat, value, damageTags, targetTag, elementTags)
          if (!buff) return
          addBuff(buff)
        }}
      >
        Apply buff
      </Button>
    </Stack>
  )
}

function validateStatBuff(
  statKey: CombatStatBuff['statKey'] | null,
  value: CombatStatBuff['value'] | string,
  damageTags: CombatStatBuff['damageTags'],
  targetTag: CombatStatBuff['targetTag'] | null,
  elementTags: CombatStatBuff['elementTags'],
): CombatStatBuff | null {
  if (statKey === null) {
    Message.error('stat is missing')
    return null
  }
  if (typeof value === 'string') {
    Message.error('invalid value')
    return null
  }
  if ((damageTags.length + elementTags.length) && !isHitAKey(statKey)) {
    // this shouldn't fire due to the special handling in setStat, but just to be safe
    Message.error('stat not compatible with damage type filtering')
    return null
  }
  const buff: CombatStatBuff = {
    statKey,
    value,
    damageTags,
    elementTags,
    targetTag: targetTag ?? TargetTag.FullTeam,
    type: CombatBuffType.StatBuff,
    disabled: false,
    id: uuid(),
  }
  console.log('adding buff', buff)
  return buff
}

function getSuffix(stat: CombatStatBuff['statKey'] | null): string | undefined {
  if (stat === null || getAKeyConfig(stat).flat) return
  return '%'
}