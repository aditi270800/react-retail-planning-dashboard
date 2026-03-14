import { useState } from 'react'
import { TopNav } from './components/layout/TopNav'
import { Sidebar } from './components/layout/Sidebar'
import { StoresPage } from './components/stores/StoresPage'
import { SKUsPage } from './components/skus/SKUsPage'
import { PlanningPage } from './components/planning/PlanningPage'
import { ChartsPage } from './components/charts/ChartsPage'
import type { NavPage } from './types'

export default function App() {
  const [activePage, setActivePage] = useState<NavPage>('planning')

  return (
    <div className="min-w-[1080px] h-screen flex flex-col bg-surface-0 text-white overflow-hidden">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <main className="flex-1 flex overflow-hidden">
          {activePage === 'stores' && <StoresPage />}
          {activePage === 'skus' && <SKUsPage />}
          {activePage === 'planning' && <PlanningPage />}
          {activePage === 'charts' && <ChartsPage />}
        </main>
      </div>
    </div>
  )
}
