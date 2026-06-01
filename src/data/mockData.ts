import type { DietPlan, InbodyEntry, WorkoutSession } from '../types'

export const workoutColors = ['#0f766e', '#ef6f61', '#4f9fd8', '#f6b64d']

export const mockWorkouts: WorkoutSession[] = [
  {
    id: 'w-1',
    date: '2026-06-01',
    title: '어깨 운동',
    time: '18:30',
    weight: 73.4,
    condition: '좋음',
    memo: '프레스 중량 안정적. 측면 삼각근 자극이 좋았다.',
    color: '#0f766e',
    exercises: [
      {
        id: 'e-1',
        name: '숄더 프레스',
        category: '어깨',
        equipment: '덤벨',
        sets: [
          { id: 's-1', kg: 22, reps: 10 },
          { id: 's-2', kg: 24, reps: 8 }
        ]
      },
      {
        id: 'e-2',
        name: '사이드 레터럴 레이즈',
        category: '어깨',
        equipment: '덤벨',
        sets: [
          { id: 's-3', kg: 8, reps: 15 },
          { id: 's-4', kg: 8, reps: 14 }
        ]
      }
    ]
  },
  {
    id: 'w-2',
    date: '2026-06-04',
    title: '하체 루틴',
    time: '07:40',
    weight: 73.1,
    condition: '보통',
    memo: '스쿼트 자세 유지.',
    color: '#ef6f61',
    exercises: [
      {
        id: 'e-3',
        name: '스쿼트',
        category: '하체',
        equipment: '바벨',
        sets: [
          { id: 's-5', kg: 80, reps: 8 },
          { id: 's-6', kg: 90, reps: 6 }
        ]
      }
    ]
  },
  {
    id: 'w-3',
    date: '2026-06-11',
    title: '등 운동',
    time: '19:10',
    weight: 72.9,
    condition: '회복',
    memo: '랫풀다운 가동 범위 체크.',
    color: '#4f9fd8',
    exercises: [
      {
        id: 'e-4',
        name: '랫풀다운',
        category: '등',
        equipment: '머신',
        sets: [
          { id: 's-7', kg: 55, reps: 12 },
          { id: 's-8', kg: 60, reps: 10 }
        ]
      }
    ]
  }
]

export const mockInbody: InbodyEntry = {
  id: 'i-1',
  date: '2026-06-01',
  weight: 73.4,
  height: 176,
  muscleMass: 34.8,
  bodyFatMass: 12.2,
  bodyFatRate: 16.6,
  bmi: 23.7
}

export const mockDiet: DietPlan = {
  calories: 2360,
  macro: {
    carbs: 48,
    protein: 32,
    fat: 20
  },
  meals: [
    {
      name: '아침',
      title: '오트밀 단백질 볼',
      kcal: 520,
      items: ['오트밀 60g', '그릭요거트', '블루베리', '삶은 달걀 2개']
    },
    {
      name: '간식',
      title: '운동 전 에너지',
      kcal: 260,
      items: ['바나나', '아메리카노', '프로틴 1스쿱']
    },
    {
      name: '점심',
      title: '닭가슴살 현미 플레이트',
      kcal: 710,
      items: ['현미밥', '닭가슴살 160g', '구운 채소', '김치']
    },
    {
      name: '저녁',
      title: '연어 회복 식단',
      kcal: 650,
      items: ['연어 150g', '고구마', '샐러드', '두부']
    }
  ],
  tips: [
    '운동 후 60분 안에 단백질 25g 이상을 먼저 채우세요.',
    '수분은 체중 1kg당 35ml를 기준으로 나눠 마시면 좋습니다.',
    '체지방률 감량 주간에는 저녁 탄수화물을 10~15% 줄여 보세요.'
  ]
}
