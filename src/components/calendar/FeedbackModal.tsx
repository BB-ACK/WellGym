import { CheckCircle2, Dumbbell, Save, ShieldAlert, Sparkles, Trash2, X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { SavedWorkoutFeedback, WorkoutFeedback, WorkoutSession } from '../../types'

type FeedbackModalProps = {
  feedback: WorkoutFeedback | SavedWorkoutFeedback
  workout?: WorkoutSession
  isSaved?: boolean
  readOnly?: boolean
  onClose: () => void
  onSave?: () => void
  onDelete?: () => void
}

export function FeedbackModal({ feedback, workout, isSaved, readOnly, onClose, onSave, onDelete }: FeedbackModalProps) {
  const savedFeedback = isSavedFeedback(feedback) ? feedback : null
  const workoutTitle = workout?.title ?? savedFeedback?.workoutTitle ?? '운동'
  const workoutDate = workout?.date ?? savedFeedback?.workoutDate
  const workoutTime = workout?.time ?? savedFeedback?.workoutTime

  const remove = () => {
    if (!onDelete) return
    const ok = window.confirm('저장된 피드백을 삭제할까요? 삭제한 피드백은 되돌릴 수 없습니다.')
    if (!ok) return
    onDelete()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/45 p-3 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-paper shadow-soft">
        <div className="flex items-center justify-between border-b border-ink/5 bg-white p-4">
          <div>
            <p className="text-sm font-black text-mint">{readOnly ? '저장된 피드백 상세' : 'AI 운동 피드백'}</p>
            <h2 className="text-xl font-black">{workoutTitle}</h2>
            <p className="mt-1 text-xs font-bold text-ink/45">
              운동일: {workoutDate ?? '기록 없음'} {workoutTime ?? ''}
              {savedFeedback ? ` · 저장일: ${new Date(savedFeedback.createdAt).toLocaleString('ko-KR')}` : ''}
            </p>
          </div>
          <button type="button" aria-label="닫기" title="닫기" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-paper">
            <X size={21} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-4">
            <section className="rounded-2xl bg-ink p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-white/55">전체 점수</p>
                  <p className="mt-1 text-4xl font-black">{feedback.overallScore}</p>
                </div>
                <Sparkles className="text-saffron" size={32} />
              </div>
              <p className="mt-4 text-sm font-bold leading-6 text-white/78">{feedback.summary}</p>
            </section>

            <section className="rounded-2xl bg-white p-4 shadow-line">
              <div className="flex items-center gap-2 font-black">
                <Dumbbell size={18} className="text-mint" />
                볼륨 분석
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Metric label="총 세트" value={`${feedback.volumeAnalysis.totalSets}세트`} />
                <Metric label="예상 볼륨" value={`${feedback.volumeAnalysis.estimatedVolumeKg}kg`} />
              </div>
              <p className="mt-3 text-sm font-bold text-ink/65">{feedback.volumeAnalysis.comment}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {feedback.volumeAnalysis.dominantBodyParts.map((part) => (
                  <span key={part} className="rounded-full bg-mint/10 px-3 py-1 text-xs font-black text-mint">{part}</span>
                ))}
              </div>
            </section>

            <FeedbackList icon={<CheckCircle2 size={18} className="text-mint" />} title="잘한 점" items={feedback.strengths} />
            <FeedbackList icon={<ShieldAlert size={18} className="text-coral" />} title="주의할 점" items={feedback.cautions} />
            <FeedbackList title="다음 운동 제안" items={feedback.nextWorkoutSuggestions} />
            <FeedbackList title="회복 팁" items={feedback.recoveryTips} />
          </div>
        </div>

        <div className={`${readOnly ? 'grid grid-cols-[auto_1fr]' : 'grid grid-cols-[1fr_auto]'} gap-2 border-t border-ink/5 bg-white p-4`}>
          {readOnly ? (
            <button type="button" onClick={remove} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-coral/10 px-5 font-black text-coral">
              <Trash2 size={18} />
              피드백 삭제
            </button>
          ) : (
            <button type="button" onClick={onSave} disabled={isSaved || !onSave} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink font-black text-white disabled:bg-ink/25">
              <Save size={18} />
              {isSaved ? '저장됨' : '피드백 저장'}
            </button>
          )}
          <button type="button" onClick={onClose} className="min-h-12 rounded-xl bg-paper px-5 font-black text-ink">
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-paper p-3">
      <p className="text-xs font-black text-ink/45">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  )
}

function FeedbackList({ icon, title, items }: { icon?: ReactNode; title: string; items: string[] }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-line">
      <div className="flex items-center gap-2 font-black">
        {icon}
        {title}
      </div>
      <ul className="mt-3 grid gap-2">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="rounded-xl bg-paper px-3 py-2 text-sm font-bold leading-6 text-ink/72">
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

function isSavedFeedback(feedback: WorkoutFeedback | SavedWorkoutFeedback): feedback is SavedWorkoutFeedback {
  return 'createdAt' in feedback
}
