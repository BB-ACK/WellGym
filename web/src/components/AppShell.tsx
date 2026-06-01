import { CalendarDays, ChefHat, LogOut, Scale, Wifi } from 'lucide-react'
import type { ViewKey } from '../App'
import type { User } from '../types'

type AppShellProps = {
  activeView: ViewKey
  user: User
  onLogout: () => void
  onViewChange: (view: ViewKey) => void
  children: React.ReactNode
}

const nav = [
  { key: 'calendar' as const, label: '일지', icon: CalendarDays },
  { key: 'inbody' as const, label: '인바디', icon: Scale },
  { key: 'diet' as const, label: '식단', icon: ChefHat }
]

export function AppShell({ activeView, user, onLogout, onViewChange, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-ink/5 bg-paper/85 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-mint">WellGym</p>
            <h1 className="truncate text-xl font-black">{user.name}님의 루틴</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black text-mint shadow-line sm:flex">
              <Wifi size={15} />
              Offline Ready
            </span>
            <button type="button" aria-label="로그아웃" title="로그아웃" onClick={onLogout} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-line">
              <LogOut size={19} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-5 pb-24 md:pb-8">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/5 bg-white/90 px-4 py-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-sm grid-cols-3 gap-2">
          {nav.map((item) => {
            const Icon = item.icon
            const active = activeView === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onViewChange(item.key)}
                className={`flex min-h-12 flex-col items-center justify-center rounded-2xl text-xs font-black transition ${
                  active ? 'bg-ink text-white' : 'text-ink/45'
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
