import type { Intervention, SimEvent } from 'lib/tabs/tabAvVisualizer/types'

type SimCharacter = {
  id: string
  spd: number      // 角色面板总速度（含遗器）
  baseSpd: number  // 白值速度（角色基础速度，不含遗器），用于百分比速度 buff 计算
}

// SpdBuff 内部统一存储 flat delta（percent 在应用时已按白值换算）
type SpdBuff = {
  delta: number
  remainingTurns: number
}

type CharState = {
  panelSpd: number  // 含遗器的面板速度，用于计算有效速度
  whiteSpd: number  // 白值，用于百分比 buff 换算
  spdBuffs: SpdBuff[]
}

type QueueEntry = {
  av: number
  originalAv?: number  // 被 av_advance 修改前的原始 AV（用于同 AV 排序 tiebreaker）
  characterId: string
  actionIndex: number
}

function computeEffectiveSpd(state: CharState): number {
  const buffTotal = state.spdBuffs.reduce((sum, b) => sum + b.delta, 0)
  return Math.max(state.panelSpd + buffTotal, 1)
}

// 主键：av 升序；同 AV 时，originalAv（拉条前位置）越小越先行动（离此 AV 越近）
function sortQueue(queue: QueueEntry[]): void {
  queue.sort((a, b) => {
    if (a.av !== b.av) return a.av - b.av
    return (a.originalAv ?? a.av) - (b.originalAv ?? b.av)
  })
}

function applyIntervention(
  iv: Intervention,
  charStates: Map<string, CharState>,
  queue: QueueEntry[],
): void {
  for (const targetId of iv.targets) {
    const targetState = charStates.get(targetId)
    if (!targetState) continue

    if (iv.type === 'spd_up' || iv.type === 'spd_down') {
      // percent 按白值换算为 flat；崩铁机制：X% = X% × 白值，与面板速度无关
      const flatDelta = iv.unit === 'flat'
        ? iv.value
        : targetState.whiteSpd * (iv.value / 100)
      const delta = iv.type === 'spd_up' ? flatDelta : -flatDelta

      const oldSpd = computeEffectiveSpd(targetState)
      const newBuff: SpdBuff = { delta, remainingTurns: iv.durationTurns }
      targetState.spdBuffs.push(newBuff)
      const newSpd = computeEffectiveSpd(targetState)

      const targetEntry = queue.find((e) => e.characterId === targetId)
      if (targetEntry) {
        const remainingAv = targetEntry.av - iv.triggerAv

        if (remainingAv > 0) {
          // 跨角色中途生效：行动条守恒重算 + 消耗 1 回合
          // （这段被重算的区间本身算作 buff 的 1 回合）
          if (oldSpd !== newSpd) {
            const gaugeDistance = remainingAv * oldSpd
            targetEntry.av = iv.triggerAv + gaugeDistance / newSpd
          }
          newBuff.remainingTurns -= 1
          if (newBuff.remainingTurns <= 0) {
            targetState.spdBuffs = targetState.spdBuffs.filter((b) => b !== newBuff)
          }
        } else if (remainingAv === 0) {
          // 行动期间（before）：buff 被当前行动消耗，立即递减
          // → durationTurns=1 时完全消耗，对后续行动 AV 无任何影响
          // → durationTurns=N 时剩余 N-1 回合，影响后续 N-1 次行动
          // 注意：after 干预在角色重新入队后触发，此时 remainingAv > 0，不会进入这个分支
          newBuff.remainingTurns -= 1
          if (newBuff.remainingTurns <= 0) {
            targetState.spdBuffs = targetState.spdBuffs.filter((b) => b !== newBuff)
          }
        }
        // remainingAv < 0：不应出现（目标已在 triggerAv 之前行动过），静默忽略
      }
    } else {
      // av_advance / av_delay：直接修改目标在队列中的下次行动 AV
      const targetEntry = queue.find((e) => e.characterId === targetId)
      if (targetEntry) {
        // percent 以目标当前最大行动间隔（10000/effectiveSpd）为基准，与游戏机制一致
        const maxInterval = 10000 / computeEffectiveSpd(targetState)
        const delta = iv.unit === 'flat'
          ? iv.value
          : maxInterval * (iv.value / 100)

        const oldAv = targetEntry.av
        targetEntry.av = iv.type === 'av_advance'
          ? Math.max(iv.triggerAv, targetEntry.av - delta)
          : targetEntry.av + delta

        // 记录被拉条前的原始 AV，用于同 AV 时的排序 tiebreaker（离此 AV 越近越先行动）
        if (iv.type === 'av_advance' && targetEntry.av < oldAv) {
          targetEntry.originalAv = oldAv
        }
      }
    }
  }

  sortQueue(queue)
}

