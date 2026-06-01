export type ExerciseSet = {
  id: string
  kg: number
  reps: number
}

export type ExerciseLog = {
  id: string
  name: string
  category: string
  equipment: string
  sets: ExerciseSet[]
}

export type WorkoutSession = {
  id: string
  date: string
  title: string
  time: string
  weight: number
  condition: '좋음' | '보통' | '피곤' | '회복'
  memo: string
  color: string
  exercises: ExerciseLog[]
  pendingSync?: boolean
}

export type InbodyEntry = {
  id: string
  date: string
  photoName?: string
  weight: number
  height: number
  muscleMass: number
  bodyFatMass: number
  bodyFatRate: number
  bmi: number
  pendingSync?: boolean
}

export type Meal = {
  name: string
  title: string
  kcal: number
  items: string[]
}

export type DietPlan = {
  calories: number
  macro: {
    carbs: number
    protein: number
    fat: number
  }
  meals: Meal[]
  tips: string[]
}
