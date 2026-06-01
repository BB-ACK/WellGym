import { z } from "zod";

export const createInbodySchema = z.object({
  heightCm: z.number().positive(),
  weightKg: z.number().positive(),
  skeletalMuscleKg: z.number().positive(),
  bodyFatKg: z.number().nonnegative(),
  bodyFatPercent: z.number().min(0).max(100),
  bmi: z.number().positive(),
  measuredAt: z.coerce.date()
});
