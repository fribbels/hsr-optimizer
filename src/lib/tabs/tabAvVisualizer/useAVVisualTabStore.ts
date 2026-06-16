import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'
import type { Intervention } from 'lib/tabs/tabAvVisualizer/types'
import { uuid } from 'lib/utils/miscUtils'

// ---- 类型定义 ----

export type Slot = {
  characterId: string | null
  spdOverride: number | null
}

// 跨会话持久化的部分（随全局存档写入 localStorage），见 saveState.ts / persistenceService.ts
export type AVVisualizerTabSavedSession = {
  slots: [Slot, Slot, Slot, Slot]
}

interface AVVisualTabStateValues {
  savedSession: AVVisualizerTabSavedSession
  rowCount: number
  interventions: Intervention[]
  // 混沌回忆模式：开启后第一行时间轴为 150 AV（对应游戏内首回合机制），其余行仍为 100
  mocFirstRow: boolean
}

interface AVVisualTabStateActions {
  setSlotCharacter: (slotIndex: number, characterId: string | null) => void
  setSlotSpdOverride: (slotIndex: number, spd: number) => void
  resetSlotSpdOverride: (slotIndex: number) => void
  setSavedSession: (session: AVVisualizerTabSavedSession) => void
  addRow: () => void
  addIntervention: (iv: Omit<Intervention, 'id'>) => void
  removeIntervention: (id: string) => void
  updateIntervention: (id: string, patch: Partial<Omit<Intervention, 'id'>>) => void
  clearInterventions: () => void
  setMocFirstRow: (value: boolean) => void
}

type AVVisualTabState = AVVisualTabStateValues & AVVisualTabStateActions

// ---- 默认状态 ----

const emptySlot = (): Slot => ({ characterId: null, spdOverride: null })

const defaultState: AVVisualTabStateValues = {
  savedSession: {
    slots: [emptySlot(), emptySlot(), emptySlot(), emptySlot()],
  },
  rowCount: 3,
  interventions: [],
  mocFirstRow: false,
}

// ---- 工具函数 ----

function updateSlot(slots: [Slot, Slot, Slot, Slot], index: number, patch: Partial<Slot>): [Slot, Slot, Slot, Slot] {
  const next = slots.map((s, i) => i === index ? { ...s, ...patch } : s)
  return next as [Slot, Slot, Slot, Slot]
}

// ---- Store ----

const useAVVisualTabStore = createTabAwareStore<AVVisualTabState>((set) => ({
  ...defaultState,

  setSlotCharacter: (slotIndex, characterId) => {
    set((s) => ({
      savedSession: {
        ...s.savedSession,
        slots: updateSlot(s.savedSession.slots, slotIndex, { characterId, spdOverride: null }),
      },
    }))
  },

  setSlotSpdOverride: (slotIndex, spd) => {
    set((s) => ({
      savedSession: {
        ...s.savedSession,
        slots: updateSlot(s.savedSession.slots, slotIndex, { spdOverride: spd }),
      },
    }))
  },

  resetSlotSpdOverride: (slotIndex) => {
    set((s) => ({
      savedSession: {
        ...s.savedSession,
        slots: updateSlot(s.savedSession.slots, slotIndex, { spdOverride: null }),
      },
    }))
  },

  setSavedSession: (session) => set((s) => ({ savedSession: { ...s.savedSession, ...session } })),

  addRow: () => set((s) => ({ rowCount: s.rowCount + 1 })),

  addIntervention: (iv) => {
    set((s) => ({ interventions: [...s.interventions, { ...iv, id: uuid() }] }))
  },

  removeIntervention: (id) => {
    set((s) => ({ interventions: s.interventions.filter((iv) => iv.id !== id) }))
  },

  updateIntervention: (id, patch) => {
    set((s) => ({
      interventions: s.interventions.map((iv) => iv.id === id ? { ...iv, ...patch } : iv),
    }))
  },

  clearInterventions: () => set({ interventions: [] }),

  setMocFirstRow: (value) => set({ mocFirstRow: value }),
}))

export { useAVVisualTabStore }
export type { AVVisualTabStateActions, AVVisualTabStateValues }
