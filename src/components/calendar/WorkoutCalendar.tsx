import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { WorkoutSession } from '../../types'
import { IconButton } from '../ui/IconButton'

type WorkoutCalendarProps = {
  workouts: WorkoutSession[]
  onNewWorkout: (date: string) => void
}

const dayNames = ['월', '화', '수', '목', '금', '토', '일']

const toDateKey = (date: Date) => {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function WorkoutCalendar({ workouts, onNewWorkout }: WorkoutCalendarProps) {
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

  const moveMonth = (step: number) => {
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + step, 1))
  }

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-mint">운동 일지</p>
          <h2 className="text-2xl font-black">{monthDate.getFullYear()}년 {monthDate.getMonth() + 1}월</h2>
        </div>
        <div className="flex items-center gap-2">
          <IconButton label="이전 달" onClick={() => moveMonth(-1)}>
            <ChevronLeft size={20} />
          </IconButton>
          <IconButton label="다음 달" onClick={() => moveMonth(1)}>
            <ChevronRight size={20} />
          </IconButton>
          <button
            type="button"
            onClick={() => onNewWorkout(toDateKey(new Date()))}
            className="flex min-h-11 items-center gap-2 rounded-lg bg-mint px-4 text-sm font-black text-white active:scale-95"
          >
            <Plus size={18} />
            기록
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
        <div className="grid grid-cols-7 border-b border-ink/10 bg-[#edf6f2]">
          {dayNames.map((day) => (
            <div key={day} className="py-3 text-center text-xs font-black text-ink/70">
              {day}
            </div>
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
                className={`min-h-24 border-b border-r border-ink/10 p-2 text-left transition hover:bg-mint/5 active:bg-mint/10 ${
                  day.isCurrentMonth ? 'bg-white' : 'bg-[#f4f1ea] text-ink/35'
                }`}
              >
                <span className="text-xs font-black">{day.date.getDate()}</span>
                <div className="mt-2 grid gap-1">
                  {dayWorkouts.slice(0, 3).map((workout) => (
                    <span
                      key={workout.id}
                      className="block truncate rounded px-2 py-1 text-[11px] font-bold text-white"
                      style={{ backgroundColor: workout.color }}
                    >
                      {workout.title}
                    </span>
                  ))}
                  {dayWorkouts.some((workout) => workout.pendingSync) ? (
                    <span className="rounded bg-amberfit/25 px-2 py-1 text-[10px] font-black text-ink">동기화 대기</span>
                  ) : null}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
