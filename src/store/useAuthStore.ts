import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../lib/api'
import type { User } from '../types'

type AuthState = {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: '',
      login: async (email, password) => {
        set({ isLoading: true, error: '' })
        try {
          const result = await api.login({ email, password })
          set({ user: result.user, token: result.token, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '로그인에 실패했습니다.',
            isLoading: false
          })
          throw error
        }
      },
      signup: async (name, email, password) => {
        set({ isLoading: true, error: '' })
        try {
          const result = await api.signup({ name, email, password })
          set({ user: result.user, token: result.token, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '회원가입에 실패했습니다.',
            isLoading: false
          })
          throw error
        }
      },
      logout: () => set({ user: null, token: null, error: '' }),
      clearError: () => set({ error: '' })
    }),
    {
      name: 'wellgym-auth'
    }
  )
)
