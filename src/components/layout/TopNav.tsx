import { BarChart2, Bell, Settings, ChevronDown } from 'lucide-react'

export function TopNav() {
  return (
    <header className="h-14 bg-surface-1 border-b border-border flex items-center justify-between px-5 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center shadow-lg shadow-brand-900/50">
          <BarChart2 size={14} className="text-white" />
        </div>
        <span className="font-display font-bold text-white tracking-tight">RetailPlan</span>
        <span className="text-[10px] font-mono text-brand-400 bg-brand-900/40 border border-brand-800/40 px-1.5 py-0.5 rounded-md">
          v1.0
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-surface-3 transition-colors">
          <Bell size={15} />
        </button>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-300 hover:bg-surface-3 transition-colors">
          <Settings size={15} />
        </button>
        <div className="w-px h-5 bg-border mx-1" />
        <button className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-surface-3 transition-colors group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white text-xs font-bold shadow">
            A
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold text-white leading-none">Admin</div>
            <div className="text-[10px] text-gray-600 leading-none mt-0.5">admin@retailplan.io</div>
          </div>
          <ChevronDown size={12} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
        </button>
      </div>
    </header>
  )
}
