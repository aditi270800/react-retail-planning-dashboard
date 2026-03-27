import { configureStore } from "@reduxjs/toolkit";
import storeReducer from "./slices/storeSlice";
import skuReducer from "./slices/skuSlice";
import planningReducer from "./slices/planningSlice";

const STORAGE_KEY = "retail_planning_v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function saveState(state: ReturnType<typeof store.getState>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export const store = configureStore({
  reducer: {
    stores: storeReducer,
    skus: skuReducer,
    planning: planningReducer,
  },
});

// Debounced persistence — avoid blocking on rapid cell edits
let timer: ReturnType<typeof setTimeout>;
store.subscribe(() => {
  clearTimeout(timer);
  timer = setTimeout(() => saveState(store.getState()), 400);
});

export type AppDispatch = typeof store.dispatch;
