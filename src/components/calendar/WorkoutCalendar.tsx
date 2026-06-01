import { ChevronLeft, ChevronRight, Plus, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { WorkoutSession } from '../../types'

type WorkoutCalendarProps = {
  workouts: WorkoutSession[]
  feedback: unknown | null
  isLoading: boolean
  onNewWorkout: (date: string) => void
  onGenerateFeedback: (workoutLogId?: string) => void
}

const dayNames = ['월', '화', '수', '목', '금', '토', '일']

const toDateKey = (date: Date) => {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function WorkoutCalendar({
  workouts,
  feedback,
  isLoading,
  onNewWorkout,
  onGenerateFeedback
}: WorkoutCalendarProps) {
  const [monthDate, setMonthDate] = useState(new Date(2026, 5, 1))

  const days = useMemo(() => {
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    const first = new Date(year, month, 1)
    const startOffset = (first.getDay() + 6) % 7
    const start = new Date(year, month, 1 - startOffset)
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      return {
        date,
        key: toDateKey(date),
        isCurrentMonth: date.getMonth() === month
      }
    })
  }, [monthDate])

  const workoutsByDate = useMemo(() => {
    return workouts.reduce<Record<string, WorkoutSession[]>>((acc, workout) => {
      acc[workout.date] = [...(acc[workout.date] ?? []), workout]
      return acc
    }, {})
  }, [workouts])

  const latestSyncedWorkout = workouts.find((workout) => !workout.pendingSync)

  return (
    <section className="grid gap-5">
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-sm font-black text-mint">운동 일지</p>
          <h2 className="text-3xl font-black">{monthDate.getFullYear()}년 {monthDate.getMonth() + 1}월</h2>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="이전 달" title="이전 달" onClick={() => setMonthDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-line">
            <ChevronLeft size={20} />
          </button>
          <button type="button" aria-label="다음 달" title="다음 달" onClick={() => setMonthDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-line">
            <ChevronRight size={20} />
          </button>
          <button type="button" onClick={() => onNewWorkout(toDateKey(new Date()))} className="flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-black text-white">
            <Plus size={18} />
            기록
          </button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_21rem]">
        <div className="overflow-hidden rounded-[1.35rem] bg-white shadow-soft">
          <div className="grid grid-cols-7 border-b border-ink/5 bg-white">
            {dayNames.map((day) => (
              <div key={day} className="py-3 text-center text-xs font-black text-ink/45">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const dayWorkouts = workoutsByDate[day.key] ?? []
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => onNewWorkout(day.key)}
                  className={`min-h-24 border-b border-r border-ink/5 p-2 text-left transition active:bg-mint/10 ${
                    day.isCurrentMonth ? 'bg-white hover:bg-paper' : 'bg-[#f0eee8] text-ink/35'
                  }`}
                >
                  <span className="text-xs font-black">{day.date.getDate()}</span>
                  <span className="mt-2 grid gap-1">
                    {dayWorkouts.slice(0, 3).map((workout) => (
                      <span key={workout.id} className="block truncate rounded-lg px-2 py-1 text-[11px] font-black text-white" style={{ backgroundColor: workout.color }}>
                        {workout.title}
                      </span>
                    ))}
                    {dayWorkouts.some((workout) => workout.pendingSync) ? (
                      <span className="rounded-lg bg-saffron/20 px-2 py-1 text-[10px] font-black text-ink">동기화 대기</span>
                    ) : null}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <aside className="grid content-start gap-3">
          <div className="rounded-[1.35rem] bg-ink p-5 text-white shadow-soft">
            <div className="flex items-center gap-2 font-black">
              <Sparkles size={18} className="text-saffron" />
              AI 운동 피드백
            </div>
            <p className="mt-3 text-sm font-bold text-white/60">백엔드 `/api/ai/feedback`로 최근 운동을 분석합니다.</p>
            <button
              type="button"
              disabled={isLoading || !latestSyncedWorkout}
              onClick={() => onGenerateFeedback(latestSyncedWorkout?.id)}
              className="mt-4 min-h-11 w-full rounded-xl bg-white text-sm font-black text-ink disabled:opacity-50"
            >
              {isLoading ? '분석 중...' : '피드백 생성'}
            </button>
          </div>
          {feedback ? (
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-[1.35rem] bg-white p-4 text-xs font-bold text-ink/70 shadow-line">
              {JSON.stringify(feedback, null, 2)}
            </pre>
          ) : null}
        </aside>
      </div>
    </section>
  )
}
