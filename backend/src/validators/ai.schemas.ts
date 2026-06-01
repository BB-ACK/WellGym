import { z } from "zod";

export const dietRequestSchema = z.object({
  goalWeightKg: z.number().positive(),
  targetDate: z.coerce.date().optional(),
  periodWeeks: z.number().int().positive().max(104).optional(),
  activityLevel: z.enum(["low", "medium", "high"]).default("medium"),
  dietaryPreference: z.string().max(300).optional(),
  allergies: z.array(z.string().min(1)).default([])
});

export const feedbackRequestSchema = z.object({
  workoutLogId: z.string().min(1).optional()
});
