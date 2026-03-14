import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Store, StoreState } from '../../types'

const initialState: StoreState = {
  stores: [],
}

const storeSlice = createSlice({
  name: 'stores',
  initialState,
  reducers: {
    addStore(state, action: PayloadAction<Store>) {
      state.stores.push(action.payload)
    },
    updateStore(state, action: PayloadAction<Store>) {
      const idx = state.stores.findIndex(s => s.id === action.payload.id)
      if (idx !== -1) state.stores[idx] = action.payload
    },
    deleteStore(state, action: PayloadAction<string>) {
      state.stores = state.stores.filter(s => s.id !== action.payload)
    },
    reorderStores(state, action: PayloadAction<Store[]>) {
      state.stores = action.payload
    },
    setStores(state, action: PayloadAction<Store[]>) {
      state.stores = action.payload
    },
  },
})

export const { addStore, updateStore, deleteStore, reorderStores, setStores } = storeSlice.actions
export default storeSlice.reducer
