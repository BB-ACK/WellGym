import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

type AuthState = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const makeUser = (email: string, name = 'WellGym 회원'): User => ({
  id: crypto.randomUUID(),
  name,
  email,
  goal: '근육량 증가'
})

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (email, password) => {
        if (!email.includes('@') || password.length < 4) {
          throw new Error('이메일과 비밀번호를 확인해 주세요.')
        }
        set({ user: makeUser(email, email.split('@')[0] || 'WellGym 회원') })
      },
      signup: async (name, email, password) => {
        if (!name.trim() || !email.includes('@') || password.length < 4) {
          throw new Error('가입 정보를 다시 확인해 주세요.')
        }
        set({ user: makeUser(email, name.trim()) })
      },
      logout: () => set({ user: null })
    }),
    { name: 'wellgym-auth' }
  )
)
