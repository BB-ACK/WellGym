import { Dumbbell, Eye, EyeOff, Lock, Mail, UserRound } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')
  const { login, signup, isLoading, error, clearError } = useAuthStore()

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    clearError()
    setLocalError('')

    if (mode === 'signup' && name.trim().length < 1) {
      setLocalError('이름을 입력해 주세요.')
      return
    }

    if (mode === 'signup' && password.length < 8) {
      setLocalError('비밀번호는 8자 이상이어야 합니다.')
      return
    }

    try {
      if (mode === 'login') await login(email, password)
      else await signup(name.trim(), email.trim(), password)
    } catch {
      // Store-level error state drives the inline message.
    }
  }

  const visibleError = localError || error

  return (
    <main className="min-h-screen bg-paper px-5 py-6 text-ink">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-5xl items-center gap-8 lg:grid-cols-[1fr_27rem]">
        <section className="hidden lg:block">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-white px-4 py-3 text-sm font-black text-mint shadow-soft">
            <Dumbbell size={20} />
            WellGym
          </div>
          <h1 className="max-w-xl text-6xl font-black leading-[0.95]">오늘의 운동을 선명하게.</h1>
          <div className="mt-8 grid max-w-md grid-cols-3 gap-3">
            {[
              ['API', '실제 로그인'],
              ['PWA', '오프라인 기록'],
              ['AI', '식단·피드백']
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-white p-4 shadow-line">
                <p className="text-2xl font-black">{value}</p>
                <p className="mt-1 text-xs font-bold text-ink/50">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.6rem] bg-white p-5 shadow-soft sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-mint text-white">
              <Dumbbell size={22} />
            </div>
            <div>
              <p className="text-lg font-black">WellGym</p>
              <p className="text-xs font-bold text-ink/45">Backend Connected PWA</p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-paper p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setLocalError('')
                clearError()
              }}
              className={`min-h-11 rounded-xl text-sm font-black ${mode === 'login' ? 'bg-white text-mint shadow-line' : 'text-ink/50'}`}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setLocalError('')
                clearError()
              }}
              className={`min-h-11 rounded-xl text-sm font-black ${mode === 'signup' ? 'bg-white text-mint shadow-line' : 'text-ink/50'}`}
            >
              회원가입
            </button>
          </div>

          <form onSubmit={submit} className="grid gap-4">
            {mode === 'signup' ? (
              <label className="grid gap-2 text-sm font-bold">
                이름
                <span className="flex min-h-12 items-center gap-2 rounded-xl bg-paper px-3">
                  <UserRound size={18} className="text-mint" />
                  <input value={name} onChange={(event) => setName(event.target.value)} className="w-full bg-transparent outline-none" />
                </span>
              </label>
            ) : null}
            <label className="grid gap-2 text-sm font-bold">
              이메일
              <span className="flex min-h-12 items-center gap-2 rounded-xl bg-paper px-3">
                <Mail size={18} className="text-mint" />
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full bg-transparent outline-none" />
              </span>
            </label>
            <label className="grid gap-2 text-sm font-bold">
              비밀번호
              <span className="flex min-h-12 items-center gap-2 rounded-xl bg-paper px-3">
                <Lock size={18} className="text-mint" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-transparent outline-none"
                />
                <button type="button" aria-label="비밀번호 보기" title="비밀번호 보기" onClick={() => setShowPassword((value) => !value)} className="p-1">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
              {mode === 'signup' ? <span className="text-xs font-bold text-ink/45">8자 이상 입력해 주세요.</span> : null}
            </label>
            {visibleError ? <p className="rounded-xl bg-coral/10 px-3 py-2 text-sm font-bold text-coral">{visibleError}</p> : null}
            <button type="submit" disabled={isLoading} className="min-h-12 rounded-xl bg-ink font-black text-white shadow-soft disabled:opacity-60">
              {isLoading ? '처리 중...' : mode === 'login' ? '시작하기' : '계정 만들기'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
