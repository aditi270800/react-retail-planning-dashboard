import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { PlanningEntry, PlanningState } from '../../types'

const initialState: PlanningState = {
  entries: [],
}

const planningSlice = createSlice({
  name: 'planning',
  initialState,
  reducers: {
    upsertEntry(state, action: PayloadAction<PlanningEntry>) {
      const { storeId, skuId, week } = action.payload
      const idx = state.entries.findIndex(
        e => e.storeId === storeId && e.skuId === skuId && e.week === week
      )
      if (idx !== -1) {
        state.entries[idx] = action.payload
      } else {
        state.entries.push(action.payload)
      }
    },
    upsertEntries(state, action: PayloadAction<PlanningEntry[]>) {
      for (const entry of action.payload) {
        const { storeId, skuId, week } = entry
        const idx = state.entries.findIndex(
          e => e.storeId === storeId && e.skuId === skuId && e.week === week
        )
        if (idx !== -1) {
          state.entries[idx] = entry
        } else {
          state.entries.push(entry)
        }
      }
    },
    resetPlanning(state) {
      state.entries = []
    },
    setEntries(state, action: PayloadAction<PlanningEntry[]>) {
      state.entries = action.payload
    },
  },
})

export const { upsertEntry, upsertEntries, resetPlanning, setEntries } = planningSlice.actions
export default planningSlice.reducer
