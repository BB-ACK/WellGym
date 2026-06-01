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

export type User = {
  id: string
  email: string
  name: string | null
}

export type BackendWorkoutLog = {
  id: string
  userId: string
  workoutDate: string
  sessionTitle: string
  condition: string | null
  memo: string | null
  createdAt: string
  updatedAt: string
  exercises: Array<{
    id: string
    workoutLogId: string
    name: string
    bodyPart: string
    sortOrder: number
    sets: Array<{
      id: string
      exerciseId: string
      weightKg: number | null
      reps: number
      sortOrder: number
    }>
  }>
}

export type BackendInbody = {
  id: string
  userId: string
  heightCm: number
  weightKg: number
  skeletalMuscleKg: number
  bodyFatKg: number
  bodyFatPercent: number
  bmi: number
  measuredAt: string
  createdAt: string
}

export type BackendDietPlan = {
  dailyCalories: number
  macroRatio: {
    carbohydrate: number
    protein: number
    fat: number
  }
  recommendedMeals: Array<{
    mealType: string
    foods: string[]
    calories: number
    notes: string
  }>
  managementTips: string[]
  rationale: string
}
