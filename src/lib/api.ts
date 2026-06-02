import type {
  BackendDietPlan,
  BackendInbody,
  BackendWorkoutLog,
  DietPlan,
  InbodyEntry,
  InbodyOcrResult,
  WorkoutFeedback,
  WorkoutSession
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'

type RequestOptions = {
  token?: string | null
  method?: string
  body?: unknown
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  })

  const payload = response.status === 204 ? null : await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(getErrorMessage(payload))
  }

  return payload as T
}

function getErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== 'object') return '요청 처리 중 오류가 발생했습니다.'

  const message = 'message' in payload && typeof payload.message === 'string' ? payload.message : ''
  const details = 'details' in payload ? payload.details : null

  if (details && typeof details === 'object' && 'fieldErrors' in details) {
    const fieldErrors = details.fieldErrors
    if (fieldErrors && typeof fieldErrors === 'object') {
      const errors = Object.values(fieldErrors)
        .flatMap((value) => (Array.isArray(value) ? value : []))
        .filter((value): value is string => typeof value === 'string')
      if (errors.length) return errors.join(' ')
    }
  }

  return message || '요청 처리 중 오류가 발생했습니다.'
}

export type AuthResponse = {
  user: {
    id: string
    email: string
    name: string | null
    createdAt?: string
  }
  token: string
}

export const api = {
  signup(input: { email: string; password: string; name?: string }) {
    return request<AuthResponse>('/api/auth/signup', { method: 'POST', body: input })
  },
  login(input: { email: string; password: string }) {
    return request<AuthResponse>('/api/auth/login', { method: 'POST', body: input })
  },
  workouts(token: string, from?: string, to?: string) {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    const query = params.toString()
    return request<BackendWorkoutLog[]>(`/api/workout/logs${query ? `?${query}` : ''}`, { token })
  },
  createWorkout(token: string, workout: WorkoutSession) {
    return request<BackendWorkoutLog>('/api/workout/logs', {
      token,
      method: 'POST',
      body: workoutToPayload(workout)
    })
  },
  updateWorkout(token: string, workoutId: string, workout: WorkoutSession) {
    return request<BackendWorkoutLog>(`/api/workout/logs/${workoutId}`, {
      token,
      method: 'PUT',
      body: workoutToPayload(workout)
    })
  },
  deleteWorkout(token: string, workoutId: string) {
    return request<null>(`/api/workout/logs/${workoutId}`, {
      token,
      method: 'DELETE'
    })
  },
  inbodyHistory(token: string) {
    return request<BackendInbody[]>('/api/inbody', { token })
  },
  latestInbody(token: string) {
    return request<BackendInbody | null>('/api/inbody/latest', { token })
  },
  createInbody(token: string, entry: InbodyEntry) {
    return request<BackendInbody>('/api/inbody', {
      token,
      method: 'POST',
      body: {
        heightCm: entry.height,
        weightKg: entry.weight,
        skeletalMuscleKg: entry.muscleMass,
        bodyFatKg: entry.bodyFatMass,
        bodyFatPercent: entry.bodyFatRate,
        bmi: entry.bmi,
        measuredAt: entry.date
      }
    })
  },
  analyzeInbodyPhoto(token: string, input: { imageBase64: string; mimeType: string }) {
    return request<InbodyOcrResult>('/api/ai/inbody-ocr', {
      token,
      method: 'POST',
      body: input
    })
  },
  diet(token: string, input: {
    goalWeightKg: number
    periodWeeks?: number
    activityLevel: 'low' | 'medium' | 'high'
    dietaryPreference?: string
    allergies?: string[]
  }) {
    return request<BackendDietPlan>('/api/ai/diet', { token, method: 'POST', body: input })
  },
  feedback(token: string, workoutLogId?: string) {
    return request<WorkoutFeedback>('/api/ai/feedback', {
      token,
      method: 'POST',
      body: { workoutLogId }
    })
  },
  health() {
    return request<{ ok: boolean; service: string }>('/health')
  }
}

export function backendWorkoutToSession(log: BackendWorkoutLog, index = 0): WorkoutSession {
  const colors = ['#0f766e', '#e9685b', '#377fb8', '#efad3f']
  return {
    id: log.id,
    date: log.workoutDate.slice(0, 10),
    title: log.sessionTitle,
    time: toTimeInputValue(log.workoutDate),
    weight: 0,
    condition: (log.condition as WorkoutSession['condition']) || '보통',
    memo: log.memo ?? '',
    color: colors[index % colors.length],
    exercises: log.exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      category: exercise.bodyPart,
      equipment: '기록 없음',
      sets: exercise.sets.map((set) => ({
        id: set.id,
        kg: set.weightKg ?? 0,
        reps: set.reps
      }))
    }))
  }
}

export function backendInbodyToEntry(inbody: BackendInbody): InbodyEntry {
  return {
    id: inbody.id,
    date: inbody.measuredAt.slice(0, 10),
    weight: inbody.weightKg,
    height: inbody.heightCm,
    muscleMass: inbody.skeletalMuscleKg,
    bodyFatMass: inbody.bodyFatKg,
    bodyFatRate: inbody.bodyFatPercent,
    bmi: inbody.bmi
  }
}

export function backendDietToPlan(diet: BackendDietPlan): DietPlan {
  return {
    calories: diet.dailyCalories,
    macro: {
      carbs: diet.macroRatio.carbohydrate,
      protein: diet.macroRatio.protein,
      fat: diet.macroRatio.fat
    },
    meals: diet.recommendedMeals.map((meal) => ({
      name: meal.mealType,
      title: meal.notes,
      kcal: meal.calories,
      items: meal.foods
    })),
    tips: [...diet.managementTips, diet.rationale]
  }
}

function workoutToPayload(workout: WorkoutSession) {
  const time = normalizeTimeInput(workout.time)
  return {
    workoutDate: `${workout.date}T${time}:00.000Z`,
    sessionTitle: workout.title,
    condition: workout.condition,
    memo: workout.memo,
    exercises: workout.exercises.map((exercise) => ({
      name: exercise.name,
      bodyPart: exercise.category,
      sets: exercise.sets.map((set) => ({
        weightKg: set.kg,
        reps: set.reps
      }))
    }))
  }
}

function toTimeInputValue(dateValue: string) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return '00:00'

  const hours = `${date.getHours()}`.padStart(2, '0')
  const minutes = `${date.getMinutes()}`.padStart(2, '0')
  return `${hours}:${minutes}`
}

function normalizeTimeInput(value: string) {
  const directMatch = value.match(/^(\d{1,2}):(\d{2})/)
  if (directMatch) {
    return `${directMatch[1].padStart(2, '0')}:${directMatch[2]}`
  }

  const koreanMatch = value.match(/(오전|오후)\s*(\d{1,2}):(\d{2})/)
  if (koreanMatch) {
    const meridiem = koreanMatch[1]
    let hours = Number(koreanMatch[2])
    if (meridiem === '오후' && hours < 12) hours += 12
    if (meridiem === '오전' && hours === 12) hours = 0
    return `${`${hours}`.padStart(2, '0')}:${koreanMatch[3]}`
  }

  return '00:00'
}
