import { useEffect, useState } from 'react'
import { AppShell } from './components/AppShell'
import { AuthPage } from './components/AuthPage'
import { InstallPrompt } from './components/InstallPrompt'
import { WorkoutCalendar } from './components/calendar/WorkoutCalendar'
import { WorkoutModal } from './components/calendar/WorkoutModal'
import { DietDashboard } from './components/diet/DietDashboard'
import { InbodyForm } from './components/inbody/InbodyForm'
import { useAuthStore } from './store/useAuthStore'
import { useWellGymStore } from './store/useWellGymStore'

export type ViewKey = 'calendar' | 'inbody' | 'diet'

export default function App() {
  const [activeView, setActiveView] = useState<ViewKey>('calendar')
  const [modalDate, setModalDate] = useState<string | null>(null)
  const { user, logout } = useAuthStore()
  const { workouts, inbodyEntries, dietPlan, addWorkout, addInbody, markSynced } = useWellGymStore()

  useEffect(() => {
    const onOnline = () => markSynced()
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [markSynced])

  if (!user) return <AuthPage />

  return (
    <AppShell activeView={activeView} user={user} onLogout={logout} onViewChange={setActiveView}>
      <div className="mb-5 hidden gap-2 md:flex">
        {([
          ['calendar', '운동 일지'],
          ['inbody', '인바디'],
          ['diet', '식단 추천']
        ] as Array<[ViewKey, string]>).map(([view, label]) => (
          <button key={view} type="button" onClick={() => setActiveView(view)} className={`min-h-11 rounded-full px-5 text-sm font-black ${activeView === view ? 'bg-ink text-white' : 'bg-white text-ink/55 shadow-line'}`}>
            {label}
          </button>
        ))}
      </div>
      {activeView === 'calendar' ? <WorkoutCalendar workouts={workouts} onNewWorkout={setModalDate} /> : null}
      {activeView === 'inbody' ? <InbodyForm latest={inbodyEntries[0]} onSave={addInbody} /> : null}
      {activeView === 'diet' ? <DietDashboard plan={dietPlan} /> : null}
      {modalDate ? <WorkoutModal date={modalDate} onClose={() => setModalDate(null)} onSave={addWorkout} /> : null}
      <InstallPrompt />
    </AppShell>
  )
}
