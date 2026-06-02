import { Camera, CheckCircle2, Loader2, Save, Sparkles, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { InbodyEntry, InbodyOcrResult } from '../../types'
import { Field } from '../ui/Field'

type InbodyFormProps = {
  latest?: InbodyEntry
  isLoading?: boolean
  onAnalyzePhoto: (input: { imageBase64: string; mimeType: string }) => Promise<InbodyOcrResult | null>
  onSave: (entry: Omit<InbodyEntry, 'id' | 'pendingSync'>) => Promise<void> | void
}

const todayKey = () => new Date().toISOString().slice(0, 10)

export function InbodyForm({ latest, isLoading, onAnalyzePhoto, onSave }: InbodyFormProps) {
  const [date, setDate] = useState(latest?.date ?? todayKey())
  const [photoName, setPhotoName] = useState('')
  const [weight, setWeight] = useState(latest?.weight ?? 0)
  const [height, setHeight] = useState(latest?.height ?? 0)
  const [muscleMass, setMuscleMass] = useState(latest?.muscleMass ?? 0)
  const [bodyFatMass, setBodyFatMass] = useState(latest?.bodyFatMass ?? 0)
  const [bodyFatRate, setBodyFatRate] = useState(latest?.bodyFatRate ?? 0)
  const [bmi, setBmi] = useState(latest?.bmi ?? 0)
  const [analysisStatus, setAnalysisStatus] = useState('')
  const [saveStatus, setSaveStatus] = useState('')
  const [ocrNotes, setOcrNotes] = useState<string[]>([])
  const [confidence, setConfidence] = useState<number | null>(null)

  const calculatedBmi = useMemo(() => {
    if (!height || !weight) return 0
    return Number((weight / (height / 100) ** 2).toFixed(1))
  }, [height, weight])

  const handlePhoto = async (file?: File) => {
    if (!file) return

    setPhotoName(file.name)
    setSaveStatus('')
    setAnalysisStatus('사진을 분석하는 중입니다...')
    setOcrNotes([])
    setConfidence(null)

    const dataUrl = await readAsDataUrl(file)
    const imageBase64 = dataUrl.split(',')[1] ?? ''
    const result = await onAnalyzePhoto({ imageBase64, mimeType: file.type })

    if (!result) {
      setAnalysisStatus('사진 분석에 실패했습니다. 직접 입력하거나 다시 촬영해 주세요.')
      return
    }

    if (result.measuredAt) setDate(result.measuredAt.slice(0, 10))
    if (typeof result.weightKg === 'number') setWeight(result.weightKg)
    if (typeof result.heightCm === 'number') setHeight(result.heightCm)
    if (typeof result.skeletalMuscleKg === 'number') setMuscleMass(result.skeletalMuscleKg)
    if (typeof result.bodyFatKg === 'number') setBodyFatMass(result.bodyFatKg)
    if (typeof result.bodyFatPercent === 'number') setBodyFatRate(result.bodyFatPercent)
    if (typeof result.bmi === 'number') setBmi(result.bmi)

    setConfidence(result.confidence)
    setOcrNotes(result.notes ?? [])
    setAnalysisStatus('사진 분석이 완료되어 수치를 자동 입력했습니다.')
  }

  const save = async () => {
    await onSave({
      date,
      photoName,
      weight,
      height,
      muscleMass,
      bodyFatMass,
      bodyFatRate,
      bmi: bmi || calculatedBmi
    })
    setSaveStatus('인바디 기록이 저장되었습니다.')
  }

  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_21rem]">
      <div className="grid gap-5">
        <div>
          <p className="text-sm font-black text-mint">체성분 기록</p>
          <h2 className="text-3xl font-black">인바디 입력</h2>
          <p className="mt-2 text-sm font-bold text-ink/50">결과지 사진을 등록하면 AI가 주요 수치를 읽어 자동으로 채웁니다.</p>
        </div>

        <label className="grid min-h-44 cursor-pointer place-items-center rounded-2xl border border-dashed border-mint/35 bg-white p-5 text-center shadow-soft transition hover:border-mint">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => void handlePhoto(event.target.files?.[0])}
          />
          <span className="grid justify-items-center gap-2">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint text-white">
              {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
            </span>
            <span className="font-black">{isLoading ? '사진 분석 중' : '인바디 사진 업로드 및 자동 분석'}</span>
            <span className="text-sm text-ink/50">{photoName || '촬영한 결과지 이미지를 선택하세요'}</span>
          </span>
        </label>

        {analysisStatus ? (
          <div className="rounded-2xl bg-mint/10 p-4 text-sm font-bold text-ink">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-mint" />
              {analysisStatus}
            </div>
            {confidence !== null ? <p className="mt-2 text-ink/55">인식 신뢰도: {Math.round(confidence * 100)}%</p> : null}
            {ocrNotes.length ? (
              <ul className="mt-2 grid gap-1 text-ink/55">
                {ocrNotes.map((note, index) => (
                  <li key={`${note}-${index}`}>{note}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {saveStatus ? (
          <div className="flex items-center gap-2 rounded-2xl bg-mint px-4 py-3 text-sm font-black text-white">
            <CheckCircle2 size={18} />
            {saveStatus}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <Field label="날짜" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <Field label="체중" type="number" suffix="kg" value={weight} onChange={(event) => setWeight(Number(event.target.value))} />
          <Field label="키" type="number" suffix="cm" value={height} onChange={(event) => setHeight(Number(event.target.value))} />
          <Field label="골격근량" type="number" suffix="kg" value={muscleMass} onChange={(event) => setMuscleMass(Number(event.target.value))} />
          <Field label="체지방량" type="number" suffix="kg" value={bodyFatMass} onChange={(event) => setBodyFatMass(Number(event.target.value))} />
          <Field label="체지방률" type="number" suffix="%" value={bodyFatRate} onChange={(event) => setBodyFatRate(Number(event.target.value))} />
          <Field label="BMI" type="number" value={bmi} onChange={(event) => setBmi(Number(event.target.value))} />
          <div className="flex min-h-20 flex-col justify-center rounded-2xl bg-ink px-4 text-white">
            <span className="text-xs font-black text-white/55">자동 계산 BMI</span>
            <span className="text-2xl font-black">{calculatedBmi || '-'}</span>
          </div>
        </div>

        <button type="button" onClick={save} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink font-black text-white">
          <Save size={18} />
          인바디 기록 저장
        </button>
      </div>

      <aside className="grid content-start gap-3">
        <div className="rounded-2xl bg-white p-5 shadow-soft">
          <p className="text-sm font-black text-mint">최근 기록</p>
          <p className="mt-3 text-4xl font-black">{latest?.weight ?? '-'}kg</p>
          <p className="mt-1 text-sm font-bold text-ink/45">{latest?.date}</p>
        </div>
        <div className="rounded-2xl bg-[#fff4df] p-5 shadow-line">
          <div className="flex items-center gap-2 font-black">
            <TrendingUp size={18} />
            저장 상태
          </div>
          <p className="mt-3 text-sm font-bold text-ink/60">저장 후 완료 메시지가 표시되고, 온라인 상태에서는 백엔드 `/api/inbody`로 즉시 전송됩니다.</p>
        </div>
      </aside>
    </section>
  )
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
