import { Store, Tag, LayoutGrid, BarChart2 } from 'lucide-react'
import type { NavPage } from '../../types'

interface SidebarProps {
  activePage: NavPage
  onNavigate: (page: NavPage) => void
}

const navItems = [
  { page: 'stores' as NavPage, label: 'Stores', icon: Store },
  { page: 'skus' as NavPage, label: 'SKUs', icon: Tag },
  { page: 'planning' as NavPage, label: 'Planning', icon: LayoutGrid },
  { page: 'charts' as NavPage, label: 'Charts', icon: BarChart2 },
]

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-56 bg-surface-1 border-r border-border flex flex-col shrink-0">
      <nav className="flex-1 p-3 space-y-0.5 mt-2">
        {navItems.map(({ page, label, icon: Icon }) => {
          const isActive = activePage === page
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/40'
                  : 'text-gray-400 hover:text-white hover:bg-surface-3'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-brand-200' : ''} />
              {label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-300" />
              )}
            </button>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="bg-surface-3 rounded-lg p-3">
          <div className="text-xs font-semibold text-white mb-1">Data Status</div>
          <div className="text-xs text-gray-500">Saved to LocalStorage</div>
          <div className="mt-2 w-full h-1 bg-surface-4 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-brand-500 rounded-full" />
          </div>
        </div>
      </div>
    </aside>
  )
}
