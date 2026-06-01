import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  api,
  backendDietToPlan,
  backendInbodyToEntry,
  backendWorkoutToSession
} from '../lib/api'
import { mockDiet, mockInbody, mockWorkouts, workoutColors } from '../data/mockData'
import type { DietPlan, InbodyEntry, WorkoutSession } from '../types'

type WellGymState = {
  workouts: WorkoutSession[]
  inbodyEntries: InbodyEntry[]
  dietPlan: DietPlan
  feedback: unknown | null
  isLoading: boolean
  error: string
  loadFromBackend: (token: string) => Promise<void>
  addWorkout: (workout: Omit<WorkoutSession, 'id' | 'color' | 'pendingSync'>, token?: string | null) => Promise<void>
  addInbody: (entry: Omit<InbodyEntry, 'id' | 'pendingSync'>, token?: string | null) => Promise<void>
  generateDiet: (token: string, input: {
    goalWeightKg: number
    periodWeeks?: number
    activityLevel: 'low' | 'medium' | 'high'
    dietaryPreference?: string
    allergies?: string[]
  }) => Promise<void>
  generateFeedback: (token: string, workoutLogId?: string) => Promise<void>
  markSynced: () => void
  clearError: () => void
}

const makeId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`

export const useWellGymStore = create<WellGymState>()(
  persist(
    (set, get) => ({
      workouts: mockWorkouts,
      inbodyEntries: [mockInbody],
      dietPlan: mockDiet,
      feedback: null,
      isLoading: false,
      error: '',
      loadFromBackend: async (token) => {
        set({ isLoading: true, error: '' })
        try {
          const [workouts, inbodies, latestInbody] = await Promise.all([
            api.workouts(token),
            api.inbodyHistory(token),
            api.latestInbody(token)
          ])
          const mappedInbodies = inbodies.map(backendInbodyToEntry)
          const latest = latestInbody ? backendInbodyToEntry(latestInbody) : null
          set({
            workouts: workouts.map(backendWorkoutToSession),
            inbodyEntries: latest
              ? [latest, ...mappedInbodies.filter((entry) => entry.id !== latest.id)]
              : mappedInbodies,
            isLoading: false
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '백엔드 데이터를 불러오지 못했습니다.',
            isLoading: false
          })
        }
      },
      addWorkout: async (workout, token) => {
        const color = workoutColors[get().workouts.length % workoutColors.length]
        const localWorkout: WorkoutSession = {
          ...workout,
          id: makeId('workout'),
          color,
          pendingSync: !navigator.onLine || !token
        }
        set((state) => ({ workouts: [...state.workouts, localWorkout], error: '' }))

        if (!token || !navigator.onLine) return

        try {
          const saved = await api.createWorkout(token, localWorkout)
          set((state) => ({
            workouts: state.workouts.map((item) =>
              item.id === localWorkout.id ? backendWorkoutToSession(saved, state.workouts.length - 1) : item
            )
          }))
        } catch (error) {
          set((state) => ({
            workouts: state.workouts.map((item) =>
              item.id === localWorkout.id ? { ...item, pendingSync: true } : item
            ),
            error: error instanceof Error ? error.message : '운동 기록 동기화에 실패했습니다.'
          }))
        }
      },
      addInbody: async (entry, token) => {
        const localEntry: InbodyEntry = {
          ...entry,
          id: makeId('inbody'),
          pendingSync: !navigator.onLine || !token
        }
        set((state) => ({ inbodyEntries: [localEntry, ...state.inbodyEntries], error: '' }))

        if (!token || !navigator.onLine) return

        try {
          const saved = await api.createInbody(token, localEntry)
          set((state) => ({
            inbodyEntries: state.inbodyEntries.map((item) =>
              item.id === localEntry.id ? backendInbodyToEntry(saved) : item
            )
          }))
        } catch (error) {
          set((state) => ({
            inbodyEntries: state.inbodyEntries.map((item) =>
              item.id === localEntry.id ? { ...item, pendingSync: true } : item
            ),
            error: error instanceof Error ? error.message : '인바디 기록 동기화에 실패했습니다.'
          }))
        }
      },
      generateDiet: async (token, input) => {
        set({ isLoading: true, error: '' })
        try {
          const diet = await api.diet(token, input)
          set({ dietPlan: backendDietToPlan(diet), isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '식단 추천 생성에 실패했습니다.',
            isLoading: false
          })
        }
      },
      generateFeedback: async (token, workoutLogId) => {
        set({ isLoading: true, error: '' })
        try {
          const feedback = await api.feedback(token, workoutLogId)
          set({ feedback, isLoading: false })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '운동 피드백 생성에 실패했습니다.',
            isLoading: false
          })
        }
      },
      markSynced: () => {
        set((state) => ({
          workouts: state.workouts.map((workout) => ({ ...workout, pendingSync: false })),
          inbodyEntries: state.inbodyEntries.map((entry) => ({ ...entry, pendingSync: false }))
        }))
      },
      clearError: () => set({ error: '' })
    }),
    {
      name: 'wellgym-offline-store',
      version: 2
    }
  )
)
