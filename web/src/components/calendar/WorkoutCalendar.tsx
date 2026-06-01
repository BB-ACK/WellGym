import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { WorkoutSession } from '../../types'

type Props = {
  workouts: WorkoutSession[]
  onNewWorkout: (date: string) => void
}

const dayNames = ['월', '화', '수', '목', '금', '토', '일']

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`

export function WorkoutCalendar({ workouts, onNewWorkout }: Props) {
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
      return { date, key: dateKey(date), isCurrentMonth: date.getMonth() === month }
    })
  }, [monthDate])

  const grouped = useMemo(
    () =>
      workouts.reduce<Record<string, WorkoutSession[]>>((acc, workout) => {
        acc[workout.date] = [...(acc[workout.date] ?? []), workout]
        return acc
      }, {}),
    [workouts]
  )

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
          <button type="button" onClick={() => onNewWorkout(dateKey(new Date()))} className="flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-black text-white">
            <Plus size={18} />
            기록
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.35rem] bg-white shadow-soft">
        <div className="grid grid-cols-7 border-b border-ink/5 bg-white">
          {dayNames.map((day) => (
            <div key={day} className="py-3 text-center text-xs font-black text-ink/45">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const sessions = grouped[day.key] ?? []
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
                  {sessions.slice(0, 3).map((session) => (
                    <span key={session.id} className="block truncate rounded-lg px-2 py-1 text-[11px] font-black text-white" style={{ backgroundColor: session.color }}>
                      {session.title}
                    </span>
                  ))}
                  {sessions.some((session) => session.pendingSync) ? (
                    <span className="rounded-lg bg-saffron/20 px-2 py-1 text-[10px] font-black text-ink">동기화 대기</span>
                  ) : null}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
