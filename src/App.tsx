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
  const { user, token, logout } = useAuthStore()
  const {
    workouts,
    inbodyEntries,
    dietPlan,
    feedback,
    isLoading,
    error,
    loadFromBackend,
    addWorkout,
    addInbody,
    generateDiet,
    generateFeedback,
    markSynced
  } = useWellGymStore()

  useEffect(() => {
    if (token) void loadFromBackend(token)
  }, [loadFromBackend, token])

  useEffect(() => {
    const onOnline = () => {
      markSynced()
      if (token) void loadFromBackend(token)
    }

    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [loadFromBackend, markSynced, token])

  if (!user) return <AuthPage />

  return (
    <AppShell activeView={activeView} user={user} onLogout={logout} onViewChange={setActiveView}>
      <div className="mb-5 hidden gap-2 md:flex">
        {([
          ['calendar', '운동 일지'],
          ['inbody', '인바디'],
          ['diet', '식단 추천']
        ] as Array<[ViewKey, string]>).map(([view, label]) => (
          <button
            key={view}
            type="button"
            onClick={() => setActiveView(view)}
            className={`min-h-11 rounded-full px-5 text-sm font-black ${
              activeView === view ? 'bg-ink text-white' : 'bg-white text-ink/55 shadow-line'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? <p className="mb-4 rounded-2xl bg-coral/10 px-4 py-3 text-sm font-bold text-coral">{error}</p> : null}

      {activeView === 'calendar' ? (
        <WorkoutCalendar
          workouts={workouts}
          feedback={feedback}
          isLoading={isLoading}
          onNewWorkout={setModalDate}
          onGenerateFeedback={(workoutLogId) => token && generateFeedback(token, workoutLogId)}
        />
      ) : null}
      {activeView === 'inbody' ? <InbodyForm latest={inbodyEntries[0]} onSave={(entry) => addInbody(entry, token)} /> : null}
      {activeView === 'diet' ? (
        <DietDashboard
          plan={dietPlan}
          latestWeight={inbodyEntries[0]?.weight}
          isLoading={isLoading}
          onGenerate={(input) => token && generateDiet(token, input)}
        />
      ) : null}

      {modalDate ? (
        <WorkoutModal date={modalDate} onClose={() => setModalDate(null)} onSave={(workout) => addWorkout(workout, token)} />
      ) : null}
      <InstallPrompt />
    </AppShell>
  )
}
