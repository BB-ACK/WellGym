import { Activity, CalendarDays, ChefHat, Scale } from 'lucide-react'
import type { ViewKey } from '../App'

type AppShellProps = {
  activeView: ViewKey
  onViewChange: (view: ViewKey) => void
  children: React.ReactNode
}

const navItems: Array<{ key: ViewKey; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { key: 'calendar', label: '일지', icon: CalendarDays },
  { key: 'inbody', label: '인바디', icon: Scale },
  { key: 'diet', label: '식단', icon: ChefHat }
]

export function AppShell({ activeView, onViewChange, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f7fbf8] text-ink">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-[#f7fbf8]/95 px-4 pb-3 pt-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">WellGym</p>
            <h1 className="text-xl font-black leading-tight">헬스 운동 기록 앱</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-mint shadow-soft">
            <Activity size={16} />
            PWA Ready
          </div>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-9rem)] max-w-5xl px-4 py-5 safe-bottom">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-white/95 px-4 py-2 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-sm grid-cols-3 gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = activeView === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onViewChange(item.key)}
                className={`flex min-h-12 flex-col items-center justify-center rounded-lg text-xs font-bold transition ${
                  active ? 'bg-mint text-white' : 'text-ink/65'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
