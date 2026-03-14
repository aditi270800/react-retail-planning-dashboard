import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { SKU, SKUState } from '../../types'

const initialState: SKUState = {
  skus: [],
}

const skuSlice = createSlice({
  name: 'skus',
  initialState,
  reducers: {
    addSKU(state, action: PayloadAction<SKU>) {
      state.skus.push(action.payload)
    },
    updateSKU(state, action: PayloadAction<SKU>) {
      const idx = state.skus.findIndex(s => s.id === action.payload.id)
      if (idx !== -1) state.skus[idx] = action.payload
    },
    deleteSKU(state, action: PayloadAction<string>) {
      state.skus = state.skus.filter(s => s.id !== action.payload)
    },
    setSKUs(state, action: PayloadAction<SKU[]>) {
      state.skus = action.payload
    },
  },
})

export const { addSKU, updateSKU, deleteSKU, setSKUs } = skuSlice.actions
export default skuSlice.reducer
