import { Download, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  if (!visible) return null

  const install = async () => {
    await promptEvent?.prompt()
    setVisible(false)
  }

  return (
    <div className="fixed inset-x-4 bottom-20 z-40 mx-auto max-w-md rounded-lg border border-mint/20 bg-white p-4 shadow-soft md:bottom-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint text-white">
          <Download size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-black">홈 화면에 추가</p>
          <p className="mt-1 text-sm text-ink/65">모바일에서 앱처럼 열고 오프라인 기록을 이어갈 수 있습니다.</p>
          <button
            type="button"
            onClick={install}
            className="mt-3 min-h-11 rounded-lg bg-mint px-4 text-sm font-black text-white"
          >
            설치하기
          </button>
        </div>
        <button type="button" aria-label="닫기" title="닫기" onClick={() => setVisible(false)} className="p-1">
          <X size={20} />
        </button>
      </div>
    </div>
  )
}
