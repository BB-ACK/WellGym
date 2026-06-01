import { Flame, Lightbulb, Utensils } from 'lucide-react'
import type { DietPlan } from '../../types'

type Props = {
  plan: DietPlan
}

export function DietDashboard({ plan }: Props) {
  return (
    <section className="grid gap-5">
      <div>
        <p className="text-sm font-black text-mint">맞춤형 식단 추천</p>
        <h2 className="text-3xl font-black">오늘의 영양 대시보드</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-[21rem_1fr]">
        <div className="rounded-[1.35rem] bg-ink p-5 text-white shadow-soft">
          <div className="flex items-center gap-2 text-sm font-black text-white/65">
            <Flame size={18} />
            일일 칼로리
          </div>
          <p className="mt-5 text-5xl font-black">{plan.calories}</p>
          <p className="text-sm font-black text-white/45">kcal 목표</p>
        </div>
        <div className="rounded-[1.35rem] bg-white p-5 shadow-soft">
          <p className="font-black">탄단지 비율</p>
          <div className="mt-5 h-5 overflow-hidden rounded-full bg-paper">
            <div className="flex h-full">
              <span className="bg-ocean" style={{ width: `${plan.macro.carbs}%` }} />
              <span className="bg-mint" style={{ width: `${plan.macro.protein}%` }} />
              <span className="bg-coral" style={{ width: `${plan.macro.fat}%` }} />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-sm font-black">
            <span className="rounded-xl bg-ocean/10 px-3 py-2">탄수 {plan.macro.carbs}%</span>
            <span className="rounded-xl bg-mint/10 px-3 py-2">단백 {plan.macro.protein}%</span>
            <span className="rounded-xl bg-coral/10 px-3 py-2">지방 {plan.macro.fat}%</span>
          </div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {plan.meals.map((meal) => (
          <article key={meal.name} className="rounded-[1.35rem] bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-mint/10 px-3 py-1 text-xs font-black text-mint">{meal.name}</span>
              <span className="text-sm font-black text-coral">{meal.kcal}kcal</span>
            </div>
            <h3 className="mt-4 text-lg font-black">{meal.title}</h3>
            <ul className="mt-3 grid gap-2 text-sm font-bold text-ink/60">
              {meal.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <Utensils className="mt-0.5 shrink-0 text-mint" size={14} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="rounded-[1.35rem] bg-white p-5 shadow-soft">
        <div className="flex items-center gap-2 font-black">
          <Lightbulb size={20} className="text-saffron" />
          식단 관리 팁
        </div>
        <div className="mt-3 grid gap-2">
          {plan.tips.map((tip) => (
            <p key={tip} className="rounded-xl bg-paper px-3 py-2 text-sm font-bold text-ink/65">{tip}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
