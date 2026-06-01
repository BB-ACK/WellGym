import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockDiet, mockInbody, mockWorkouts, workoutColors } from '../data/mockData'
import type { DietPlan, InbodyEntry, WorkoutSession } from '../types'

type WellGymState = {
  workouts: WorkoutSession[]
  inbodyEntries: InbodyEntry[]
  dietPlan: DietPlan
  addWorkout: (workout: Omit<WorkoutSession, 'id' | 'color' | 'pendingSync'>) => void
  addInbody: (entry: Omit<InbodyEntry, 'id' | 'pendingSync'>) => void
  markSynced: () => void
}

const makeId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`

export const useWellGymStore = create<WellGymState>()(
  persist(
    (set, get) => ({
      workouts: mockWorkouts,
      inbodyEntries: [mockInbody],
      dietPlan: mockDiet,
      addWorkout: (workout) => {
        const color = workoutColors[get().workouts.length % workoutColors.length]
        set((state) => ({
          workouts: [
            ...state.workouts,
            {
              ...workout,
              id: makeId('workout'),
              color,
              pendingSync: !navigator.onLine
            }
          ]
        }))
      },
      addInbody: (entry) => {
        set((state) => ({
          inbodyEntries: [
            {
              ...entry,
              id: makeId('inbody'),
              pendingSync: !navigator.onLine
            },
            ...state.inbodyEntries
          ]
        }))
      },
      markSynced: () => {
        set((state) => ({
          workouts: state.workouts.map((workout) => ({ ...workout, pendingSync: false })),
          inbodyEntries: state.inbodyEntries.map((entry) => ({ ...entry, pendingSync: false }))
        }))
      }
    }),
    {
      name: 'wellgym-offline-store',
      version: 1
    }
  )
)
