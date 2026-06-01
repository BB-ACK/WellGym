import { Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import type { ExerciseLog, WorkoutSession } from '../../types'
import { Field, TextAreaField } from '../ui/Field'

type Props = {
  date: string
  onClose: () => void
  onSave: (workout: Omit<WorkoutSession, 'id' | 'color' | 'pendingSync'>) => void
}

const emptyExercise = (): ExerciseLog => ({
  id: crypto.randomUUID(),
  name: '',
  category: '',
  equipment: '',
  sets: [{ id: crypto.randomUUID(), kg: 0, reps: 0 }]
})

export function WorkoutModal({ date, onClose, onSave }: Props) {
  const [title, setTitle] = useState('어깨 운동')
  const [time, setTime] = useState('18:30')
  const [weight, setWeight] = useState(73)
  const [condition, setCondition] = useState<WorkoutSession['condition']>('좋음')
  const [memo, setMemo] = useState('')
  const [exercises, setExercises] = useState<ExerciseLog[]>([
    { id: crypto.randomUUID(), name: '숄더 프레스', category: '어깨', equipment: '덤벨', sets: [{ id: crypto.randomUUID(), kg: 22, reps: 10 }] }
  ])

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

  const save = () => {
    onSave({ date, title, time, weight, condition, memo, exercises })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 p-3 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden rounded-[1.45rem] bg-paper shadow-soft">
        <div className="flex items-center justify-between border-b border-ink/5 bg-white p-4">
          <div>
            <p className="text-sm font-black text-mint">{date}</p>
            <h2 className="text-xl font-black">운동 일지 작성</h2>
          </div>
          <button type="button" aria-label="닫기" title="닫기" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-paper">
            <X size={21} />
          </button>
        </div>
        <div className="grid flex-1 gap-4 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="제목" value={title} onChange={(event) => setTitle(event.target.value)} />
            <Field label="시간" type="time" value={time} onChange={(event) => setTime(event.target.value)} />
            <Field label="체중" type="number" suffix="kg" value={weight} onChange={(event) => setWeight(Number(event.target.value))} />
            <label className="grid gap-2 text-sm font-bold text-ink">
              <span>컨디션</span>
              <select value={condition} onChange={(event) => setCondition(event.target.value as WorkoutSession['condition'])} className="min-h-12 rounded-xl bg-white px-3 shadow-line outline-none">
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
                추가
              </button>
            </div>
            {exercises.map((exercise) => (
              <div key={exercise.id} className="rounded-2xl bg-white p-3 shadow-line">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="운동 이름" value={exercise.name} onChange={(event) => updateExercise(exercise.id, { name: event.target.value })} />
                  <Field label="카테고리" value={exercise.category} onChange={(event) => updateExercise(exercise.id, { category: event.target.value })} />
                  <Field label="기구" value={exercise.equipment} onChange={(event) => updateExercise(exercise.id, { equipment: event.target.value })} />
                </div>
                <div className="mt-3 grid gap-2">
                  {exercise.sets.map((set, index) => (
                    <div key={set.id} className="grid grid-cols-[2rem_1fr_1fr] items-end gap-2">
                      <span className="pb-3 text-sm font-black text-ink/45">{index + 1}</span>
                      <Field label="kg" type="number" value={set.kg} onChange={(event) => updateSet(exercise.id, set.id, { kg: Number(event.target.value) })} />
                      <Field label="회수" type="number" value={set.reps} onChange={(event) => updateSet(exercise.id, set.id, { reps: Number(event.target.value) })} />
                    </div>
                  ))}
                  <button type="button" onClick={() => updateExercise(exercise.id, { sets: [...exercise.sets, { id: crypto.randomUUID(), kg: 0, reps: 0 }] })} className="min-h-10 rounded-xl bg-paper text-sm font-black text-mint">
                    세트 추가
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
        <div className="border-t border-ink/5 bg-white p-4">
          <button type="button" onClick={save} className="min-h-12 w-full rounded-xl bg-ink font-black text-white">저장</button>
        </div>
      </div>
    </div>
  )
}
