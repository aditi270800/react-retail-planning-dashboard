# Retail Planning Dashboard

A production-grade retail planning tool built with React + Vite + TypeScript + Redux Toolkit + AG Grid + Recharts.
When you open the link https://react-retail-planning-dashboard-zf8.vercel.app/, click on the button "load sample data" and it will load all the sample data.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript (strict) |
| State | Redux Toolkit |
| Grid | AG Grid (Client Side) |
| Charts | Recharts |
| Styling | TailwindCSS v3 |
| Persistence | LocalStorage (debounced) |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (opens at http://localhost:5173)
npm run dev

# 3. Build for production
npm run build
```

---

## Project Structure

```
src/
├── types/index.ts              # All TypeScript interfaces
├── store/
│   ├── index.ts                # Redux store + LocalStorage persistence
│   ├── selectors.ts            # Memoized selectors (createSelector)
│   └── slices/
│       ├── storeSlice.ts       # Store CRUD actions
│       ├── skuSlice.ts         # SKU CRUD actions
│       └── planningSlice.ts    # Planning entry upsert/reset
├── utils/
│   ├── planningCalculations.ts # Pure calculation functions
│   └── calendarUtils.ts        # Week/month generation
├── data/sampleData.ts          # Mock data + seeded random entries
├── hooks/redux.ts              # Typed useAppDispatch / useAppSelector
└── components/
    ├── layout/
    │   ├── TopNav.tsx
    │   └── Sidebar.tsx
    ├── ui/index.tsx            # Button, Input, Modal, Badge, PageHeader, StatCard
    ├── stores/StoresPage.tsx   # Store management (add/edit/delete/reorder)
    ├── skus/SKUsPage.tsx       # SKU management with live margin preview
    ├── planning/PlanningPage.tsx # AG Grid planning matrix
    └── charts/ChartsPage.tsx   # Recharts dual-axis chart + weekly table
```

---

## Business Logic

All calculations are pure functions in `src/utils/planningCalculations.ts`:

```ts
calculateSales(units, price)          // units × price
calculateGMDollars(units, price, cost) // sales − (units × cost)
calculateGMPercent(gmDollars, sales)  // gm / sales (returns 0 if sales = 0)
```

### GM% Conditional Formatting

| Range | Color |
|---|---|
| ≥ 40% | Green |
| 10–40% | Yellow |
| 5–10% | Orange |
| ≤ 5% | Red |

---

## Data Model

```ts
Store    { id, name, order }
SKU      { id, name, price, cost }
Planning { storeId, skuId, week, units }
// week format: "2024-W01"
```

Planning grid rows = **Stores × SKUs** cross join.
Columns = **24 weeks** (Jan–Jun 2024, 4 weeks/month) grouped by month.

---

## Performance

- `createSelector` memoization on all derived data
- AG Grid virtualization handles 10,000+ rows smoothly
- LocalStorage saves are debounced 400ms to avoid blocking on cell edits
- `useMemo` / `useCallback` on all heavy computations and handlers

---

## Features

### Stores Page
- Add / Edit / Delete stores
- Drag-to-reorder (HTML5 drag API, persisted via Redux)

### SKUs Page
- Add / Edit / Delete SKUs
- Live gross margin preview in the form

### Planning Grid
- Editable `Units` cells — all other columns auto-calculated
- GM% cells color-coded by threshold
- **Load Sample Data** — 5 stores × 6 SKUs × 24 weeks = 720 rows
- **Reset** — clears all planning units
- **Export CSV** — via AG Grid's native export API

### Charts
- Store selector dropdown
- Dual-axis ComposedChart: GM Dollars (bars) + GM% (line)
- KPI summary cards: Total Sales, Total GM$, Avg GM%
- Weekly breakdown table with color-coded GM% badges
