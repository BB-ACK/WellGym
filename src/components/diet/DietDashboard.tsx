import { Flame, Lightbulb, Utensils } from 'lucide-react'
import type { DietPlan } from '../../types'

type DietDashboardProps = {
  plan: DietPlan
}

const macroColors = {
  carbs: 'bg-skyfit',
  protein: 'bg-mint',
  fat: 'bg-coral'
}

export function DietDashboard({ plan }: DietDashboardProps) {
  return (
    <section className="grid gap-5">
      <div>
        <p className="text-sm font-bold text-mint">맞춤형 식단 추천</p>
        <h2 className="text-2xl font-black">오늘의 영양 대시보드</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-[20rem_1fr]">
        <div className="rounded-lg bg-mint p-5 text-white shadow-soft">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Flame size={18} />
            일일 칼로리
          </div>
          <p className="mt-4 text-5xl font-black">{plan.calories}</p>
          <p className="text-sm font-bold text-white/75">kcal 목표</p>
        </div>

        <div className="rounded-lg bg-white p-5 shadow-soft">
          <p className="font-black">탄단지 비율</p>
          <div className="mt-4 h-5 overflow-hidden rounded-full bg-ink/10">
            <div className="flex h-full">
              <span className={`${macroColors.carbs}`} style={{ width: `${plan.macro.carbs}%` }} />
              <span className={`${macroColors.protein}`} style={{ width: `${plan.macro.protein}%` }} />
              <span className={`${macroColors.fat}`} style={{ width: `${plan.macro.fat}%` }} />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-sm font-bold">
            <span className="rounded bg-skyfit/15 px-3 py-2">탄수 {plan.macro.carbs}%</span>
            <span className="rounded bg-mint/15 px-3 py-2">단백 {plan.macro.protein}%</span>
            <span className="rounded bg-coral/15 px-3 py-2">지방 {plan.macro.fat}%</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {plan.meals.map((meal) => (
          <article key={meal.name} className="rounded-lg border border-ink/10 bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="rounded bg-[#edf6f2] px-2 py-1 text-xs font-black text-mint">{meal.name}</span>
              <span className="text-sm font-black text-coral">{meal.kcal}kcal</span>
            </div>
            <h3 className="mt-3 text-lg font-black">{meal.title}</h3>
            <ul className="mt-3 grid gap-2 text-sm text-ink/70">
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

      <div className="rounded-lg bg-white p-5 shadow-soft">
        <div className="flex items-center gap-2 font-black">
          <Lightbulb size={20} className="text-amberfit" />
          식단 관리 팁
        </div>
        <div className="mt-3 grid gap-2">
          {plan.tips.map((tip) => (
            <p key={tip} className="rounded bg-[#f4f1ea] px-3 py-2 text-sm text-ink/75">
              {tip}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
