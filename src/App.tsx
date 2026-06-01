import { useEffect, useState } from 'react'
import { AppShell } from './components/AppShell'
import { InstallPrompt } from './components/InstallPrompt'
import { WorkoutCalendar } from './components/calendar/WorkoutCalendar'
import { WorkoutModal } from './components/calendar/WorkoutModal'
import { DietDashboard } from './components/diet/DietDashboard'
import { InbodyForm } from './components/inbody/InbodyForm'
import { useWellGymStore } from './store/useWellGymStore'

export type ViewKey = 'calendar' | 'inbody' | 'diet'

export default function App() {
  const [activeView, setActiveView] = useState<ViewKey>('calendar')
  const [modalDate, setModalDate] = useState<string | null>(null)
  const { workouts, inbodyEntries, dietPlan, addWorkout, addInbody, markSynced } = useWellGymStore()

  useEffect(() => {
    const onOnline = () => {
      markSynced()
    }

    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [markSynced])

  return (
    <AppShell activeView={activeView} onViewChange={setActiveView}>
      <div className="hidden gap-2 pb-5 md:flex">
        {(['calendar', 'inbody', 'diet'] as ViewKey[]).map((view) => (
          <button
            key={view}
            type="button"
            onClick={() => setActiveView(view)}
            className={`min-h-11 rounded-lg px-4 text-sm font-black ${
              activeView === view ? 'bg-mint text-white' : 'bg-white text-ink/70'
            }`}
          >
            {view === 'calendar' ? '운동 일지' : view === 'inbody' ? '인바디' : '식단 추천'}
          </button>
        ))}
      </div>

      {activeView === 'calendar' ? <WorkoutCalendar workouts={workouts} onNewWorkout={setModalDate} /> : null}
      {activeView === 'inbody' ? <InbodyForm latest={inbodyEntries[0]} onSave={addInbody} /> : null}
      {activeView === 'diet' ? <DietDashboard plan={dietPlan} /> : null}

      {modalDate ? (
        <WorkoutModal date={modalDate} onClose={() => setModalDate(null)} onSave={addWorkout} />
      ) : null}
      <InstallPrompt />
    </AppShell>
  )
}
