import { useEffect, useState } from 'react'
import { AppShell } from './components/AppShell'
import { AuthPage } from './components/AuthPage'
import { InstallPrompt } from './components/InstallPrompt'
import { FeedbackModal } from './components/calendar/FeedbackModal'
import { WorkoutCalendar } from './components/calendar/WorkoutCalendar'
import { WorkoutModal } from './components/calendar/WorkoutModal'
import { DietDashboard } from './components/diet/DietDashboard'
import { InbodyForm } from './components/inbody/InbodyForm'
import { useAuthStore } from './store/useAuthStore'
import { useWellGymStore } from './store/useWellGymStore'
import type { WorkoutFeedback, WorkoutSession } from './types'

export type ViewKey = 'calendar' | 'inbody' | 'diet'

export default function App() {
  const [activeView, setActiveView] = useState<ViewKey>('calendar')
  const [modalDate, setModalDate] = useState<string | null>(null)
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSession | null>(null)
  const [feedbackModal, setFeedbackModal] = useState<{ feedback: WorkoutFeedback; workout?: WorkoutSession; saved?: boolean } | null>(null)
  const { user, token, logout } = useAuthStore()
  const {
    workouts,
    inbodyEntries,
    dietPlan,
    savedFeedbacks,
    isLoading,
    error,
    loadFromBackend,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    addInbody,
    analyzeInbodyPhoto,
    generateDiet,
    generateFeedback,
    saveFeedback,
    markSynced
  } = useWellGymStore()

  const currentUserFeedbacks = savedFeedbacks.filter((feedback) => feedback.userId === user?.id)

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
          savedFeedbacks={currentUserFeedbacks}
          isLoading={isLoading}
          onNewWorkout={(date) => {
            setSelectedWorkout(null)
            setModalDate(date)
          }}
          onOpenWorkout={(workout) => {
            setSelectedWorkout(workout)
            setModalDate(workout.date)
          }}
          onGenerateFeedback={async (workout) => {
            if (!token) return
            const result = await generateFeedback(token, workout?.id)
            if (result) setFeedbackModal({ feedback: result, workout })
          }}
        />
      ) : null}
      {activeView === 'inbody' ? (
        <InbodyForm
          latest={inbodyEntries[0]}
          isLoading={isLoading}
          onAnalyzePhoto={(input) => (token ? analyzeInbodyPhoto(token, input) : Promise.resolve(null))}
          onSave={(entry) => addInbody(entry, token)}
        />
      ) : null}
      {activeView === 'diet' ? (
        <DietDashboard
          plan={dietPlan}
          latestWeight={inbodyEntries[0]?.weight}
          isLoading={isLoading}
          onGenerate={(input) => token && generateDiet(token, input)}
        />
      ) : null}

      {modalDate ? (
        <WorkoutModal
          date={modalDate}
          workout={selectedWorkout}
          onClose={() => {
            setModalDate(null)
            setSelectedWorkout(null)
          }}
          onSave={(workout) => {
            if (selectedWorkout) {
              void updateWorkout(selectedWorkout.id, workout, token)
            } else {
              void addWorkout(workout, token)
            }
          }}
          onDelete={
            selectedWorkout
              ? () => {
                  void deleteWorkout(selectedWorkout.id, token)
                }
              : undefined
          }
        />
      ) : null}
      {feedbackModal ? (
        <FeedbackModal
          feedback={feedbackModal.feedback}
          workout={feedbackModal.workout}
          isSaved={feedbackModal.saved}
          onClose={() => setFeedbackModal(null)}
          onSave={() => {
            saveFeedback(feedbackModal.feedback, user.id, feedbackModal.workout)
            setFeedbackModal((current) => (current ? { ...current, saved: true } : current))
          }}
        />
      ) : null}
      <InstallPrompt />
    </AppShell>
  )
}
