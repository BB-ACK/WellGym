import { Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { makeId } from '../../lib/id'
import type { ExerciseLog, WorkoutSession } from '../../types'
import { Field, TextAreaField } from '../ui/Field'

type WorkoutFormValue = Omit<WorkoutSession, 'id' | 'color' | 'pendingSync'>

type WorkoutModalProps = {
  date: string
  workout?: WorkoutSession | null
  onClose: () => void
  onSave: (workout: WorkoutFormValue) => void
  onDelete?: () => void
}

const bodyPartOptions = ['가슴', '어깨', '등', '하체', '팔', '복근']

const emptyExercise = (): ExerciseLog => ({
  id: makeId('exercise'),
  name: '',
  category: '가슴',
  equipment: '',
  sets: [{ id: makeId('set'), kg: 0, reps: 0 }]
})

const cloneExercises = (exercises: ExerciseLog[]) =>
  exercises.map((exercise) => ({
    ...exercise,
    category: bodyPartOptions.includes(exercise.category) ? exercise.category : '가슴',
    sets: exercise.sets.map((set) => ({ ...set }))
  }))

const toTimeInputValue = (value: string) => {
  const directMatch = value.match(/^(\d{1,2}):(\d{2})/)
  if (directMatch) return `${directMatch[1].padStart(2, '0')}:${directMatch[2]}`

  const koreanMatch = value.match(/(오전|오후)\s*(\d{1,2}):(\d{2})/)
  if (!koreanMatch) return '18:30'

  let hours = Number(koreanMatch[2])
  if (koreanMatch[1] === '오후' && hours < 12) hours += 12
  if (koreanMatch[1] === '오전' && hours === 12) hours = 0
  return `${`${hours}`.padStart(2, '0')}:${koreanMatch[3]}`
}

export function WorkoutModal({ date, workout, onClose, onSave, onDelete }: WorkoutModalProps) {
  const isEditing = Boolean(workout)
  const [workoutDate, setWorkoutDate] = useState(workout?.date ?? date)
  const [title, setTitle] = useState(workout?.title ?? '어깨 운동')
  const [time, setTime] = useState(toTimeInputValue(workout?.time ?? '18:30'))
  const [weight, setWeight] = useState(workout?.weight ?? 73)
  const [condition, setCondition] = useState<WorkoutSession['condition']>(workout?.condition ?? '좋음')
  const [memo, setMemo] = useState(workout?.memo ?? '')
  const [exercises, setExercises] = useState<ExerciseLog[]>(
    workout?.exercises?.length
      ? cloneExercises(workout.exercises)
      : [
          {
            id: makeId('exercise'),
            name: '숄더 프레스',
            category: '어깨',
            equipment: '덤벨',
            sets: [{ id: makeId('set'), kg: 22, reps: 10 }]
          }
        ]
  )

  const updateExercise = (id: string, patch: Partial<ExerciseLog>) => {
    setExercises((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const updateSet = (exerciseId: string, setId: string, patch: { kg?: number; reps?: number }) => {
    setExercises((items) =>
      items.map((item) =>
        item.id === exerciseId
          ? { ...item, sets: item.sets.map((set) => (set.id === setId ? { ...set, ...patch } : set)) }
          : item
      )
    )
  }

  const addSetFromFirst = (exercise: ExerciseLog) => {
    const firstSet = exercise.sets[0] ?? { kg: 0, reps: 0 }
    updateExercise(exercise.id, {
      sets: [...exercise.sets, { id: makeId('set'), kg: firstSet.kg, reps: firstSet.reps }]
    })
  }

  const save = () => {
    onSave({ date: workoutDate, title, time, weight, condition, memo, exercises })
    onClose()
  }

  const remove = () => {
    if (!isEditing || !onDelete) return
    const ok = window.confirm('이 운동 일지를 삭제할까요? 삭제한 일지는 되돌릴 수 없습니다.')
    if (!ok) return
    onDelete()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/45 p-3 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-paper shadow-soft">
        <div className="flex items-center justify-between border-b border-ink/5 bg-white p-4">
          <div>
            <p className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${isEditing ? 'bg-saffron/20 text-ink' : 'bg-mint/10 text-mint'}`}>
              {isEditing ? '기존 일지 수정 모드' : '새 일지 작성 모드'}
            </p>
            <h2 className="mt-2 text-xl font-black">{isEditing ? '운동 일지 확인 및 수정' : '운동 일지 작성'}</h2>
            <p className="mt-1 text-sm font-bold text-ink/45">{workoutDate}</p>
          </div>
          <button type="button" aria-label="닫기" title="닫기" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-paper">
            <X size={21} />
          </button>
        </div>

        <div className="grid flex-1 gap-4 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="날짜" type="date" value={workoutDate} onChange={(event) => setWorkoutDate(event.target.value)} />
            <Field label="시간" type="time" value={time} onChange={(event) => setTime(event.target.value)} />
            <Field label="제목" value={title} onChange={(event) => setTitle(event.target.value)} />
            <Field label="체중" type="number" suffix="kg" value={weight} onChange={(event) => setWeight(Number(event.target.value))} />
            <label className="grid gap-2 text-sm font-semibold text-ink">
              <span>컨디션</span>
              <select value={condition} onChange={(event) => setCondition(event.target.value as WorkoutSession['condition'])} className="min-h-12 rounded-lg border border-ink/10 bg-white px-3 outline-none focus:border-mint">
                <option>좋음</option>
                <option>보통</option>
                <option>피곤</option>
                <option>회복</option>
              </select>
            </label>
          </div>
          <TextAreaField label="전체 메모" value={memo} onChange={(event) => setMemo(event.target.value)} />

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black">운동 목록</h3>
              <button type="button" onClick={() => setExercises((items) => [...items, emptyExercise()])} className="flex min-h-10 items-center gap-2 rounded-full bg-white px-3 text-sm font-black text-mint shadow-line">
                <Plus size={16} />
                운동 추가
              </button>
            </div>

            {exercises.map((exercise) => (
              <div key={exercise.id} className="rounded-2xl bg-white p-3 shadow-line">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="운동 이름" value={exercise.name} onChange={(event) => updateExercise(exercise.id, { name: event.target.value })} />
                  <label className="grid gap-2 text-sm font-semibold text-ink">
                    <span>카테고리</span>
                    <select
                      value={exercise.category}
                      onChange={(event) => updateExercise(exercise.id, { category: event.target.value })}
                      className="min-h-12 rounded-lg border border-ink/10 bg-white px-3 outline-none focus:border-mint"
                    >
                      {bodyPartOptions.map((bodyPart) => (
                        <option key={bodyPart} value={bodyPart}>{bodyPart}</option>
                      ))}
                    </select>
                  </label>
                  <Field label="기구" value={exercise.equipment} onChange={(event) => updateExercise(exercise.id, { equipment: event.target.value })} />
                </div>
                <div className="mt-3 grid gap-2">
                  {exercise.sets.map((set, index) => (
                    <div key={set.id} className="grid grid-cols-[2rem_1fr_1fr] items-end gap-2">
                      <span className="pb-3 text-sm font-black text-ink/45">{index + 1}</span>
                      <Field label="kg" type="number" value={set.kg} onChange={(event) => updateSet(exercise.id, set.id, { kg: Number(event.target.value) })} />
                      <Field label="횟수" type="number" value={set.reps} onChange={(event) => updateSet(exercise.id, set.id, { reps: Number(event.target.value) })} />
                    </div>
                  ))}
                  <button type="button" onClick={() => addSetFromFirst(exercise)} className="min-h-10 rounded-xl bg-paper text-sm font-black text-mint">
                    첫 세트 값으로 세트 추가
                  </button>
                </div>
                {exercises.length > 1 ? (
                  <button type="button" onClick={() => setExercises((items) => items.filter((item) => item.id !== exercise.id))} className="mt-3 flex min-h-10 items-center gap-2 text-sm font-black text-coral">
                    <Trash2 size={16} />
                    운동 삭제
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2 border-t border-ink/5 bg-white p-4 sm:grid-cols-[auto_1fr]">
          {isEditing ? (
            <button type="button" onClick={remove} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-coral/10 px-5 font-black text-coral">
              <Trash2 size={18} />
              일지 삭제
            </button>
          ) : null}
          <button type="button" onClick={save} className="min-h-12 w-full rounded-xl bg-ink font-black text-white">
            {isEditing ? '기존 일지 수정 저장' : '새 일지 저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
