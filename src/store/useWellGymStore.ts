import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  api,
  backendDietToPlan,
  backendInbodyToEntry,
  backendWorkoutToSession
} from '../lib/api'
import { mockDiet, mockInbody, mockWorkouts, workoutColors } from '../data/mockData'
import { makeId } from '../lib/id'
import type { DietPlan, InbodyEntry, SavedWorkoutFeedback, WorkoutFeedback, WorkoutSession } from '../types'
import type { InbodyOcrResult } from '../types'

type WorkoutFormValue = Omit<WorkoutSession, 'id' | 'color' | 'pendingSync'>

type WellGymState = {
  workouts: WorkoutSession[]
  inbodyEntries: InbodyEntry[]
  dietPlan: DietPlan
  feedback: WorkoutFeedback | null
  savedFeedbacks: SavedWorkoutFeedback[]
  isLoading: boolean
  error: string
  loadFromBackend: (token: string) => Promise<void>
  addWorkout: (workout: WorkoutFormValue, token?: string | null) => Promise<void>
  updateWorkout: (workoutId: string, workout: WorkoutFormValue, token?: string | null) => Promise<void>
  deleteWorkout: (workoutId: string, token?: string | null) => Promise<void>
  addInbody: (entry: Omit<InbodyEntry, 'id' | 'pendingSync'>, token?: string | null) => Promise<void>
  analyzeInbodyPhoto: (token: string, input: { imageBase64: string; mimeType: string }) => Promise<InbodyOcrResult | null>
  generateDiet: (token: string, input: {
    goalWeightKg: number
    periodWeeks?: number
    activityLevel: 'low' | 'medium' | 'high'
    dietaryPreference?: string
    allergies?: string[]
  }) => Promise<void>
  generateFeedback: (token: string, workoutLogId?: string) => Promise<WorkoutFeedback | null>
  saveFeedback: (feedback: WorkoutFeedback, userId: string, workout?: WorkoutSession) => void
  deleteSavedFeedback: (feedbackId: string) => void
  markSynced: () => void
  clearError: () => void
}

export const useWellGymStore = create<WellGymState>()(
  persist(
    (set, get) => ({
      workouts: mockWorkouts,
      inbodyEntries: [mockInbody],
      dietPlan: mockDiet,
      feedback: null,
      savedFeedbacks: [],
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
            workouts: state.workouts.map((item, index) =>
              item.id === localWorkout.id ? backendWorkoutToSession(saved, index) : item
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
      updateWorkout: async (workoutId, workout, token) => {
        const current = get().workouts.find((item) => item.id === workoutId)
        if (!current) return

        const localWorkout: WorkoutSession = {
          ...workout,
          id: workoutId,
          color: current.color,
          pendingSync: !navigator.onLine || !token
        }
        set((state) => ({
          workouts: state.workouts.map((item) => (item.id === workoutId ? localWorkout : item)),
          error: ''
        }))

        if (!token || !navigator.onLine) return

        try {
          const saved = await api.updateWorkout(token, workoutId, localWorkout)
          set((state) => ({
            workouts: state.workouts.map((item, index) =>
              item.id === workoutId ? backendWorkoutToSession(saved, index) : item
            )
          }))
        } catch (error) {
          set((state) => ({
            workouts: state.workouts.map((item) =>
              item.id === workoutId ? { ...item, pendingSync: true } : item
            ),
            error: error instanceof Error ? error.message : '운동 기록 수정 동기화에 실패했습니다.'
          }))
        }
      },
      deleteWorkout: async (workoutId, token) => {
        const current = get().workouts.find((item) => item.id === workoutId)
        if (!current) return

        set((state) => ({
          workouts: state.workouts.filter((item) => item.id !== workoutId),
          savedFeedbacks: state.savedFeedbacks.filter((feedback) => feedback.workoutLogId !== workoutId),
          error: ''
        }))

        if (!token || !navigator.onLine || current.pendingSync) return

        try {
          await api.deleteWorkout(token, workoutId)
        } catch (error) {
          set((state) => ({
            workouts: [...state.workouts, { ...current, pendingSync: true }],
            error: error instanceof Error ? error.message : '운동 기록 삭제 동기화에 실패했습니다.'
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
      analyzeInbodyPhoto: async (token, input) => {
        set({ isLoading: true, error: '' })
        try {
          const result = await api.analyzeInbodyPhoto(token, input)
          set({ isLoading: false })
          return result
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '인바디 사진 분석에 실패했습니다.',
            isLoading: false
          })
          return null
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
          return feedback
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '운동 피드백 생성에 실패했습니다.',
            isLoading: false
          })
          return null
        }
      },
      saveFeedback: (feedback, userId, workout) => {
        set((state) => ({
          savedFeedbacks: [
            {
              ...feedback,
              id: makeId('feedback'),
              userId,
              workoutLogId: workout?.id,
              workoutTitle: workout?.title,
              workoutDate: workout?.date,
              workoutTime: workout?.time,
              createdAt: new Date().toISOString()
            },
            ...state.savedFeedbacks
          ],
          error: ''
        }))
      },
      deleteSavedFeedback: (feedbackId) => {
        set((state) => ({
          savedFeedbacks: state.savedFeedbacks.filter((feedback) => feedback.id !== feedbackId),
          error: ''
        }))
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
      version: 4
    }
  )
)