export function simulateTimeline(
  characters: SimCharacter[],
  interventions: Intervention[],
  totalAv: number,
): SimEvent[] {
  if (characters.length === 0 || totalAv <= 0) return []

  const charStates = new Map<string, CharState>()
  for (const char of characters) {
    charStates.set(char.id, { panelSpd: char.spd, whiteSpd: char.baseSpd, spdBuffs: [] })
  }

  const queue: QueueEntry[] = characters
    .map((char) => ({ av: 10000 / char.spd, characterId: char.id, actionIndex: 0 }))
    .sort((a, b) => a.av - b.av)

  // 三类干预：
  // 全局行动期间（无 beforeCharId、无 afterCharId）：仅按 triggerAv 触发一次，与具体角色行动无关
  // 角色行动期间（beforeCharId 有值）：在该角色第 beforeActionIndex 次行动开始前触发
  // 角色行动结束瞬间（afterCharId 有值）：在该角色第 afterActionIndex 次行动结束后触发
  const pendingGlobalBefore = interventions
    .filter((iv) => !iv.beforeCharId && !iv.afterCharId)
    .sort((a, b) => a.triggerAv - b.triggerAv)

  const pendingCharBefore = interventions.filter((iv) => iv.beforeCharId)
  const pendingAfter = interventions.filter((iv) => iv.afterCharId)

  let beforeIdx = 0
  const results: SimEvent[] = []

  // 统一离散事件循环：
  // 1. 先消化所有 triggerAv <= 队首角色 AV 的全局 before 干预
  // 2. 检查队首角色此次行动是否匹配某条角色专属 before 干预，若匹配则原地应用并从列表移除（不弹出队列）
  // 3. 处理角色行动，记录结果
  // 4. 将角色重新入队
  // 5. 立即处理该角色此 AV 处的 after 干预（可能改变重新入队后的 AV）
  while (queue.length > 0 || beforeIdx < pendingGlobalBefore.length) {
    const nextActionAv = queue.length > 0 ? queue[0].av : Infinity
    const nextGlobalBeforeAv = beforeIdx < pendingGlobalBefore.length ? pendingGlobalBefore[beforeIdx].triggerAv : Infinity

    if (Math.min(nextActionAv, nextGlobalBeforeAv) >= totalAv) break

    if (nextGlobalBeforeAv <= nextActionAv) {
      applyIntervention(pendingGlobalBefore[beforeIdx], charStates, queue)
      beforeIdx++
      continue
    }

    // 队首角色即将行动：检查是否有专属于这次行动的"行动期间"干预（窥视，不弹出）
    // 命中后原地应用（队列中条目仍存在，remainingAv=0 分支正确生效），并从列表移除防止重复触发
    const head = queue[0]
    const charBeforeMatch = pendingCharBefore.find((iv) =>
      iv.beforeCharId === head.characterId
      && iv.triggerAv === head.av
      && (iv.beforeActionIndex ?? 0) === head.actionIndex,
    )
    if (charBeforeMatch) {
      applyIntervention(charBeforeMatch, charStates, queue)
      pendingCharBefore.splice(pendingCharBefore.indexOf(charBeforeMatch), 1)
      continue
    }

    const event = queue.shift()!
    const state = charStates.get(event.characterId)!
    const spd = computeEffectiveSpd(state)

    results.push({
      av: event.av,
      characterId: event.characterId,
      actionIndex: event.actionIndex,
      effectiveSpd: spd,
    })

    const nextAv = event.av + 10000 / spd

    // 本次行动后递减 SPD buff 剩余回合（递减在调度之后，buff 已计入当前间隔）
    state.spdBuffs = state.spdBuffs
      .map((b) => ({ ...b, remainingTurns: b.remainingTurns - 1 }))
      .filter((b) => b.remainingTurns > 0)

    // 先将角色重新入队，after 干预才能找到并修改其队列条目
    // 注意：即使 nextAv >= totalAv 也需要入队，otherwise after 干预找不到目标。
    // 未被 after 干预修改的 >= totalAv 条目会在下次循环顶部的 break 条件中被截断。
    queue.push({ av: nextAv, characterId: event.characterId, actionIndex: event.actionIndex + 1 })
    sortQueue(queue)

    // 触发此角色此 AV 处匹配 actionIndex 的 after 干预
    // 每条干预精确绑定 (charId, av, afterActionIndex)，天然不会重复触发
    for (const iv of pendingAfter) {
      const targetIdx = iv.afterActionIndex ?? 0
      if (iv.afterCharId === event.characterId && iv.triggerAv === event.av && targetIdx === event.actionIndex) {
        applyIntervention(iv, charStates, queue)
      }
    }
  }

  return results
}
