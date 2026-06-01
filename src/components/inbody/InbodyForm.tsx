import { Camera, CloudOff, Save } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { InbodyEntry } from '../../types'
import { Field } from '../ui/Field'

type InbodyFormProps = {
  latest?: InbodyEntry
  onSave: (entry: Omit<InbodyEntry, 'id' | 'pendingSync'>) => void
}

export function InbodyForm({ latest, onSave }: InbodyFormProps) {
  const [date, setDate] = useState('2026-06-01')
  const [photoName, setPhotoName] = useState('')
  const [weight, setWeight] = useState(latest?.weight ?? 0)
  const [height, setHeight] = useState(latest?.height ?? 0)
  const [muscleMass, setMuscleMass] = useState(latest?.muscleMass ?? 0)
  const [bodyFatMass, setBodyFatMass] = useState(latest?.bodyFatMass ?? 0)
  const [bodyFatRate, setBodyFatRate] = useState(latest?.bodyFatRate ?? 0)
  const [bmi, setBmi] = useState(latest?.bmi ?? 0)

  const calculatedBmi = useMemo(() => {
    if (!height || !weight) return 0
    return Number((weight / (height / 100) ** 2).toFixed(1))
  }, [height, weight])

  const save = () => {
    onSave({
      date,
      photoName,
      weight,
      height,
      muscleMass,
      bodyFatMass,
      bodyFatRate,
      bmi: bmi || calculatedBmi
    })
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_20rem]">
      <div className="grid gap-4">
        <div>
          <p className="text-sm font-bold text-mint">체성분 기록</p>
          <h2 className="text-2xl font-black">인바디 입력</h2>
        </div>

        <label className="grid min-h-44 place-items-center rounded-lg border-2 border-dashed border-mint/35 bg-white p-5 text-center shadow-soft">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => setPhotoName(event.target.files?.[0]?.name ?? '')}
          />
          <span className="grid justify-items-center gap-2">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-mint text-white">
              <Camera size={24} />
            </span>
            <span className="font-black">인바디 사진 업로드</span>
            <span className="text-sm text-ink/60">{photoName || '촬영한 결과지를 선택하세요.'}</span>
          </span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <Field label="날짜" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <Field
            label="체중"
            type="number"
            suffix="kg"
            value={weight}
            onChange={(event) => setWeight(Number(event.target.value))}
          />
          <Field
            label="키"
            type="number"
            suffix="cm"
            value={height}
            onChange={(event) => setHeight(Number(event.target.value))}
          />
          <Field
            label="근육량"
            type="number"
            suffix="kg"
            value={muscleMass}
            onChange={(event) => setMuscleMass(Number(event.target.value))}
          />
          <Field
            label="체지방량"
            type="number"
            suffix="kg"
            value={bodyFatMass}
            onChange={(event) => setBodyFatMass(Number(event.target.value))}
          />
          <Field
            label="체지방률"
            type="number"
            suffix="%"
            value={bodyFatRate}
            onChange={(event) => setBodyFatRate(Number(event.target.value))}
          />
          <Field label="BMI" type="number" value={bmi} onChange={(event) => setBmi(Number(event.target.value))} />
          <div className="flex min-h-20 flex-col justify-center rounded-lg bg-[#edf6f2] px-4">
            <span className="text-xs font-black text-mint">자동 계산 BMI</span>
            <span className="text-2xl font-black">{calculatedBmi || '-'}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={save}
          className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-mint font-black text-white"
        >
          <Save size={18} />
          저장
        </button>
      </div>

      <aside className="grid content-start gap-3">
        <div className="rounded-lg bg-white p-4 shadow-soft">
          <p className="text-sm font-bold text-mint">최근 기록</p>
          <p className="mt-2 text-3xl font-black">{latest?.weight ?? '-'}kg</p>
          <p className="text-sm text-ink/60">{latest?.date}</p>
        </div>
        <div className="rounded-lg bg-[#fff3e1] p-4">
          <div className="flex items-center gap-2 font-black">
            <CloudOff size={18} />
            오프라인 저장
          </div>
          <p className="mt-2 text-sm text-ink/65">네트워크가 끊겨도 입력값은 기기에 보관되고, 연결 후 동기화할 수 있습니다.</p>
        </div>
      </aside>
    </section>
  )
}
